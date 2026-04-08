import sqlite3
import numpy as np
import json
import os
from pathlib import Path

# Default Portable DB Path (Inside the engine folder to stay independent)
ENGINE_DIR = Path(__file__).parent.absolute()
DB_DIR = ENGINE_DIR / "data"
DB_PATH = DB_DIR / "memory.db"

class SQLiteVectorStore:
    def __init__(self, db_path=None):
        if db_path is None:
            self.db_path = DB_PATH
        else:
            self.db_path = Path(db_path)
            
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = self._get_connection()
        self._init_db()

    def _get_connection(self):
        """Creates a SQLite connection with WAL mode and busy_timeout for multi-agent concurrency."""
        conn = sqlite3.connect(
            str(self.db_path),
            timeout=5.0,  # 5000ms busy_timeout is handled directly by the timeout param
            isolation_level=None,  # Autocommit mode to reduce lock spans
            check_same_thread=False # Required for ThreadPoolExecutor
        )
        # Enable Write-Ahead Logging for high concurrency
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        return conn

    def _init_db(self):
        """Initializes the V1 Unified Schema."""
        with self.conn:
            # Memory Nodes
            self.conn.execute("""
            CREATE TABLE IF NOT EXISTS memory_nodes (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                content         TEXT NOT NULL,
                source_type     TEXT NOT NULL,  -- 'skill' | 'plan' | 'doc' | 'log'
                source_path     TEXT NOT NULL,
                domain          TEXT DEFAULT 'general',
                embedding       BLOB NOT NULL,
                embedding_model TEXT NOT NULL DEFAULT 'qwen3-embedding-8b',
                is_valid        BOOLEAN DEFAULT 1,
                hit_count       INTEGER DEFAULT 0,
                created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Safe migration for V1 to V2
            try:
                self.conn.execute("ALTER TABLE memory_nodes ADD COLUMN domain TEXT DEFAULT 'general';")
            except sqlite3.OperationalError:
                pass # Column already exists

            # Memory Edges for future Graph connectivity
            self.conn.execute("""
            CREATE TABLE IF NOT EXISTS memory_edges (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                node_id_1       INTEGER REFERENCES memory_nodes(id),
                node_id_2       INTEGER REFERENCES memory_nodes(id),
                similarity      REAL NOT NULL,
                relation_type   TEXT  -- 'similar' | 'supersedes' | 'related'
            );
            """)

            # Pending Queue for Graceful Degradation
            self.conn.execute("""
            CREATE TABLE IF NOT EXISTS pending_queue (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                source_path     TEXT NOT NULL,
                source_type     TEXT NOT NULL,
                content         TEXT NOT NULL,
                queued_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
                retry_count     INTEGER DEFAULT 0
            );
            """)

            # Create Indexes for performance
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_source_path ON memory_nodes(source_path);")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_is_valid ON memory_nodes(is_valid);")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_domain ON memory_nodes(domain);")

    def serialize_embedding(self, embedding_array: np.ndarray) -> bytes:
        """Converts Numpy array to SQLite BLOB."""
        return embedding_array.astype(np.float32).tobytes()

    def deserialize_embedding(self, embedding_blob: bytes) -> np.ndarray:
        """Converts SQLite BLOB back to Numpy array."""
        return np.frombuffer(embedding_blob, dtype=np.float32)

    def add_node(self, content: str, source_type: str, source_path: str, embedding: np.ndarray, model: str = 'qwen3-embedding-8b', domain: str = 'general'):
        """Inserts a new memory node."""
        blob = self.serialize_embedding(embedding)
        with self.conn:
            cursor = self.conn.execute(
                """
                INSERT INTO memory_nodes (content, source_type, source_path, domain, embedding, embedding_model)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (content, source_type, source_path, domain, blob, model)
            )
            return cursor.lastrowid

    def soft_delete_node(self, node_id: int):
        """Invalidates a memory instead of hard deleting (Rollback capability)."""
        with self.conn:
            self.conn.execute("UPDATE memory_nodes SET is_valid = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (node_id,))

    def get_all_valid_nodes(self):
        """Returns all valid nodes for querying/retrieval."""
        cursor = self.conn.execute("SELECT id, content, source_type, source_path, domain, embedding, created_at, hit_count FROM memory_nodes WHERE is_valid = 1")
        return cursor.fetchall()

    def get_valid_nodes_by_domain(self, domain: str):
        """Returns valid nodes filtered by domain."""
        cursor = self.conn.execute("SELECT id, content, source_type, source_path, domain, embedding, created_at, hit_count FROM memory_nodes WHERE is_valid = 1 AND domain = ?", (domain,))
        return cursor.fetchall()
        
    def increment_hit_count(self, node_id: int):
        """Increments hit_count for pruning logic."""
        with self.conn:
            self.conn.execute("UPDATE memory_nodes SET hit_count = hit_count + 1 WHERE id = ?", (node_id,))

    def queue_pending(self, content: str, source_type: str, source_path: str):
        """Queues an item when API is down (Graceful Degradation)."""
        with self.conn:
            self.conn.execute(
                "INSERT INTO pending_queue (content, source_type, source_path) VALUES (?, ?, ?)",
                (content, source_type, source_path)
            )

    def close(self):
        self.conn.close()

if __name__ == "__main__":
    # Test DB initialization
    print("Initializing Vector Store DB...")
    db = SQLiteVectorStore()
    cursor = db.conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Created tables:", [t[0] for t in tables])
    db.close()
