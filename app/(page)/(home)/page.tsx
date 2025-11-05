'use client';

import React from 'react';
import { Search, Brain, BarChart, MapPin, DollarSign, Lightbulb, Shuffle } from 'lucide-react';
// Đã thay thế import Image từ 'next/image' bằng thẻ <img> tiêu chuẩn
// import Image from 'next/image'; 

// Dữ liệu cho phần tính năng
const features = [
  {
    icon: Search,
    title: 'Tìm kiếm Nâng cao',
    description: 'Bộ lọc thông minh giúp bạn tìm mặt bằng phù hợp nhất với mọi tiêu chí.',
  },
  {
    icon: MapPin,
    title: 'Bản đồ Trực quan',
    description: 'Hiển thị vị trí mặt bằng trên bản đồ tương tác, dễ dàng định vị.',
  },
  {
    icon: BarChart,
    title: 'Phân tích Dữ liệu',
    description: 'Cung cấp báo cáo thị trường, xu hướng giá thuê và tiềm năng khu vực.',
  },
  {
    icon: Brain,
    title: 'Trợ lý AI Thông minh',
    description: 'Chatbot AI trả lời mọi câu hỏi về mặt bằng và chiến lược kinh doanh.',
  },
  {
    icon: Shuffle, // Dùng lại Shuffle từ Navbar cho Compare
    title: 'So sánh Tối ưu',
    description: 'So sánh các lựa chọn mặt bằng cạnh nhau để đưa ra quyết định tốt nhất.',
  },
  {
    icon: Lightbulb,
    title: 'Đề xuất Chiến lược',
    description: 'Nhận gợi ý và phân tích chuyên sâu cho kế hoạch kinh doanh của bạn.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        {/* Background Image/Video Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Thay thế Next.js Image component bằng thẻ <img> tiêu chuẩn */}
          <img
            src="https://placehold.co/1920x1080/0F172A/94A3B8?text=BI+Background+Image" // Sử dụng placeholder tạm thời
            alt="Background for business intelligence"
            // Các class CSS để mô phỏng thuộc tính fill và priority của Next Image
            className="w-full h-full object-cover opacity-40" 
          />
          {/* Một lớp phủ gradient để làm mờ ảnh và tạo hiệu ứng sâu */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/70 via-blue-900/60 to-gray-950/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-6 max-w-4xl mx-auto">
          <p className="text-lg md:text-xl text-blue-300 font-semibold mb-4 tracking-wider uppercase">LOCAFINDER</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Khám phá <span className="text-blue-300">Tiềm năng Kinh doanh</span> Vô hạn
          </h1>
          <p className="text-lg md:text-2xl mb-10 text-gray-200">
            Cung cấp dữ liệu thị trường, phân tích chuyên sâu và trợ lý AI để bạn đưa ra quyết định chiến lược hiệu quả nhất.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full 
                         shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              Khám phá Dashboard
            </a>
            <a
              href="/chat"
              className="bg-transparent border-2 border-blue-500 hover:bg-blue-500 text-blue-200 hover:text-white font-bold py-3 px-8 rounded-full 
                         shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              Hỏi AI Chatbot
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 border-t border-blue-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-6 text-blue-300">
            Nền Tảng Dữ Liệu & Trí Tuệ Doanh Nghiệp
          </h2>
          <p className="text-lg text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Chúng tôi cung cấp các công cụ mạnh mẽ và thông tin chi tiết để bạn luôn dẫn đầu trong mọi quyết định kinh doanh.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-800 p-8 rounded-xl shadow-lg border border-blue-800 
                             hover:shadow-blue-500/30 transition-shadow duration-300 group"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-blue-700 rounded-full mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-blue-200" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-base">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Optional: Call to Action Section (Ví dụ) */}
      <section className="bg-blue-800 py-16 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">Sẵn sàng để Phát triển Doanh nghiệp của bạn?</h2>
        <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
          Bắt đầu hành trình với PROJECT BI ngay hôm nay và biến dữ liệu thành lợi thế cạnh tranh của bạn.
        </p>
        <a
          href="/signup"
          className="bg-white text-blue-800 font-bold py-3 px-8 rounded-full shadow-lg 
                     hover:bg-gray-200 transform transition-transform hover:scale-105"
        >
          Đăng ký Ngay
        </a>
      </section>

    </div>
  );
}
