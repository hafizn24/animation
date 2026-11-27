"""Move shared lifecycle out of the 9 environment classes onto BaseEnvironmentApp."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
ENV_DIR = ROOT / "environments"

# methods the base now owns (only stripped when defined at 2-space indent)
STRIP = [
    "init", "setupRenderer", "createStdMaterial", "makeCanvasTexture",
    "createToonMaterial", "updateWallVisibility", "animate",
    "onWindowResize", "resetScene", "dispose",
]

# envs whose animate() carried a per-frame hook -> becomes onAnimateFrame()
ANIM_HOOK = {
    "club-office.js": """  onAnimateFrame(elapsed) {
    if (this.lights.lamp) this.lights.lamp.intensity = 16 + Math.sin(elapsed * 2.3) * 0.12;
  }
""",
}

# env-specific constructor lines kept after super(container)
KEEP_CTOR = re.compile(
    r"^    this\.(roomBounds|wallCull|anchors|lights|tunnel|bounds|envId|isIndoor|cameraPresets) = .*$"
)

BOUNDS = {
    "bakery.js": None,           # derived from roomBounds
    "club-office.js": None,
    "lender-boardroom.js": None,
    "locker-room.js": None,
    "manager-office.js": None,
    "sponsor-office.js": None,
    "players-tunnel.js": "    this.bounds = { minX: -4, maxX: 4, minZ: -14, maxZ: 14, floorY: 0, ceilingY: 3.5 };\n",
    "stadium.js": "    this.bounds = { minX: -70, maxX: 70, minZ: -70, maxZ: 70, floorY: 0, ceilingY: 45 };\n",
}

META = {
    "bakery.js": ("bakery", True),
    "club-office.js": ("club-office", True),
    "lender-boardroom.js": ("lender-boardroom", True),
    "locker-room.js": ("locker-room", True),
    "manager-office.js": ("manager-office", True),
    "players-tunnel.js": ("players-tunnel", False),
    "sponsor-office.js": ("sponsor-office", True),
    "stadium.js": ("stadium", False),
}


def split_blocks(lines):
    """Yield (start, end_exclusive, header) for every `  name(...) {` method."""
    out = []
    i = 0
    while i < len(lines):
        m = re.match(r"^  (?:async )?([A-Za-z_][A-Za-z0-9_]*)\s*\(", lines[i])
        if m:
            start = i
            depth = 0
            j = i
            while j < len(lines):
                depth += lines[j].count("{") - lines[j].count("}")
                if depth == 0 and j > start:
                    break
                j += 1
            out.append((start, j + 1, m.group(1)))
            i = j + 1
        else:
            i += 1
    return out


def find_block(blocks, name):
    for start, end, header in blocks:
        if header == name:
            return start, end
    return None


def refactor(path: Path):
    raw = path.read_bytes().decode("utf-8")
    nl = "\r\n" if "\r\n" in raw[:4000] else "\n"
    text = raw.replace("\r\n", "\n")
    lines = text.split("\n")

    # 1. class declaration + import
    lines = [
        re.sub(r"^export class (\w+) \{", r"export class \1 extends BaseEnvironmentApp {", ln)
        for ln in lines
    ]
    if not any("BaseEnvironmentApp" in ln and ln.startswith("import") for ln in lines):
        idx = next(i for i, ln in enumerate(lines) if ln.startswith("import "))
        last = idx
        while last + 1 < len(lines) and lines[last + 1].startswith("import "):
            last += 1
        lines.insert(last + 1, "import { BaseEnvironmentApp } from './core/BaseEnvironmentApp.js';")

    blocks = split_blocks(lines)

    # 2. constructor -> super + env-specific fields
    cs, ce = find_block(blocks, "constructor")
    kept = [ln for ln in lines[cs + 1:ce - 1] if KEEP_CTOR.match(ln)]
    name = path.name
    env_id, indoor = META.get(name, (name[:-3], True))
    extra = [f"    this.envId = '{env_id}';", f"    this.isIndoor = {'true' if indoor else 'false'};"]
    if BOUNDS.get(name):
        extra.append(BOUNDS[name].rstrip("\n"))
    new_ctor = ["  constructor(container) {", "    super(container);"] + extra + kept + ["  }"]
    lines[cs:ce] = new_ctor

    # 3. strip base-owned methods
    blocks = split_blocks(lines)
    for method in STRIP:
        blk = find_block(blocks, method)
        if not blk:
            continue
        s, e = blk
        # keep a hook version of animate() when the env had per-frame work
        if method == "animate" and name in ANIM_HOOK:
            lines[s:e] = ANIM_HOOK[name].split("\n")[:-1]
        else:
            del lines[s:e]
        blocks = split_blocks(lines)

    # 4. headless-safe camera aspect
    lines = [
        "    const aspect = this.cameraAspect();"
        if ln == "    const aspect = this.container.clientWidth / this.container.clientHeight;"
        else ln
        for ln in lines
    ]

    # 5. rebuild-safe dispose inside createProceduralCharacter
    lines = [
        "    if (this.character) this.disposeCharacter();"
        if ln == "    if (this.character) this.dispose();"
        else ln
        for ln in lines
    ]

    # 6. applyDressing hook at the end of createProceduralCharacter
    blocks = split_blocks(lines)
    s, e = find_block(blocks, "createProceduralCharacter")
    body = lines[s:e]
    for k in range(len(body) - 1, -1, -1):
        if re.match(r"^    return (group|root|room|this\.character);$", body[k]):
            body.insert(k, "    this.applyDressing(this.character);")
            break
    else:
        raise SystemExit(f"{path.name}: no return found in createProceduralCharacter")
    lines[s:e] = body

    # 7. drop the OrbitControls import when nothing uses it any more
    if not any("OrbitControls(" in ln for ln in lines):
        lines = [ln for ln in lines if "OrbitControls" not in ln]

    out = nl.join(lines)
    path.write_bytes(out.encode("utf-8"))
    print(f"refactored {path.name}")


for p in sorted(ENV_DIR.glob("*.js")):
    if p.name == "episode6-office.js":
        continue
    refactor(p)
