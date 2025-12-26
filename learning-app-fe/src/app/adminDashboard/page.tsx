"use client";
import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Warehouse,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // Dữ liệu cho biểu đồ Revenue Stats
  const revenueData = [
    { month: "Jan", value: 45 },
    { month: "Feb", value: 52 },
    { month: "Mar", value: 68 },
    { month: "Apr", value: 85 },
    { month: "May", value: 102 },
    { month: "Jun", value: 118 },
    { month: "Jul", value: 135 },
    { month: "Aug", value: 155 },
    { month: "Sep", value: 168 },
    { month: "Oct", value: 210 },
    { month: "Nov", value: 225 },
    { month: "Dec", value: 248 },
  ];

  // Dữ liệu cho biểu đồ Sales by Category
  const categoryData = [
    { name: "Fashion", value: 15.8, color: "#FF6B7A" },
    { name: "Health and Careness", value: 22.2, color: "#7B68EE" },
    { name: "Electronics", value: 29.1, color: "#4A90E2" },
    { name: "Sporting Goods", value: 33, color: "#FFB84D" },
  ];

  const stats = [
    {
      title: "Total Sales",
      value: "890",
      change: "+18%",
      detail: "+3.8k this week",
      positive: true,
      bg: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Visitor",
      value: "1,234",
      change: "+18%",
      detail: "+2.8k this week",
      positive: true,
      bg: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Total Orders",
      value: "567",
      change: "+18%",
      detail: "+7.8k this week",
      positive: true,
      bg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Refunded",
      value: "123",
      change: "+18%",
      detail: "+1.2k this week",
      positive: false,
      bg: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Package, label: "Products" },
    { icon: CreditCard, label: "Transaction" },
    { icon: Warehouse, label: "Warehouse" },
    { icon: Users, label: "Customer" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </div>

        <nav className="flex-1 px-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveMenu(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
                activeMenu === item.label
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mb-2">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome back, Ketut Susilo
              </h2>
              <p className="text-gray-500 mt-1">
                Lorem ipsum dolor sit amet consectetur adipiscing
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
                  K
                </div>
                <span className="font-medium text-gray-700">Ketut Susilo</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.bg} rounded-2xl p-6`}>
                <h3 className="text-gray-600 text-sm font-medium mb-2">
                  {stat.title}
                </h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-800">
                    {stat.value}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`font-semibold ${
                      stat.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-gray-600">{stat.detail}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Stats */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Revenue Stats
                </h3>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <span>This year</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    ticks={[0, 50, 100, 150, 200, 250]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4A90E2"
                    strokeWidth={3}
                    dot={{ fill: "#4A90E2", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sales by Category */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Sales by Category
                </h3>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <span>This year</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-center mb-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {categoryData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
