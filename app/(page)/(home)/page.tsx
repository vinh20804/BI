export default function Home() {
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-700 via-pink-500 to-blue-400 text-white flex items-center justify-center overflow-hidden">
      {/* Overlay gradient + blur nhẹ */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-700 via-pink-500 to-blue-400 opacity-80 backdrop-blur-sm"></div>

      {/* Nội dung chính */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          Tìm kiếm <span className="text-pink-300">mặt bằng cho thuê</span> thông minh
        </h1>
        <p className="text-lg md:text-2xl mb-8 text-gray-100">
          Giải pháp nhanh chóng và hiệu quả với <span className="font-semibold text-white">LocaFinder</span>
        </p>
      </div>

      {/* Decorative shapes */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-pink-300 opacity-20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute -top-32 -right-32 w-72 h-72 bg-blue-200 opacity-20 rounded-full filter blur-2xl animate-pulse"></div>
    </div>
  );
}
