#!/bin/bash
# THE CONCRETE CADILLAC — Full video build script
# Run this on your Mac. It will:
#   1. Download all 30 images from higgsfield.ai
#   2. Combine images + narration into a single MP4
#   3. Output: ../output/concrete_cadillac.mp4
#
# Requirements: bash, curl, ffmpeg
#   Install ffmpeg on Mac:  brew install ffmpeg
#
# Usage:
#   cd "New Story/Long_Form/Final_Video/build_scripts"
#   chmod +x build_video.sh
#   ./build_video.sh

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"
IMG_DIR="$ROOT/images"
AUDIO_DIR="$ROOT/audio_placeholder"
TMP_DIR="$ROOT/_build_tmp"
OUT_DIR="$ROOT/output"
mkdir -p "$IMG_DIR" "$TMP_DIR" "$OUT_DIR"

echo "=== STEP 1/4: Download 30 images from higgsfield.ai ==="

declare -a IMAGES=(
  "IMG_01:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045656_bac6dab8-fc2f-4c0e-b9ec-b67c99f293a6.png"
  "IMG_02:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_044634_bc9d7c97-5ce2-4aac-a53e-357ca5ac0f01.png"
  "IMG_03:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045707_ef52fe3f-5c28-4ea8-b32e-371a7591ad62.png"
  "IMG_04:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045716_0a547dcb-db66-41ce-9a57-63f55ade4fab.png"
  "IMG_05:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045726_a7f178f3-ee08-4a7f-8af0-08c951efd852.png"
  "IMG_06:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045749_7def16b4-6d03-4cbd-bd4c-82717ca6ada4.png"
  "IMG_07:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045758_6f2e5c2f-7fbf-4cf6-a9b5-a45c6931e92b.png"
  "IMG_08:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045808_10cf2113-8d90-44e1-97c3-dc62bdcd8897.png"
  "IMG_09:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045818_7dea937f-18ce-431c-93c7-939e0662e511.png"
  "IMG_10:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045827_60180a20-0c89-4324-af7a-218b163714db.png"
  "IMG_11:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045835_09ecbc0d-3332-47be-bfce-4a31d0ec1f23.png"
  "IMG_12:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045900_74c3fd2b-36e5-4976-a164-b1d2b40ef0a3.png"
  "IMG_13:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045910_7f3d5228-3eb1-4845-862b-3ccf4bbda902.png"
  "IMG_14:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045920_a6cbef12-0fb3-4cde-9220-74c5dfbd2576.png"
  "IMG_15:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045425_47e0f319-ce3a-41fe-b36c-f4cb81a5663d.png"
  "IMG_16:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045930_47296b89-f500-475e-9fb4-cac6c545d74e.png"
  "IMG_17:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045942_df324072-d3fc-4604-ad45-263429f4c0bc.png"
  "IMG_18:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045951_ea7453f2-994d-4976-9360-7a468693d6b6.png"
  "IMG_19:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_045959_be39e375-8016-4080-8611-2c3f13ac9f4c.png"
  "IMG_20:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050009_d16d64e3-92b7-442c-afdf-80f30dff7d74.png"
  "IMG_21:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050020_2eb5162e-a80c-4221-8dab-488022e34dd9.png"
  "IMG_22:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050029_4e6b99c2-5fdd-45fa-88e2-7daa3f0fe81d.png"
  "IMG_23:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050046_a5ebb6ae-fdc0-4c14-b1f9-e2c26c88f09d.png"
  "IMG_24:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050055_8633196c-09f7-44ef-8c58-d4e281387f96.png"
  "IMG_25:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050105_27ddeb6f-08ae-4c99-acdb-bb24a9cd9021.png"
  "IMG_26:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050114_0afad949-761c-4c3f-b0fc-eda5e4c3cf9c.png"
  "IMG_27:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050124_879aa95e-a04e-4a2c-bf7d-cf5fa0da19c4.png"
  "IMG_28:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050142_56e02c9a-3491-481a-89d1-26703465ba9d.png"
  "IMG_29:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050152_78634201-92f7-480b-ac07-59f19021f989.png"
  "IMG_30:https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260514_050201_240b2d68-8546-49c5-b5a1-e591c827bfda.png"
)

for entry in "${IMAGES[@]}"; do
  name="${entry%%:*}"
  url="${entry#*:}"
  target="$IMG_DIR/${name}.png"
  if [[ -s "$target" ]]; then
    echo "  ✓ $name (already downloaded)"
  else
    echo "  ↓ downloading $name..."
    curl -sSL "$url" -o "$target"
  fi
