"""
One-time helper: creates the required sheet tabs with headers
in an existing Google Spreadsheet.

Run once:
    python setup_sheets.py
"""

import gspread
from google.oauth2.service_account import Credentials
from config import config

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

SHEETS = {
    "Topics": [
        "Topic",
        "Prompt / Extra Instructions",
        "Status",
        "Video URL",
        "YouTube URL",
        "Notes",
    ],
    "Music": ["Track Name", "URL"],
    "ErrorLog": ["Timestamp (UTC)", "Topic", "Error"],
}

SAMPLE_TOPICS = [
    ["10 Amazing Facts About the Ocean", "Make it suitable for all ages, upbeat tone", "", "", "", ""],
    ["How AI Is Changing Healthcare", "Focus on 2024-2025 developments", "", "", "", ""],
    ["Beginner's Guide to Sourdough Bread", "Include tips for common mistakes", "", "", "", ""],
]

SAMPLE_MUSIC = [
    ["Upbeat Background", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"],
    ["Calm Ambient", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"],
]


def main() -> None:
    creds = Credentials.from_service_account_file(config.google_service_account_json, scopes=SCOPES)
    gc = gspread.authorize(creds)
    spreadsheet = gc.open_by_key(config.spreadsheet_id)

    existing = {ws.title for ws in spreadsheet.worksheets()}

    for sheet_name, headers in SHEETS.items():
        if sheet_name not in existing:
            ws = spreadsheet.add_worksheet(title=sheet_name, rows=500, cols=len(headers))
            print(f"Created sheet: {sheet_name}")
        else:
            ws = spreadsheet.worksheet(sheet_name)
            print(f"Sheet already exists: {sheet_name}")

        # Write headers in bold
        ws.update("A1", [headers])
        ws.format("A1:Z1", {"textFormat": {"bold": True}})

        # Seed sample data
        if sheet_name == "Topics":
            ws.update("A2", SAMPLE_TOPICS)
        elif sheet_name == "Music":
            ws.update("A2", SAMPLE_MUSIC)

    print("\nSetup complete. Open your spreadsheet and verify the sheets.")


if __name__ == "__main__":
    main()
