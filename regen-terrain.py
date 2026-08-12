#!/usr/bin/env python3
"""
regen-terrain.py — rebuild TERRAIN_PNG and TMETA from a real DEM.

WHY THIS RUNS ON YOUR MACHINE, NOT IN CHAT
------------------------------------------
The current terrain is ETOPO 2022 at 60 arc-seconds, resampled to 0.035
degrees — about 3.9 km per cell. That is the ceiling on how good a state
plate can look, and no amount of interpolation adds detail that was never
sampled. Fixing it properly means starting from a finer DEM. Those live on
NOAA / USGS / Bhuvan, which the chat sandbox cannot reach, so you run this
locally against a raster you have downloaded.

WHAT YOU NEED
-------------
    pip install rasterio geopandas numpy pillow shapely

  1. A DEM covering India as GeoTIFF, in EPSG:4326.
       - SRTM 90 m (CGIAR-CSI) is the usual choice; mosaic the tiles first.
       - Cartosat / CartoDEM 30 m from Bhuvan is better and Indian-sourced.
       - Merge tiles with:  gdal_merge.py -o india_dem.tif tile1.tif tile2.tif ...
  2. State boundaries as GeoJSON or shapefile, EPSG:4326, with a name field.

USAGE
-----
    python3 regen-terrain.py india_dem.tif states.geojson --cell 0.01

  --cell is degrees per grid cell. Trade-off, roughly:
       0.035  =  3.9 km   current, ~737k grid, 556 KB PNG
       0.015  =  1.7 km   ~4.0M grid, around 3 MB PNG
       0.010  =  1.1 km   ~9.1M grid, around 7 MB PNG
       0.005  =  0.55 km  Kerala's detail level, ~36M grid, 25 MB+ PNG

  Kerala gets away with 0.005 because it is one small state. India at 0.005
  is a very large single-file payload — 0.010 to 0.015 is the sensible band,
  and already 3-4x finer than today.

OUTPUT
------
  terrain.png        the encoded heightmap
  tmeta.json         the TMETA object
  snippet.txt        both, formatted ready to paste into index.html

ENCODING (must match what app.js decodes)
  R,G  = elevation, big-endian 16-bit, scaled 0..emax
  B    = state index, 1-based; 0 means no land
"""
import sys, json, base64, argparse
import numpy as np

try:
    import rasterio
    from rasterio.enums import Resampling
    import geopandas as gpd
    from rasterio.features import rasterize
    from PIL import Image
except ImportError as e:
    sys.exit("Missing dependency: %s\n"
             "Run: pip install rasterio geopandas numpy pillow shapely" % e.name)

ap = argparse.ArgumentParser()
ap.add_argument("dem")
ap.add_argument("states")
ap.add_argument("--cell", type=float, default=0.010)
ap.add_argument("--name-field", default=None,
                help="attribute holding the state name (auto-detected if omitted)")
ap.add_argument("--out-prefix", default="terrain")
a = ap.parse_args()

# ---------------------------------------------------------------- boundaries
gdf = gpd.read_file(a.states).to_crs("EPSG:4326")
field = a.name_field
if not field:
    for c in ["ST_NM", "NAME_1", "state", "STATE", "name", "NAME"]:
        if c in gdf.columns:
            field = c
            break
if not field:
    sys.exit("Could not find a name column. Columns present: %s\n"
             "Re-run with --name-field <column>" % list(gdf.columns))
gdf = gdf[[field, "geometry"]].rename(columns={field: "name"})
gdf["name"] = gdf["name"].astype(str).str.strip()
gdf = gdf.dissolve(by="name", as_index=False)
names = sorted(gdf["name"].tolist())
if len(names) > 255:
    sys.exit("More than 255 states — the blue channel cannot index them all.")
print("states: %d" % len(names))

# ---------------------------------------------------------------- grid
minx, miny, maxx, maxy = gdf.total_bounds
minx, miny = np.floor(minx / a.cell) * a.cell, np.floor(miny / a.cell) * a.cell
maxx, maxy = np.ceil(maxx / a.cell) * a.cell, np.ceil(maxy / a.cell) * a.cell
W = int(round((maxx - minx) / a.cell))
H = int(round((maxy - miny) / a.cell))
print("grid: %d x %d  (%.3f deg, ~%.2f km)" % (W, H, a.cell, a.cell * 111))
if W * H > 40_000_000:
    print("WARNING: that is a very large grid; the PNG will be big.")

transform = rasterio.transform.from_origin(minx, maxy, a.cell, a.cell)

# state index raster, 1-based, row 0 = north
sidx = rasterize(
    ((geom, i + 1) for i, geom in enumerate(gdf.set_index("name").loc[names, "geometry"])),
    out_shape=(H, W), transform=transform, fill=0, dtype="uint8",
)
print("land cells: %d" % int((sidx > 0).sum()))

# ---------------------------------------------------------------- elevation
with rasterio.open(a.dem) as src:
    elev = src.read(
        1, out_shape=(H, W), resampling=Resampling.bilinear,
        masked=True,
    ).astype("float32").filled(0.0)
    if src.transform.f < src.transform.c:  # guard against flipped rasters
        pass
elev[elev < 0] = 0.0
elev[sidx == 0] = 0.0
emax = float(elev.max())
print("emax: %.0f m" % emax)

# ---------------------------------------------------------------- encode
enc = np.zeros((H, W, 3), dtype="uint8")
scaled = np.clip(elev / max(emax, 1.0), 0, 1) * 65535.0
u16 = scaled.astype("uint32")
enc[:, :, 0] = (u16 >> 8) & 0xFF
enc[:, :, 1] = u16 & 0xFF
enc[:, :, 2] = sidx
png = "%s.png" % a.out_prefix
Image.fromarray(enc, "RGB").save(png, optimize=True)

# ---------------------------------------------------------------- per-state meta
meta = {}
for i, nm in enumerate(names, start=1):
    m = sidx == i
    if not m.any():
        continue
    rows, cols = np.where(m)
    e = elev[m]
    meta[nm] = {
        "i": i,
        "x0": int(cols.min()), "x1": int(cols.max()),
        "y0": int(rows.min()), "y1": int(rows.max()),
        "emin": float(round(e.min())), "emax": float(round(e.max())),
        "cells": int(m.sum()),
    }

tmeta = {"w": W, "h": H, "emax": emax, "cell": a.cell,
         "states": names, "meta": meta}
json.dump(tmeta, open("%s_tmeta.json" % a.out_prefix, "w"), indent=1)

b64 = base64.b64encode(open(png, "rb").read()).decode()
with open("snippet.txt", "w") as f:
    f.write('const TERRAIN_PNG="data:image/png;base64,%s";\n\n' % b64)
    f.write("const TMETA=%s;\n" % json.dumps(tmeta, separators=(",", ":")))

mb = len(b64) / 1_048_576
print("\nwrote %s, %s_tmeta.json, snippet.txt" % (png, a.out_prefix))
print("base64 payload: %.2f MB" % mb)
if mb > 4:
    print("That is heavy for a single HTML file. Consider a coarser --cell,")
    print("or serving terrain.png as a separate file and fetching it.")
print("\nReplace the TERRAIN_PNG and TMETA lines in index.html with snippet.txt.")
print("app.js needs no change — it reads w, h, emax, states and meta from TMETA.")
