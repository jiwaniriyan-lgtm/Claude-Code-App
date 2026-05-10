# ============================================================
# DOWNLOAD ALL ASSETS — "Why Most Investors Fail" YouTube Video
# ============================================================
# Run this in Windows PowerShell. It creates the folder structure
# at C:\Video Project API\Finance Youtube\ and downloads every
# image, video, and document into the correct subfolder.
#
# HOW TO RUN:
#   1. Save this file as: download_assets.ps1
#   2. Right-click PowerShell → "Run as Administrator"
#   3. cd "C:\path\to\where\you\saved\this\script"
#   4. Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   5. .\download_assets.ps1
#
# Total download size: ~250 MB | Time: ~3-5 min on broadband
# ============================================================

$ROOT = "C:\Video Project API\Finance Youtube"

# ----- 1. CREATE FOLDER STRUCTURE -----
Write-Host "Creating folder structure at $ROOT..." -ForegroundColor Cyan

$folders = @(
    "01_Thumbnails",
    "02_BRoll_Images\Hook",
    "02_BRoll_Images\Setup",
    "02_BRoll_Images\Segment1_Emotions",
    "02_BRoll_Images\Segment2_Research",
    "02_BRoll_Images\Segment3_Timing",
    "02_BRoll_Images\Segment4_Diversification",
    "02_BRoll_Images\Segment5_Goals",
    "02_BRoll_Images\Climax_Patience",
    "02_BRoll_Images\CTA_End",
    "03_BRoll_Videos\Hook",
    "03_BRoll_Videos\Setup",
    "03_BRoll_Videos\Segment1_Emotions",
    "03_BRoll_Videos\Segment2_Research",
    "03_BRoll_Videos\Segment3_Timing",
    "03_BRoll_Videos\Segment4_Diversification",
    "03_BRoll_Videos\Climax_Patience",
    "03_BRoll_Videos\CTA_End",
    "04_Voiceover",
    "05_Music",
    "06_Documents",
    "07_Export"
)

foreach ($folder in $folders) {
    $path = Join-Path $ROOT $folder
    New-Item -ItemType Directory -Force -Path $path | Out-Null
}
Write-Host "✓ Folder structure created`n" -ForegroundColor Green

