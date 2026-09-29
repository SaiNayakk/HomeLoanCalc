"""
Serves the built app (dist/) on the phone. Standard library only, so it runs on Termux.

- Hashed files under /assets/ are cached for a year; everything else is revalidated.
- Unknown paths fall back to index.html, so shared links keep working.
- Binds to 127.0.0.1: only the Cloudflare tunnel reaches it.

    python3 serve.py            # port 5173, or PORT=...
"""
import mimetypes
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("image/svg+xml", ".svg")


class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or (os.path.isdir(path) and not os.path.exists(os.path.join(path, "index.html"))):
            self.path = "/index.html"  # SPA fallback
        return super().send_head()

    def end_headers(self):
        p = self.path.split("?", 1)[0]
        if p.startswith("/assets/"):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        else:
            self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # the tunnel sees every request; keep the app log quiet


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5173"))
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=ROOT))
    print(f"HomeLoanCalc on 127.0.0.1:{port}", flush=True)
    server.serve_forever()
