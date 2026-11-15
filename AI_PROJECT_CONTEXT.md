# 3D Character & Stadium Viewer — Project Context & AI Instructions

## 1. Project Overview
This repository is an interactive 3D procedural character and environment viewer powered by **Three.js (ESM)**. It features an in-browser inspector UI, orbit controls, procedural character outfits, and a 3D procedural stadium environment.

- **Stack**: Pure client-side ES Modules (`importmap` using Three.js `0.162.0`), HTML5/CSS3.
- **Entry point**: [`index.html`](file:///C:/Users/Hafiz/Desktop/Personal%20Project/5.%20Video/3d-character/index.html)
- **Local Dev Server**: `live-server` with automatic hot-reloading.

---

## 2. Dev Server & Hot Reloading
The `serve` package does not support file watching/hot reload. The project is configured with `live-server` to automatically refresh the browser when files change:

```bash
# Run dev server with hot reload:
npm start
# Alternatively:
npx live-server --port=3000 --watch=. --open=index.html

# Fallback static server (no hot reload):
npm run serve
```

---

## 3. Repository Structure
```text
3d-character/
├── index.html                   # Main viewer HTML, UI controls & character loader
├── Inspector.js                 # In-browser 3D scene & mesh inspector panel
├── package.json                 # Project scripts and dependencies
├── characters/
│   ├── character-default.js     # Default hoodie character
│   ├── character-suit.js        # Three-piece suit outfit
│   ├── character-coach.js       # Soccer coach tracksuit outfit
│   ├── character-soccer.js      # Soccer jersey outfit
│   └── character-casual.js      # Casual sweater outfit
└── environments/
    ├── stadium.js               # Procedural football stadium ("The Oaks")
    └── stadium-props.js         # Dedicated modular file for match equipment, cameras, lighting & media props
```

---

## 4. Key Components & Architecture

### A. Environment: Football Stadium ([`environments/stadium.js`](file:///C:/Users/Hafiz/Desktop/Personal%20Project/5.%20Video/3d-character/environments/stadium.js))
- Class: `StadiumApp`
- Pitch Dimensions: 64m (width) x 100m (length).
  - Center circle, penalty boxes, 6-yard boxes, penalty arcs, and corner arcs.
  - Alternating lawn stripes (mowing pattern).
- Structures included:
  1. **Pitch line markings & flags**: Regulation markings, corner flags with poles.
  2. **Football Goal Posts (Both Ends)**:
     - Standard regulation dimensions: $7.32\,\text{m}$ wide, $2.44\,\text{m}$ high, $0.8\,\text{m}$ roof depth, $2.0\,\text{m}$ bottom depth.
     - Uprights and crossbars ($12\,\text{cm}$ regulation diameter) with spherical corner elbow joints and ground socket collars.
     - Continental box-style netting: Flat top net, angled rear net drop, and custom trapezoidal side netting.
     - Dual-material netting: Structured wireframe mesh combined with semi-transparent backing.
     - Rear support structure: Diagonal tension stanchions with anchor pegs, upper roof braces, horizontal tension cables, and ground frame bars.
  3. **On-Pitch Match Equipment & Objects**:
     - **The Match Football**: Centered on spot with classic pentagon pattern.
     - **Corner Flags & Flexible Spring Bases**: Yellow flex-poles, spring-coil joints, turf socket collars, checkered flags.
     - **Substitution Board**: Fourth official dual-display electronic board (Red out, Green in).
     - **Free-Kick Spray Line & Referee Whistle**: Ten-yard spray line and metal referee whistle.
     - **VAR Review Booth**: Sheltered review booth with active monitor screen & pedestal between dugouts.
  4. **Pitchside & Technical Area Objects**:
     - **LED Digital Advertising Boards**: Dynamic emissive wrap-around banners along touchlines & goal lines.
     - **Broadcast TV Cameras & Jib Crane**: Tripod telephoto sideline cameras, low goal cameras, and heavy mobile camera crane.
     - **Field Parabolic Microphones**: Sound dish stands along both sidelines.
     - **Ball Boy Stations**: Stools with orange cones and reserve footballs around the perimeter.
     - **Team Coolers & Bottle Crates**: Squeeze bottles and insulated coolers at both team dugouts.
  5. **Lighting & Architectural Assets**:
     - **4x Corner Floodlight Towers**: 26m steel lattice stanchions with 12-bulb emissive banks and angled spotlights.
     - **Player Retractable Tunnel**: Accordion bellows walkway leading from the clubhouse.
     - **Turnstiles & Ticket Booths**: Exterior entrance turnstiles with rotating metal rotor arms.
  6. **Media & Backstage Storytelling Studio**:
     - **Press Conference Desk & Backdrop**: Sponsor grid wall, desk with 3 microphones and branded energy drinks.
     - **Flash Interview Board**: Pop-up sponsor wall positioned at tunnel exit.
     - **Locker Room Cubbies & Bench**: Hanging jerseys, nameplates, and bench seating.
     - **Tactical Rolling Whiteboard**: Pitch tactics diagram with blue vs. red magnetic markers on wheels.
  7. **Main Grandstand**: Brick base, concrete standing terraces, roof canopy with steel pillars, fascia board, club sign (*Oakhaven United FC - The Oaks*), and front advertising boards.
  8. **Clubhouse Building**: Brick exterior, windows, entrance door, and signage.
  9. **Perimeter Railing**: Metal rails surrounding the pitch perimeter.
  10. **Scoreboard & Dugouts**: Scoreboard with canvas textures, home/away dugouts with seating.
  11. **Surroundings**: Perimeter chain link fencing and procedural trees.

### B. Characters ([`characters/*.js`](file:///C:/Users/Hafiz/Desktop/Personal%20Project/5.%20Video/3d-character/characters/))
- Procedural humanoid figures composed of Three.js primitives (Cylinders, Spheres, Boxes, Extrusions).
- Materials use a combination of custom toon materials (`MeshToonMaterial` with discrete gradient maps) and standard PBR materials (`MeshStandardMaterial`).

### C. Inspector Tool ([`Inspector.js`](file:///C:/Users/Hafiz/Desktop/Personal%20Project/5.%20Video/3d-character/Inspector.js))
- Attaches to `window.inspector`.
- Allows clicking and inspecting scene objects, toggling wireframes, adjusting positions, rotations, colors, and scales in real-time.

---

## 5. Guidelines for Future AI Assistance
- **Preserve Module System**: Files use standard ES6 module imports/exports. Keep browser compatibility in mind (relative paths like `./environments/stadium.js`).
- **Coordinate Conventions**:
  - $Y$-axis: Up.
  - $Z$-axis: Goal line to goal line (length: $-50\,\text{m}$ to $+50\,\text{m}$).
  - $X$-axis: Touchline to touchline (width: $-32\,\text{m}$ to $+32\,\text{m}$).
- **Material Consistency**: Reuse or extend the material definitions inside `createProceduralCharacter()` rather than hardcoding ad-hoc materials.
- **Resource Disposal**: When adding or replacing geometries and materials, ensure they are disposed of properly during teardown (`dispose()` method) to prevent WebGL context leaks.
