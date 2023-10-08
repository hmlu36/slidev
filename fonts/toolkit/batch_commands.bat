@echo off

python findUniqueChar.py

pyftsubset CWTEX-K.ttf --text-file=unique_chars.txt --no-hinting --output-file=CWTEX-K2.ttf

python converTtf2Woff.py
