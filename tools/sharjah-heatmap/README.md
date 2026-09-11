# Sharjah Prospect Atlas

An interactive density map and filter workbench over the two Sharjah business
prospecting workbooks. `app/index.html` is a single self-contained page — no
build step, no framework, no map tile server. Open it directly in a browser, or
serve the `app/` folder from anywhere static.

```
tools/sharjah-heatmap/
├── app/
│   ├── index.html        the viewer (canvas map, filters, charts)
│   └── data.js           generated dataset — window.SHARJAH_DATA
└── pipeline/
    ├── build_dataset.py  xlsx → data.js
    └── gazetteer.py      Sharjah district coordinates + named premises
```

## Regenerating the dataset

```bash
pip install openpyxl
cd tools/sharjah-heatmap/pipeline
python3 build_dataset.py \
  Sharjah_High_Value_Business_Prospecting_v2_Community_Split_1.xlsx \
  Sharjah_Business_Target_List_D11HealthcareCheckpoint.xlsx \
  -o ../app/data.js
```

The script prints a coverage report and, importantly, lists any district string
in the source workbooks that the gazetteer could not place. Add those to
`gazetteer.py` and re-run — nothing is silently dropped.

## What the numbers mean

| | |
|---|---|
| 5,155 | unique businesses after merging both workbooks (28 duplicates collapsed) |
| 956 | carry enough geography to plot |
| 4,199 | Sharjah-confirmed but with no district recorded in the source |

Those 4,199 are **not** scattered across the map to pad it out. They are counted
in every chart and listed in Results, and the map header links straight to them
as a map-trace queue.

Each plotted record is labelled with how its position was established:

| Precision | Count | Meaning |
|---|---|---|
| `exact` | 7 | a real coordinate published in the source workbook |
| `premises` | 436 | a named building or mall with a known point location |
| `area` | 513 | the centroid of its district, scattered inside the district footprint |

The scatter is deterministic — the same business always lands on the same point —
and area-uniform, so a district reads as a district rather than a starburst.

The coastline, lagoons and arterial roads are a hand-authored **schematic**. They
exist to orient the eye; they are not survey geometry, and the app says so in its
legend.

## Working list

Businesses can be marked *Shortlisted* or *Contacted*. When the page runs as a
published Artifact with the `db` capability, that list is shared by everyone who
opens it. Anywhere else it falls back to this browser's local storage, and the
detail panel says which mode is in effect.

## Filters

Sector · activity category · priority · target tier · district · source list ·
location precision · working-list status · free text. Counts are faceted: each
list shows how many records each option would add given every *other* filter, so
an option that would empty the result set is visibly struck through. Filter state
is written to the URL hash — copy the address bar to share an exact view.
