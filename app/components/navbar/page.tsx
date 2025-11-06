'use client';

import React, { useState } from 'react';
import { Map, MessageCircle, SlidersHorizontal, LayoutDashboard, Shuffle, Video, Menu, X, Home,MapPin } from 'lucide-react';

// Dữ liệu các liên kết
const navItems = [
  // Thêm trang Home vào đầu danh sách
  { name: 'Home', href: '/', icon: Home }, 
  { name: 'Map', href: '/map', icon: Map },
  { name: 'Chatbot', href: '/chat', icon: MessageCircle },
  { name: 'Filter', href: '/filter', icon: SlidersHorizontal },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Compare', href: '/compare', icon: Shuffle },
  { name: 'FindVD', href: '/findvd', icon: Video },
  { name: 'Direct', href: '/direct', icon: MapPin },
  // { name: 'Sign up', href: '/signup', icon: MapPin },
];

// Component Logo (Inline SVG)
const BiLogo = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hình dạng chính: một viên kim cương/hình phân tích */}
      <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="#3B82F6" className="text-blue-500" />
      {/* Hiệu ứng phân tích/dữ liệu */}
      <path d="M12 4.47273L4.47273 12L12 19.5273L19.5273 12L12 4.47273Z" fill="#DBEAFE" className="text-blue-100" />
    </svg>
);


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Component cho một mục điều hướng (liên kết)
  const NavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    return (
      <a
        href={item.href}
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg 
                   text-blue-100 hover:text-white hover:bg-blue-700 
                   transition-all duration-300 group"
      >
        <Icon className="w-5 h-5 text-blue-300 group-hover:text-white transition-colors" />
        {item.name}
      </a>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-blue-900/80 backdrop-blur-md shadow-xl border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand */}
          <a href="/" className="flex-shrink-0 flex items-center gap-2">
            <BiLogo />
            <span className="text-xl font-extrabold text-blue-300 tracking-wider hidden sm:block">
               <span className="text-white">LOCAFINDER</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md 
                         text-blue-300 hover:text-white hover:bg-blue-700 
                         focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-700/50">
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} onClick={() => setIsOpen(false)} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
