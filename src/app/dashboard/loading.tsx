export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
        <div className="h-4 bg-gray-100 rounded-lg w-64"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm"></div>
        ))}
      </div>

      <div className="bg-white rounded-2xl h-96 border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 h-16"></div>
        <div className="p-8 space-y-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-50 rounded-lg"></div>)}
        </div>
      </div>
    </div>
  );
}