"""Local stand-in for the Apps Script endpoint. Logs each POST and answers like the real script.
   /ok   -> 200 {"ok":true}
   /fail -> 500
   /slow -> 200 after 20s (exercises the client timeout)
"""
import json
import time
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.send_header('Access-Control-Allow-Headers', 'content-type')
        self.end_headers()

    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(n).decode('utf-8', 'replace')
        print(f"POST {self.path} {self.headers.get('Content-Type')}\n  {body}", flush=True)
        if self.path == '/slow':
            time.sleep(20)
        if self.path == '/fail':
            self.send_response(500)
            self._cors()
            self.end_headers()
            return
        out = json.dumps({'ok': True}).encode()
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(out)))
        self.end_headers()
        self.wfile.write(out)


if __name__ == '__main__':
    print('mock endpoint on http://localhost:8767  (/ok, /fail, /slow)', flush=True)
    HTTPServer(('127.0.0.1', 8767), Handler).serve_forever()
