import React, { useState, useEffect } from 'react';
import { Coffee, Volume2, VolumeX, Radio, Sparkles, Settings } from 'lucide-react';

export default function Navbar({ settings, onUpdateSettings, onOpenVoice, onOpenSettings }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('hi-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const toggleMute = () => {
    onUpdateSettings({ voiceEnabled: !settings.voiceEnabled });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-chai-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Shop Title */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Coffee className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-lg text-chai-dark tracking-tight leading-none">
                  ChaiKhata <span className="text-primary">AI</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  VibeX 2026
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium truncate max-w-[160px] sm:max-w-xs">
                {settings.shopName || 'Sharma Chai Point'}
              </p>
            </div>
          </div>

          {/* Center Info (Desktop/Tablet) */}
          <div className="hidden md:flex items-center space-x-4 text-xs">
            <div className="px-3 py-1.5 rounded-full bg-[#FFF9F2] border border-chai-border flex items-center space-x-2 text-stone-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{formatDate(currentTime)} • {formatTime(currentTime)}</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Online / Saved Locally</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2">
            {/* Direct Voice Assistant trigger */}
            <button
              onClick={onOpenVoice}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm hover:shadow transition transform active:scale-95"
              title="Voice Assistant kholen"
            >
              <Radio className="w-4 h-4 animate-pulse text-white" />
              <span className="hidden sm:inline">बोलें (Voice)</span>
            </button>

            {/* Mute/Unmute audio button */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border transition ${
                settings.voiceEnabled 
                  ? 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100' 
                  : 'border-stone-200 bg-stone-100 text-stone-400 hover:bg-stone-200'
              }`}
              title={settings.voiceEnabled ? "Voice bolna on hai (Mute karein)" : "Voice bolna mute hai (Unmute karein)"}
            >
              {settings.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl border border-chai-border bg-white text-stone-600 hover:bg-stone-50 hover:text-chai-dark transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
