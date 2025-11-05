'use client';

import React from 'react';
import { Mail, MapPin, Phone, Linkedin, Twitter, Github, Map, MessageCircle, SlidersHorizontal, Users } from 'lucide-react';

export default function Footer() {
  // Dữ liệu Links cho cột Navigation
  const navigationLinks = [
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Chatbot', href: '/chat', icon: MessageCircle },
    { name: 'Filter', href: '/filter', icon: SlidersHorizontal },
    { name: 'Dashboard', href: '/dashboard', icon: Users }, // Thay Contact bằng Users cho Dashboard
  ];

  // Dữ liệu Links cho cột Liên hệ
  const contactInfo = [
    { name: 'Email Hỗ trợ', value: 'support@locafinder.com', icon: Mail },
    { name: 'Hotline', value: '+84 865 320 932', icon: Phone },
    { name: 'Địa chỉ văn phòng', value: '175 Tây Sơn, Hà Nội', icon: MapPin },
  ];

  // Component Links Item
  const LinkItem = ({ href, name }) => (
    <a
      href={href}
      className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm font-light"
    >
      {name}
    </a>
  );

  return (
    <footer className="w-full bg-gray-900 border-t border-blue-800 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12 border-b border-blue-800 pb-10">
          
          {/* Cột 1: Logo và Mô tả */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="text-3xl font-extrabold text-blue-400 tracking-wider">
              LOCAFINDER
            </div>
            <p className="text-gray-400 text-sm max-w-[280px]">
              Giải pháp Business Intelligence toàn diện, cung cấp dữ liệu mặt bằng, khu vực và chiến lược kinh doanh thông minh.
            </p>
            <div className="flex space-x-4 pt-2">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Linkedin size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Github size={20} /></a>
            </div>
          </div>

          {/* Cột 2: Điều hướng */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300 border-b border-blue-700/50 pb-1">Điều hướng</h3>
            <div className="flex flex-col space-y-3">
              {navigationLinks.map((item) => (
                <LinkItem key={item.name} href={item.href} name={item.name} />
              ))}
            </div>
          </div>

          {/* Cột 3: Giải pháp và Sản phẩm */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300 border-b border-blue-700/50 pb-1">Hỗ trợ</h3>
            <div className="flex flex-col space-y-3">
              <LinkItem href="/pricing" name="Bảng giá" />
              <LinkItem href="/help" name="Trung tâm trợ giúp" />
              <LinkItem href="/privacy" name="Chính sách bảo mật" />
              <LinkItem href="/terms" name="Điều khoản sử dụng" />
            </div>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-blue-300 border-b border-blue-700/50 pb-1">Liên hệ</h3>
            <div className="space-y-3">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-gray-400 text-sm">
                  <item.icon className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
                  <div className='flex flex-col'>
                    <span className="font-medium text-gray-300">{item.name}</span>
                    <p className='text-gray-400'>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          © 2025 Geniant. All rights reserved. Powered by PROJECT BI.
        </div>
      </div>
    </footer>
  );
}
