import re
import sys
from pathlib import Path

METHODS = [
    "init",
    "createToonMaterial",
    "createOutlinedMesh",
    "buildHairstyle",
    "changeHairStyle",
    "setWalking",
    "animate",
    "onWindowResize",
    "resetScene",
    "dispose",
]

# Files whose dispose() is bespoke and must survive.
SKIP_DISPOSE = {"character-lawyer.js", "character-squad.js"}


def strip_method(lines, name, allow_async=True):
    """Return (new_lines, removed) with the class method `name` deleted."""
    pattern = re.compile(r"^  (?:async\s+)?%s\s*\(" % re.escape(name))
    for i, line in enumerate(lines):
        # exactly two leading spaces => class-level method
        if not (line.startswith("  ") and not line.startswith("   ")):
            continue
        if not pattern.match(line):
            continue
        j = i
        while j < len(lines) and "{" not in lines[j]:
            j += 1
        if j >= len(lines):
            continue
        depth = 0
        k = j
        while k < len(lines):
            depth += lines[k].count("{") - lines[k].count("}")
            if depth == 0:
                break
            k += 1
        if k >= len(lines):
            continue
        end = k
        start = i
        m = i - 1
        while m >= 0 and lines[m].strip() == "":
            m -= 1
        if m >= 0 and lines[m].strip().endswith("*/"):
            doc_start = m
            while doc_start >= 0 and not lines[doc_start].strip().startswith("/**"):
                doc_start -= 1
            if doc_start >= 0:
                start = doc_start
                while start > 0 and lines[start - 1].strip() == "":
                    start -= 1
        if start > 0 and lines[start - 1].strip() == "":
            start -= 1
        return lines[:start] + lines[end + 1 :], True
    return lines, False


def process(path: Path, methods):
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    removed = []
    for name in methods:
        if name == "dispose" and path.name in SKIP_DISPOSE:
            continue
        before = len(lines)
        lines, ok = strip_method(lines, name)
        if ok:
            removed.append(name)
    text = "".join(lines)
    # collapse runs of 3+ blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    path.write_text(text, encoding="utf-8")
    print(f"{path.name}: removed {', '.join(removed) or '(nothing)'}")


if __name__ == "__main__":
    root = Path("characters")
    targets = sys.argv[1:] or [
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
    for t in targets:
        process(root / t, METHODS)
