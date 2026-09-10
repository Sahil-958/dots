# openGym State Architecture & Protocol Integration

- **Date:** 2026-09-09
- **Type:** Infrastructure / Service Knowledge
- **Status:** Proved (Verified against live production state on `ampere`)

## Storage & Configuration Paths
- **Host Server:** `ampere` (Oracle Cloud ARM64)
- **Container Services:** `opengym-api.service` (Go/Node backend on `:3000`), `opengym-web.service` (Nginx gateway on `:8084`)
- **Domain:** `https://fit.sahil.dedyn.io` (Public, user authenticated)
- **Data Mount:** `/mnt/media/opengym/data/`
- **Active State File:** `/mnt/media/opengym/data/state-VWhE0iYM7BxDTKd_.json`
- **Protocol Plan Backup:** `/mnt/media/opengym/protocol_plan.json`
- **Daily Automated Backups:** `/mnt/media/backups/opengym/opengym_YYYYMMDD_HHMMSS.tar.gz` (synced via Syncthing to `Archy`)
- **Source Protocol Docs:** `/home/sawhill/fitness-protocol/`

## State JSON Schema Specifics
1. **Week Array Mapping (`week`):**
   - Maps integer day indices (`'0'` through `'6'`) to routine IDs:
     `'0': Sunday`, `'1': Monday`, `'2': Tuesday`, `'3': Wednesday`, `'4': Thursday`, `'5': Friday`, `'6': Saturday`.
2. **Exercise ID Types:**
   - **Built-in exercises:** 4-digit numerical string IDs (e.g. `0025` for Flat Bench, `0042` for Front Squat, `0314` for DB Press).
   - **Custom exercises:** Prefix `c_*` (e.g. `c_ruck`, `c_landmine_punch`, `c_medball_throw`).
3. **Custom Exercise Schema (`customEx` array):**
   - Each entry requires:
     - `id`: Unique identifier matching routine references (e.g. `c_ruck`)
     - `n`: Exercise display name
     - `bp`: Body part (e.g. `cardio`, `waist`, `shoulders`, `upper legs`)
     - `tg`: Target muscle
     - `eq`: Equipment category (`body weight`, `barbell`, `band`, `weighted`, `medicine ball`, `other`)
     - `st`: Array of execution steps / cues
