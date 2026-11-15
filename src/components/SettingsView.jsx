import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Volume2, 
  VolumeX, 
  QrCode, 
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Store
} from 'lucide-react';
import { StorageService } from '../services/storage';

export default function SettingsView({
  settings,
  onUpdateSettings,
  onResetData,
  onNotify
}) {
  const [formData, setFormData] = useState({
    shopName: settings.shopName || 'Sharma Chai Point',
    ownerName: settings.ownerName || 'Manoj Sharma',
    ownerPhone: settings.ownerPhone || '9876543210',
    upiVpa: settings.upiVpa || 'sharmachai@upi',
    voiceEnabled: settings.voiceEnabled !== false,
    voiceLanguage: settings.voiceLanguage || 'hi-IN',
    autoSpeak: settings.autoSpeak !== false,
  });

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExport = () => {
    const data = StorageService.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaikhata-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        StorageService.importAllData(json);
        window.location.reload();
      } catch (err) {
        alert('Invalid JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-chai-dark tracking-tight flex items-center space-x-2">
          <Settings className="w-6 h-6 text-primary" />
          <span>दुकान सेटिंग्स (Shop Settings)</span>
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          दुकान का नाम, UPI VPA पता, वॉइस असिस्टेंट और डेटा बैकअप सेटिंग्स
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>सेटिंग्स सफलतापूर्वक सुरक्षित हो गई हैं!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Shop & Owner Profile */}
        <div className="bg-white rounded-3xl p-6 border border-chai-border shadow-soft space-y-4">
          <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
            <Store className="w-4 h-4 text-primary" />
            <span>दुकान व मालिक का विवरण (Shop Profile)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                दुकान / टी स्टॉल का नाम (Shop Name) *
              </label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                मालिक का नाम (Owner Name)
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                मोबाइल नंबर (Owner Phone)
              </label>
              <input
                type="tel"
                value={formData.ownerPhone}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: UPI Payment Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-chai-border shadow-soft space-y-4">
          <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
            <QrCode className="w-4 h-4 text-primary" />
            <span>UPI भुगतान सेटिंग (UPI Configuration)</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              मर्चेंट UPI आईडी (Merchant UPI VPA) *
            </label>
            <input
              type="text"
              required
              value={formData.upiVpa}
              onChange={(e) => setFormData({ ...formData, upiVpa: e.target.value })}
              placeholder="उदा. sharmachai@upi, 9876543210@paytm"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none text-chai-dark"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              इसी UPI आईडी पर सभी QR कोड व Deep Link भुगतान प्राप्त होंगे।
            </p>
          </div>
        </div>

        {/* Card 3: AI Voice Assistant Settings */}
        <div className="bg-white rounded-3xl p-6 border border-chai-border shadow-soft space-y-4">
          <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI वॉइस व भाषा सेटिंग्स (Speech & Language)</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.voiceEnabled}
                onChange={(e) => setFormData({ ...formData, voiceEnabled: e.target.checked })}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="text-xs font-bold text-stone-700">
                हिंदी वॉइस फीडबैक ऑन रखें (SpeechSynthesis Voice Response)
              </span>
            </label>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                वॉइस भाषा (Voice Recognition Language)
              </label>
              <select
                value={formData.voiceLanguage}
                onChange={(e) => setFormData({ ...formData, voiceLanguage: e.target.value })}
                className="w-full max-w-xs px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none bg-white"
              >
                <option value="hi-IN">हिंदी (Hindi - hi-IN)</option>
                <option value="en-IN">Indian English / Hinglish (en-IN)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary hover:bg-orange-600 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center space-x-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>सेटिंग्स सुरक्षित करें (Save Settings)</span>
          </button>
        </div>
      </form>

      {/* Card 4: Backup, Export & Reset Sample Data */}
      <div className="bg-white rounded-3xl p-6 border border-chai-border shadow-soft space-y-4">
        <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-primary" />
          <span>डेटा बैकअप व रीसेट (Data Management)</span>
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>JSON बैकअप डाउनलोड करें</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>बैकअप रिस्टोर करें</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center space-x-1.5 transition ml-auto"
          >
            <RotateCcw className="w-4 h-4 text-red-600" />
            <span>डेमो डेटा रीसेट करें (Reset Sample Data)</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-red-300">
            <h3 className="font-extrabold text-base text-red-600 mb-2">
              डेमो डेटा रीसेट करें?
            </h3>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              यह क्रिया सभी मौजूदा ग्राहकों, इन्वेंटरी और लेनदेनों को प्रारंभिक हैकथॉन सैंपल डेटा (Ramesh, Suresh, 10 packets milk etc.) पर रीसेट कर देगी।
            </p>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setResetConfirmOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                हाँ, रीसेट करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
