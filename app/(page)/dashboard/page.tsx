'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    avgPrice: 0,
    avgArea: 0,
    totalViews: 0,
  });

  useEffect(() => {
    fetch('https://glorytran.app.n8n.cloud/webhook/locafinder')
      .then(res => res.json())
      .then(res => {
        const arr = Array.isArray(res) ? res : res.data || [];
        setData(arr);
        if (arr.length) {
          const total = arr.length;
          const avgPrice = arr.reduce((a, b) => a + Number(b.price || 0), 0) / total;
          const avgArea = arr.reduce((a, b) => a + Number(b.area || 0), 0) / total;
          const totalViews = arr.reduce((a, b) => a + Number(b.pre || 0), 0);
          setSummary({ total, avgPrice, avgArea, totalViews });
        }
      })
      .catch(e => console.error('Dashboard data error:', e));
  }, []);

  // Gom theo khu vực (dựa trên address)
  const avgByArea = Object.values(
    data.reduce((acc: any, cur: any) => {
      const area = cur.address?.split(',').pop()?.trim() || 'Khác';
      if (!acc[area]) acc[area] = { area, count: 0, totalPrice: 0 };
      acc[area].count++;
      acc[area].totalPrice += Number(cur.price || 0);
      return acc;
    }, {})
  ).map((v: any) => ({
    area: v.area,
    avgPrice: Number((v.totalPrice / v.count).toFixed(1)),
  }));

  const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">📊 Dashboard thống kê mặt bằng</h1>

      {/* Tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-900 p-5 rounded-xl text-center border border-gray-800">
          <div className="text-gray-400 text-sm">Tổng số mặt bằng</div>
          <div className="text-3xl font-bold text-white mt-2">{summary.total}</div>
        </div>
        <div className="bg-gray-900 p-5 rounded-xl text-center border border-gray-800">
          <div className="text-gray-400 text-sm">Giá trung bình</div>
          <div className="text-3xl font-bold text-yellow-400 mt-2">
            {summary.avgPrice.toFixed(1)} triệu/tháng
          </div>
        </div>
        <div className="bg-gray-900 p-5 rounded-xl text-center border border-gray-800">
          <div className="text-gray-400 text-sm">Diện tích TB</div>
          <div className="text-3xl font-bold text-emerald-400 mt-2">
            {summary.avgArea.toFixed(1)} m²
          </div>
        </div>
        <div className="bg-gray-900 p-5 rounded-xl text-center border border-gray-800">
          <div className="text-gray-400 text-sm">Tổng lượt xem</div>
          <div className="text-3xl font-bold text-pink-400 mt-2">{summary.totalViews}</div>
        </div>
      </div>

      {/* Biểu đồ giá trung bình theo khu vực */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">
          💰 Giá thuê trung bình theo khu vực
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={avgByArea}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="area" tick={{ fill: '#9ca3af' }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ backgroundColor: '#111827', color: '#fff' }} />
            <Bar dataKey="avgPrice" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top mặt bằng được xem nhiều */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">🔥 Top mặt bằng nổi bật</h2>
        <div className="space-y-3">
          {data
            .sort((a, b) => (b.pre || 0) - (a.pre || 0))
            .slice(0, 5)
            .map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <div>
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.address}</div>
                </div>
                <div className="text-yellow-400 font-bold">{item.price} tr/th</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
