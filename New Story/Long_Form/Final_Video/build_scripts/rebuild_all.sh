#!/bin/bash
# One-shot rebuild: regenerate voice + build video + open it.
# Wipes all caches. Use this whenever you want a fresh video.
#
# Requires:
#   - ELEVEN_API_KEY exported in your shell (or use --mac for macOS 'say')
#   - ffmpeg + jq installed (brew install ffmpeg jq)
#
# Usage:
#   export ELEVEN_API_KEY="sk_xxxxxxxx"
#   ./rebuild_all.sh                    # use ElevenLabs (default voice nzFihrBIvB34imQBuxub)
#   ./rebuild_all.sh --mac              # use macOS 'say' with Tom (Premium)
#   ELEVEN_VOICE_ID="otherid" ./rebuild_all.sh    # different ElevenLabs voice
#   MAC_VOICE="Evan (Premium)" ./rebuild_all.sh --mac

set -euo pipefail
cd "$(dirname "$0")"

MODE="elevenlabs"
if [[ "${1:-}" == "--mac" ]]; then
  MODE="mac"
fi

echo "════════════════════════════════════════════════════════════"
echo " STEP 1/3: Regenerate voice ($MODE)"
echo "════════════════════════════════════════════════════════════"

if [[ "$MODE" == "elevenlabs" ]]; then
  if [[ -z "${ELEVEN_API_KEY:-}" ]]; then
    echo "❌ ELEVEN_API_KEY not set. Either:"
    echo "    export ELEVEN_API_KEY='sk_xxx'  &&  ./rebuild_all.sh"
    echo "  or fall back to macOS voice:"
    echo "    ./rebuild_all.sh --mac"
    exit 1
  fi
  ./regen_voice_elevenlabs.sh
else
  ./regen_voice_mac.sh "${MAC_VOICE:-Tom (Premium)}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo " STEP 2/3: Wipe build cache + rebuild video"
echo "════════════════════════════════════════════════════════════"
# Build script now auto-wipes cache by default (no --keep-cache)
./build_video.sh

echo ""
echo "════════════════════════════════════════════════════════════"
echo " STEP 3/3: Open the result"
echo "════════════════════════════════════════════════════════════"
OUTPUT="../output/concrete_cadillac.mp4"
if [[ -f "$OUTPUT" ]]; then
  echo "✓ Opening $OUTPUT"
  open "$OUTPUT"
else
  echo "❌ Output file not found at $OUTPUT"
  exit 1
fi
