'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const MAP_CENTER: [number, number] = [105.8208, 21.0239];

export default function HomePage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    note: '',
  });

  // 🧠 Thêm state cho AI dự đoán
  const [aiResult, setAiResult] = useState<{ predicted: string; advice: string } | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // 🟢 Lấy dữ liệu từ webhook n8n
  useEffect(() => {
    fetch('https://glorytran.app.n8n.cloud/webhook/locafinder')
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.data || [];
        setPoints(arr);
        setFilteredPoints(arr);
      })
      .catch((e) => {
        console.error('API error', e);
        setPoints([]);
        setFilteredPoints([]);
      });
  }, []);

  // 🗺️ Khởi tạo và render map
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: MAP_CENTER,
        zoom: 12.5,
        attributionControl: false,
      });

      mapRef.current.once('load', () => {
        mapRef.current!.resize();
        mapRef.current!.flyTo({ center: MAP_CENTER, zoom: 13.5, speed: 0.8, curve: 1.2 });
      });
    }

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredPoints.forEach((p: any, i: number) => {
      if (!p.lat || !p.lng) return;

      const safeId = `detail-btn-${i}`;
      const thumbHtml = p.image
        ? `<img src="${p.image}" alt="${p.name || 'img'}" style="width:100%;height:120px;object-fit:cover;border-radius:10px;margin-bottom:8px"/>`
        : `<div style="width:100%;height:120px;border-radius:10px;background:#1f2937;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:13px;margin-bottom:8px">Không có ảnh</div>`;

      const popupHTML = `
        <div style="
          width:260px;
          background:#0f172a;
          color:white;
          border-radius:12px;
          padding:10px;
          font-family:'Inter',sans-serif;
          backdrop-filter:blur(8px);
        ">
          ${thumbHtml}
          <div style="font-size:15px;font-weight:700;color:#60a5fa;margin-bottom:4px;">${p.name || ''}</div>
          <div style="font-size:13px;color:#cbd5e1;margin-bottom:4px;">${p.address || ''}</div>
          <div style="font-size:13px;color:#94a3b8;margin-bottom:8px;">${p.desc || ''}</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="color:#facc15;font-weight:600;">💰 ${p.price} triệu/tháng</span>
            <span style="font-size:12px;color:#9ca3af;">${p.area || '-'} m²</span>
          </div>
          <!-- ⭐ Đánh giá từ người thuê -->
          <div style="display:flex;align-items:center;margin-bottom:6px;font-size:13px;color:#facc15;">
            ${p.star ? (() => {
              const fullStars = Math.floor(p.star);
              const halfStar = p.star - fullStars >= 0.5 ? 1 : 0;
              const emptyStars = 5 - fullStars - halfStar;
              return (
                'Đánh giá: ' +
                '★'.repeat(fullStars) +
                (halfStar ? '☆' : '') +
                '✩'.repeat(emptyStars)
              );
            })() : 'Chưa có đánh giá'}
          </div>

          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:12px;color:#9ca3af;">Lượt thuê trước: <b style="color:white">${p.pre ?? 0}</b></span>
            <button id="${safeId}" style="
              padding:5px 10px;
              border-radius:8px;
              background:#2563eb;
              border:none;
              color:white;
              font-size:13px;
              cursor:pointer;
            ">Xem chi tiết</button>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 28,
        closeButton: false,
        className: 'custom-popup',
      }).setHTML(popupHTML);

      const marker = new mapboxgl.Marker({ color: '#f43f5e' })
        .setLngLat([Number(p.lng), Number(p.lat)])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);

      marker.getElement().addEventListener('click', () => {
        setTimeout(() => {
          const btn = document.getElementById(safeId);
          if (btn)
            btn.onclick = () => {
              setSelectedPoint(p);
              mapRef.current?.flyTo({
                center: [Number(p.lng), Number(p.lat)],
                zoom: 15,
                speed: 1.1,
                curve: 1.1,
                essential: true,
              });
            };
        }, 120);
      });
    });
  }, [filteredPoints]);

  const handleZoomToLocation = () => {
    if (!selectedPoint) return;
    setSelectedPoint(null);
    mapRef.current?.flyTo({
      center: [Number(selectedPoint.lng), Number(selectedPoint.lat)],
      zoom: 15.5,
      speed: 0.9,
      curve: 1.1,
    });
  };

  // 🧾 Submit lịch hẹn
  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.date || !formData.time) {
      alert('⚠️ Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setIsSubmitting(true);

    const payload = {
      timestamp: new Date().toISOString(),
      ...formData,
      point_name: selectedPoint?.name || '',
      address: selectedPoint?.address || '',
      price: selectedPoint?.price || '',
      area: selectedPoint?.area || '',
    };

    try {
      await fetch('https://glorytran.app.n8n.cloud/webhook/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      alert('✅ Đặt lịch thành công, chủ nhà sẽ liên hệ lại bạn sớm nhất!');
      setShowForm(false);
      setFormData({ name: '', phone: '', email: '', date: '', time: '', note: '' });
    } catch (err) {
      alert('❌ Gửi thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🧠 Gọi API AI dự đoán giá (n8n)
  const handleAIPredict = async () => {
    if (!selectedPoint) return;
    setIsPredicting(true);
    setAiResult(null);

    try {
      const res = await fetch('https://glorytran.app.n8n.cloud/webhook/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedPoint.name,
          address: selectedPoint.address,
          area: selectedPoint.area,
          price: selectedPoint.price,
        }),
      });

      const data = await res.json();
      console.log('AI Predict Response:', data);

      // ✅ Parse kết quả JSON AI trả về
      let predicted_price = null;
      let advice = '';
      try {
        const outputStr = data[0]?.output || data.output || '';
        const clean = outputStr.replace(/```json/i, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        predicted_price = parsed.predicted_price;
        advice = parsed.advice;
      } catch (err) {
        console.error('Parse error:', err);
      }

      setAiResult({
        predicted: predicted_price || 'Không xác định',
        advice: advice || 'Không có khuyến nghị.',
      });
    } catch (err) {
      alert('❌ Lỗi khi gọi AI dự đoán!');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-gray-900 to-black min-h-screen text-white">
      <h1 className="text-3xl font-bold text-blue-400 py-4">📍 Bản đồ mặt bằng cho thuê</h1>

      <div ref={mapContainer} className="w-full flex-1" style={{ minHeight: '85vh' }} />

      {/* 📦 Popup chi tiết */}
      {selectedPoint && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
          onClick={() => setSelectedPoint(null)}
        >
          <div
            className="bg-gray-900 text-white rounded-2xl max-w-4xl w-full overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                {selectedPoint.image ? (
                  <img
                    src={selectedPoint.image}
                    alt={selectedPoint.name}
                    className="w-full h-full object-cover min-h-[300px]"
                  />
                ) : (
                  <div className="flex items-center justify-center min-h-[300px] bg-gray-800">
                    Không có ảnh
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-400">{selectedPoint.name}</h2>
                    <p className="text-sm text-gray-300 mt-1">📍 {selectedPoint.address}</p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-white text-xl"
                    onClick={() => setSelectedPoint(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-200">
                  <div>
                    <div className="text-gray-400 text-xs">Diện tích</div>
                    <div className="font-semibold">
                      {selectedPoint.area ? `${selectedPoint.area} m²` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Giá thuê</div>
                    <div className="font-semibold text-yellow-400">
                      {selectedPoint.price ? `${selectedPoint.price} triệu/tháng` : '-'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
                    onClick={handleAIPredict}
                    disabled={isPredicting}
                  >
                    {isPredicting ? 'Đang dự đoán...' : '🧠 Dự đoán giá AI'}
                  </button>
                  <button
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-semibold"
                    onClick={() => setShowForm(true)}
                  >
                    Đặt lịch xem
                  </button>
                  <button
                    className="bg-transparent border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg"
                    onClick={handleZoomToLocation}
                  >
                    Zoom tới vị trí
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💡 Modal hiển thị kết quả AI */}
      {aiResult && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
          onClick={() => setAiResult(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-blue-400 mb-3">🔮 Kết quả AI dự đoán</h3>
            <p className="text-lg">
              💰 <span className="font-bold text-yellow-400">{aiResult.predicted}</span> triệu/tháng
            </p>
            <p className="text-sm text-gray-300 mt-3">{aiResult.advice}</p>
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
              onClick={() => setAiResult(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* 🧾 Form đặt lịch */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div
            className="bg-gray-900 text-white rounded-2xl w-full max-w-md p-6 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-blue-400 mb-4">🗓️ Đặt lịch xem nhà</h3>

            <div className="space-y-3">
              <input
                className="w-full bg-gray-800 rounded-lg p-2"
                placeholder="Họ và tên *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                className="w-full bg-gray-800 rounded-lg p-2"
                placeholder="Số điện thoại *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <input
                className="w-full bg-gray-800 rounded-lg p-2"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <div className="flex gap-3">
                <input
                  type="date"
                  className="w-1/2 bg-gray-800 rounded-lg p-2"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <input
                  type="time"
                  className="w-1/2 bg-gray-800 rounded-lg p-2"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <textarea
                className="w-full bg-gray-800 rounded-lg p-2"
                placeholder="Ghi chú thêm..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>

            <div className="flex justify-end mt-4 gap-3">
              <button
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                onClick={() => setShowForm(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi lịch hẹn'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .mapboxgl-popup {
          max-width: 300px !important;
        }
        .mapboxgl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border: none !important;
        }
        .mapboxgl-popup-tip {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
