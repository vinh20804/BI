'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const MAP_CENTER: [number, number] = [105.8208, 21.0239];

interface Point {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  price?: number;
  area?: number;
  image?: string;
}

interface Step {
  maneuver: { instruction: string };
  distance: number;
}

export default function DirectPage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [routeLayerId, setRouteLayerId] = useState<string | null>(null);
  const [userMarker, setUserMarker] = useState<mapboxgl.Marker | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const watchIdRef = useRef<number | null>(null);

  // Load points
  useEffect(() => {
    fetch('https://glorytran.app.n8n.cloud/webhook/locafinder')
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.data || [];
        setPoints(arr);
      })
      .catch(() => setPoints([]));
  }, []);

  // Init map
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
    }

    points.forEach((p) => {
      if (!p.lat || !p.lng) return;

      const marker = new mapboxgl.Marker({ color: '#f43f5e' })
        .setLngLat([p.lng, p.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="color:white;font-family:sans-serif">
              <h3>${p.name}</h3>
              <p>${p.address || ''}</p>
              <p>💰 ${p.price ?? '-'} triệu/tháng | ${p.area ?? '-'} m²</p>
              <button id="select-${p.id}" style="
                margin-top:5px;padding:5px 10px;background:#2563eb;border:none;color:white;border-radius:6px;cursor:pointer;
              ">Chọn điểm này</button>
            </div>
          `)
        )
        .addTo(mapRef.current!);

      marker.getElement().addEventListener('click', () => {
        setTimeout(() => {
          const btn = document.getElementById(`select-${p.id}`);
          if (btn) btn.onclick = () => setSelectedPoint(p);
        }, 100);
      });
    });
  }, [points]);

  // Start tracking GPS
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị!');
      return;
    }

    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setCurrentLocation(coords);

        if (userMarker) {
          userMarker.setLngLat(coords);
        } else {
          const marker = new mapboxgl.Marker({ color: '#10b981' })
            .setLngLat(coords)
            .setPopup(new mapboxgl.Popup().setText('📍 Vị trí của bạn'))
            .addTo(mapRef.current!);
          setUserMarker(marker);
        }

        if (selectedPoint) {
          drawRoute(coords, [selectedPoint.lng, selectedPoint.lat]);
        }

        mapRef.current?.flyTo({ center: coords, zoom: 14, speed: 0.5, curve: 1 });
      },
      (err) => alert('Không thể lấy vị trí: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    watchIdRef.current = id;
  };

  // Draw route + get turn-by-turn
  const drawRoute = async (startCoords: [number, number], endCoords: [number, number]) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords.join(
          ','
        )};${endCoords.join(',')}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();

      if (!data.routes || data.routes.length === 0) return;

      const route = data.routes[0].geometry;
      const routeSteps: Step[] = data.routes[0].legs[0].steps;
      setSteps(routeSteps);

      // Remove old route
      if (routeLayerId && mapRef.current?.getLayer(routeLayerId)) {
        mapRef.current.removeLayer(routeLayerId);
        mapRef.current.removeSource(routeLayerId);
      }

      const newLayerId = `route-${Date.now()}`;
      setRouteLayerId(newLayerId);

      mapRef.current?.addSource(newLayerId, {
        type: 'geojson',
        data: { type: 'Feature', geometry: route },
      });

      mapRef.current?.addLayer({
        id: newLayerId,
        type: 'line',
        source: newLayerId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#facc15', 'line-width': 5 },
      });

      const coords = route.coordinates;
      const bounds = coords.reduce(
        (b: mapboxgl.LngLatBounds, c: any) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      mapRef.current?.fitBounds(bounds, { padding: 50 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRouteFromHere = () => {
    if (!currentLocation) {
      startTracking();
      return;
    }
    if (!selectedPoint) return;

    drawRoute(currentLocation, [selectedPoint.lng, selectedPoint.lat]);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-blue-400 py-4">🗺️ Chỉ đường tới mặt bằng</h1>

      <div className="flex gap-3 mb-4">
        <button
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
          onClick={startTracking}
        >
          📍 Vị trí hiện tại
        </button>
        <button
          className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-semibold"
          onClick={handleRouteFromHere}
          disabled={!selectedPoint}
        >
          🚗 Chỉ đường tới điểm
        </button>
      </div>

      <div ref={mapContainer} className="w-full flex-1" style={{ minHeight: '70vh' }} />

      {selectedPoint && (
        <div className="fixed bottom-4 bg-gray-800 p-4 rounded-xl shadow-lg text-white z-50 w-[90%] md:w-1/3 mx-auto text-center">
          Chọn điểm: <b>{selectedPoint.name}</b>
        </div>
      )}

      {steps.length > 0 && (
        <div className="fixed right-4 top-20 bg-gray-800 p-4 rounded-xl shadow-lg text-white z-50 w-72 max-h-[60vh] overflow-y-auto">
          <h3 className="font-semibold text-blue-400 mb-2">🛣️ Hướng dẫn đi</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            {steps.map((s, idx) => (
              <li key={idx}>
                {s.maneuver.instruction} - <b>{(s.distance / 1000).toFixed(2)} km</b>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
