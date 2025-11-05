export default function Footer() {
  return (
    <footer className="relative w-full py-12 px-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-400 opacity-20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-green-400 opacity-20 rounded-full filter blur-3xl animate-pulse"></div>

      <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 max-w-6xl mx-auto">
        {/* Logo + mô tả */}
        <div className="text-center md:text-left">
          <div className="text-3xl font-extrabold mb-2">LocaFinder</div>
          <p className="text-gray-200 max-w-sm">
            Giải pháp tìm kiếm mặt bằng cho thuê thông minh và hiệu quả.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col md:flex-row gap-6 text-center md:text-right">
          <a href="/map" className="hover:text-pink-300 transition-colors duration-300 font-medium">Map</a>
          <a href="/chat" className="hover:text-pink-300 transition-colors duration-300 font-medium">ChatGPT</a>
          <a href="/filter" className="hover:text-pink-300 transition-colors duration-300 font-medium">Filter</a>
          <a href="/contact" className="hover:text-pink-300 transition-colors duration-300 font-medium">Contact</a>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center text-gray-300 text-sm">
        © 2025 Geniant. All rights reserved.
      </div>
    </footer>
  );
}
