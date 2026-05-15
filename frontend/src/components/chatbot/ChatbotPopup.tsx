import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../services/chatbot.service';
import { chatbotService } from '../../services/chatbot.service';
import './ChatbotPopup.css';

const WELCOME_MESSAGE: ChatMessage & { id: number } = {
  id: 0,
  role: 'model',
  text: 'Xin chào! Mình là **Hana** 🩸, trợ lý AI của Red Bridge AI.\n\nMình có thể giúp bạn:\n• Kiểm tra điều kiện hiến máu\n• Giải đáp thắc mắc về hiến máu\n\nBạn cần hỗ trợ gì hôm nay?',
};

interface DisplayMessage {
  id: number;
  role: 'user' | 'model';
  text: string;
}

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

export function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: DisplayMessage = {
      id: Date.now(),
      role: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatbotService.sendMessage({
        message: trimmed,
        history,
      });

      const botMsg: DisplayMessage = {
        id: Date.now() + 1,
        role: 'model',
        text: res.response,
      };

      setMessages((prev) => [...prev, botMsg]);
      setHistory((prev) => [
        ...prev,
        { role: 'user', text: trimmed },
        { role: 'model', text: res.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'model',
          text: 'Xin lỗi, mình gặp sự cố kết nối. Bạn vui lòng thử lại sau nhé! 🙏',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggle = () => setIsOpen((v) => !v);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="chatbot-popup bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ width: '370px', height: '520px', border: '1px solid #fecaca' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white">
            <div className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-lg font-bold shrink-0">
              🩸
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">Hana</p>
              <p className="text-xs text-red-100 leading-tight">Trợ lý hiến máu AI</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-xs text-red-100">Online</span>
            </div>
            <button
              onClick={handleToggle}
              className="ml-2 w-7 h-7 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors"
              aria-label="Đóng chatbot"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-message flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">
                    🩸
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                  }`}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                />
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="chatbot-message flex gap-2 justify-start">
                <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-sm shrink-0">
                  🩸
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
                  <div className="dot-typing flex gap-1">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn... (Enter để gửi)"
              disabled={isLoading}
              className="chatbot-input flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 disabled:opacity-50 transition-colors"
              style={{ maxHeight: '96px', overflowY: 'auto' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
              aria-label="Gửi tin nhắn"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleToggle}
        className="chatbot-fab w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Mở chatbot Hana"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default ChatbotPopup;
