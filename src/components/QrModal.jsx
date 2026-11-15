import React, { useState, useEffect } from 'react';
import { QrCode, X, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { UpiService } from '../services/upiService';

export default function QrModal({ isOpen, onClose, customer, settings }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [upiUri, setUpiUri] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      try {
        const uri = UpiService.buildUpiUri({
          vpa: settings.upiVpa || 'sharmachai@upi',
          shopName: settings.shopName || 'Sharma Chai Point',
          amount: Number(customer.balance) > 0 ? Number(customer.balance) : undefined,
          note: `${customer.name} - ChaiKhata`,
        });
        setUpiUri(uri);

        UpiService.generateQrCodeDataUrl(uri, { width: 300 })
          .then(url => setQrDataUrl(url))
          .catch(err => console.error(err));
      } catch (err) {
        console.error(err);
      }
    }
  }, [isOpen, customer, settings]);

  if (!isOpen || !customer) return null;

  const handleCopyUri = () => {
    navigator.clipboard?.writeText(upiUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/70 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-orange-200 text-center flex flex-col items-center">
        <div className="w-full flex items-center justify-between pb-3 border-b border-chai-border mb-3">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase text-orange-600">UPI Payment QR</span>
            <h3 className="font-black text-base text-chai-dark">{customer.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount */}
        <div className="px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-black text-lg mb-3">
          बकाया राशि: ₹{customer.balance}
        </div>

        {/* QR Code */}
        <div className="p-3 bg-white rounded-2xl border-2 border-chai-border shadow-md mb-3">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="UPI QR" className="w-56 h-56 object-contain rounded-xl" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-stone-400 text-xs">
              QR बन रहा है...
            </div>
          )}
        </div>

        <p className="text-[11px] text-stone-500 font-mono mb-4">
          UPI ID: <strong>{settings.upiVpa || 'sharmachai@upi'}</strong>
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <button
            onClick={() => UpiService.openUpiIntent(upiUri)}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>UPI ऐप में खोलें (GPay, PhonePe, Paytm)</span>
          </button>

          <button
            onClick={handleCopyUri}
            className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center space-x-1 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'UPI लिंक कॉपी हो गया!' : 'UPI लिंक कॉपी करें'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
