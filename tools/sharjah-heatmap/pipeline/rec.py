#!/usr/bin/env python3
"""Append traces: python3 rec.py "name|area|address|source" ..."""
import csv, sys, pathlib
p = pathlib.Path("traced_locations.csv")
rows = [a.split("|", 3) for a in sys.argv[1:]]
with p.open("a", newline="", encoding="utf-8") as fh:
    csv.writer(fh).writerows(rows)
print("total traced rows:", sum(1 for _ in open(p)) - 1)
