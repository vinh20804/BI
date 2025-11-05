'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const MAP_CENTER: [number, number] = [105.8208, 21.0239];

export default function Filter() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);

  const [filters, setFilters] = useState({
    address: '',
    type: '',
    minArea: 0,
    maxArea: 9999,
    minPrice: 0,
    maxPrice: 9999,
  });

  // 🟢 Lấy dữ liệu từ webhook n8n
  useEffect(() => {
    fetch('https://glorytran.app.n8n.cloud/webhook/locafinder')
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.data || [];
        setPoints(arr);
        setFilteredPoints(arr);
      })
      .catch(() => {
        setPoints([]);
        setFilteredPoints([]);
      });
  }, []);

  // 🔹 Lọc dữ liệu
  const filterPoints = useCallback(() => {
    const filtered = points.filter((p) => {
      const matchAddress = !filters.address || p.address === filters.address;
      const matchType = !filters.type || p.type === filters.type;
      const matchArea =
        (!filters.minArea || p.area >= Number(filters.minArea)) &&
        (!filters.maxArea || p.area <= Number(filters.maxArea));
      const matchPrice =
        (!filters.minPrice || p.price >= Number(filters.minPrice)) &&
        (!filters.maxPrice || p.price <= Number(filters.maxPrice));
      return matchAddress && matchType && matchArea && matchPrice;
    });
    setFilteredPoints(filtered);

    if (mapRef.current) {
      if (filtered.length === 1) {
        const f = filtered[0];
        mapRef.current.flyTo({ center: [f.lng, f.lat], zoom: 15, speed: 1.2 });
      } else if (filtered.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        filtered.forEach((p) => p.lng && p.lat && bounds.extend([p.lng, p.lat]));
        if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, { padding: 80 });
      }
    }
  }, [filters, points]);

  // Áp dụng lọc tự động khi thay đổi
  useEffect(() => {
    filterPoints();
  }, [filters, points, filterPoints]);

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
        mapRef.current!.flyTo({ center: MAP_CENTER, zoom: 13.5, speed: 0.8 });
      });
    }

    // Xóa marker cũ
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredPoints.forEach((p: any, i: number) => {
      if (!p.lat || !p.lng) return;
      const safeId = `detail-btn-${i}`;
      const thumbHtml = p.image
        ? `<img src="${p.image}" style="width:100%;height:120px;object-fit:cover;border-radius:10px;margin-bottom:8px"/>`
        : `<div style="width:100%;height:120px;border-radius:10px;background:#1f2937;display:flex;align-items:center;justify-content:center;color:#9ca3af;">Không có ảnh</div>`;

      const popupHTML = `
        <div style="width:260px;background:#0f172a;color:white;border-radius:12px;padding:10px;font-family:'Inter',sans-serif;">
          ${thumbHtml}
          <div style="font-size:15px;font-weight:700;color:#60a5fa;margin-bottom:4px;">${p.name}</div>
          <div style="font-size:13px;color:#cbd5e1;margin-bottom:4px;">${p.address}</div>
          <div style="font-size:13px;color:#94a3b8;margin-bottom:8px;">${p.desc || ''}</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="color:#facc15;font-weight:600;">💰 ${p.price} triệu/tháng</span>
            <span style="font-size:12px;color:#9ca3af;">${p.area} m²</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#9ca3af;">Lượt thuê trước: <b style="color:white">${p.pre ?? 0}</b></span>
            <button id="${safeId}" style="padding:5px 10px;border-radius:8px;background:#2563eb;border:none;color:white;font-size:13px;cursor:pointer;">Xem chi tiết</button>
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
    });
  };

  const handleSchedule = () => {
    alert(`📅 Đặt lịch xem: ${selectedPoint.name}`);
  };

  // 🔸 Dropdown động từ dữ liệu
  const uniqueAddresses = Array.from(new Set(points.map((p) => p.address))).filter(Boolean);
  const uniqueTypes = Array.from(new Set(points.map((p) => p.type))).filter(Boolean);

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-gray-900 to-black min-h-screen text-white relative">
      <h1 className="text-3xl font-bold text-blue-400 py-4">📍 Bản đồ mặt bằng cho thuê</h1>

      {/* 🔹 Thanh lọc cố định */}
      <div className="absolute top-20 z-50 bg-gray-900/80 backdrop-blur-lg p-4 rounded-2xl shadow-xl flex flex-wrap justify-center gap-3 w-[95%] max-w-5xl">
        <select
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
          value={filters.address}
          onChange={(e) => setFilters((f) => ({ ...f, address: e.target.value }))}
        >
          <option value="">Tất cả địa chỉ</option>
          {uniqueAddresses.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">Tất cả loại hình</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Diện tích</span>
          <input
            type="range"
            min="0"
            max="200"
            value={filters.maxArea}
            onChange={(e) => setFilters((f) => ({ ...f, maxArea: Number(e.target.value) }))}
          />
          <span className="text-xs">{filters.maxArea} m²</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Giá</span>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
          />
          <span className="text-xs">{filters.maxPrice} triệu</span>
        </div>

        <button
          onClick={() =>
            setFilters({ address: '', type: '', minArea: 0, maxArea: 9999, minPrice: 0, maxPrice: 9999 })
          }
          className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          Xóa lọc
        </button>
      </div>

      <div ref={mapContainer} className="w-full flex-1" style={{ minHeight: '85vh' }} />

      {/* Chi tiết popup */}
      {selectedPoint && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
          onClick={() => setSelectedPoint(null)}
        >
          <div
            className="bg-gray-900 text-white rounded-2xl max-w-4xl w-full overflow-hidden animate-fadeIn"
            style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                {selectedPoint.image ? (
                  <img
                    src={selectedPoint.image}
                    alt={selectedPoint.name}
                    className="w-full h-full object-cover min-h-[300px]"
                  />
                ) : (
                  <div className="flex items-center justify-center min-h-[300px] bg-gray-800 text-gray-400">
                    Không có ảnh
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-400">{selectedPoint.name}</h2>
                    <p className="text-sm text-gray-300 mt-1">📍 {selectedPoint.address}</p>
                    <p className="text-sm text-gray-400 italic mt-2">{selectedPoint.desc}</p>
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
                    <div className="font-semibold">{selectedPoint.area} m²</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Giá thuê</div>
                    <div className="font-semibold text-yellow-400">
                      {selectedPoint.price} triệu/tháng
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Lượt thuê trước</div>
                    <div className="font-semibold">{selectedPoint.pre ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Tọa độ</div>
                    <div className="font-semibold">
                      {selectedPoint.lat}, {selectedPoint.lng}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold">
                    Dự đoán giá AI
                  </button>
                  <button
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-semibold"
                    onClick={handleSchedule}
                  >
                    Đặt lịch xem
                  </button>
                  <button
                    className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-gray-200"
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
