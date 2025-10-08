"use client";
import React, { useEffect, useState } from "react";
import { Users, FileText, PhoneCall } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({
  title,
  value,
  icon,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalDuration = 1500;
    const incrementTime = 20;
    const step = Math.ceil(end / (totalDuration / incrementTime));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-2 flex flex-col items-center justify-center shadow-lg transition transform hover:scale-105 cursor-pointer"
    >
      <div className="mb-4 p-3 bg-teal-600 text-white rounded-full">{icon}</div>
      <h2 className="text-3xl font-extrabold">{count}</h2>
      <p className="mt-2">{title}</p>
      <div className="w-16 h-1 bg-teal-600 mt-3 rounded-full"></div>
    </div>
  );
};

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const stats = {
    leads: { total: 120 },
    quotations: { total: 45 },
    followUps: { total: 60 },
  };

  const data = [
    { month: "Jan", approved: 20, rejected: 5 },
    { month: "Feb", approved: 25, rejected: 10 },
    { month: "Mar", approved: 30, rejected: 15 },
    { month: "Apr", approved: 35, rejected: 8 },
    { month: "May", approved: 40, rejected: 12 },
    { month: "Jun", approved: 45, rejected: 5 },
    { month: "Jul", approved: 34, rejected: 4 },
    { month: "Aug", approved: 25, rejected: 3 },
    { month: "Sep", approved: 20, rejected: 4 },
    { month: "Oct", approved: 35, rejected: 8 },
    { month: "Nov", approved: 26, rejected: 6 },
    { month: "Dec", approved: 25, rejected: 3 },
  ];

  return (
    <div className= "md:p-6 flex flex-col items-center">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
        <StatCard
          title="Total Leads"
          value={stats.leads.total}
          icon={<Users size={40} />}
          onClick={() => setActiveTab("totalleads")}
        />
        <StatCard
          title="Total Quotations"
          value={stats.quotations.total}
          icon={<FileText size={40} />}
          // onClick={() => setActiveTab("quotations")}
        />
        <StatCard
          title="Total Follow Ups"
          value={stats.followUps.total}
          icon={<PhoneCall size={40} />}
          onClick={() => setActiveTab("totalfollow")}
        />
      </div>

      {/* Monthly Leads Chart */}
      <div className="w-full h-80 md:h-96 bg-white rounded-xl p-6 shadow-lg mt-6">
        <h2 className="text-xl font-bold mb-4">Monthly Leads</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="approved" fill="#10B981" />
            <Bar dataKey="rejected" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
