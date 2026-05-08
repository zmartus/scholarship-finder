"""Make `import scraper.*` work for pytest regardless of editable-install state.

Python 3.14 + macOS skip .pth files inside hidden parent dirs (the `.venv` dir
is treated as hidden), so the standard setuptools editable install fails. This
file does the obvious thing: prepend `src/` to sys.path before tests import.
"""

import sys
from pathlib import Path

SRC = Path(__file__).parent / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))
