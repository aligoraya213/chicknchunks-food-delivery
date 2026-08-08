import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Send, X, User, Bike, Shield, Check } from 'lucide-react';

const roleIcons = { customer: User, admin: Shield, rider: Bike };

// WhatsApp Ticks Component
const MessageTicks = ({ status }) => {
  if (status === 'read') {
    return (
      <div className="flex items-center -space-x-1.5 text-sky-400 font-bold" title="Read">
        <Check className="h-3 w-3 stroke-[2.5]" />
        <Check className="h-3 w-3 stroke-[2.5]" />
      </div>
    );
  }

  if (status === 'delivered') {
    return (
      <div className="flex items-center -space-x-1.5 text-white/70" title="Delivered">
        <Check className="h-3 w-3 stroke-[2]" />
        <Check className="h-3 w-3 stroke-[2]" />
      </div>
    );
  }

  // Single Grey / Light tick for sent
  return (
    <div className="flex items-center text-white/60" title="Sent">
      <Check className="h-3 w-3 stroke-[2]" />
    </div>
  );
};

export const ChatWindow = ({ orderId, initialChannel, onClose }) => {
  const {
    chatConversations,
    sendMessage,
    fetchMessages,
    markChannelMessagesAsRead,
    user,
    riderProfile,
    isAdminLoggedIn,
    isRiderLoggedIn
  } = useApp();

  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const getSenderRole = () => {
    if (isAdminLoggedIn) return 'admin';
    if (isRiderLoggedIn || riderProfile) return 'rider';
    return 'customer';
  };

  const getSenderName = () => {
    if (isAdminLoggedIn) return user?.name || 'Admin';
    if (isRiderLoggedIn || riderProfile) return riderProfile?.name || 'Rider';
    return user?.name || 'Customer';
  };

  const myRole = getSenderRole();
  const targetChannel = initialChannel || (myRole === 'admin' ? 'customer_admin' : 'customer_rider');

  const conversation = chatConversations.find((c) => c.orderId === orderId);
  const allMessages = conversation?.messages || [];
  const activeMessages = allMessages.filter(m => (m.channel || 'customer_rider') === targetChannel);

  useEffect(() => {
    fetchMessages(orderId, targetChannel);
    markChannelMessagesAsRead(orderId, targetChannel);

    const interval = setInterval(() => {
      fetchMessages(orderId, targetChannel);
    }, 1000);

    return () => clearInterval(interval);
  }, [orderId, targetChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(orderId, text, myRole, getSenderName(), targetChannel);
    setText('');
  };

  if (!isOpen) return null;

  const getHeaderInfo = () => {
    if (targetChannel === 'admin_rider') {
      return { title: '🛡️ Rider ↔ Admin Support', icon: Shield };
    }
    if (targetChannel === 'customer_admin') {
      return { title: '🛡️ Customer ↔ Store Admin', icon: Shield };
    }
    return { title: '🛵 Customer ↔ Rider Chat', icon: Bike };
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="fixed bottom-24 right-4 z-50 w-80 sm:w-96 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* WhatsApp-Style Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#E31E24] to-[#FF6B35] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20">
              <HeaderIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-black tracking-wide leading-none">{headerInfo.title}</p>
              <p className="text-[10px] font-mono opacity-80 mt-0.5">Order #{orderId?.slice(-6)}</p>
            </div>
          </div>
          <button onClick={() => { setIsOpen(false); onClose?.(); }} className="rounded-xl p-1 hover:bg-white/20 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="h-80 space-y-3 overflow-y-auto p-4 bg-slate-100/70">
          {activeMessages.length === 0 && (
            <div className="pt-20 text-center text-xs text-gray-400 font-medium">
              <MessageSquare className="h-9 w-9 mx-auto mb-2 text-gray-300 stroke-1" />
              <p className="font-bold text-gray-500">No messages yet</p>
              <p className="text-[10px] text-gray-400 mt-1">Start a conversation for this order!</p>
            </div>
          )}

          {activeMessages.map((msg) => {
            const Icon = roleIcons[msg.sender] || User;
            const isMine = msg.sender === myRole;

            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2 shadow-sm transition-all ${
                    isMine
                      ? 'bg-gradient-to-br from-[#E31E24] to-[#C1121F] text-white rounded-2xl rounded-tr-none'
                      : 'bg-white text-gray-900 border border-gray-200/80 rounded-2xl rounded-tl-none'
                  }`}
                >
                  {!isMine && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#E31E24] mb-0.5">
                      <Icon className="h-3 w-3" />
                      <span>{msg.senderName}</span>
                    </div>
                  )}

                  <p className="text-xs leading-relaxed font-normal whitespace-pre-wrap">{msg.text}</p>

                  <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMine ? 'text-white/80' : 'text-gray-400'} font-mono`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMine && <MessageTicks status={msg.status} />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-100 p-3 bg-white">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-medium focus:border-[#E31E24] focus:bg-white focus:ring-2 focus:ring-red-100 transition"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E31E24] text-white transition hover:bg-red-700 disabled:opacity-40 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
