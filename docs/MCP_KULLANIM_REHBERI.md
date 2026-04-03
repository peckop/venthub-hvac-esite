# 🧠 Model Context Protocol (MCP) Sunucuları Kullanım Rehberi

Bu doküman, projeye entegre edilebilecek veya sistemin potansiyelini artıran MCP (Model Context Protocol) araçlarının ne anlama geldiğini, hangi amaçlarla kullanılacağını ve "Fiziksel Sistem / Gerçek Hayat" analojilerini içermektedir.

> [!NOTE]
> **MCP (Model Context Protocol) Nedir?**
> Bir yapay zeka ajanının, tıpkı fiziksel bir ustanın takım çantasındaki farklı aletleri (matkap, ölçü aleti, lehim makinesi) kullanarak gerçek dünyadaki sistemlere etki etmesi veya veri okuması gibi, dış hizmetleri ve veritabanlarını kontrol etmesini sağlayan "Standartlaştırılmış Soket (Priz) Sistemidir."

---

## 1. ArizeTracingAssistant (Uçuş Veri Kaydedici / Karakutu)

**Nedir?** Yapay zeka (LLM) ajanlarının yanıtlarını, düşünme yollarını ve süreçte verdikleri kararları detaylı bir şekilde kaydeden sistemdir.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Üretim hattında bir hata meydana geldiğinde hatanın hangi istasyonda ve neden olduğunu bulmak için. Eğer yapay zeka absürt bir yanıt verirse veya sisteme yanlış veri kaydederse, bu hatanın (bug) nerede başladığını Arize üzerinden saniye saniye izleyip teşhis ederiz.

## 2. Genkit (Modüler Motor Şasesi ve Akış Kontrolü)

**Nedir?** Karmaşık AI yeteneklerini tıpkı bir fabrikadaki "Üretim Akış Şeması" (Flow) gibi modüler bir düzende çalıştıran ana şasedir.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Sistemde birden fazla yapay zeka modelinin aynı anda çalıştığı durumları düşünün. Biri resmi analiz edip diğeri rapor yazacak olsun. Bu iki süreci ardışık bir montaj bandı gibi (genkit flows) planlamak, test etmek ve durdurup başlatmak (start/stop) için Genkit ortamı kurulur.

## 3. Airweave (Pnömatik Tüp & Merkezi Arşiv Lojistiği)

**Nedir?** 50'den fazla farklı platformu (Uygulama, Veritabanı, PDF vb.) saniyeler içinde birbirine bağlayan ve güncel senkronize arama yapmayı sağlayan merkezi arama istasyonudur.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Elimizde dağınık veri havuzları varsa (Örneğin ürün verileri Supabase'de, müşteri şikayetleri Zendesk'te, kataloglar PDF dosyasında), ajanın tek bir merkezden devasa bir dosya kütüphanesini tarar gibi bu verilere anında ulaşıp cevap üretmesi gerektiğinde ihtiyaç duyulur.

## 4. Prisma (Gelişmiş Valf Bloğu ve Kontrol Panosu)

**Nedir?** Kod ile doğrudan veritabanı arasındaki bağlantıyı kuran, tip korumalı gümrük kapısı / sigorta panosudur (ORM).
**Ne Zaman ve Neden İhtiyaç Duyulur?** Veritabanına (Örneğin PostgreSQL) doğrudan SQL yazmadan, sıkı ve kurallı (type-safe) bir filtre ile okuma/yazma yapmak istediğimizde. Hata riskini minimize ederek (yanlış tipte verinin boruya girmesini engelleyen bir filtre valfi gibi) veriyi yönetmemizi sağlar.

## 5. Pinecone (Anlamsal Depo & İkiz Parça Radarı)

**Nedir?** Verilerin doğrudan kelime karşılıklarını değil, anlamsal uzaydaki "matematiksel ağırlıklarını" saniyeler içinde eşleştiren (Vektör) arama motoru deposudur.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Klasik veritabanları "mavi vana 3 inç" yazısını arar. Pinecone ise "su akışını kesen, paslanmaz boruya uygun parça" diye aradığınızda, mavi vanayı anlayıp (vektör anlamsal bağı) karşınıza getirir. Ürün öneri motorları (Bunu alan şunu da aldı) veya akıllı katalog taramaları için vazgeçilmezdir.

## 6. Heroku (Uzaktan Devreye Alma Şantiyesi)

**Nedir?** Kodların kendi bilgisayarımızdan çıkarak tüm dünyaya açılacağı barındırma (Cloud Hosting) santralinin uzaktan kumandasıdır.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Yapılan geliştirmelerin yayına (Prod) veya test ortamına (Stage) gönderilmesi, sunucunun kapatıp açılması (dyno scale) ve o andaki performans/bellek tıkanıklarının çözümlenmesi gerektiğinde, ajanın komutla platformu "uzaktan bir şantiye şefi gibi" yönetebilmesi için kullanılır.

## 7. Perplexity (Gerçek Zamanlı Radar ve Küresel Kütüphane)

**Nedir?** İnterneti canlı olarak tarayabilen, eski veri yerine en güncel kaynakları derleyip güçlü bir araştırma ofisi gibi çalışan sorgu motorudur.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Çözülecek problemin cevabı anlık ve değişken olduğunda veya bir kodlama kütüphanesinin en yeni kullanımına (dokümana) ihtiyaç duyduğumuzda güncel "radar taraması" yapar. Böylece eskimiş veya tahmini cevaplar (hallucinations) üretilmesi engellenir.

## 8. Redis (Aktarma Merkezi ve Yüksek Hızlı RAM Ambarı)

**Nedir?** Verileri kalıcı yavaş depolama alanları (Harddisk) yerine sistemin anlık hızlı hafızasında (RAM) tutan süper hızlı araç/mesajlaşma ortamıdır. İnteraktif aktarma merkezlerindeki dev forklift ağına veya hava kargoda beklemeden iletilen geçici depoya benzer.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Kalıcı olması gerekmeyen (Örneğin "15 dakika geçerli doğrulama kodu", "sepetteki geçici ürünler", "kimler şu an sayfada" gibi) anlık ve saniyede on binlerce kez okuma-yazma yapılması gereken senaryolarda sistemi kilitlememek için kullanılır. Ayrıca farklı makinelerin birbirleriyle mesajlaşma veya sipariş kuyruğu oluşturmasında kullanılır.

> [!IMPORTANT]  
> Bu araçların tamamı, otonom ajanın (JULES/AI) sadece kod yazan bir bot olmaktan çıkıp, tüm fabrikadaki aletleri, şebekeleri ve makineleri yerinden kalkmadan yönetebilen gerçek bir **"Sistem Analisti"** haline dönüşmesini sağlar.

<br/>

<details>
<summary><b>Orijinal Veriler (Referans Dokümanlar)</b></summary>

