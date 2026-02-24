#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MANIFEST="$SCRIPT_DIR/manifest.json"

# Extension source files to include in the zip
SRC_FILES=(manifest.json background.js popup.html popup.js popup.css)

# Bump the patch version in manifest.json
bump_version() {
    local current
    current="$(python3 -c "import json; print(json.load(open('$MANIFEST'))['version'])")"
    local major minor patch
    IFS='.' read -r major minor patch <<< "$current"
    patch=$((patch + 1))
    local new_version="$major.$minor.$patch"

    python3 -c "
import json
with open('$MANIFEST', 'r') as f:
    m = json.load(f)
m['version'] = '$new_version'
with open('$MANIFEST', 'w') as f:
    json.dump(m, f, indent=2)
    f.write('\n')
"
    echo "$new_version"
}

NEW_VERSION="$(bump_version)"
echo "Bumped version to $NEW_VERSION"

ZIP_FILE="$SCRIPT_DIR/PACify-$NEW_VERSION.zip"

cd "$SCRIPT_DIR"
zip -j "$ZIP_FILE" "${SRC_FILES[@]}"

echo "Built: $ZIP_FILE ($(du -h "$ZIP_FILE" | cut -f1 | xargs))"
