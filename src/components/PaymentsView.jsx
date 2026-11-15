import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  IndianRupee, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle, 
  Copy, 
  Download, 
  Share2, 
  Users,
  Search,
  AlertCircle
} from 'lucide-react';
import { UpiService } from '../services/upiService';
import { WhatsAppService } from '../services/whatsappService';
import confetti from 'canvas-confetti';

export default function PaymentsView({
  customers,
  transactions,
  settings,
  onReceivePayment,
  onNavigate
}) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customAmount, setCustomAmount] = useState('40');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [upiUri, setUpiUri] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [confirmPaymentModal, setConfirmPaymentModal] = useState(false);
  const [confirmAmount, setConfirmAmount] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  // Whenever selected customer or amount changes, regenerate QR code
  useEffect(() => {
    let effectiveAmount = parseFloat(customAmount) || 0;
    let customerNote = 'ChaiKhata Payment';

    if (selectedCustomer) {
      if (Number(selectedCustomer.balance) > 0 && (!customAmount || customAmount === '0')) {
        effectiveAmount = Number(selectedCustomer.balance);
      }
      customerNote = `${selectedCustomer.name} - ChaiKhata`;
    }

    try {
      const uri = UpiService.buildUpiUri({
        vpa: settings.upiVpa || 'sharmachai@upi',
        shopName: settings.shopName || 'Sharma Chai Point',
        amount: effectiveAmount > 0 ? effectiveAmount : undefined,
        note: customerNote,
      });

      setUpiUri(uri);

      UpiService.generateQrCodeDataUrl(uri, { width: 280 })
        .then(dataUrl => setQrDataUrl(dataUrl))
        .catch(err => console.error('QR generation failed:', err));
    } catch (e) {
      console.warn('UPI Build error:', e);
    }
  }, [selectedCustomerId, customAmount, settings]);

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText(settings.upiVpa || 'sharmachai@upi');
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleMarkPaymentReceived = () => {
    if (!selectedCustomer) {
      alert('Kripya pehle customer chunein jiska payment jama karna hai.');
      return;
    }
    setConfirmAmount(customAmount || selectedCustomer.balance.toString());
    setConfirmPaymentModal(true);
  };

  const executeConfirmPayment = (e) => {
    e.preventDefault();
    const amount = parseFloat(confirmAmount);
    if (isNaN(amount) || amount <= 0 || !selectedCustomer) return;

    onReceivePayment({
      customerId: selectedCustomer.id,
      amount,
      description: `Manual Confirmed Payment via QR (₹${amount})`,
    });

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    setConfirmPaymentModal(false);
  };

  const pendingCustomers = customers.filter(c => Number(c.balance) > 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-chai-dark tracking-tight flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-primary" />
            <span>UPI पेमेंट्स व QR कोड हब</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Google Pay, PhonePe, Paytm, BHIM द्वारा तुरंत भुगतान प्राप्त करें
          </p>
        </div>

        {/* Current Merchant VPA pill */}
        <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-2xl border border-chai-border shadow-soft">
          <span className="text-[11px] font-bold uppercase text-stone-400">Shop UPI:</span>
          <span className="text-xs font-black text-chai-dark font-mono">{settings.upiVpa || 'sharmachai@upi'}</span>
          <button
            onClick={handleCopyVpa}
            className="p-1 rounded-lg text-primary hover:bg-orange-50 transition"
            title="Copy UPI ID"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {copiedVpa && <span className="text-[10px] font-bold text-emerald-600">Copied!</span>}
        </div>
      </div>

      {/* Main QR Payment Generator Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive QR Code Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-chai-border shadow-soft flex flex-col items-center text-center">
          <div className="w-full pb-3 border-b border-chai-border flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                Official NPCI QR Code
              </span>
              <h3 className="font-extrabold text-sm text-chai-dark">
                {settings.shopName || 'Sharma Chai Point'}
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active UPI
            </span>
          </div>

          {/* Amount Badge */}
          <div className="mt-4 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-900 font-extrabold text-lg flex items-center space-x-1">
            <span>रकम: ₹{parseFloat(customAmount) || 0}</span>
          </div>

          {/* QR Code Container */}
          <div className="relative my-4 p-4 rounded-3xl bg-white border-2 border-chai-border shadow-md">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="ChaiKhata UPI QR Code"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-stone-400">
                Generating QR...
              </div>
            )}
            <div className="absolute inset-x-0 bottom-1 flex justify-center">
              <span className="bg-white/95 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider text-stone-600 shadow-xs border border-stone-200">
                GPay • PhonePe • Paytm
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-500 font-medium">
            ग्राहक अपने मोबाइल से स्कैन करके सीधे भुगतान कर सकते हैं
          </p>

          {/* Payment Intent & Manual Confirmation Buttons */}
          <div className="w-full space-y-2 mt-4 pt-3 border-t border-chai-border">
            <button
              onClick={() => UpiService.openUpiIntent(upiUri)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-sm hover:from-orange-600 hover:to-amber-600 transition flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>UPI ऐप में खोलें (Open in UPI App)</span>
            </button>

            <button
              onClick={handleMarkPaymentReceived}
              disabled={!selectedCustomer}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {selectedCustomer ? `${selectedCustomer.name} का पेमेंट प्राप्त हुआ दर्ज करें` : 'पेमेंट प्राप्त हुआ (पहले ग्राहक चुनें)'}
              </span>
            </button>
            <p className="text-[10px] text-stone-400 leading-tight">
              ⚠️ UPI ऐप में पैसे आने पर ही यहाँ मैनुअल पुष्टि (Confirm) करें
            </p>
          </div>
        </div>

        {/* Right Column: Controls, Customer Auto-Fill & Pending Balances */}
        <div className="lg:col-span-7 space-y-6">
          {/* Controls: Select Customer & Custom Amount */}
          <div className="bg-white rounded-3xl p-6 border border-chai-border shadow-soft">
            <h3 className="font-extrabold text-base text-chai-dark mb-4">
              QR कोड कस्टमाइज़ करें (Customize Amount & Customer)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  ग्राहक चुनें (Select Customer)
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedCustomerId(id);
                    const cust = customers.find(c => c.id === id);
                    if (cust && Number(cust.balance) > 0) {
                      setCustomAmount(cust.balance.toString());
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FFF9F2] text-sm focus:ring-2 focus:ring-primary focus:outline-none text-chai-dark font-medium"
                >
                  <option value="">-- सामान्य QR (बिना ग्राहक) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (₹{c.balance} बकाया)
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  रकम (Amount ₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="उदा. 40"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none text-chai-dark font-bold"
                />
              </div>
            </div>

            {/* Preset Amount Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Quick Amounts:</span>
              {[10, 20, 40, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCustomAmount(amt.toString())}
                  className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-orange-100 text-stone-800 hover:text-orange-900 text-xs font-bold transition"
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Pending Udhaar Collections List */}
          <div className="bg-white rounded-3xl p-6 border border-chai-border shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-chai-border mb-3">
              <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
                <span>बकाया उधारी वाले ग्राहक ({pendingCustomers.length})</span>
              </h3>
              <span className="text-xs text-red-600 font-bold">
                1-क्लिक WhatsApp तगादा भेजें
              </span>
            </div>

            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
              {pendingCustomers.length > 0 ? (
                pendingCustomers.map((cust) => (
                  <div key={cust.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-chai-dark">{cust.name}</p>
                      <p className="text-xs text-stone-500">{cust.phone || 'मोबाइल दर्ज नहीं'}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-sm font-black text-red-600">
                          ₹{cust.balance}
                        </span>
                        <p className="text-[10px] text-stone-400">बकाया</p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCustomerId(cust.id);
                          setCustomAmount(cust.balance.toString());
                        }}
                        className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold transition"
                        title="Is customer ka QR banayein"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => WhatsAppService.sendCustomerReminder({
                          customer: cust,
                          shopName: settings.shopName,
                          upiVpa: settings.upiVpa,
                        })}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-stone-400 text-xs">
                  कोई बकाया उधारी नहीं है! सब हिसाब क्लियर है। 🎉
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Manual Payment Confirmation Modal */}
      {confirmPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-emerald-300">
            <div className="flex items-center space-x-2 text-emerald-700 font-extrabold text-base mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>भुगतान प्राप्ति की पुष्टि (Confirm Payment)</span>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              क्या आपके बैंक/UPI ऐप में <strong>{selectedCustomer.name}</strong> से पेमेंट प्राप्त हो गया है?
            </p>

            <form onSubmit={executeConfirmPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  प्राप्त राशि (Received Amount ₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={confirmAmount}
                  onChange={(e) => setConfirmAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-lg font-black text-chai-dark focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmPaymentModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  हाँ, जमा करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
