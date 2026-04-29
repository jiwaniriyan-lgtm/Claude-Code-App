export default function StatCard({
  label,
  value,
  sub,
  color = "gray",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "gray" | "green" | "yellow" | "red" | "blue";
}) {
  const accent: Record<string, string> = {
    gray: "border-gray-700",
    green: "border-green-500/50",
    yellow: "border-yellow-500/50",
    red: "border-red-500/50",
    blue: "border-blue-500/50",
  };
  return (
    <div className={`rounded-xl border ${accent[color]} bg-gray-900 p-5 flex flex-col gap-1`}>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-3xl font-bold text-white">{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}
