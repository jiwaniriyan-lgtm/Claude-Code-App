#!/bin/bash
# ============================================================
# DOWNLOAD ALL ASSETS — "Why Most Investors Fail" YouTube Video
# Bash version (Mac / Linux / Windows WSL / Git Bash)
# ============================================================
# HOW TO RUN:
#   1. Save this file as: download_assets.sh
#   2. Open Git Bash (or Terminal on Mac)
#   3. chmod +x download_assets.sh
#   4. ./download_assets.sh
#
# Total download size: ~250 MB | Time: ~3-5 min on broadband
# ============================================================

# Use Windows-style path if on Windows (Git Bash), else Linux/Mac path
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    ROOT="/c/Video Project API/Finance Youtube"
else
    ROOT="$HOME/Desktop/Finance_Youtube"
fi

echo "Creating folder structure at: $ROOT"

# ----- 1. CREATE FOLDERS -----
mkdir -p "$ROOT/01_Thumbnails"
mkdir -p "$ROOT/02_BRoll_Images/Hook"
mkdir -p "$ROOT/02_BRoll_Images/Setup"
mkdir -p "$ROOT/02_BRoll_Images/Segment1_Emotions"
mkdir -p "$ROOT/02_BRoll_Images/Segment2_Research"
mkdir -p "$ROOT/02_BRoll_Images/Segment3_Timing"
mkdir -p "$ROOT/02_BRoll_Images/Segment4_Diversification"
mkdir -p "$ROOT/02_BRoll_Images/Segment5_Goals"
mkdir -p "$ROOT/02_BRoll_Images/Climax_Patience"
mkdir -p "$ROOT/02_BRoll_Images/CTA_End"
mkdir -p "$ROOT/03_BRoll_Videos/Hook"
mkdir -p "$ROOT/03_BRoll_Videos/Setup"
mkdir -p "$ROOT/03_BRoll_Videos/Segment1_Emotions"
mkdir -p "$ROOT/03_BRoll_Videos/Segment2_Research"
mkdir -p "$ROOT/03_BRoll_Videos/Segment3_Timing"
mkdir -p "$ROOT/03_BRoll_Videos/Segment4_Diversification"
mkdir -p "$ROOT/03_BRoll_Videos/Climax_Patience"
mkdir -p "$ROOT/03_BRoll_Videos/CTA_End"
mkdir -p "$ROOT/04_Voiceover"
mkdir -p "$ROOT/05_Music"
mkdir -p "$ROOT/06_Documents"
mkdir -p "$ROOT/07_Export"

CDN="https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI"

dl() {
    local url="$1"
    local dest="$2"
    local name="$3"
    echo -n "  ↓ $name ... "
    if curl -sSfL -o "$ROOT/$dest/$name" "$url"; then
        echo "✓"
    else
        echo "✗ FAILED"
    fi
}

# ----- THUMBNAILS -----
echo ""; echo "[1/4] Thumbnails..."
dl "$CDN/hf_20260510_055817_54ed5f7e-4e4d-425c-bb7e-1137c17125fd.png" "01_Thumbnails" "THUMB-1_SplitScreen_PRIMARY.png"
dl "$CDN/hf_20260510_055839_cadd9272-4be3-4961-bdc3-e23116782df6.png" "01_Thumbnails" "THUMB-2_PanicFace.png"
dl "$CDN/hf_20260510_055849_c94b8a23-0198-4f82-91db-e20279e66ba0.png" "01_Thumbnails" "THUMB-3_PiggyVsTrophy.png"
dl "$CDN/hf_20260510_055857_55b09a1c-f617-4343-8621-ce758b40d36a.png" "01_Thumbnails" "THUMB-4_TradingFloor.png"

