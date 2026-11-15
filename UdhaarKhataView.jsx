import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Phone, 
  IndianRupee, 
  QrCode, 
  MessageSquare, 
  Plus, 
  Minus, 
  History, 
  Edit2, 
  Trash2, 
  Clock, 
  CheckCircle2,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UdhaarKhataView({
  customers,
  transactions,
  settings,
  onSaveCustomer,
  onDeleteCustomer,
  onAddCredit,
  onReceivePayment,
  onGenerateQr,
  onSendWhatsApp,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'pending' | 'settled'
  
  // Modals state
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', balance: '', notes: '' });

  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [activeTransactionType, setActiveTransactionType] = useState('credit'); // 'credit' | 'payment'
  const [targetCustomer, setTargetCustomer] = useState(null);
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState(null);

  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState(null);

  // Filtered customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.nameHi && c.nameHi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && c.phone.includes(searchQuery));
    
    if (!matchesSearch) return false;

    if (filterType === 'pending') return Number(c.balance) > 0;
    if (filterType === 'settled') return Number(c.balance) === 0;
    return true;
  });

  const totalOutstanding = customers.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);

  // Open Add/Edit Customer Modal
  const openCustomerModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerForm({
        name: customer.name,
        phone: customer.phone || '',
        balance: customer.balance.toString(),
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({ name: '', phone: '', balance: '0', notes: '' });
    }
    setCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!customerForm.name.trim()) return;

    onSaveCustomer({
      id: editingCustomer ? editingCustomer.id : undefined,
      name: customerForm.name.trim(),
      phone: customerForm.phone.trim(),
      balance: Math.max(0, parseFloat(customerForm.balance) || 0),
      notes: customerForm.notes.trim(),
    });

    setCustomerModalOpen(false);
  };

  // Open Quick Transaction Modal (Add Udhaar / Receive Payment)
  const openTxModal = (customer, type) => {
    setTargetCustomer(customer);
    setActiveTransactionType(type);
    setTxAmount('');
    setTxNote('');
    setTransactionModalOpen(true);
  };

  const handleExecuteTx = (e) => {
    e.preventDefault();
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0 || !targetCustomer) return;

    if (activeTransactionType === 'credit') {
      onAddCredit({
        customerId: targetCustomer.id,
        amount,
        description: txNote.trim() || 'Udhaar Added',
      });
    } else {
      onReceivePayment({
        customerId: targetCustomer.id,
        amount,
        description: txNote.trim() || 'Payment Received',
      });
      // Fire celebration confetti!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // ignore
      }
    }

    setTransactionModalOpen(false);
  };

  // Open History Modal
  const openHistory = (customer) => {
    setHistoryCustomer(customer);
    setHistoryModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-chai-dark tracking-tight flex items-center space-x-2">
            <span>उधार खाता (Customer Ledger)</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
              {customers.length} ग्राहक
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            सभी ग्राहकों का डिजिटल खाता, बकाया उधारी और लेनदेन इतिहास
          </p>
        </div>

        <button
          onClick={() => openCustomerModal()}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-md hover:bg-orange-600 transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ नया ग्राहक जोड़ें (Add Customer)</span>
        </button>
      </div>

      {/* Summary Banner & Search / Filter Controls */}
      <div className="bg-white rounded-3xl p-5 border border-chai-border shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ग्राहक का नाम या मोबाइल नंबर खोजें..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-[#FFF9F2] text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-chai-dark"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'all'
                  ? 'bg-chai-dark text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              सभी ({customers.length})
            </button>
            <button
              onClick={() => setFilterType('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'pending'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              उधार बाकी ({customers.filter(c => Number(c.balance) > 0).length})
            </button>
            <button
              onClick={() => setFilterType('settled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'settled'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              हिसाब क्लियर ({customers.filter(c => Number(c.balance) === 0).length})
            </button>
          </div>
        </div>

        {/* Ledger Quick Summary Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-chai-border text-xs">
          <span className="text-stone-500 font-medium">
            दिख रहे ग्राहक: <strong className="text-chai-dark">{filteredCustomers.length}</strong>
          </span>
          <span className="text-stone-500 font-medium">
            कुल बकाया उधारी: <strong className="text-red-600 font-bold">₹{totalOutstanding.toLocaleString('en-IN')}</strong>
          </span>
        </div>
      </div>

      {/* Customer Ledger Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => {
            const hasUdhaar = Number(customer.balance) > 0;
            return (
              <div
                key={customer.id}
                className="bg-white rounded-3xl p-5 border border-chai-border shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Line: Avatar, Name, Phone & Edit */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-base ${
                        hasUdhaar
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-chai-dark leading-tight">
                          {customer.name}
                        </h3>
                        <p className="text-xs text-stone-500 flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{customer.phone || 'मोबाइल दर्ज नहीं'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openCustomerModal(customer)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmCustomer(customer)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Outstanding Balance Box */}
                  <div className={`mt-4 p-3 rounded-2xl flex items-center justify-between ${
                    hasUdhaar ? 'bg-red-50/80 border border-red-200' : 'bg-emerald-50/80 border border-emerald-200'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Outstanding Udhaar
                      </span>
                      <p className={`text-xl font-black ${hasUdhaar ? 'text-red-600' : 'text-emerald-700'}`}>
                        ₹{customer.balance}
                      </p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      hasUdhaar ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {hasUdhaar ? 'बाकी है' : 'हिसाब चुकता'}
                    </span>
                  </div>

                  {/* Notes / Last updated */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="truncate max-w-[170px]">
                      {customer.notes || 'कोई टिप्पणी नहीं'}
                    </span>
                    <span className="shrink-0 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(customer.updatedAt || customer.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons (Add Udhaar, Receive Payment, QR, WhatsApp, History) */}
                <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                  {/* Row 1: Quick Add & Pay Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openTxModal(customer, 'credit')}
                      className="py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-bold text-xs flex items-center justify-center space-x-1 active:scale-95 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-orange-600" />
                      <span>उधार जोड़ें (+)</span>
                    </button>
                    <button
                      onClick={() => openTxModal(customer, 'payment')}
                      className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-1 active:scale-95 transition"
                    >
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                      <span>जमा करें (Pay)</span>
                    </button>
                  </div>

                  {/* Row 2: UPI QR, WhatsApp Reminder, History */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onGenerateQr(customer)}
                      disabled={!hasUdhaar}
                      className="py-1.5 px-2 rounded-xl bg-stone-50 hover:bg-orange-50 border border-stone-200 text-stone-700 hover:text-orange-900 font-bold text-[11px] flex items-center justify-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      title="Generate UPI QR"
                    >
                      <QrCode className="w-3.5 h-3.5 text-primary" />
                      <span>UPI QR</span>
                    </button>

                    <button
                      onClick={() => onSendWhatsApp(customer)}
                      disabled={!hasUdhaar}
                      className="py-1.5 px-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center justify-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => openHistory(customer)}
                      className="py-1.5 px-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 font-bold text-[11px] flex items-center justify-center space-x-1 transition"
                      title="View Transaction History"
                    >
                      <History className="w-3.5 h-3.5 text-stone-500" />
                      <span>इतिहास</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300">
            <p className="text-base font-bold text-stone-600">
              कोई ग्राहक नहीं मिला
            </p>
            <p className="text-xs text-stone-400 mt-1">
              नया ग्राहक जोड़ने के लिए ऊपर दिए गए बटन पर क्लिक करें
            </p>
            <button
              onClick={() => openCustomerModal()}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
            >
              + नया ग्राहक जोड़ें
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL 1: ADD / EDIT CUSTOMER --- */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-orange-200">
            <div className="flex items-center justify-between pb-3 border-b border-chai-border mb-4">
              <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <span>{editingCustomer ? 'ग्राहक विवरण बदलें' : 'नया ग्राहक जोड़ें'}</span>
              </h3>
              <button
                onClick={() => setCustomerModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  ग्राहक का नाम (Customer Name) *
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="उदा. Ramesh, Suresh..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  मोबाइल नंबर (WhatsApp / Phone)
                </label>
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {!editingCustomer && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    आरंभिक बकाया उधारी (Starting Udhaar ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={customerForm.balance}
                    onChange={(e) => setCustomerForm({ ...customerForm, balance: e.target.value })}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  टिप्पणी / पहचान (Notes)
                </label>
                <input
                  type="text"
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  placeholder="उदा. बैंक कर्मचारी, ऑटो वाले भैया..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs shadow-md"
                >
                  सुरक्षित करें (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD UDHAAR OR RECEIVE PAYMENT --- */}
      {transactionModalOpen && targetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-orange-200">
            <div className="flex items-center justify-between pb-3 border-b border-chai-border mb-4">
              <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
                {activeTransactionType === 'credit' ? (
                  <>
                    <Plus className="w-5 h-5 text-red-600" />
                    <span>उधार जोड़ें ({targetCustomer.name})</span>
                  </>
                ) : (
                  <>
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                    <span>पेमेंट जमा करें ({targetCustomer.name})</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setTransactionModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#FFF9F2] p-3 rounded-2xl mb-4 text-xs flex justify-between items-center">
              <span className="text-stone-600 font-medium">वर्तमान बकाया उधारी:</span>
              <span className="font-black text-sm text-red-600">₹{targetCustomer.balance}</span>
            </div>

            <form onSubmit={handleExecuteTx} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  रकम (Amount ₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  autoFocus
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="उदा. 40, 50, 100..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-xl font-black text-chai-dark focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Quick preset amount chips */}
              <div className="flex items-center space-x-2">
                {[10, 20, 40, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTxAmount(amt.toString())}
                    className="flex-1 py-1.5 rounded-lg bg-stone-100 hover:bg-orange-100 text-xs font-bold text-stone-700 transition"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  विवरण / कारण (Description)
                </label>
                <input
                  type="text"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  placeholder={activeTransactionType === 'credit' ? 'उदा. 4 Chai + Samosa' : 'उदा. Cash / UPI Received'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransactionModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs shadow-md ${
                    activeTransactionType === 'credit'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {activeTransactionType === 'credit' ? 'खाते में जोड़ें (+)' : 'जमा रिकॉर्ड करें (✓)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: TRANSACTION HISTORY --- */}
      {historyModalOpen && historyCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-orange-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-chai-border mb-3">
              <div>
                <h3 className="font-extrabold text-base text-chai-dark">
                  {historyCustomer.name} का लेनदेन इतिहास
                </h3>
                <p className="text-xs text-stone-500">
                  वर्तमान बकाया: <strong className="text-red-600 font-black">₹{historyCustomer.balance}</strong>
                </p>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* List of customer transactions */}
            <div className="overflow-y-auto flex-1 divide-y divide-stone-100 pr-1">
              {transactions.filter(t => t.customerId === historyCustomer.id).length > 0 ? (
                transactions
                  .filter(t => t.customerId === historyCustomer.id)
                  .map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'credit'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {tx.type === 'credit' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-chai-dark">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-black ${
                          tx.type === 'credit' ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {tx.type === 'credit' ? `+ ₹${tx.amount}` : `- ₹${tx.amount}`}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-12 text-center text-stone-400 text-xs">
                  इस ग्राहक का कोई पिछला लेनदेन दर्ज नहीं है
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-chai-border mt-3 text-right">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: DELETE CONFIRMATION --- */}
      {deleteConfirmCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-red-200">
            <h3 className="font-extrabold text-base text-red-600 mb-2">
              ग्राहक हटाएं (Delete Customer)?
            </h3>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              क्या आप वाकई <strong>{deleteConfirmCustomer.name}</strong> को हटाना चाहते हैं? इनका खाता और सभी लेनदेन हटा दिए जाएंगे।
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDeleteConfirmCustomer(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
              >
                रद्द करें
              </button>
              <button
                onClick={() => {
                  onDeleteCustomer(deleteConfirmCustomer.id);
                  setDeleteConfirmCustomer(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                हाँ, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