# ----- 2. DOWNLOAD HELPER -----
function Download-Asset {
    param(
        [string]$Url,
        [string]$Destination,
        [string]$Filename
    )
    $fullPath = Join-Path (Join-Path $ROOT $Destination) $Filename
    Write-Host "  ↓ $Filename" -NoNewline
    try {
        Invoke-WebRequest -Uri $Url -OutFile $fullPath -UseBasicParsing -ErrorAction Stop
        Write-Host " ✓" -ForegroundColor Green
    } catch {
        Write-Host " ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ============================================================
#  SECTION 1: THUMBNAILS (4 files → 01_Thumbnails\)
# ============================================================
Write-Host "[1/4] Downloading thumbnails..." -ForegroundColor Cyan

Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055817_54ed5f7e-4e4d-425c-bb7e-1137c17125fd.png" "01_Thumbnails" "THUMB-1_SplitScreen_PRIMARY.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055839_cadd9272-4be3-4961-bdc3-e23116782df6.png" "01_Thumbnails" "THUMB-2_PanicFace.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055849_c94b8a23-0198-4f82-91db-e20279e66ba0.png" "01_Thumbnails" "THUMB-3_PiggyVsTrophy.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055857_55b09a1c-f617-4343-8621-ce758b40d36a.png" "01_Thumbnails" "THUMB-4_TradingFloor.png"

# ============================================================
#  SECTION 2: B-ROLL IMAGES (24 PNGs → segment subfolders)
# ============================================================
Write-Host "`n[2/4] Downloading 24 B-roll images..." -ForegroundColor Cyan

# HOOK (0:00-0:15)
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055912_545c9994-f914-4c9d-8f67-84094167d2ff.png" "02_BRoll_Images\Hook" "IMG-01_HostCloseup.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055920_79e3d7b2-29ca-4359-bd11-5ef1f18eb72b.png" "02_BRoll_Images\Hook" "IMG-02_NinetyPercentStat.png"

# SETUP (0:15-1:00)
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055926_5d0dc3d8-005d-4207-baec-657bb87cb869.png" "02_BRoll_Images\Setup" "IMG-03_FintechOffice.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055933_67be6c70-57fe-49cf-ab56-991484a53314.png" "02_BRoll_Images\Setup" "IMG-04_HoloInfographic.png"

# SEGMENT 1 — EMOTIONS (1:00-3:00)
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055946_39f6574e-85f9-4a05-b6b8-c59b9e9ac32f.png" "02_BRoll_Images\Segment1_Emotions" "IMG-05_PanicSeller.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055953_d8ffbbbd-c972-4c5c-a92a-d0ede40b39cb.png" "02_BRoll_Images\Segment1_Emotions" "IMG-06_FearVsGreedSplit.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_055959_f42658b4-9156-4d47-b844-cf89028bfc81.png" "02_BRoll_Images\Segment1_Emotions" "IMG-07_RedTickerChaos.png"
# IMG-08 was a regen — using new job ID
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060221_eabdd417-7405-44c1-8a04-757c39fa16f2.png" "02_BRoll_Images\Segment1_Emotions" "IMG-08_CalmPlanner_PLACEHOLDER.png"

# SEGMENT 2 — RESEARCH (3:00-5:00)
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060019_dde7b578-41d0-42a1-9bf5-761aea1555c8.png" "02_BRoll_Images\Segment2_Research" "IMG-09_FrustratedResearcher.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060027_bb7457c4-1670-44e6-a40e-b3281b0a65a4.png" "02_BRoll_Images\Segment2_Research" "IMG-10_InfluencerWarning.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060034_102ef856-ffaf-4d50-9b9e-819083f91a31.png" "02_BRoll_Images\Segment2_Research" "IMG-11_FinanceBooks.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060041_bf9eeb55-8065-4309-9e5e-24d22a7d7218.png" "02_BRoll_Images\Segment2_Research" "IMG-12_DataAnalyst.png"

# SEGMENT 3 — TIMING (5:00-7:00)
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060048_e4b56bcb-8ea4-423c-8e8c-36c59e398c18.png" "02_BRoll_Images\Segment3_Timing" "IMG-13_CrystalBall.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060055_660bbdb6-6c73-4721-bff1-9379d9c5d121.png" "02_BRoll_Images\Segment3_Timing" "IMG-14_DCAChart.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060102_d61f3d45-0a50-484a-ac6f-7a3cd4b954dc.png" "02_BRoll_Images\Segment3_Timing" "IMG-15_Snowball.png"

# SEGMENT 4 — DIVERSIFICATION (7:00-9:00)
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060123_0ab00b10-c759-4984-b228-ad27110f5ec9.png" "02_BRoll_Images\Segment4_Diversification" "IMG-16_EggsBasketTipping.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060130_267d9ae5-7456-4f5f-ad3a-a35ae26f7a2a.png" "02_BRoll_Images\Segment4_Diversification" "IMG-17_BasketsFlatLay.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060139_b68a3963-ca5a-4789-9228-813076b54a7a.png" "02_BRoll_Images\Segment4_Diversification" "IMG-18_AssetTriptych.png"

# SEGMENT 5 — GOALS (9:00-11:00)
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060145_cd97692a-f1cb-40bf-aa25-d700000fe662.png" "02_BRoll_Images\Segment5_Goals" "IMG-19_Compass.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060151_62e7533b-d36b-4db2-8660-74c6f36bc0ba.png" "02_BRoll_Images\Segment5_Goals" "IMG-20_TargetGoals.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060158_6467334d-376a-497c-a3c8-9879836a07b5.png" "02_BRoll_Images\Segment5_Goals" "IMG-21_NotebookPlan.png"

# CLIMAX — PATIENCE (11:00-13:00)
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060207_13caa04f-2167-43b9-a64f-8121f7d7e06e.png" "02_BRoll_Images\Climax_Patience" "IMG-22_Sapling.png"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060213_d501a9b7-b00e-4ff0-8307-f6907bd2d30a.png" "02_BRoll_Images\Climax_Patience" "IMG-23_LongTermChart.png"

# CTA (13:00-15:00)
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060221_eabdd417-7405-44c1-8a04-757c39fa16f2.png" "02_BRoll_Images\CTA_End" "IMG-24_HostSubscribe.png"

# ============================================================
#  SECTION 3: B-ROLL VIDEOS (12 MP4s → segment subfolders)
# ============================================================
Write-Host "`n[3/4] Downloading 12 B-roll video clips..." -ForegroundColor Cyan

# HOOK
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_155536_56cfcc75-3170-4cbf-8178-7a3675a74ca2.mp4" "03_BRoll_Videos\Hook" "VID-01_HookDollyIn.mp4"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_060249_c646f213-9c9d-477a-86ed-fb545e36d7a9.mp4" "03_BRoll_Videos\Hook" "VID-02_NinetyPercentReveal.mp4"

# SETUP
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_061111_734d7ad6-63ad-43af-8a21-bcba41c628c3.mp4" "03_BRoll_Videos\Setup" "VID-03_OfficeCrane.mp4"

# SEGMENT 1 — EMOTIONS
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_155544_5e3b5043-1057-4165-9c70-c182ac36bf89.mp4" "03_BRoll_Videos\Segment1_Emotions" "VID-04_FrustratedInvestor.mp4"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_160342_3b2cedd2-1b0a-4042-b2f8-5b976877d580.mp4" "03_BRoll_Videos\Segment1_Emotions" "VID-05_FearGreedSmokeMetaphor.mp4"

# SEGMENT 2 — RESEARCH
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_061133_17e97a73-6895-4e7c-b541-6f0750021ae8.mp4" "03_BRoll_Videos\Segment2_Research" "VID-06_ResearchTimelapse.mp4"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_061139_af2a80e0-bb57-464a-977f-a9908f23402f.mp4" "03_BRoll_Videos\Segment2_Research" "VID-07_LibraryPushIn.mp4"

# SEGMENT 3 — TIMING
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_155601_bc422f5c-99b1-49b0-ba0e-51dbb616a3d8.mp4" "03_BRoll_Videos\Segment3_Timing" "VID-08_GlassOrbStorm.mp4"
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_061156_d08ce660-ea16-47c2-b0af-aea4d283990f.mp4" "03_BRoll_Videos\Segment3_Timing" "VID-09_DCAAnimation.mp4"

# SEGMENT 4 — DIVERSIFICATION
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_061405_1b145283-a44b-45c6-9b25-a21bc7c4ff80.mp4" "03_BRoll_Videos\Segment4_Diversification" "VID-10_EggsBasketSlowMo.mp4"

# CLIMAX
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_061413_72264f6a-069a-4124-991d-80bd46f47451.mp4" "03_BRoll_Videos\Climax_Patience" "VID-11_MoneyTreeOrchard.mp4"

# CTA
Download-Asset "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxar64VflOxcstzDkRmxJwAwsI/hf_20260510_061420_4241a841-9b45-463e-89a1-4fe9b3cacb89.mp4" "03_BRoll_Videos\CTA_End" "VID-12_HostSubscribeOutro.mp4"

# ============================================================
#  SECTION 4: DOCUMENTS (3 markdown files → 06_Documents\)
# ============================================================
Write-Host "`n[4/4] Downloading documents from GitHub..." -ForegroundColor Cyan

$repoBase = "https://raw.githubusercontent.com/jiwaniriyan-lgtm/Claude-Code-App/claude/youtube-video-generator-X5uZm/mvp"
Download-Asset "$repoBase/Why_Most_Investors_Fail_FULL_VIDEO_PACKAGE.md" "06_Documents" "01_FULL_VIDEO_PACKAGE.md"
Download-Asset "$repoBase/Why_Most_Investors_Fail_ASSET_MANIFEST.md" "06_Documents" "02_ASSET_MANIFEST.md"
Download-Asset "$repoBase/Why_Most_Investors_Fail_CAPCUT_GUIDE.md" "06_Documents" "03_CAPCUT_GUIDE.md"

# ============================================================
#  PLACEHOLDER FILES (so empty folders aren't confusing)
# ============================================================
@"
PLACE YOUR ELEVENLABS VOICEOVER HERE.

1. Go to https://elevenlabs.io
2. Voice: Adam | Model: eleven_multilingual_v2
3. Settings: Stability 0.45, Similarity 0.75, Style 0.50, Speaker Boost ON
4. Paste full SSML script from 06_Documents\01_FULL_VIDEO_PACKAGE.md (Section 3)
5. Generate, download MP3, save here as: VO_full.mp3
"@ | Out-File -FilePath (Join-Path $ROOT "04_Voiceover\README.txt") -Encoding utf8

@"
PLACE YOUR BACKGROUND MUSIC HERE.

Free options:
- YouTube Audio Library (https://studio.youtube.com -> Audio Library)
  Filter: Cinematic, ~90 BPM, Instrumental, No attribution required
- Epidemic Sound (paid): https://www.epidemicsound.com
- Artlist (paid): https://artlist.io

Save selected track as: bg_music.mp3
"@ | Out-File -FilePath (Join-Path $ROOT "05_Music\README.txt") -Encoding utf8

@"
YOUR FINAL EXPORTED VIDEO LANDS HERE.

Recommended export settings (CapCut):
- Resolution: 1080p
- Frame Rate: 30 fps
- Bitrate: High (12 Mbps)
- Format: MP4 / H.264

Final filename suggestion: Investors_Final.mp4
"@ | Out-File -FilePath (Join-Path $ROOT "07_Export\README.txt") -Encoding utf8

# ============================================================
#  DONE
# ============================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "✅ ALL DOWNLOADS COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Location: $ROOT"
Write-Host ""
Write-Host "FOLDER MAP:"
Write-Host "  01_Thumbnails\         → 4 PNG thumbnail variants"
Write-Host "  02_BRoll_Images\       → 24 PNGs in 9 segment folders"
Write-Host "  03_BRoll_Videos\       → 12 MP4s in 8 segment folders"
Write-Host "  04_Voiceover\          → (empty — render in ElevenLabs)"
Write-Host "  05_Music\              → (empty — license a track)"
Write-Host "  06_Documents\          → 3 markdown guides"
Write-Host "  07_Export\             → (empty — your final MP4 goes here)"
Write-Host ""
Write-Host "NEXT STEPS:"
Write-Host "  1. Read 06_Documents\03_CAPCUT_GUIDE.md"
Write-Host "  2. Render voiceover in ElevenLabs → save to 04_Voiceover\"
Write-Host "  3. Pick background music → save to 05_Music\"
Write-Host "  4. Open CapCut, import C:\Video Project API\Finance Youtube\, follow guide"
Write-Host ""