# ----- B-ROLL IMAGES -----
echo ""; echo "[2/4] B-Roll Images (24)..."
dl "$CDN/hf_20260510_055912_545c9994-f914-4c9d-8f67-84094167d2ff.png" "02_BRoll_Images/Hook" "IMG-01_HostCloseup.png"
dl "$CDN/hf_20260510_055920_79e3d7b2-29ca-4359-bd11-5ef1f18eb72b.png" "02_BRoll_Images/Hook" "IMG-02_NinetyPercentStat.png"
dl "$CDN/hf_20260510_055926_5d0dc3d8-005d-4207-baec-657bb87cb869.png" "02_BRoll_Images/Setup" "IMG-03_FintechOffice.png"
dl "$CDN/hf_20260510_055933_67be6c70-57fe-49cf-ab56-991484a53314.png" "02_BRoll_Images/Setup" "IMG-04_HoloInfographic.png"
dl "$CDN/hf_20260510_055946_39f6574e-85f9-4a05-b6b8-c59b9e9ac32f.png" "02_BRoll_Images/Segment1_Emotions" "IMG-05_PanicSeller.png"
dl "$CDN/hf_20260510_055953_d8ffbbbd-c972-4c5c-a92a-d0ede40b39cb.png" "02_BRoll_Images/Segment1_Emotions" "IMG-06_FearVsGreedSplit.png"
dl "$CDN/hf_20260510_055959_f42658b4-9156-4d47-b844-cf89028bfc81.png" "02_BRoll_Images/Segment1_Emotions" "IMG-07_RedTickerChaos.png"
dl "$CDN/hf_20260510_060019_dde7b578-41d0-42a1-9bf5-761aea1555c8.png" "02_BRoll_Images/Segment2_Research" "IMG-09_FrustratedResearcher.png"
dl "$CDN/hf_20260510_060027_bb7457c4-1670-44e6-a40e-b3281b0a65a4.png" "02_BRoll_Images/Segment2_Research" "IMG-10_InfluencerWarning.png"
dl "$CDN/hf_20260510_060034_102ef856-ffaf-4d50-9b9e-819083f91a31.png" "02_BRoll_Images/Segment2_Research" "IMG-11_FinanceBooks.png"
dl "$CDN/hf_20260510_060041_bf9eeb55-8065-4309-9e5e-24d22a7d7218.png" "02_BRoll_Images/Segment2_Research" "IMG-12_DataAnalyst.png"
dl "$CDN/hf_20260510_060048_e4b56bcb-8ea4-423c-8e8c-36c59e398c18.png" "02_BRoll_Images/Segment3_Timing" "IMG-13_CrystalBall.png"
dl "$CDN/hf_20260510_060055_660bbdb6-6c73-4721-bff1-9379d9c5d121.png" "02_BRoll_Images/Segment3_Timing" "IMG-14_DCAChart.png"
dl "$CDN/hf_20260510_060102_d61f3d45-0a50-484a-ac6f-7a3cd4b954dc.png" "02_BRoll_Images/Segment3_Timing" "IMG-15_Snowball.png"
dl "$CDN/hf_20260510_060123_0ab00b10-c759-4984-b228-ad27110f5ec9.png" "02_BRoll_Images/Segment4_Diversification" "IMG-16_EggsBasketTipping.png"
dl "$CDN/hf_20260510_060130_267d9ae5-7456-4f5f-ad3a-a35ae26f7a2a.png" "02_BRoll_Images/Segment4_Diversification" "IMG-17_BasketsFlatLay.png"
dl "$CDN/hf_20260510_060139_b68a3963-ca5a-4789-9228-813076b54a7a.png" "02_BRoll_Images/Segment4_Diversification" "IMG-18_AssetTriptych.png"
dl "$CDN/hf_20260510_060145_cd97692a-f1cb-40bf-aa25-d700000fe662.png" "02_BRoll_Images/Segment5_Goals" "IMG-19_Compass.png"
dl "$CDN/hf_20260510_060151_62e7533b-d36b-4db2-8660-74c6f36bc0ba.png" "02_BRoll_Images/Segment5_Goals" "IMG-20_TargetGoals.png"
dl "$CDN/hf_20260510_060158_6467334d-376a-497c-a3c8-9879836a07b5.png" "02_BRoll_Images/Segment5_Goals" "IMG-21_NotebookPlan.png"
dl "$CDN/hf_20260510_060207_13caa04f-2167-43b9-a64f-8121f7d7e06e.png" "02_BRoll_Images/Climax_Patience" "IMG-22_Sapling.png"
dl "$CDN/hf_20260510_060213_d501a9b7-b00e-4ff0-8307-f6907bd2d30a.png" "02_BRoll_Images/Climax_Patience" "IMG-23_LongTermChart.png"
dl "$CDN/hf_20260510_060221_eabdd417-7405-44c1-8a04-757c39fa16f2.png" "02_BRoll_Images/CTA_End" "IMG-24_HostSubscribe.png"

