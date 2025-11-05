'use client';

import { useEffect, useState } from 'react';

interface YTVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
  };
}

const YouTubeSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('cho thuê nhà'); // default search
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchYoutubeVideos = async (q: string) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = process.env.NEXT_PUBLIC_YT_API_KEY;
      if (!apiKey) throw new Error('YouTube API key not set');

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          q
        )}&type=video&maxResults=6&key=${apiKey}`
      );

      const data = await res.json();
      if (!data.items) throw new Error('Không tìm thấy video');
      setVideos(data.items);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải video');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) fetchYoutubeVideos(searchTerm);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchTerm(query.trim());
  };

  return (
    <div className="mt-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6 max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm video về chủ đề..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-md"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-105"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Videos */}
      <h3 className="text-xl font-bold text-blue-400 mb-4 text-center">🎥 Video liên quan</h3>

      {loading && <p className="text-gray-400 text-center">Đang tải video...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}
      {!loading && !error && videos.length === 0 && (
        <p className="text-gray-400 text-center">Không tìm thấy video nào.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {videos.map((v) => (
          <a
            key={v.id.videoId}
            href={`https://www.youtube.com/watch?v=${v.id.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border border-gray-700 rounded-xl overflow-hidden bg-gray-900 shadow-lg hover:shadow-2xl transition hover:-translate-y-1"
          >
            <div className="relative">
              <img
                src={v.snippet.thumbnails.medium.url}
                alt={v.snippet.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                ▶
              </div>
            </div>
            <div className="p-3">
              <p className="text-gray-200 font-semibold text-sm line-clamp-2">{v.snippet.title}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default YouTubeSearch;
