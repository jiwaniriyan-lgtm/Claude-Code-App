import { getTopics, getErrorLog, type TopicRow as TopicRowData, type ErrorLogRow } from "@/lib/sheets";
import StatCard from "./_components/StatCard";
import TopicRow from "./_components/TopicRow";
import RefreshButton from "./_components/RefreshButton";

async function fetchData(): Promise<{
  topics: TopicRowData[];
  errors: ErrorLogRow[];
  warning?: string;
}> {
  if (!process.env.SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return {
      topics: DEMO_TOPICS,
      errors: DEMO_ERRORS,
      warning: "Running with demo data. Set SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON to connect to Google Sheets.",
    };
  }
  try {
    const [topics, errors] = await Promise.all([getTopics(), getErrorLog()]);
    return { topics, errors };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { topics: DEMO_TOPICS, errors: DEMO_ERRORS, warning: `Sheets error: ${msg}` };
  }
}

function counts(topics: TopicRowData[]) {
  return {
    total: topics.length,
    done: topics.filter((t) => t.status === "done").length,
    running: topics.filter((t) => t.status === "running").length,
    error: topics.filter((t) => t.status === "error").length,
    pending: topics.filter((t) => !t.status || t.status === "pending").length,
  };
}

export default async function DashboardPage() {
  const { topics, errors, warning } = await fetchData();
  const stats = counts(topics);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">YouTube Automation</h1>
              <p className="text-xs text-gray-400">Pipeline Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Scheduler active
            </span>
            <RefreshButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">

        {/* Demo / warning banner */}
        {warning && (
          <div className="rounded-lg border border-yellow-700/50 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-300">
            {warning}
          </div>
        )}

        {/* Stats */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Topics" value={stats.total} color="gray" />
            <StatCard label="Published" value={stats.done} sub="uploaded to YouTube" color="green" />
            <StatCard label="In Progress" value={stats.running} sub="rendering / uploading" color="yellow" />
            <StatCard label="Errors" value={stats.error} sub="need attention" color="red" />
          </div>
        </section>

        {/* Pipeline steps */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Pipeline</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
            {[
              { step: "1", label: "Google Sheets", desc: "Read topics & prompts" },
              { step: "2", label: "Claude AI", desc: "Generate script, title, tags" },
              { step: "3", label: "json2video", desc: "Render full video" },
              { step: "4", label: "YouTube API", desc: "Upload & publish" },
            ].map((s, i, arr) => (
              <div key={s.step} className="flex items-center">
                <div className="flex flex-col items-center bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-500 mb-1">STEP {s.step}</span>
                  <span className="text-sm font-semibold text-white">{s.label}</span>
                  <span className="text-xs text-gray-500 text-center mt-0.5">{s.desc}</span>
                </div>
                {i < arr.length - 1 && (
                  <svg className="w-5 h-5 text-gray-600 shrink-0 mx-1 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Topics table */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Topics Queue</h2>
            <span className="text-xs text-gray-500">{topics.length} rows</span>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden overflow-x-auto">
            {topics.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-500 text-center">No topics found in the sheet.</p>
            ) : (
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    {["Topic", "Prompt", "Status", "Video", "YouTube", "Notes"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topics.map((row) => (
                    <TopicRow key={row.row} row={row} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Error log */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Recent Errors</h2>
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4">
            {errors.length === 0 ? (
              <p className="text-sm text-gray-500">No errors. All clear!</p>
            ) : (
              <ul className="space-y-2">
                {errors.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center text-xs font-bold">!</span>
                    <div className="min-w-0">
                      <span className="font-medium text-white">{e.topic}</span>
                      {e.error && <span className="ml-2 text-gray-400">— {e.error}</span>}
                      {e.timestamp && <span className="ml-2 text-xs text-gray-600">{e.timestamp}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

      </main>

      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        YouTube Automation System &mdash; powered by Claude AI &amp; json2video
      </footer>
    </div>
  );
}

// ── Demo data (used when env vars are not set) ──────────────────────────────

const DEMO_TOPICS: TopicRowData[] = [
  { row: 2, topic: "10 Facts About Black Holes", prompt: "Educational, all ages, upbeat narration", status: "done", videoUrl: "https://cdn.example.com/videos/black-holes.mp4", youtubeUrl: "https://youtu.be/abc123", notes: "" },
  { row: 3, topic: "How Ocean Currents Work", prompt: "Documentary style, calm music", status: "running", videoUrl: "", youtubeUrl: "", notes: "Rendering at json2video" },
  { row: 4, topic: "The History of the Internet", prompt: "Fast-paced, Gen Z audience", status: "pending", videoUrl: "", youtubeUrl: "", notes: "" },
  { row: 5, topic: "Why Cats Purr", prompt: "Lighthearted, family friendly", status: "error", videoUrl: "", youtubeUrl: "", notes: "json2video timeout after 600s" },
  { row: 6, topic: "Inside the Mariana Trench", prompt: "Mysterious, ambient music", status: "done", videoUrl: "https://cdn.example.com/videos/mariana.mp4", youtubeUrl: "https://youtu.be/def456", notes: "" },
];

const DEMO_ERRORS: ErrorLogRow[] = [
  { timestamp: "2026-04-28T14:32:00", topic: "Why Cats Purr", error: "json2video timeout after 600s" },
];
