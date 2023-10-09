@echo off

python fonts/toolkit/findUniqueChar.py

pyftsubset fonts/toolkit/CWTEX-K.ttf --text-file=fonts/toolkit/unique_chars.txt --no-hinting --output-file=fonts/toolkit/CWTEX-K2.ttf

python fonts/toolkit/converTtf2Woff.py
