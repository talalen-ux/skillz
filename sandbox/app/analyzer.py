"""Static analyzer: heuristic + AST-based risk scoring for skill code."""
from __future__ import annotations

import ast
import re
from typing import Any, Dict, List

DANGEROUS_CALLS = {
    "eval", "exec", "compile", "__import__", "open",
    "input", "globals", "vars", "getattr", "setattr", "delattr",
}
DANGEROUS_MODULES = {
    "subprocess", "socket", "os", "shutil", "ctypes", "cffi", "pickle",
    "marshal", "multiprocessing", "threading", "asyncio.subprocess",
    "requests", "urllib", "http.client", "ftplib", "telnetlib", "smtplib",
    "paramiko", "boto3", "web3", "eth_account", "solana", "wallet",
}
WALLET_HINTS = re.compile(r"(privatekey|mnemonic|seed_phrase|wallet|eth_account|0x[a-fA-F0-9]{40,64})")
HIDDEN_INSTRUCTIONS = re.compile(r"(ignore (all )?(previous|prior) (instructions|prompts)|system:\s*you are|jailbreak)", re.I)
OBFUSCATION = re.compile(r"(base64\.|codecs\.decode|chr\(\d+\)\s*\+\s*chr\(\d+\)|\\x[0-9a-fA-F]{2}){2,}")


def analyze(code: str, manifest: Dict[str, Any]) -> Dict[str, Any]:
    findings: List[Dict[str, str]] = []
    score = 0

    # AST-based checks
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {"riskScore": 100, "findings": [{"severity": "high", "rule": "syntax",
                                                 "message": f"syntax error: {e}"}]}

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for n in node.names:
                if n.name.split(".")[0] in DANGEROUS_MODULES:
                    findings.append({"severity": "high", "rule": "dangerous_import",
                                     "message": f"imports {n.name}"})
                    score += 25
        if isinstance(node, ast.ImportFrom):
            mod = (node.module or "").split(".")[0]
            if mod in DANGEROUS_MODULES:
                findings.append({"severity": "high", "rule": "dangerous_import",
                                 "message": f"from {node.module} import ..."})
                score += 25
        if isinstance(node, ast.Call):
            fn = ""
            if isinstance(node.func, ast.Name):
                fn = node.func.id
            elif isinstance(node.func, ast.Attribute):
                fn = node.func.attr
            if fn in DANGEROUS_CALLS:
                findings.append({"severity": "high", "rule": "dangerous_call",
                                 "message": f"calls {fn}()"})
                score += 20

    # Regex-based hints
    if WALLET_HINTS.search(code):
        findings.append({"severity": "high", "rule": "wallet_access",
                         "message": "wallet/private-key tokens detected"})
        score += 30
    if HIDDEN_INSTRUCTIONS.search(code):
        findings.append({"severity": "med", "rule": "hidden_prompt",
                         "message": "hidden prompt-injection-style instructions"})
        score += 15
    if OBFUSCATION.search(code):
        findings.append({"severity": "med", "rule": "obfuscation",
                         "message": "looks obfuscated (base64/decode/chr-concat)"})
        score += 15

    # Manifest sanity
    if not manifest.get("entry"):
        findings.append({"severity": "low", "rule": "manifest",
                         "message": "manifest missing 'entry' field"})
        score += 5

    if not findings:
        findings.append({"severity": "low", "rule": "ok", "message": "no static issues found"})

    return {"riskScore": min(score, 100), "findings": findings}
