// components/admin/StatsCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: string; // "blue" | "green" | "purple" | "orange"
}

export default function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {trend && <p className="text-xs text-green-600 mt-2 font-medium">Wait: {trend}</p>}
      </div>
      <div className={`w-12 h-12 rounded-lg ${colorMap[color]} flex items-center justify-center text-white shadow-md`}>
        <Icon size={24} />
      </div>
    </div>
  );
}