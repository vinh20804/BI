'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';

interface Property {
  name: string;
  price: number;
  area: number;
  address: string;
  pricePerM2: number;
}

interface ComparisonResult {
  comparison: Property[];
  ai_advice: string;
  recommended: string;
}

export default function ComparePage() {
  const [points, setPoints] = useState<Property[]>([]);
  const [selected1, setSelected1] = useState('');
  const [selected2, setSelected2] = useState('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Lấy dữ liệu gốc từ locafinder
  useEffect(() => {
    fetch('https://glorytran.app.n8n.cloud/webhook/locafinder')
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.data || [];
        setPoints(arr);
      })
      .catch((err) => console.error('Error fetching points', err));
  }, []);

  const handleCompare = async () => {
    if (!selected1 || !selected2) {
      alert('⚠️ Vui lòng chọn đủ 2 mặt bằng để so sánh!');
      return;
    }

    setIsComparing(true);
    setComparisonResult(null);

    try {
      const res = await fetch('https://glorytran.app.n8n.cloud/webhook/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prop1: selected1, prop2: selected2 }),
      });
      const data: ComparisonResult = await res.json();
      setComparisonResult(data);
    } catch (err) {
      alert('❌ Lỗi khi so sánh mặt bằng!');
      console.error(err);
    } finally {
      setIsComparing(false);
    }
  };

  const chartData =
    comparisonResult?.comparison.length === 2
      ? [
          {
            name: 'Giá thuê (triệu)',
            [comparisonResult.comparison[0].name]: comparisonResult.comparison[0].price,
            [comparisonResult.comparison[1].name]: comparisonResult.comparison[1].price,
          },
          {
            name: 'Diện tích (m²)',
            [comparisonResult.comparison[0].name]: comparisonResult.comparison[0].area,
            [comparisonResult.comparison[1].name]: comparisonResult.comparison[1].area,
          },
          {
            name: 'Giá/m²',
            [comparisonResult.comparison[0].name]: Number(
              (comparisonResult.comparison[0].price / comparisonResult.comparison[0].area).toFixed(2)
            ),
            [comparisonResult.comparison[1].name]: Number(
              (comparisonResult.comparison[1].price / comparisonResult.comparison[1].area).toFixed(2)
            ),
          },
        ]
      : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <h1 className="text-3xl font-bold text-center text-blue-400 mb-8">🏙️ So sánh mặt bằng</h1>

      {/* Chọn mặt bằng */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <select
          className="bg-gray-800 p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selected1}
          onChange={(e) => setSelected1(e.target.value)}
        >
          <option value="">Chọn mặt bằng 1</option>
          {points.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className="bg-gray-800 p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selected2}
          onChange={(e) => setSelected2(e.target.value)}
        >
          <option value="">Chọn mặt bằng 2</option>
          {points.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Nút so sánh */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleCompare}
          disabled={isComparing}
          className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all ${
            isComparing ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isComparing ? '🔄 Đang so sánh...' : '⚖️ So sánh ngay'}
        </button>
      </div>

      {/* Kết quả */}
      {comparisonResult && (
        <div className="mt-6 space-y-8 max-w-5xl mx-auto">
          {/* Thông tin chi tiết */}
          <div className="grid md:grid-cols-2 gap-6">
            {comparisonResult.comparison.map((p) => (
              <div
                key={p.name}
                className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg hover:shadow-blue-700/30 transition-all"
              >
                <div className="p-5">
                  <h2 className="text-xl font-bold text-blue-400 mb-2">{p.name}</h2>
                  <p className="text-sm text-gray-300 mb-2">📍 {p.address}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-400">💰 Giá thuê</div>
                      <div className="text-yellow-400 font-semibold">{p.price} triệu/tháng</div>
                    </div>
                    <div>
                      <div className="text-gray-400">📏 Diện tích</div>
                      <div className="font-semibold">{p.area} m²</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-400">
                    <span>Giá/m²: </span>
                    <b className="text-white">{p.pricePerM2.toFixed(2)} triệu/m²</b>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Biểu đồ */}
          {comparisonResult.comparison.length === 2 && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-center text-blue-400">📊 Biểu đồ so sánh</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey={comparisonResult.comparison[0].name} fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={comparisonResult.comparison[1].name} fill="#f472b6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* AI advice */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl border-l-4 border-l-blue-400 p-6 text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-3 text-blue-300">🤖 Kết luận từ AI</h3>
            <pre className="text-gray-100 text-lg leading-relaxed whitespace-pre-line">
              {comparisonResult.ai_advice}
            </pre>
            {comparisonResult.recommended && (
              <p className="mt-4 text-xl font-semibold text-yellow-300">
                ✅ Gợi ý chọn: <span className="text-white">{comparisonResult.recommended}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}