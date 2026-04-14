import os
import sys
import json
import subprocess
from datetime import datetime

class MRIDiagnosticEngine:
    def __init__(self):
        self.workspace_root = os.getcwd()
        self.template_path = os.path.join(self.workspace_root, '.agent', 'skills', 'venthub-deep-mri', 'mri-template.json')
        self.report_dir = os.path.join(self.workspace_root, '.agent', 'reports', 'mri')
        self.config = self.load_config()

    def load_config(self):
        if not os.path.exists(self.template_path):
            print(f"HATA: MRI Template bulunamadi: {self.template_path}")
            sys.exit(1)
        with open(self.template_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def print_section(self, title):
        print(f"\n{'='*50}\n[{title}]\n{'='*50}")

    def run_command(self, cmd):
        print(f"--> {cmd}")
        # Run command and capture output
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                cwd=self.workspace_root,
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='replace'
            )
            return result.returncode, result.stdout or "", result.stderr or ""
        except Exception as e:
            return 1, "", str(e)

    def ensure_report_dir(self):
        os.makedirs(self.report_dir, exist_ok=True)

    def run_knip(self, module_config):
        self.print_section("Knip Analysis (Dead Code & Exports)")
        cmd = module_config.get("command", "pnpm run knip")
        
        returncode, stdout, stderr = self.run_command(cmd)
        
        # Save exact output to report
        report_path = os.path.join(self.report_dir, 'knip_report.txt')
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(stdout)
            if stderr:
                f.write(f"\nERRORS:\n{stderr}")
                
        print(f"[INFO] Analyzed {len(stdout)} characters of output.")
        
        print(f"\n[INFO] Knip report saved to: {report_path}")
        if returncode != 0:
            print("[WARNING] Knip detected issues. Please check the report.")
        else:
            print("[PASS] Knip found no dead code/unused dependencies.")

    def run_bundle_analyzer(self, module_config):
        self.print_section("Next.js Bundle Analyzer")
        cmd = module_config.get("command", "pnpm run analyze")
        
        returncode, stdout, stderr = self.run_command(cmd)
        
        report_path = os.path.join(self.report_dir, 'bundle_analyzer_log.txt')
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(stdout)
            if stderr:
                f.write(f"\nERRORS:\n{stderr}")
                
        print(f"[INFO] Bundle analyzer completed. Check '.next/analyze/' for HTML reports.")
        print(f"[INFO] Build logs saved to: {report_path}")

    def execute(self):
        self.print_section("VentHub Deep MRI Diagnostics - START")
        print("DIKKAT: MRI derin performans katsayisidir, Röntgen isleminden sonra calismalidir.")
        
        self.ensure_report_dir()
        
        modules = self.config.get("modules", {})
        
        if "dead_code" in modules:
            self.run_knip(modules["dead_code"])
            
        if "bundle_analyzer" in modules:
            self.run_bundle_analyzer(modules["bundle_analyzer"])
            
        self.print_section("VentHub Deep MRI Diagnostics - COMPLETE")
        print("\n[BILGI] MRI cerrahi mudahale (kod degisikligi) yapmaz. Sadece raporlama yapar.")
        print("[BILGI] Lutfen uretilen raporlari (HTML ve txt) inceleyerek mudahale karari aliniz.")

if __name__ == "__main__":
    engine = MRIDiagnosticEngine()
    engine.execute()
