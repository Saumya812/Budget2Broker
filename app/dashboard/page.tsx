import StatCard from "@/components/StatCard";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Learning Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Knowledge Level" value="Beginner" />
        <StatCard title="Focus Area" value="Index Funds" />
        <StatCard title="Risk Profile" value="Low – Medium" />
      </div>
    </div>
  );
}
