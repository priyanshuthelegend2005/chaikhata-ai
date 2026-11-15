import React, { useState } from 'react';
import { Coffee, Cookie, Utensils, CheckCircle, UserCheck, ChevronDown, Plus } from 'lucide-react';

const QUICK_ITEMS = [
  { id: 'chai', label: '+1 Chai', price: 10, icon: Coffee, desc: 'Special Masala Chai' },
  { id: 'bun-maska', label: '+1 Bun Maska', price: 20, icon: Cookie, desc: 'Fresh Butter Bun' },
  { id: 'samosa', label: '+1 Samosa', price: 15, icon: Utensils, desc: 'Crispy Aloo Samosa' },
  { id: 'chai-samosa', label: 'Chai + Samosa', price: 25, icon: Coffee, desc: 'Combo ₹25' },
];

export default function QuickActionPad({ customers, onAddCredit, onReceivePayment, onOpenAddCustomer }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [showSelectModal, setShowSelectModal] = useState(false);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  const handleQuickCredit = (item) => {
    if (!selectedCustomer) {
      setShowSelectModal(true);
      return;
    }
    onAddCredit({
      customerId: selectedCustomer.id,
      amount: item.price,
      description: `Quick POS: ${item.label} (₹${item.price})`,
    });
  };

  const handleQuickPayment = (amount) => {
    if (!selectedCustomer) {
      setShowSelectModal(true);
      return;
    }
    onReceivePayment({
      customerId: selectedCustomer.id,
      amount,
      description: `Quick Payment Received (₹${amount})`,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-chai-border shadow-soft">
      {/* Header and Customer Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-chai-border">
        <div>
          <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
            <span>⚡ Quick POS Buttons</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              शोर में 1-टच बिलिंग
            </span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            बिना टाइपिंग के सीधे ग्राहक के खाते में जोड़ें
          </p>
        </div>

        {/* Selected Customer Pill */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSelectModal(true)}
            className="flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl bg-[#FFF9F2] hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-300 transition text-left"
          >
            <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
              {selectedCustomer ? selectedCustomer.name.charAt(0) : '?'}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700 leading-none">
                Selected Customer:
              </p>
              <p className="text-xs font-extrabold text-chai-dark leading-tight mt-0.5">
                {selectedCustomer ? `${selectedCustomer.name} (₹${selectedCustomer.balance} बकी)` : 'ग्राहक चुनें'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-orange-600 ml-1" />
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {QUICK_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleQuickCredit(item)}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-gradient-to-b from-[#FFF9F2] to-orange-50/60 border border-orange-200 hover:border-orange-400 hover:shadow-md transition active:scale-95 group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 group-hover:bg-orange-500 text-orange-700 group-hover:text-white flex items-center justify-center transition mb-1.5">
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-sm text-chai-dark group-hover:text-orange-900">
                {item.label}
              </span>
              <span className="text-xs font-bold text-orange-600">
                ₹{item.price}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Payment Received Bar */}
      <div className="mt-3 pt-3 border-t border-dashed border-chai-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 text-xs text-stone-600 font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Quick Payment Received:</span>
        </div>
        <div className="flex items-center space-x-2">
          {[20, 50, 100].map((amt) => (
            <button
              key={amt}
              onClick={() => handleQuickPayment(amt)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs active:scale-95 transition"
            >
              Paid ₹{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Selector Modal */}
      {showSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <span>ग्राहक चुनें (Select Customer)</span>
              </h4>
              <button
                onClick={() => setShowSelectModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomerId(c.id);
                    setShowSelectModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                    selectedCustomerId === c.id
                      ? 'border-orange-500 bg-orange-50 font-bold'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-chai-dark">{c.name}</p>
                    <p className="text-xs text-stone-500">{c.phone || 'No Phone'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-orange-600">
                      ₹{c.balance} Udhaar
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setShowSelectModal(false);
                  if (onOpenAddCustomer) onOpenAddCustomer();
                }}
                className="flex-1 py-2.5 rounded-xl border border-dashed border-orange-300 text-orange-700 hover:bg-orange-50 font-bold text-xs flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>नया ग्राहक जोड़ें (+ New)</span>
              </button>
              <button
                onClick={() => setShowSelectModal(false)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
