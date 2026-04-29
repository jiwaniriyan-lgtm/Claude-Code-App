import { google } from "googleapis";

export type TopicRow = {
  row: number;
  topic: string;
  prompt: string;
  status: string;
  videoUrl: string;
  youtubeUrl: string;
  notes: string;
};

export type ErrorLogRow = {
  timestamp: string;
  topic: string;
  error: string;
};

function makeAuth() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!keyJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");

  const credentials = JSON.parse(keyJson);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

function sheets() {
  return google.sheets({ version: "v4", auth: makeAuth() });
}

const SPREADSHEET_ID = process.env.SPREADSHEET_ID ?? "";
const TOPICS_SHEET = process.env.TOPICS_SHEET ?? "Topics";
const LOG_SHEET = process.env.LOG_SHEET ?? "ErrorLog";

export async function getTopics(): Promise<TopicRow[]> {
  const client = await sheets();
  const res = await client.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TOPICS_SHEET}!A:F`,
  });

  const rows = res.data.values ?? [];
  return rows.slice(1).map((row, i) => ({
    row: i + 2,
    topic: row[0]?.trim() ?? "",
    prompt: row[1]?.trim() ?? "",
    status: row[2]?.trim().toLowerCase() ?? "",
    videoUrl: row[3]?.trim() ?? "",
    youtubeUrl: row[4]?.trim() ?? "",
    notes: row[5]?.trim() ?? "",
  }));
}

export async function getErrorLog(limit = 20): Promise<ErrorLogRow[]> {
  const client = await sheets();
  const res = await client.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${LOG_SHEET}!A:C`,
  });

  const rows = res.data.values ?? [];
  return rows
    .slice(1)
    .reverse()
    .slice(0, limit)
    .map((row) => ({
      timestamp: row[0]?.trim() ?? "",
      topic: row[1]?.trim() ?? "",
      error: row[2]?.trim() ?? "",
    }));
}
