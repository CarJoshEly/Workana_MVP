import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <Icon className="w-5 h-5 text-[#1A9B5E]" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
  );
}