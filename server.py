"""
Flask backend: exposes POST /api/match to run the breed matcher.
Run from project root: python3 server.py
Runs the matcher CLI in a subprocess (same as running it from the shell) to avoid pyDatalog thread-local issues.
"""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS

_root = Path(__file__).resolve().parent
_matcher_script = _root / "matcher" / "trait_matcher.py"
app = Flask(__name__)
CORS(app)

MIN_MATCHES = 5


@app.route("/api/match", methods=["POST"])
def match():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "Request body must be JSON"}), 400
        prefs = data.get("preferences") if isinstance(data, dict) else data
        if not prefs or not isinstance(prefs, list):
            return jsonify({"error": "At least one preference with 'trait' is required"}), 400
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump(data if isinstance(data, dict) else {"preferences": prefs}, f)
            prefs_path = f.name
        try:
            env = {**os.environ, "PYTHONPATH": str(_root)}
            proc = subprocess.run(
                [sys.executable, str(_matcher_script), prefs_path, "--json-full", "--min-matches", str(MIN_MATCHES)],
                capture_output=True,
                text=True,
                timeout=90,
                cwd=str(_root),
                env=env,
            )
            if proc.returncode != 0:
                err = (proc.stderr or proc.stdout or "Matcher failed").strip()
                return jsonify({"error": err}), 500
            result = json.loads(proc.stdout)
            return jsonify(result)
        finally:
            Path(prefs_path).unlink(missing_ok=True)
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Matching timed out"}), 504
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid matcher output: {e}"}), 500
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