done

echo ""
echo "=== STEP 2/4: Build scene-by-scene video clips ==="

# Scene → image mapping (some scenes use multiple images that share the scene's audio duration)
# Format: "SCENE:IMAGES_COMMA_SEPARATED"
declare -a SCENE_MAP=(
  "01:IMG_01"
  "02:IMG_02"
  "03:IMG_03"
  "04:IMG_04,IMG_05,IMG_06"
  "05:IMG_07,IMG_08"
  "06:IMG_09"
  "07:IMG_10"
  "08:IMG_11"
  "09:IMG_12,IMG_13"
  "10:IMG_14,IMG_15"
  "11:IMG_16,IMG_17,IMG_18"
  "12:IMG_19,IMG_20"
  "13:IMG_21"
  "14:IMG_22,IMG_23"
  "15:IMG_24"
  "16:IMG_25"
  "17:IMG_26"
  "18:IMG_27"
  "19:IMG_28"
  "20:IMG_29"
  "21:IMG_29"
  "22:IMG_30"
)

# Concat list for ffmpeg
CONCAT_LIST="$TMP_DIR/concat.txt"
> "$CONCAT_LIST"

for entry in "${SCENE_MAP[@]}"; do
  scene="${entry%%:*}"
  imgs="${entry#*:}"
  audio="$AUDIO_DIR/VO_S${scene}.mp3"

  if [[ ! -f "$audio" ]]; then
    echo "  ⚠ missing audio for scene $scene, skipping"
    continue
  fi

  # Get audio duration
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$audio")

  # Split images list
  IFS=',' read -ra IMG_ARR <<< "$imgs"
  n_imgs=${#IMG_ARR[@]}
  per_img=$(echo "scale=3; $dur / $n_imgs" | bc)

  echo "  scene $scene → ${n_imgs} image(s), ${dur}s total (${per_img}s each)"

  # Build scene video by chaining images with a small Ken Burns zoom each
  scene_video="$TMP_DIR/scene_${scene}.mp4"
  if [[ -s "$scene_video" ]]; then
    echo "    ✓ already built"
  else
    # Create a temp video per image then concat
    temp_parts=()
    for i in "${!IMG_ARR[@]}"; do
      img="$IMG_DIR/${IMG_ARR[$i]}.png"
      part="$TMP_DIR/scene${scene}_part${i}.mp4"
      # Ken Burns slow zoom on the image; output 1920x1080 at 30fps
      ffmpeg -y -loglevel error -loop 1 -i "$img" -t "$per_img" \
        -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0005,1.08)':d=125*${per_img%.*}:s=1920x1080:fps=30,fade=t=in:st=0:d=0.3,fade=t=out:st=$(echo "$per_img - 0.3" | bc -l):d=0.3" \
        -c:v libx264 -pix_fmt yuv420p -r 30 "$part" 2>&1 | tail -3
      temp_parts+=("$part")
    done

    # Concat parts into scene video
    scene_concat="$TMP_DIR/scene_${scene}_concat.txt"
    > "$scene_concat"
    for p in "${temp_parts[@]}"; do
      echo "file '$p'" >> "$scene_concat"
    done
    ffmpeg -y -loglevel error -f concat -safe 0 -i "$scene_concat" -c copy "$scene_video"

    # Mux scene audio
    final_scene="$TMP_DIR/scene_${scene}_final.mp4"
    ffmpeg -y -loglevel error -i "$scene_video" -i "$audio" -c:v copy -c:a aac -b:a 192k -shortest "$final_scene"
    mv "$final_scene" "$scene_video"
  fi

  echo "file '$scene_video'" >> "$CONCAT_LIST"
done

echo ""
echo "=== STEP 3/4: Concatenate all scenes ==="
ffmpeg -y -loglevel error -f concat -safe 0 -i "$CONCAT_LIST" -c copy "$OUT_DIR/concrete_cadillac.mp4"

echo ""
echo "=== STEP 4/4: Done ==="
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT_DIR/concrete_cadillac.mp4")
SIZE=$(du -h "$OUT_DIR/concrete_cadillac.mp4" | cut -f1)
echo ""
echo "✓ Output: $OUT_DIR/concrete_cadillac.mp4"
printf "  Duration: %.1f seconds (%.1f minutes)\n" "$DURATION" "$(echo "$DURATION / 60" | bc -l)"
echo "  Size:     $SIZE"
echo ""
echo "Next: drop this file into CapCut, replace audio with ElevenLabs voice if desired,"
echo "      and use CapCut's Auto Caption feature to generate subtitles."
