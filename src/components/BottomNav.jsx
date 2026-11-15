import React from 'react';
import { LayoutDashboard, BookOpen, Mic, QrCode, Boxes } from 'lucide-react';

export default function BottomNav({ activeTab, onSelectTab, onOpenVoice }) {
  const items = [
    { id: 'dashboard', label: 'डैशबोर्ड', icon: LayoutDashboard },
    { id: 'udhaar', label: 'उधार खाता', icon: BookOpen },
    // Center big Mic button handled separately
    { id: 'payments', label: 'पेमेंट QR', icon: QrCode },
    { id: 'inventory', label: 'स्टॉक', icon: Boxes },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-chai-border shadow-lg px-2 pb-safe">
      <div className="flex items-center justify-around h-16 relative">
        {/* Left items */}
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
                isActive ? 'text-primary font-bold' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}

        {/* Center Floating Mic Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={onOpenVoice}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 text-white flex items-center justify-center shadow-float border-4 border-white active:scale-95 transition-all"
            aria-label="AI Voice Assistant"
          >
            <Mic className="w-7 h-7 animate-pulse text-white" />
          </button>
          <span className="text-[10px] font-extrabold text-orange-600 mt-0.5">बोलें</span>
        </div>

        {/* Right items */}
        {items.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
                isActive ? 'text-primary font-bold' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
