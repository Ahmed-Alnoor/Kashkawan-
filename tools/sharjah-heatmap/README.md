# Sharjah Prospect Atlas

An interactive density map and filter workbench over the two Sharjah business
prospecting workbooks. `app/index.html` is a self-contained page — no build
step, no framework, no map library. Open it directly in a browser, or serve the
`app/` folder from anywhere static.

```
tools/sharjah-heatmap/
├── app/
│   ├── index.html        the viewer (map, filters, charts)
│   ├── data.js           generated dataset — window.SHARJAH_DATA
│   └── basemap.js        offline coastline — window.SHARJAH_BASEMAP
└── pipeline/
    ├── build_dataset.py  xlsx → data.js
    └── gazetteer.py      Sharjah district coordinates + named premises
```

## The basemap

The map draws standard XYZ street tiles onto its own canvas — CARTO Voyager in
the light theme, Dark Matter in the dark one, plus an Esri satellite option.
`view.scale` is the width of the whole world in pixels, which is exactly what a
slippy-map zoom level measures, so the tile grid needs no second projection.
Unloaded tiles are covered by their cached parent stretched over the gap, the
way every slippy map avoids flashing between zooms.

Some sandboxes block third-party images. The first tiles act as a probe: several
failures with no successes and the map falls back to `basemap.js` — real
OpenStreetMap coastline for the emirate, clipped and simplified to ~7 m — and
says so under the map. Nothing is silently degraded.

`basemap.js` is generated from `@geo-maps/earth-coastlines-10m` (OpenStreetMap
data, ODbL). Tiles carry their own attribution, shown bottom-right.

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

## What is in, what is out

| | |
|---|---|
| 5,077 | unique businesses after merging both workbooks (28 duplicates collapsed) |
| 75 | automotive and workshop records dropped at build time |
| 3 | records traced to Fujairah, Ajman and Dubai, dropped as out of emirate |
| 419 | free-zone entities, kept but filtered out of the default view |
| 4,658 | businesses in the default view |
| 1,036 | plotted (1,141 including the free zones) |
| 534 of 610 | **P1 core targets plotted — 88%** |

**Automotive and workshops are removed from the dataset**, matched three ways
because the source workbooks tag them inconsistently: the `Automotive &
Workshops` category, detailed activities like *Auto Spare Parts / Trading* and
*Auto Repair & Maintenance*, and names containing *workshop* or *garage*. The
build report breaks down which rule caught what.

**Free zones are kept but hidden.** A business counts as free zone if it came off
the free-zone register or sits in a free-zone district (Hamriyah, SAIF, Sharjah
Media City, Publishing City, SRTIP). The filter rail offers *Exclude* (default),
*Include with the rest*, and *Free zones only*.

## Location precision

Records without geography are **not** scattered across the map to pad it out.
They are counted in every chart and listed in Results, and the map header links
straight to them as a map-trace queue.

| Precision | Count | Meaning |
|---|---|---|
| `exact` | 7 | a real coordinate published in the source workbook |
| `premises` | 436 | a named building or mall with a known point location |
| `area` | 698 | the centroid of its district, scattered inside the district footprint |
| `none` | 3,936 | Sharjah confirmed, no district recorded — left off the map |

The scatter is deterministic — the same business always lands on the same point —
and area-uniform, so a district reads as a district rather than a starburst.

## Views and filters

Three map views: **Heat** (density of the current filter), **Points** (every
business individually), and **By sector** (eight small maps sharing one extent,
so sector footprints can be compared directly).

Filters: sector · activity category · priority · target tier · district · source
list · location precision · free zones · working-list status · free text. Counts
are faceted — each list shows how many records each option would add given every
*other* filter, so an option that would empty the result set is visibly struck
through. Filter state is written to the URL hash; copy the address bar to share
an exact view.

Theme follows the system by default and can be pinned to light or dark; the
basemap switches with it.

## Working list

Businesses can be marked *Shortlisted* or *Contacted*. When the page runs as a
published Artifact with the `db` capability, that list is shared by everyone who
opens it. Anywhere else it falls back to this browser's local storage, and the
detail panel says which mode is in effect.


## Continuing the trace

The workbooks record no district for most of the list, and nothing else in them
recovers one — of the businesses left unplaced, only 15 carry a district anywhere
in their name and none carry a street address. The only way to place the rest is
to look each one up, one at a time.

That work is resumable:

- `pipeline/trace_queue.csv` — the work list, ordered P1 → P4 and with free
  zones, workshops and pharmacies already taken out. Longest-website-first
  within each priority, because a business with a real domain is the one most
  likely to be findable.
- `pipeline/traced_locations.csv` — what has been traced so far: name, district,
  address, and where the district came from. Append rows and re-run the build;
  a name already in the file is skipped, so the two files together are the
  resume point.
- `pipeline/rec.py` — one-liner appender:
  `python3 rec.py "Business name|District|Address|Source"`.

Rules the existing 211 traces follow, worth keeping:

1. Only record a district you can corroborate — the business's own domain in the
   result, or a named building you can place. A name match alone is not enough;
   several Sharjah trade names ("Al Wasit", "Al Jubail") are also district names
   and mean nothing about location.
2. A district not already in `gazetteer.py` must be added there with coordinates
   before it will place — the build reports any it cannot match rather than
   dropping it.
3. Businesses that turn out to be outside the emirate get `EXCLUDE` as their
   district and a reason in the address column; the build drops them and says so.

## Handover checklist

- The viewer needs no build step. `app/index.html` plus its two `.js` files is
  the whole thing; open it or serve the folder.
- Street tiles come from CARTO and Esri at run time. If the host blocks
  third-party images the map falls back to the bundled coastline and says so
  under the map — nothing silently degrades.
- To regenerate after editing the traces, re-run the build command above. It
  prints a full coverage report and flags anything it could not place.
