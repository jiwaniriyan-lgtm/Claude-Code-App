"use client";

import StatusBadge from "./StatusBadge";

export type Topic = {
  topic: string;
  prompt: string;
  status: string;
  videoUrl: string;
  youtubeUrl: string;
  notes: string;
};

export default function TopicRow({ row }: { row: Topic }) {
  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-white max-w-xs truncate">{row.topic}</td>
      <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{row.prompt}</td>
      <td className="px-4 py-3">
        <StatusBadge status={row.status} />
      </td>
      <td className="px-4 py-3 text-sm">
        {row.videoUrl ? (
          <a href={row.videoUrl} target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline truncate block max-w-[120px]">
            Video
          </a>
        ) : <span className="text-gray-600">—</span>}
      </td>
      <td className="px-4 py-3 text-sm">
        {row.youtubeUrl ? (
          <a href={row.youtubeUrl} target="_blank" rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 underline truncate block max-w-[120px]">
            YouTube
          </a>
        ) : <span className="text-gray-600">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{row.notes || "—"}</td>
    </tr>
  );
}