```text
ArizeTracingAssistant
1. get_arize_tracing_docs
Get docs and examples to instrument an app and send traces/spans to Arize. If the framework is not in the list use manual instrumentation with open telemetry. Parameters ---------- framework : str LLM provider or framework. One of: ["agno", "amazon-bedrock", "anthropic", "autogen", "beeai", "crewai", "dspy", "google-gen-ai", "groq", "guardrails-ai", "haystack", "hugging-face-smolagents", "instructor", "langchain", "langflow", "langgraph", "litellm", "llamaindex", "mistralai", "openai", "openai-agents", "prompt-flow", "pydantic-ai", "strands-agents", "together", "vercel", "vertexai"] language : str Programming language: "python" or "typescript" Returns ------- str Example code snippets for auto/manual instrumentation for Arize.
2. get_arize_advanced_tracing_docs
Get advanced docs and examples to manually instrument an app and send traces/spans to Arize. Parameters ----------: language: str "python" or "typescript" or "javascript" Returns: str Docs and code snippets for advanced instrumentation.
3. arize_support
Send *message* to the `search` tool and return the assistant reply. Parameters ---------- message : str The user message to send to the assistant. Returns ------- str The assistant's textual response.

Genkit
1. lookup_genkit_docs
Use this to look up documentation for the Genkit AI framework.
2. get_usage_guide
Use this tool to look up the Genkit usage guide before implementing any AI feature
3. list_flows
Use this to discover available Genkit flows or inspect the input schema of Genkit flows to know how to successfully call them.
4. run_flow
Runs the flow with the provided input
5. get_trace
Returns the trace details
6. start_runtime
Use this to start a Genkit runtime process (This is typically the entry point to the users app). Once started, the runtime will be picked up by the `genkit start` command to power the Dev UI features like model and flow playgrounds. The inputSchema for this tool matches the function prototype for `NodeJS.child_process.spawn`. Examples: {command: "go", args: ["run", "main.go"]} {command: "npm", args: ["run", "dev"]} {command: "npm", args: ["run", "dev"], projectRoot: "path/to/project"}
7. kill_runtime
Use this to kill an existing runtime that was started using the `start_runtime` tool
8. restart_runtime
Use this to restart an existing runtime that was started using the `start_runtime` tool

Airweave
What is Airweave?
Airweave connects to your apps, tools, and databases, continuously syncs their data, and exposes it through a unified, LLM-friendly search interface. AI agents query Airweave to retrieve relevant, grounded, up-to-date context from multiple sources in a single request.
Where it fits
Airweave sits between your data sources and AI systems as shared retrieval infrastructure. It handles authentication, ingestion, syncing, indexing, and retrieval so you don't have to rebuild fragile pipelines for every agent or integration.
How it works
1.	Connect your apps, databases, and documents (50+ integrations)
2.	Airweave syncs, indexes, and exposes your data through a unified retrieval layer
3.	Agents query Airweave via our SDKs, REST API, MCP, or native integrations with popular agent frameworks
4.	Agents retrieve relevant, grounded context on demand
Quickstart
Cloud-hosted: app.airweave.ai
Self-hosted
git clone https://github.com/airweave-ai/airweave.git cd airweave ./start.sh
→ http://localhost:8080
Requires Docker and docker-compose
Supported Integrations
SDKs
pip install airweave-sdk # Python npm install @airweave/sdk # TypeScript
from airweave import AirweaveSDK client = AirweaveSDK(api_key="YOUR_API_KEY") results = client.collections.search.instant( readable_id="my-collection", query="Find recent failed payments" )
CLI
Search collections, manage sources, and trigger syncs from your terminal:
pip install airweave-cli
airweave auth login airweave search "quarterly revenue figures" --collection finance-data
The CLI outputs rich interactive results in your terminal and clean JSON when piped — making it work for both developers and AI agents.
Tech Stack
•	Frontend: React/TypeScript with ShadCN
•	Backend: FastAPI (Python)
•	Databases: PostgreSQL (metadata), Vespa (vectors)
•	Workers: Temporal (orchestration), Redis (pub/sub)
•	Deployment: Docker Compose (dev), Kubernetes (prod)
Contributing
We welcome contributions! See our Contributing Guide.
License
MIT License

What is Prisma?
Prisma ORM is a next-generation ORM that consists of these tools:
•	Prisma Client: Auto-generated and type-safe query builder for Node.js & TypeScript
•	Prisma Migrate: Declarative data modeling & migration system
•	Prisma Studio: GUI to view and edit data in your database
Prisma Client can be used in any Node.js or TypeScript backend application (including serverless applications and microservices). This can be a REST API, a GraphQL API, a gRPC API, or anything else that needs a database.
If you need a database to use with Prisma ORM, check out Prisma Postgres or if you are looking for our MCP Server, head here.
Getting started
Quickstart (5min)
The fastest way to get started with Prisma is by following the quickstart guides. You can choose either of two databases:
•	Prisma Postgres
•	SQLite
Bring your own database
If you already have your own database, you can follow these guides:
•	Add Prisma to an existing project
•	Set up a new project with Prisma from scratch
How Prisma ORM works
This section provides a high-level overview of how Prisma ORM works and its most important technical components. For a more thorough introduction, visit the Prisma documentation.
The Prisma schema
Every project that uses a tool from the Prisma toolkit starts with a Prisma schema file. The Prisma schema allows developers to define their application models in an intuitive data modeling language and configure generators.
// Data source datasource db { provider = "postgresql" } // Generator generator client { provider = "prisma-client" output = "../generated" } // Data model model Post { id Int @id @default(autoincrement()) title String content String? published Boolean @default(false) author User? @relation(fields: [authorId], references: [id]) authorId Int? } model User { id Int @id @default(autoincrement()) email String @unique name String? posts Post[] }
In this schema, you configure three things:
•	Data source: Specifies your database type and thus defines the features and data types you can use in the schema
•	Generator: Indicates that you want to generate Prisma Client
•	Data model: Defines your application models
prisma.config.ts
Database connection details are defined via prisma.config.ts.
import { defineConfig } from 'prisma/config' export default defineConfig({ datasource: { url: 'postgres://...', }, })
If you store the database connection string in process.env, an env function can help you access it in a type safe way and throw an error if it is missing at run time:
import { defineConfig, env } from 'prisma/config' export default defineConfig({ datasource: { url: env('DATABASE_URL'), }, })
Prisma ORM does not load the .env files for you automatically. If you want to populate the environment variables from a .env file, consider using a package such as dotenv or @dotenvx/dotenvx.
The configuration file may look like this in that case:
import 'dotenv/config' import { defineConfig, env } from 'prisma/config' export default defineConfig({ datasource: { url: env('DATABASE_URL'), }, })
To start a local PostgreSQL development server without using Docker and without any configuration, run prisma dev:
npx prisma dev
Alternatively, spin up an instant Prisma Postgres® database in the cloud:
npx create-db --interactive
________________________________________
The Prisma data model
On this page, the focus is on the data model. You can learn more about Data sources and Generators on the respective docs pages.
Functions of Prisma models
The data model is a collection of models. A model has two major functions:
•	Represent a table in the underlying database
•	Provide the foundation for the queries in the Prisma Client API
Getting a data model
There are two major workflows for "getting" a data model into your Prisma schema:
•	Generate the data model from introspecting a database
•	Manually writing the data model and mapping it to the database with Prisma Migrate
Once the data model is defined, you can generate Prisma Client which will expose CRUD and more queries for the defined models. If you're using TypeScript, you'll get full type-safety for all queries (even when only retrieving the subsets of a model's fields).
________________________________________
Accessing your database with Prisma Client
Step 1: Install Prisma
First, install Prisma CLI as a development dependency and Prisma Client:
npm install prisma --save-dev npm install @prisma/client
Step 2: Set up your Prisma schema
Ensure your Prisma schema includes a generator block with an output path specified:
generator client { provider = "prisma-client" output = "../generated" } datasource db { provider = "postgresql" // mysql, sqlite, sqlserver, mongodb or cockroachdb }
Step 3: Configure Prisma Config
Configure the Prisma CLI using a prisma.config.ts file. This file configures Prisma CLI subcommands like migrate and studio. Create a prisma.config.ts file in your project root:
import { defineConfig, env } from 'prisma/config' type Env = { DATABASE_URL: string } export default defineConfig({ schema: 'prisma/schema.prisma', migrations: { path: 'prisma/migrations', }, datasource: { url: env<Env>('DATABASE_URL'), }, })
Note: Environment variables from .env files are not automatically loaded when using prisma.config.ts. You can use dotenv by importing dotenv/config at the top of your config file. For Bun, .env files are automatically loaded.
Learn more about Prisma Config and all available configuration options.
Step 4: Generate Prisma Client
Generate Prisma Client with the following command:
npx prisma generate
This command reads your Prisma schema and generates the Prisma Client code in the location specified by the output path in your generator configuration.
After you change your data model, you'll need to manually re-generate Prisma Client to ensure the generated code gets updated:
npx prisma generate
Refer to the documentation for more information about "generating the Prisma client".
Step 5: Use Prisma Client to send queries to your database
Once the Prisma Client is generated, you can import it in your code and send queries to your database.
Import and instantiate Prisma Client
You can import and instantiate Prisma Client from the output path specified in your generator configuration. When instantiating the Client, you need to provide a driver adapter to its constructor. For example, when using PostgreSQL with a driver adapter:
import { PrismaClient } from './generated/client' import { PrismaPg } from '@prisma/adapter-pg' const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL }) const prisma = new PrismaClient({ adapter })
To load environment variables, you can use dotenv by importing dotenv/config, use tsx --env-file=.env, node --env-file=.env, or Bun (which loads .env automatically).
Now you can start sending queries via the generated Prisma Client API, here are a few sample queries. Note that all Prisma Client queries return plain old JavaScript objects.
Learn more about the available operations in the Prisma Client docs or watch this demo video (2 min).
Retrieve all User records from the database
const allUsers = await prisma.user.findMany()
Include the posts relation on each returned User object
const allUsers = await prisma.user.findMany({ include: { posts: true }, })
Filter all Post records that contain "prisma"
const filteredPosts = await prisma.post.findMany({ where: { OR: [{ title: { contains: 'prisma' } }, { content: { contains: 'prisma' } }], }, })
Create a new User and a new Post record in the same query
const user = await prisma.user.create({ data: { name: 'Alice', email: 'alice@prisma.io', posts: { create: { title: 'Join us for Prisma Day 2021' }, }, }, })
Update an existing Post record
const post = await prisma.post.update({ where: { id: 42 }, data: { published: true }, })
Usage with TypeScript
Note that when using TypeScript, the result of this query will be statically typed so that you can't accidentally access a property that doesn't exist (and any typos are caught at compile-time). Learn more about leveraging Prisma Client's generated types on the Advanced usage of generated types page in the docs.
Community
Prisma has a large and supportive community of enthusiastic application developers. You can join us on Discord and here on GitHub.
Badges
   
Built something awesome with Prisma? 🌟 Show it off with these badges, perfect for your readme or website.
[![Made with Prisma](https://made-with.prisma.io/dark.svg)](https://prisma.io)
[![Made with Prisma](https://made-with.prisma.io/indigo.svg)](https://prisma.io)
Security
If you have a security issue to report, please contact us at security@prisma.io.
Support
Ask a question about Prisma
You can ask questions and initiate discussions about Prisma-related topics in the prisma repository on GitHub.
👉 Ask a question
Create a bug report for Prisma
If you see an error message or run into an issue, please make sure to create a bug report! You can find best practices for creating bug reports (like including additional debugging output) in the docs.
👉 Create bug report
Submit a feature request
If Prisma currently doesn't have a certain feature, be sure to check out the roadmap to see if this is already planned for the future.
If the feature on the roadmap is linked to a GitHub issue, please make sure to leave a 👍 reaction on the issue and ideally a comment with your thoughts about the feature!
👉 Submit feature request
Contributing
Refer to our contribution guidelines and Code of Conduct for contributors.
Tests Status
•	Prisma Tests Status:  
•	Ecosystem Tests Status:  

Pinecone Developer MCP Server
The Model Context Protocol (MCP) is a standard that allows coding assistants and other AI tools to interact with platforms like Pinecone. The Pinecone Developer MCP Server allows you to connect these tools with Pinecone projects and documentation.
Once connected, AI tools can:
•	Search Pinecone documentation to answer questions accurately.
•	Help you configure indexes based on your application's needs.
•	Generate code informed by your index configuration and data, as well as Pinecone documentation and examples.
•	Upsert and search for data in indexes, allowing you to test queries and evaluate results within your dev environment.
See the docs for more detailed information.
This MCP server is focused on improving the experience of developers working with Pinecone as part of their technology stack. It is intended for use with coding assistants. Pinecone also offers the Assistant MCP, which is designed to provide AI assistants with relevant context sourced from your knowledge base.
Setup
To configure the MCP server to access your Pinecone project, you will need to generate an API key using the console. Without an API key, your AI tool will still be able to search documentation. However, it will not be able to manage or query your indexes.
The MCP server requires Node.js v18 or later. Ensure that node and npx are available in your PATH.
Next, you will need to configure your AI assistant to use the MCP server.
Configure Cursor
To add the Pinecone MCP server to a project, create a .cursor/mcp.json file in the project root (if it doesn't already exist) and add the following configuration:
{ "mcpServers": { "pinecone": { "command": "npx", "args": [ "-y", "@pinecone-database/mcp" ], "env": { "PINECONE_API_KEY": "<your pinecone api key>" } } } }
You can check the status of the server in Cursor Settings > MCP.
To enable the server globally, add the configuration to the .cursor/mcp.json in your home directory instead.
It is recommended to use rules to instruct Cursor on proper usage of the MCP server. Check out the docs for some suggestions.
Configure Claude desktop
Use Claude desktop to locate the claude_desktop_config.json file by navigating to Settings > Developer > Edit Config. Add the following configuration:
{ "mcpServers": { "pinecone": { "command": "npx", "args": [ "-y", "@pinecone-database/mcp" ], "env": { "PINECONE_API_KEY": "<your pinecone api key>" } } } }
Restart Claude desktop. On the new chat screen, you should see a hammer (MCP) icon appear with the new MCP tools available.
Use as a Gemini CLI extension
To install this as a Gemini CLI extension, run the following command:
gemini extensions install https://github.com/pinecone-io/pinecone-mcp
You will need to provide your Pinecone API key in the PINECONE_API_KEY environment variable.
export PINECONE_API_KEY=<your pinecone api key>
When you run gemini and press ctrl+t, pinecone should now be shown in the list of installed MCP servers.
Usage
Once configured, your AI tool will automatically make use of the MCP to interact with Pinecone. You may be prompted for permission before a tool can be used.
Example prompts
Here are some prompts you can try with your AI assistant:
•	"Search the Pinecone docs for information about metadata filtering"
•	"List all my Pinecone indexes and describe their configurations"
•	"Create a new index called 'my-docs' using the multilingual-e5-large model"
•	"Upsert these documents into my index: [paste your documents]"
•	"Search my index for records related to 'authentication best practices'"
•	"What namespaces exist in my index, and how many records are in each?"
Tools
Pinecone Developer MCP Server provides the following tools for AI assistants to use:
•	search-docs: Search the official Pinecone documentation.
•	list-indexes: Lists all Pinecone indexes.
•	describe-index: Describes the configuration of an index.
•	describe-index-stats: Provides statistics about the data in the index, including the number of records and available namespaces.
•	create-index-for-model: Creates a new index that uses an integrated inference model to embed text as vectors.
•	upsert-records: Inserts or updates records in an index with integrated inference.
•	search-records: Searches for records in an index based on a text query, using integrated inference for embedding. Has options for metadata filtering and reranking.
•	cascading-search: Searches for records across multiple indexes, deduplicating and reranking the results.
•	rerank-documents: Reranks a collection of records or text documents using a specialized reranking model.
Limitations
Only indexes with integrated inference are supported. Assistants, indexes without integrated inference, standalone embeddings, and vector search are not supported.
Troubleshooting
MCP server not appearing in your AI tool
•	Ensure Node.js v18 or later is installed: node --version
•	Verify npx is available in your PATH: which npx
•	Check that your configuration file is in the correct location and has valid JSON syntax
•	Restart your AI tool after making configuration changes
"Invalid API key" or authentication errors
•	Verify your API key is correct in the Pinecone console
•	Check that the PINECONE_API_KEY environment variable is set correctly in your MCP configuration
•	Ensure there are no extra spaces or quotes around the API key value
Tools not working as expected
•	The MCP server only supports indexes with integrated inference. If you're trying to use a serverless index without integrated inference, you'll need to create a new index with an embedding model
•	Check the MCP server logs for error messages. In Cursor, view logs in Cursor Settings > MCP
Connection issues
•	If using a corporate network, ensure your firewall allows connections to api.pinecone.io
•	Try running the server manually to see detailed error output: PINECONE_API_KEY=<your-key> npx @pinecone-database/mcp
Contributing
We welcome your collaboration in improving the developer MCP experience. Please submit issues in the GitHub issue tracker. Information about contributing can be found in CONTRIBUTING.md.

heroku-mcp-server
The Heroku Platform MCP Server works on Common Runtime, Cedar Private and Shield Spaces, and Fir Private Spaces.
Prerequisites
•	Heroku CLI must be installed globally on your system, version 10.8.1 or higher.
o	Install or upgrade the Heroku CLI
Deploy on Heroku
Overview
The Heroku Platform MCP Server is a specialized Model Context Protocol (MCP) implementation designed to facilitate seamless interaction between large language models (LLMs) and the Heroku Platform. This server provides a robust set of tools and capabilities that enable LLMs to read, manage, and operate Heroku Platform resources.
Key Features:
•	Direct interaction with Heroku Platform resources through LLM-driven tools
•	Secure and authenticated access to Heroku Platform APIs, leveraging the Heroku CLI
•	Natural language interface for Heroku Platform interactions
Note: The Heroku Platform MCP Server is currently in early development. As we continue to enhance and refine the implementation, the available functionality and tools may evolve. We welcome feedback and contributions to help shape the future of this project.
Note: The Heroku Platform MCP Server requires the Heroku CLI to be installed globally (v10.8.1+). Ensure you have the correct version by running heroku --version.
Configure the Heroku Platform MCP Server
You can configure Claude Desktop, Zed, Cursor, Windsurf, and other clients to work with the Heroku Platform MCP Server.
Configure the Heroku Platform MCP Server with heroku mcp:start
Use heroku mcp:start to launch the Heroku Platform MCP Server. We recommend this method as it leverages your existing Heroku CLI authentication, so you don't need to set the HEROKU_API_KEY environment variable. The heroku mcp:start command is available in Heroku CLI version 10.8.1 and later.
There are several benefits to configuring with heroku mcp:start:
•	No need to manage or expose your Heroku API key
•	Uses your current Heroku CLI authentication context
•	Works seamlessly with supported clients
Example configuration for Claude Desktop:
{ "mcpServers": { "heroku": { "command": "heroku mcp:start" } } }
Example configuration for Zed:
{ "context_servers": { "heroku": { "command": { "path": "heroku", "args": ["mcp:start"] } } } }
Example configuration for Cursor:
{ "mcpServers": { "heroku": { "command": "heroku mcp:start" } } }
Example configuration for Windsurf:
{ "mcpServers": { "heroku": { "command": "heroku mcp:start" } } }
Example configuration for Cline:
{ "mcpServers": { "heroku": { "command": "heroku mcp:start" } } }
Example configuration for VSCode:
{ "mcp": { "servers": { "heroku": { "type": "stdio", "command": "heroku", "args": ["mcp:start"] } } } }
Example configuration for Trae:
{ "mcpServers": { "heroku": { "command": "heroku mcp:start" } } }
Note: When you use heroku mcp:start, the server authenticates using your current Heroku CLI session so you don't need to set the HEROKU_API_KEY environment variable. We recommend you use heroku mcp:start, but if you prefer to use an API key, you can use the alternate configuration below.
Configure the Heroku Platform MCP Server with npx -y @heroku/mcp-server
You can also launch the Heroku Platform MCP Server using the npx -y @heroku/mcp-server command. This method requires you to set the HEROKU_API_KEY environment variable with your Heroku authorization token.
Generating the HEROKU_API_KEY
Generate a Heroku authorization token with one of these methods:
•	Use the Heroku CLI command:
heroku authorizations:create
•	Use an existing token in the CLI
heroku auth:token
Copy the token and use it as your HEROKU_API_KEY in the following steps.
•	In your Heroku Dashboard:
1.	Select your avatar, then select Account Settings.
2.	Open the Applications tab.
3.	Next to Authorizations, click Create authorization.
Example configuration for Claude Desktop:
{ "mcpServers": { "heroku": { "command": "npx", "args": ["-y", "@heroku/mcp-server"], "env": { "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>" } } } }
Example configuration for Zed:
{ "context_servers": { "heroku": { "command": { "path": "npx", "args": ["-y", "@heroku/mcp-server"], "env": { "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>" } } } } }
Example configuration for Cursor:
{ "mcpServers": { "heroku": { "command": "npx -y @heroku/mcp-server", "env": { "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>" } } } }
Example configuration for Windsurf:
{ "mcpServers": { "heroku": { "command": "npx", "args": ["-y", "@heroku/mcp-server"], "env": { "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>" } } } }
Example configuration for Cline:
{ "mcpServers": { "heroku": { "command": "npx", "args": ["-y", "@heroku/mcp-server"], "env": { "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>" } } } }
Example configuration for VSCode:
{ "mcp": { "servers": { "heroku": { "type": "stdio", "command": "npx", "args": ["-y", "@heroku/mcp-server"], "env": { "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>" } } } } }
Example configuration for Trae:
{ "mcpServers": { "heroku": { "command": "npx", "args": ["-y", "@heroku/mcp-server"], "env": { "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>" } } } }
Note: When you use npx -y @heroku/mcp-server, you must set the HEROKU_API_KEY environment variable with your Heroku authorization token.
Available Tools
Application Management
•	list_apps - List all Heroku apps. You can filter apps by personal, collaborator, team, or space.
•	get_app_info - Get detailed information about an app, including its configuration, dynos, and add-ons.
•	create_app - Create a new app with customizable settings for region, team, and space.
•	rename_app - Rename an existing app.
•	transfer_app - Transfer ownership of an app to another user or team.
•	deploy_to_heroku - Deploy projects to Heroku with an app.json configuration, supporting team deployments, private spaces, and environment setups.
•	deploy_one_off_dyno - Execute code or commands in a sandboxed environment on a Heroku one-off dyno. Supports file creation, network access, environment variables, and automatic cleanup. Ideal for running scripts, tests, or temporary workloads.
Process & Dyno Management
•	ps_list - List all dynos for an app.
•	ps_scale - Scale the number of dynos up or down, or resize dynos.
•	ps_restart - Restart specific dynos, process types, or all dynos.
Add-ons
•	list_addons - List all add-ons for all apps or for a specific app.
•	get_addon_info - Get detailed information about a specific add-on.
•	create_addon - Provision a new add-on for an app.
Maintenance & Logs
•	maintenance_on - Enable maintenance mode for an app.
•	maintenance_off - Disable maintenance mode for an app.
•	get_app_logs - View application logs.
Pipeline Management
•	pipelines_create - Create a new pipeline.
•	pipelines_promote - Promote apps to the next stage in a pipeline.
•	pipelines_list - List available pipelines.
•	pipelines_info - Get detailed pipeline information.
Team & Space Management
•	list_teams - List teams you belong to.
•	list_private_spaces - List available spaces.
PostgreSQL Database Management
•	pg_psql - Execute SQL queries against the Heroku PostgreSQL database.
•	pg_info - Display detailed database information.
•	pg_ps - View active queries and execution details.
•	pg_locks - View database locks and identify blocking transactions.
•	pg_outliers - Identify resource-intensive queries.
•	pg_credentials - Manage database credentials and access.
•	pg_kill - Terminate specific database processes.
•	pg_maintenance - Show database maintenance information.
•	pg_backups - Manage database backups and schedules.
•	pg_upgrade - Upgrade PostgreSQL to a newer version.
Debugging
You can use the MCP inspector or the VS Code Run and Debug function to run and debug the server.
1.	Link the project as a global CLI using npm link from the project root.
2.	Build with npm run build:dev or watch for file changes and build automatically with npm run build:watch.
Use the MCP Inspector
Use the MCP inspector with no breakpoints in the code:
# Breakpoints are not available npx @modelcontextprotocol/inspector heroku-mcp-server
Alternatively, if you installed the package in a specific directory or are actively developing on the Heroku MCP server:
cd /path/to/servers npx @modelcontextprotocol/inspector dist/index.js
Use the VS Code Run and Debug Function
Use the VS Code Run and Debug launcher with fully functional breakpoints in the code:
1.	Locate and select the run debug.
2.	Select the configuration labeled "MCP Server Launcher" in the dropdown.
3.	Select the run/debug button.
VS Code / Cursor Debugging Setup
To set up local debugging with breakpoints:
1.	Store your Heroku auth token in the VS Code user settings:
o	Open the Command Palette (Cmd/Ctrl + Shift + P).
o	Type Preferences: Open User Settings (JSON).
o	Add the following snippet:
{ "heroku.mcp.authToken": "your-token-here" }
2.	Create or update .vscode/launch.json:
{ "version": "0.2.0", "configurations": [ { "type": "node", "request": "launch", "name": "MCP Server Launcher", "skipFiles": ["<node_internals>/**"], "program": "${workspaceFolder}/node_modules/@modelcontextprotocol/inspector/bin/cli.js", "outFiles": ["${workspaceFolder}/**/dist/**/*.js"], "env": { "HEROKU_API_KEY": "${config:heroku.mcp.authToken}", "DEBUG": "true" }, "args": ["heroku-mcp-server"], "sourceMaps": true, "console": "integratedTerminal", "internalConsoleOptions": "neverOpen", "preLaunchTask": "npm: build:watch" }, { "type": "node", "request": "attach", "name": "Attach to Debug Hook Process", "port": 9332, "skipFiles": ["<node_internals>/**"], "sourceMaps": true, "outFiles": ["${workspaceFolder}/dist/**/*.js"] }, { "type": "node", "request": "attach", "name": "Attach to REPL Process", "port": 9333, "skipFiles": ["<node_internals>/**"], "sourceMaps": true, "outFiles": ["${workspaceFolder}/dist/**/*.js"] } ], "compounds": [ { "name": "Attach to MCP Server", "configurations": ["Attach to Debug Hook Process", "Attach to REPL Process"] } ] }
3.	Create .vscode/tasks.json:
{ "version": "2.0.0", "tasks": [ { "type": "npm", "script": "build:watch", "group": { "kind": "build", "isDefault": true }, "problemMatcher": ["$tsc"] } ] }
4.	(Optional) Set breakpoints in your TypeScript files.
5.	Press F5 or use the Run and Debug sidebar.
Note: the debugger automatically builds your TypeScript files before launching.
Environment Variables
The Heroku Platform MCP Server supports the following environment variables:
HEROKU_API_KEY
Your Heroku authorization token. Required for authentication with the Heroku Platform.
MCP_SERVER_REQUEST_TIMEOUT
Timeout in milliseconds for command execution. Defaults to 15000 (15 seconds) if not set.
Example configuration with custom timeout:
{ "mcpServers": { "heroku": { "command": "npx", "args": ["-y", "@heroku/mcp-server"], "env": { "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>", "MCP_SERVER_REQUEST_TIMEOUT": "30000" } } } }

Perplexity API Platform MCP Server
The official MCP server implementation for the Perplexity API Platform, providing AI assistants with real-time web search, reasoning, and research capabilities through Sonar models and the Search API.
Available Tools
perplexity_search
Direct web search using the Perplexity Search API. Returns ranked search results with metadata, perfect for finding current information.
perplexity_ask
General-purpose conversational AI with real-time web search using the sonar-pro model. Great for quick questions and everyday searches.
perplexity_research
Deep, comprehensive research using the sonar-deep-research model. Ideal for thorough analysis and detailed reports.
perplexity_reason
Advanced reasoning and problem-solving using the sonar-reasoning-pro model. Perfect for complex analytical tasks.
[!TIP] Available as an optional parameter for perplexity_reason and perplexity_research: strip_thinking
Set to true to remove <think>...</think> tags from the response, saving context tokens. Default: false
Configuration
Get Your API Key
1.	Get your Perplexity API Key from the API Portal
2.	Replace your_key_here in the configurations below with your API key
3.	(Optional) Set timeout: PERPLEXITY_TIMEOUT_MS=600000 (default: 5 minutes)
4.	(Optional) Set custom base URL: PERPLEXITY_BASE_URL=https://your-custom-url.com (default: https://api.perplexity.ai)
5.	(Optional) Set log level: PERPLEXITY_LOG_LEVEL=DEBUG|INFO|WARN|ERROR (default: ERROR)
Claude Code
claude mcp add perplexity --env PERPLEXITY_API_KEY="your_key_here" -- npx -y @perplexity-ai/mcp-server
Or install via plugin:
export PERPLEXITY_API_KEY="your_key_here" claude # Then run: /plugin marketplace add perplexityai/modelcontextprotocol # Then run: /plugin install perplexity
Cursor, Claude Desktop & Windsurf
We recommend using the one-click install badge at the top of this README for Cursor.
For manual setup, all these clients use the same mcpServers format:
Client	Config File
Cursor	~/.cursor/mcp.json
Claude Desktop	claude_desktop_config.json
Windsurf	~/.codeium/windsurf/mcp_config.json
{ "mcpServers": { "perplexity": { "command": "npx", "args": ["-y", "@perplexity-ai/mcp-server"], "env": { "PERPLEXITY_API_KEY": "your_key_here" } } } }
VS Code
We recommend using the one-click install badge at the top of this README for VS Code, or for manual setup, add to .vscode/mcp.json:
{ "servers": { "perplexity": { "type": "stdio", "command": "npx", "args": ["-y", "@perplexity-ai/mcp-server"], "env": { "PERPLEXITY_API_KEY": "your_key_here" } } } }
Codex
codex mcp add perplexity --env PERPLEXITY_API_KEY="your_key_here" -- npx -y @perplexity-ai/mcp-server
Other MCP Clients
Most clients can be manually configured to use the mcpServers wrapper in their configuration file (like Cursor). If your client doesn't work, check its documentation for the correct wrapper format.
Proxy Setup (For Corporate Networks)
If you are running this server at work—especially behind a company firewall or proxy—you may need to tell the program how to send its internet traffic through your network's proxy. Follow these steps:
1. Get your proxy details
•	Ask your IT department for your HTTPS proxy address and port.
•	You may also need a username and password.
2. Set the proxy environment variable
The easiest and most reliable way for Perplexity MCP is to use PERPLEXITY_PROXY. For example:
export PERPLEXITY_PROXY=https://your-proxy-host:8080
If your proxy needs a username and password, use:
export PERPLEXITY_PROXY=https://username:password@your-proxy-host:8080
3. Alternate: Standard environment variables
If you'd rather use the standard variables, we support HTTPS_PROXY and HTTP_PROXY.
[!NOTE] The server checks proxy settings in this order: PERPLEXITY_PROXY → HTTPS_PROXY → HTTP_PROXY. If none are set, it connects directly to the internet. URLs must include https://. Typical ports are 8080, 3128, and 80.
HTTP Server Deployment
For cloud or shared deployments, run the server in HTTP mode.
Environment Variables
Variable	Description	Default
PERPLEXITY_API_KEY	Your Perplexity API key	Required
PERPLEXITY_BASE_URL	Custom base URL for API requests	https://api.perplexity.ai
PORT	HTTP server port	8080
BIND_ADDRESS	Network interface to bind to	0.0.0.0
ALLOWED_ORIGINS	CORS origins (comma-separated)	*
Docker
docker build -t perplexity-mcp-server . docker run -p 8080:8080 -e PERPLEXITY_API_KEY=your_key_here perplexity-mcp-server
Node.js
export PERPLEXITY_API_KEY=your_key_here npm install && npm run build && npm run start:http
The server will be accessible at http://localhost:8080/mcp
Troubleshooting
•	API Key Issues: Ensure PERPLEXITY_API_KEY is set correctly
•	Connection Errors: Check your internet connection and API key validity
•	Tool Not Found: Make sure the package is installed and the command path is correct
•	Timeout Errors: For very long research queries, set PERPLEXITY_TIMEOUT_MS to a higher value
•	Proxy Issues: Verify your PERPLEXITY_PROXY or HTTPS_PROXY setup and ensure api.perplexity.ai isn't blocked by your firewall.
•	EOF / Initialize Errors: Some strict MCP clients fail because npx writes installation messages to stdout. Use npx -yq instead of npx -y to suppress this output.
For support, visit community.perplexity.ai or file an issue.

Redis MCP Server
Overview
The Redis MCP Server is a natural language interface designed for agentic applications to efficiently manage and search data in Redis. It integrates seamlessly with MCP (Model Content Protocol) clients, enabling AI-driven workflows to interact with structured and unstructured data in Redis. Using this MCP Server, you can ask questions like:
•	"Store the entire conversation in a stream"
•	"Cache this item"
•	"Store the session with an expiration time"
•	"Index and search this vector"
Table of Contents
•	Overview
•	Features
•	Tools
•	Installation
o	From PyPI (recommended)
o	Testing the PyPI package
o	From GitHub
o	Development Installation
o	With Docker
•	Configuration
o	Redis ACL
o	Configuration via command line arguments
o	Configuration via Environment Variables
o	EntraID Authentication for Azure Managed Redis
o	Logging
•	Integrations
o	OpenAI Agents SDK
o	Augment
o	Claude Desktop
o	VS Code with GitHub Copilot
•	Testing
•	Example Use Cases
•	Contributing
•	License
•	Badges
•	Contact
Features
•	Natural Language Queries: Enables AI agents to query and update Redis using natural language.
•	Seamless MCP Integration: Works with any MCP client for smooth communication.
•	Full Redis Support: Handles hashes, lists, sets, sorted sets, streams, and more.
•	Search & Filtering: Supports efficient data retrieval and searching in Redis.
•	Scalable & Lightweight: Designed for high-performance data operations.
•	EntraID Authentication: Native support for Azure Active Directory authentication with Azure Managed Redis.
•	The Redis MCP Server supports the stdio transport. Support to the stremable-http transport will be added in the future.
Tools
This MCP Server provides tools to manage the data stored in Redis.
•	string tools to set, get strings with expiration. Useful for storing simple configuration values, session data, or caching responses.
•	hash tools to store field-value pairs within a single key. The hash can store vector embeddings. Useful for representing objects with multiple attributes, user profiles, or product information where fields can be accessed individually.
•	list tools with common operations to append and pop items. Useful for queues, message brokers, or maintaining a list of most recent actions.
•	set tools to add, remove and list set members. Useful for tracking unique values like user IDs or tags, and for performing set operations like intersection.
•	sorted set tools to manage data for e.g. leaderboards, priority queues, or time-based analytics with score-based ordering.
•	pub/sub functionality to publish messages to channels and subscribe to receive them. Useful for real-time notifications, chat applications, or distributing updates to multiple clients.
•	streams tools to add, read, and delete from data streams. Useful for event sourcing, activity feeds, or sensor data logging with consumer groups support.
•	JSON tools to store, retrieve, and manipulate JSON documents in Redis. Useful for complex nested data structures, document databases, or configuration management with path-based access.
Additional tools.
•	docs tool to search Redis documentation, tutorials, and best practices using natural language questions (backed by the MCP_DOCS_SEARCH_URL HTTP API).
•	query engine tools to manage vector indexes and perform vector search
•	server management tool to retrieve information about the database
Installation
The Redis MCP Server is available as a PyPI package and as direct installation from the GitHub repository.
From PyPI (recommended)
Configuring the latest Redis MCP Server version from PyPI, as an example, can be done importing the following JSON configuration in the desired framework or tool. The uvx command will download the server on the fly (if not cached already), create a temporary environment, and then run it.
{ "mcpServers": { "RedisMCPServer": { "command": "uvx", "args": [ "--from", "redis-mcp-server@latest", "redis-mcp-server", "--url", "\"redis://localhost:6379/0\"" ] } } }
URL specification
The format to specify the --url argument follows the redis and rediss schemes:
redis://user:secret@localhost:6379/0?foo=bar&qux=baz
As an example, you can easily connect to a localhost server with:
redis://localhost:6379/0
Where 0 is the logical database you'd like to connect to.
For an encrypted connection to the database (e.g., connecting to a Redis Cloud database), you'd use the rediss scheme.
rediss://user:secret@localhost:6379/0?foo=bar&qux=baz
To verify the server's identity, specify ssl_ca_certs.
rediss://user:secret@hostname:port?ssl_cert_reqs=required&ssl_ca_certs=path_to_the_certificate
For an unverified connection, set ssl_cert_reqs to none
rediss://user:secret@hostname:port?ssl_cert_reqs=none
Configure your connection using the available options in the section "Available CLI Options".
Testing the PyPI package
You can install the package as follows:
pip install redis-mcp-server
And start it using uv the package in your environment.
uv python install 3.14 uv sync uv run redis-mcp-server --url redis://localhost:6379/0
However, starting the MCP Server is most useful when delegate to the framework or tool where this MCP Server is configured.
From GitHub
You can configure the desired Redis MCP Server version with uvx, which allows you to run it directly from GitHub (from a branch, or use a tagged release).
It is recommended to use a tagged release, the main branch is under active development and may contain breaking changes.
As an example, you can execute the following command to run the 0.2.0 release:
uvx --from git+https://github.com/redis/mcp-redis.git@0.2.0 redis-mcp-server --url redis://localhost:6379/0
Check the release notes for the latest version in the Releases section. Additional examples are provided below.
# Run with Redis URI uvx --from git+https://github.com/redis/mcp-redis.git redis-mcp-server --url redis://localhost:6379/0 # Run with Redis URI and SSL uvx --from git+https://github.com/redis/mcp-redis.git redis-mcp-server --url "rediss://<USERNAME>:<PASSWORD>@<HOST>:<PORT>?ssl_cert_reqs=required&ssl_ca_certs=<PATH_TO_CERT>" # Run with individual parameters uvx --from git+https://github.com/redis/mcp-redis.git redis-mcp-server --host localhost --port 6379 --password mypassword # See all options uvx --from git+https://github.com/redis/mcp-redis.git redis-mcp-server --help
Development Installation
For development or if you prefer to clone the repository:
# Clone the repository git clone https://github.com/redis/mcp-redis.git cd mcp-redis # Install dependencies using uv uv venv source .venv/bin/activate uv sync # Run with CLI interface uv run redis-mcp-server --help # Or run the main file directly (uses environment variables) uv run src/main.py
Once you cloned the repository, installed the dependencies and verified you can run the server, you can configure Claude Desktop or any other MCP Client to use this MCP Server running the main file directly (it uses environment variables). This is usually preferred for development. The following example is for Claude Desktop, but the same applies to any other MCP Client.
1.	Specify your Redis credentials and TLS configuration
2.	Retrieve your uv command full path (e.g. which uv)
3.	Edit the claude_desktop_config.json configuration file
o	on a MacOS, at ~/Library/Application\ Support/Claude/
{ "mcpServers": { "redis": { "command": "<full_path_uv_command>", "args": [ "--directory", "<your_mcp_server_directory>", "run", "src/main.py" ], "env": { "REDIS_HOST": "<your_redis_database_hostname>", "REDIS_PORT": "<your_redis_database_port>", "REDIS_PWD": "<your_redis_database_password>", "REDIS_SSL": True|False, "REDIS_SSL_CA_PATH": "<your_redis_ca_path>", "REDIS_CLUSTER_MODE": True|False } } } }
You can troubleshoot problems by tailing the log file.
tail -f ~/Library/Logs/Claude/mcp-server-redis.log
With Docker
You can use a dockerized deployment of this server. You can either build your own image or use the official Redis MCP Docker image.
If you'd like to build your own image, the Redis MCP Server provides a Dockerfile. Build this server's image with:
docker build -t mcp-redis .
Finally, configure the client to create the container at start-up. An example for Claude Desktop is provided below. Edit the claude_desktop_config.json and add:
{ "mcpServers": { "redis": { "command": "docker", "args": ["run", "--rm", "--name", "redis-mcp-server", "-i", "-e", "REDIS_HOST=<redis_hostname>", "-e", "REDIS_PORT=<redis_port>", "-e", "REDIS_USERNAME=<redis_username>", "-e", "REDIS_PWD=<redis_password>", "mcp-redis"] } } }
To use the official Redis MCP Docker image, just replace your image name (mcp-redis in the example above) with mcp/redis.
Configuration
The Redis MCP Server can be configured in two ways: via command line arguments or via environment variables. The precedence is: command line arguments > environment variables > default values.
Redis ACL
You can configure Redis ACL to restrict the access to the Redis database. For example, to create a read-only user:
127.0.0.1:6379> ACL SETUSER readonlyuser on >mypassword ~* +@read -@write
Configure the user via command line arguments or environment variables.
Configuration via command line arguments
When using the CLI interface, you can configure the server with command line arguments:
# Basic Redis connection uvx --from redis-mcp-server@latest redis-mcp-server \ --host localhost \ --port 6379 \ --password mypassword # Using Redis URI (simpler) uvx --from redis-mcp-server@latest redis-mcp-server \ --url redis://user:pass@localhost:6379/0 # SSL connection uvx --from redis-mcp-server@latest redis-mcp-server \ --url rediss://user:pass@redis.example.com:6379/0 # See all available options uvx --from redis-mcp-server@latest redis-mcp-server --help
Available CLI Options:
•	--url - Redis connection URI (redis://user:pass@host:port/db)
•	--host - Redis hostname (default: 127.0.0.1)
•	--port - Redis port (default: 6379)
•	--db - Redis database number (default: 0)
•	--username - Redis username
•	--password - Redis password
•	--ssl - Enable SSL connection
•	--ssl-ca-path - Path to CA certificate file
•	--ssl-keyfile - Path to SSL key file
•	--ssl-certfile - Path to SSL certificate file
•	--ssl-cert-reqs - SSL certificate requirements (default: required)
•	--ssl-ca-certs - Path to CA certificates file
•	--cluster-mode - Enable Redis cluster mode
Configuration via Environment Variables
If desired, you can use environment variables. Defaults are provided for all variables.
Name	Description	Default Value
REDIS_HOST	Redis IP or hostname	"127.0.0.1"
REDIS_PORT	Redis port	6379
REDIS_DB	Database	0
REDIS_USERNAME	Default database username	"default"
REDIS_PWD	Default database password	""
REDIS_SSL	Enables or disables SSL/TLS	False
REDIS_SSL_CA_PATH	CA certificate for verifying server	None
REDIS_SSL_KEYFILE	Client's private key file for client authentication	None
REDIS_SSL_CERTFILE	Client's certificate file for client authentication	None
REDIS_SSL_CERT_REQS	Whether the client should verify the server's certificate	"required"
REDIS_SSL_CA_CERTS	Path to the trusted CA certificates file	None
REDIS_CLUSTER_MODE	Enable Redis Cluster mode	False
EntraID Authentication for Azure Managed Redis
The Redis MCP Server supports EntraID (Azure Active Directory) authentication for Azure Managed Redis, enabling OAuth-based authentication with automatic token management.
Authentication Providers
Service Principal Authentication - Application-based authentication using client credentials:
export REDIS_ENTRAID_AUTH_FLOW=service_principal export REDIS_ENTRAID_CLIENT_ID=your-client-id export REDIS_ENTRAID_CLIENT_SECRET=your-client-secret export REDIS_ENTRAID_TENANT_ID=your-tenant-id
Managed Identity Authentication - For Azure-hosted applications:
# System-assigned managed identity export REDIS_ENTRAID_AUTH_FLOW=managed_identity export REDIS_ENTRAID_IDENTITY_TYPE=system_assigned # User-assigned managed identity export REDIS_ENTRAID_AUTH_FLOW=managed_identity export REDIS_ENTRAID_IDENTITY_TYPE=user_assigned export REDIS_ENTRAID_USER_ASSIGNED_CLIENT_ID=your-identity-client-id
Default Azure Credential - Automatic credential discovery (recommended for development):
export REDIS_ENTRAID_AUTH_FLOW=default_credential export REDIS_ENTRAID_SCOPES=https://redis.azure.com/.default
EntraID Configuration Variables
Name	Description	Default Value
REDIS_ENTRAID_AUTH_FLOW	Authentication flow type	None (EntraID disabled)
REDIS_ENTRAID_CLIENT_ID	Service Principal client ID	None
REDIS_ENTRAID_CLIENT_SECRET	Service Principal client secret	None
REDIS_ENTRAID_TENANT_ID	Azure tenant ID	None
REDIS_ENTRAID_IDENTITY_TYPE	Managed identity type	"system_assigned"
REDIS_ENTRAID_USER_ASSIGNED_CLIENT_ID	User-assigned managed identity client ID	None
REDIS_ENTRAID_SCOPES	OAuth scopes for Default Azure Credential	"https://redis.azure.com/.default"
REDIS_ENTRAID_RESOURCE	Azure Redis resource identifier	"https://redis.azure.com/"
Key Features
•	Automatic token renewal - Background token refresh with no manual intervention
•	Graceful fallback - Falls back to standard Redis authentication when EntraID not configured
•	Multiple auth flows - Supports Service Principal, Managed Identity, and Default Azure Credential
•	Enterprise ready - Designed for Azure Managed Redis with centralized identity management
Example Configuration
For local development with Azure CLI:
# Login with Azure CLI az login # Configure MCP server export REDIS_ENTRAID_AUTH_FLOW=default_credential export REDIS_URL=redis://your-azure-redis.redis.cache.windows.net:6379
For production with Service Principal:
export REDIS_ENTRAID_AUTH_FLOW=service_principal export REDIS_ENTRAID_CLIENT_ID=your-app-client-id export REDIS_ENTRAID_CLIENT_SECRET=your-app-secret export REDIS_ENTRAID_TENANT_ID=your-tenant-id export REDIS_URL=redis://your-azure-redis.redis.cache.windows.net:6379
For Azure-hosted applications with Managed Identity:
export REDIS_ENTRAID_AUTH_FLOW=managed_identity export REDIS_ENTRAID_IDENTITY_TYPE=system_assigned export REDIS_URL=redis://your-azure-redis.redis.cache.windows.net:6379
There are several ways to set environment variables:
1.	Using a .env File: Place a .env file in your project directory with key-value pairs for each environment variable. Tools like python-dotenv, pipenv, and uv can automatically load these variables when running your application. This is a convenient and secure way to manage configuration, as it keeps sensitive data out of your shell history and version control (if .env is in .gitignore). For example, create a .env file with the following content from the .env.example file provided in the repository:
cp .env.example .env
Then edit the .env file to set your Redis configuration:
OR,
2.	Setting Variables in the Shell: You can export environment variables directly in your shell before running your application. For example:
export REDIS_HOST=your_redis_host export REDIS_PORT=6379 # Other variables will be set similarly...
This method is useful for temporary overrides or quick testing.
Logging
The server uses Python's standard logging and is configured at startup. By default it logs at WARNING and above. You can change verbosity with the MCP_REDIS_LOG_LEVEL environment variable.
•	Accepted values (case-insensitive): DEBUG, INFO, WARNING, ERROR, CRITICAL, NOTSET
•	Aliases supported: WARN → WARNING, FATAL → CRITICAL
•	Numeric values are also accepted, including signed (e.g., "10", "+20")
•	Default when unset or unrecognized: WARNING
Handler behavior
•	If the host (e.g., uv, VS Code, pytest) already installed console handlers, the server will NOT add its own; it only lowers overly-restrictive handler thresholds so your chosen level is not filtered out. It will never raise a handler's threshold.
•	If no handlers are present, the server adds a single stderr StreamHandler with a simple format.
Examples
# See normal lifecycle messages MCP_REDIS_LOG_LEVEL=INFO uv run src/main.py # Very verbose for debugging MCP_REDIS_LOG_LEVEL=DEBUG uvx --from redis-mcp-server@latest redis-mcp-server --url redis://localhost:6379/0
In MCP client configs that support env, add it alongside your Redis settings. For example:
{ "mcpServers": { "redis": { "command": "uvx", "args": ["--from", "redis-mcp-server@latest", "redis-mcp-server", "--url", "redis://localhost:6379/0"], "env": { "REDIS_HOST": "localhost", "REDIS_PORT": "6379", "MCP_REDIS_LOG_LEVEL": "INFO" } } } }
Integrations
Integrating this MCP Server to development frameworks like OpenAI Agents SDK, or with tools like Claude Desktop, VS Code, or Augment is described in the following sections.
OpenAI Agents SDK
Integrate this MCP Server with the OpenAI Agents SDK. Read the documents to learn more about the integration of the SDK with MCP.
Install the Python SDK.
pip install openai-agents
Configure the OpenAI token:
export OPENAI_API_KEY="<openai_token>"
And run the application.
python3.14 redis_assistant.py
You can troubleshoot your agent workflows using the OpenAI dashboard.
Augment
The preferred way of configuring the Redis MCP Server in Augment is to use the Easy MCP feature.
You can also configure the Redis MCP Server in Augment manually by importing the server via JSON:
{ "mcpServers": { "Redis MCP Server": { "command": "uvx", "args": [ "--from", "redis-mcp-server@latest", "redis-mcp-server", "--url", "redis://localhost:6379/0" ] } } }
Claude Desktop
The simplest way to configure MCP clients is using uvx. Add the following JSON to your claude_desktop_config.json, remember to provide the full path to uvx.
Basic Redis connection:
{ "mcpServers": { "redis-mcp-server": { "type": "stdio", "command": "/Users/mortensi/.local/bin/uvx", "args": [ "--from", "redis-mcp-server@latest", "redis-mcp-server", "--url", "redis://localhost:6379/0" ] } } }
Azure Managed Redis with EntraID authentication:
{ "mcpServers": { "redis-mcp-server": { "type": "stdio", "command": "/Users/mortensi/.local/bin/uvx", "args": [ "--from", "redis-mcp-server@latest", "redis-mcp-server", "--url", "redis://your-azure-redis.redis.cache.windows.net:6379" ], "env": { "REDIS_ENTRAID_AUTH_FLOW": "default_credential", "REDIS_ENTRAID_SCOPES": "https://redis.azure.com/.default" } } } }
VS Code with GitHub Copilot
To use the Redis MCP Server with VS Code, you must nable the agent mode tools. Add the following to your settings.json:
{ "chat.agent.enabled": true }
You can start the GitHub desired version of the Redis MCP server using uvx by adding the following JSON to your mcp.json file:
"servers": { "redis": { "type": "stdio", "command": "uvx", "args": [ "--from", "redis-mcp-server@latest", "redis-mcp-server", "--url", "redis://localhost:6379/0" ] }, }
Suppressing uvx Installation Messages
If you want to suppress uvx installation messages that may appear as warnings in MCP client logs, use the -qq flag:
"servers": { "redis": { "type": "stdio", "command": "uvx", "args": [ "-qq", "--from", "redis-mcp-server@latest", "redis-mcp-server", "--url", "redis://localhost:6379/0" ] }, }
The -qq flag enables silent mode, which suppresses "Installed X packages" messages that uvx writes to stderr during package installation.
Alternatively, you can start the server using uv and configure your mcp.json. This is usually desired for development.
// mcp.json { "servers": { "redis": { "type": "stdio", "command": "<full_path_uv_command>", "args": [ "--directory", "<your_mcp_server_directory>", "run", "src/main.py" ], "env": { "REDIS_HOST": "<your_redis_database_hostname>", "REDIS_PORT": "<your_redis_database_port>", "REDIS_USERNAME": "<your_redis_database_username>", "REDIS_PWD": "<your_redis_database_password>", } } } }
For more information, see the VS Code documentation.
Tip: You can prompt Copilot chat to use the Redis MCP tools by including #redis in your message.
Note: Starting with VS Code v1.102, MCP servers are now stored in a dedicated mcp.json file instead of settings.json.
Testing
You can use the MCP Inspector for visual debugging of this MCP Server.
npx @modelcontextprotocol/inspector uv run src/main.py
Example Use Cases
•	AI Assistants: Enable LLMs to fetch, store, and process data in Redis.
•	Chatbots & Virtual Agents: Retrieve session data, manage queues, and personalize responses.
•	Data Search & Analytics: Query Redis for real-time insights and fast lookups.
•	Event Processing: Manage event streams with Redis Streams.
Contributing
1.	Fork the repo
2.	Create a new branch (feature-branch)
3.	Commit your changes
4.	Push to your branch and submit a PR!
License
This project is licensed under the MIT License.
Badges
Contact
For questions or support, reach out via GitHub Issues.
Alternatively, you can join the Redis Discord server and ask in the #redis-mcp-server channel.
```
</details>
