#!/usr/bin/env python3

import functools
import http.server
import threading
import webbrowser
from pathlib import Path


DIR = Path(__file__).parent / "src"
PORT = 8000
URL = f"http://localhost:{PORT}"


Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(DIR))

with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
    threading.Timer(0.5, lambda: webbrowser.open(URL)).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
