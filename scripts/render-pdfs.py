#!/usr/bin/env python3

import json
import logging
import os
import sys

from weasyprint import HTML


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: render-pdfs.py MANIFEST.json")
    logging.getLogger("weasyprint").setLevel(logging.ERROR)
    with open(sys.argv[1], encoding="utf-8") as manifest_file:
        documents = json.load(manifest_file)
    for document in documents:
        try:
            os.makedirs(os.path.dirname(document["output"]), exist_ok=True)
            HTML(filename=document["input"]).write_pdf(document["output"])
            os.chmod(document["output"], 0o644)
        except Exception as error:
            raise RuntimeError(f'{document["sourceFile"]}: {error}') from error


if __name__ == "__main__":
    main()
