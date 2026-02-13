#!/bin/sh
set -e

python3 fonts/toolkit/findUniqueChar.py

pyftsubset fonts/toolkit/CWTEX-K.ttf --text-file=fonts/toolkit/unique_chars.txt --flavor=woff2 --no-hinting --output-file=fonts/toolkit/CWTEX-K.subset.woff2
