import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  QrCode, 
  Boxes, 
  Truck, 
  Mic, 
  Settings,
  Sparkles,
  Award
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'डैशबोर्ड (Dashboard)', icon: LayoutDashboard },
  { id: 'voice', label: 'AI Voice Assistant', icon: Mic, badge: 'Voice' },
  { id: 'udhaar', label: 'उधार खाता (Udhaar)', icon: BookOpen },
  { id: 'payments', label: 'पेमेंट्स व QR (UPI)', icon: QrCode },
  { id: 'inventory', label: 'स्टॉक / इन्वेंटरी (Stock)', icon: Boxes },
  { id: 'supplier', label: 'सप्लायर आर्डर (Orders)', icon: Truck },
  { id: 'settings', label: 'सेटिंग्स (Settings)', icon: Settings },
];

export default function Sidebar({ activeTab, onSelectTab, metrics }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-chai-border shrink-0 min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* Navigation Links */}
        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Menu (सुविधाएं)
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition-all text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-stone-700 hover:bg-orange-50/70 hover:text-orange-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.id === 'udhaar' && metrics?.totalCustomers > 0 && !isActive && (
                  <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-bold">
                    {metrics.totalCustomers}
                  </span>
                )}
                {item.id === 'inventory' && metrics?.lowStockCount > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-red-200 text-red-900' : 'bg-red-100 text-red-700'
                  }`}>
                    {metrics.lowStockCount} Alert
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Voice Prompt Teaser Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-orange-100/60 border border-orange-200 text-chai-dark shadow-sm">
          <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Voice Hint</span>
          </div>
          <p className="text-xs text-stone-700 font-medium leading-relaxed italic">
            "Ramesh ke 40 rupaye udhaar likh lo"
          </p>
          <button
            onClick={() => onSelectTab('voice')}
            className="mt-3 w-full py-2 bg-white text-orange-600 font-bold text-xs rounded-xl shadow-xs border border-orange-200 hover:bg-orange-50 transition"
          >
            माइक्रोफ़ोन खोलें 🎙️
          </button>
        </div>
      </div>

      {/* Footer Hackathon Info */}
      <div className="pt-4 border-t border-chai-border text-center">
        <div className="inline-flex items-center space-x-1.5 text-xs text-stone-600 font-semibold bg-[#FFF9F2] px-3 py-1.5 rounded-full border border-orange-200/80">
          <Award className="w-4 h-4 text-orange-500" />
          <span>VibeX Codes 2026</span>
        </div>
        <p className="text-[11px] text-stone-600 mt-1.5 font-medium">
          Built for Chaiwalas & Daily Vendors
        </p>
      </div>
    </aside>
  );
}
