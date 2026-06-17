#!/usr/bin/env python
"""Repo-root Django entrypoint (local dev + migrations)."""
import os
import sys
from pathlib import Path


def main():
    backend_dir = Path(__file__).resolve().parent / "backend"
    sys.path.insert(0, str(backend_dir))
    os.chdir(backend_dir)
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are dependencies installed and available on your PYTHONPATH?"
        ) from exc

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