# ----- B-ROLL VIDEOS -----
echo ""; echo "[3/4] B-Roll Videos (12)..."
dl "$CDN/hf_20260510_155536_56cfcc75-3170-4cbf-8178-7a3675a74ca2.mp4" "03_BRoll_Videos/Hook" "VID-01_HookDollyIn.mp4"
dl "$CDN/hf_20260510_060249_c646f213-9c9d-477a-86ed-fb545e36d7a9.mp4" "03_BRoll_Videos/Hook" "VID-02_NinetyPercentReveal.mp4"
dl "$CDN/hf_20260510_061111_734d7ad6-63ad-43af-8a21-bcba41c628c3.mp4" "03_BRoll_Videos/Setup" "VID-03_OfficeCrane.mp4"
dl "$CDN/hf_20260510_155544_5e3b5043-1057-4165-9c70-c182ac36bf89.mp4" "03_BRoll_Videos/Segment1_Emotions" "VID-04_FrustratedInvestor.mp4"
dl "$CDN/hf_20260510_160342_3b2cedd2-1b0a-4042-b2f8-5b976877d580.mp4" "03_BRoll_Videos/Segment1_Emotions" "VID-05_FearGreedSmokeMetaphor.mp4"
dl "$CDN/hf_20260510_061133_17e97a73-6895-4e7c-b541-6f0750021ae8.mp4" "03_BRoll_Videos/Segment2_Research" "VID-06_ResearchTimelapse.mp4"
dl "$CDN/hf_20260510_061139_af2a80e0-bb57-464a-977f-a9908f23402f.mp4" "03_BRoll_Videos/Segment2_Research" "VID-07_LibraryPushIn.mp4"
dl "$CDN/hf_20260510_155601_bc422f5c-99b1-49b0-ba0e-51dbb616a3d8.mp4" "03_BRoll_Videos/Segment3_Timing" "VID-08_GlassOrbStorm.mp4"
dl "$CDN/hf_20260510_061156_d08ce660-ea16-47c2-b0af-aea4d283990f.mp4" "03_BRoll_Videos/Segment3_Timing" "VID-09_DCAAnimation.mp4"
dl "$CDN/hf_20260510_061405_1b145283-a44b-45c6-9b25-a21bc7c4ff80.mp4" "03_BRoll_Videos/Segment4_Diversification" "VID-10_EggsBasketSlowMo.mp4"
dl "$CDN/hf_20260510_061413_72264f6a-069a-4124-991d-80bd46f47451.mp4" "03_BRoll_Videos/Climax_Patience" "VID-11_MoneyTreeOrchard.mp4"
dl "$CDN/hf_20260510_061420_4241a841-9b45-463e-89a1-4fe9b3cacb89.mp4" "03_BRoll_Videos/CTA_End" "VID-12_HostSubscribeOutro.mp4"

# ----- DOCUMENTS -----
echo ""; echo "[4/4] Documents..."
GH="https://raw.githubusercontent.com/jiwaniriyan-lgtm/Claude-Code-App/claude/youtube-video-generator-X5uZm/mvp"
dl "$GH/Why_Most_Investors_Fail_FULL_VIDEO_PACKAGE.md" "06_Documents" "01_FULL_VIDEO_PACKAGE.md"
dl "$GH/Why_Most_Investors_Fail_ASSET_MANIFEST.md" "06_Documents" "02_ASSET_MANIFEST.md"
dl "$GH/Why_Most_Investors_Fail_CAPCUT_GUIDE.md" "06_Documents" "03_CAPCUT_GUIDE.md"

echo ""
echo "========================================"
echo "✅ ALL DOWNLOADS COMPLETE"
echo "========================================"
echo "Location: $ROOT"
echo ""
echo "Next: Read 06_Documents/03_CAPCUT_GUIDE.md"
