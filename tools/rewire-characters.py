"""Rewires each character module onto BaseCharacterApp."""
from pathlib import Path
import re

BASE_FIELDS = {
    "    this.container = container;",
    "    this.scene = null;",
    "    this.camera = null;",
    "    this.renderer = null;",
    "    this.controls = null;",
    "    this.character = null;",
    "    this.characterParts = {};",
    "    this.animations = {};",
    "    this.clock = new THREE.Clock();",
    "    this.isWalking = false;",
    "    this._dead = false;",
    "    this.currentPose = 'idle';",
}

MOTION = {
    "character-suit.js": "SUIT_MOTION",
    "character-soccer.js": "SOCCER_MOTION",
    "character-chairman.js": "CHAIRMAN_MOTION",
    "character-sponsor.js": "SPONSOR_MOTION",
    "character-new-owner.js": "NEW_OWNER_MOTION",
    "character-karim.js": "KARIM_MOTION",
    "character-azam.js": "AZAM_MOTION",
}

EXTRA = {
    "character-soccer.js": "    this.outlineOpts = { receiveShadow: false };",
}

ROOT = Path("characters")
TARGETS = [
    "character-suit.js",
    "character-coach.js",
    "character-casual.js",
    "character-soccer.js",
    "character-chairman.js",
    "character-sponsor.js",
    "character-new-owner.js",
    "character-karim.js",
    "character-azam.js",
]

ORBIT_IMPORT = (
    "import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';\n"
)
BASE_IMPORT = "import { BaseCharacterApp } from './core/BaseCharacterApp.js';\n"


def process(name: str) -> None:
    path = ROOT / name
    raw = path.read_bytes()
    crlf = b"\r\n" in raw
    text = raw.decode("utf-8").replace("\r\n", "\n")

    # 1. imports
    if BASE_IMPORT.strip() not in text:
        if ORBIT_IMPORT in text:
            text = text.replace(ORBIT_IMPORT, ORBIT_IMPORT + BASE_IMPORT, 1)
        else:
            text = BASE_IMPORT + text

    motion = MOTION.get(name)
    if motion and f"{{ {motion} }}" not in text:
        text = text.replace(
            BASE_IMPORT,
            BASE_IMPORT + f"import {{ {motion} }} from './core/motion.js';\n",
            1,
        )

    # 2. class extends
    text = re.sub(
        r"^export class (\w+) \{$",
        r"export class \1 extends BaseCharacterApp {",
        text,
        count=1,
        flags=re.M,
    )

    # 3. constructor: super() + drop base-owned fields
    lines = text.split("\n")
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line == "  constructor(container) {":
            out.append(line)
            out.append("    super(container);")
            i += 1
            while i < len(lines):
                if lines[i] in BASE_FIELDS:
                    i += 1
                    continue
                if lines[i].strip() == "" and out[-1] == "    super(container);":
                    i += 1
                    continue
                break
            if motion:
                out.append(f"    this.motion = {{ ...{motion} }};")
            if name in EXTRA:
                out.append(EXTRA[name])
            out.append("")
            continue
        out.append(line)
        i += 1

    text = "\n".join(out)
    text = re.sub(r"\n{3,}", "\n\n", text)

    if crlf:
        text = text.replace("\n", "\r\n")
    path.write_bytes(text.encode("utf-8"))
    print(f"rewired {name}")


if __name__ == "__main__":
    for t in TARGETS:
        process(t)
