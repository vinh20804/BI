'use client';

import React, { useState, useRef, useEffect } from 'react';

const CHATBOT_API = 'https://glorytran.app.n8n.cloud/webhook/aichat';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: 'bot',
      content:
        '👋 Xin chào! Tôi là trợ lý AI — bạn cần hỏi gì về mặt bằng, kinh doanh hay khu vực cho thuê?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setLoading(true);

    try {
      const res = await fetch(CHATBOT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      console.log('API response:', data);
      // Xử lý cả mảng hoặc object
      const botContent = Array.isArray(data)
        ? data.map((item: any) => item.output).join('\n')
        : data?.output;

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: botContent || '🤖 Xin lỗi, tôi chưa thể trả lời lúc này.',
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: '⚠️ Có lỗi xảy ra, vui lòng thử lại.' },
      ]);
    }

    setInput('');
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="bg-blue-800/90 backdrop-blur-md text-center py-4 shadow-md">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-blue-100 drop-shadow">
          🤖 AI Chatbot Trợ Lý Kinh Doanh
        </h1>
        <p className="text-sm text-blue-200 mt-1">
          Hỏi tôi về mặt bằng, khu vực, giá thuê hoặc chiến lược kinh doanh nhé!
        </p>
      </header>

      {/* Chat box */}
      <main className="flex-1 flex justify-center items-center px-4 py-6">
        <div className="w-full max-w-2xl h-[75vh] bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-blue-700 rounded-2xl shadow-2xl flex flex-col backdrop-blur-lg p-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[75%] text-base leading-relaxed break-words shadow-md ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-blue-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-blue-100 text-gray-700 animate-pulse">
                  Đang trả lời...
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 mt-3 border-t border-blue-800 pt-3"
          >
            <input
              className="flex-1 rounded-xl px-4 py-3 bg-gray-900/70 border border-blue-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="💬 Nhập câu hỏi hoặc yêu cầu của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold shadow-lg transition transform hover:scale-105"
            >
              Gửi
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
