export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-gray-700">
      <h1 className="px-8 py-24 text-4xl font-bold">Bar Team Dashboard</h1>
      <div className="space-x-4">
        <a href="/opening" className="px-8 py-24 bg-green-600 text-white rounded shadow hover:bg-green-700">Opening Checklist</a>
        <a href="/closing" className="px-8 py-24 bg-red-600 text-white rounded shadow hover:bg-red-700">Closing Checklist</a>
        <a href="/schedule" className="px-8 py-24 bg-blue-600 text-white rounded shadow hover:bg-blue-700">See Schedule</a>
      </div>
    </main>
  );
}
