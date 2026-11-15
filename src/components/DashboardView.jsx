import React from 'react';
import { 
  Users, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle, 
  Mic, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles,
  PackageCheck,
  ChevronRight,
  Boxes
} from 'lucide-react';
import QuickActionPad from './QuickActionPad';

export default function DashboardView({ 
  metrics, 
  inventory, 
  customers, 
  onOpenVoice, 
  onAddCredit, 
  onReceivePayment, 
  onOpenAddCustomer,
  onNavigate 
}) {
  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Banner / Welcome with Voice Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-6 md:p-8 text-white shadow-xl shadow-orange-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>Voice-First AI Assistant for Chaiwalas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              बस बोलिए, खाता अपने आप बनेगा
            </h2>
            <p className="text-sm text-orange-100 max-w-lg leading-relaxed font-medium">
              हिंदी या Hinglish में बोलें: उधारी लिखना, पेमेंट जमा करना, या सामान का स्टॉक चेक करना—सब कुछ एक सेकंड में।
            </p>

            {/* Example voice commands preview chips */}
            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="bg-white/15 px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xs">
                "Ramesh ke 40 rupaye likh lo"
              </span>
              <span className="bg-white/15 px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xs">
                "Suresh ne 50 rupaye jama kar diye"
              </span>
              <span className="bg-white/15 px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xs">
                "Kal ke liye 20 packet doodh order karo"
              </span>
            </div>
          </div>

          {/* Large Circular Microphone Button */}
          <div className="shrink-0 flex flex-col items-center">
            <button
              onClick={onOpenVoice}
              className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white text-orange-600 flex flex-col items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-8 ring-white/30"
              aria-label="Start Voice Assistant"
            >
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-primary group-hover:scale-110 transition" />
              <span className="text-[11px] font-black uppercase tracking-wider text-chai-dark mt-1">
                यहाँ बोलें 🎙️
              </span>
            </button>
            <span className="text-xs font-bold text-white/90 mt-2">
              Tap to Speak
            </span>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </div>

      {/* 4 Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Customers */}
        <div 
          onClick={() => onNavigate('udhaar')}
          className="bg-white p-5 rounded-3xl border border-chai-border shadow-soft hover:border-orange-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Customers
            </span>
            <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-chai-dark mt-2">
            {metrics.totalCustomers}
          </p>
          <p className="text-xs text-stone-500 font-medium mt-1 flex items-center space-x-1">
            <span>कुल पंजीकृत ग्राहक</span>
            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:translate-x-1 transition" />
          </p>
        </div>

        {/* Metric 2: Total Outstanding Udhaar */}
        <div 
          onClick={() => onNavigate('udhaar')}
          className="bg-white p-5 rounded-3xl border border-chai-border shadow-soft hover:border-red-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Udhaar
            </span>
            <div className="w-9 h-9 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-600 mt-2">
            ₹{metrics.totalOutstandingUdhaar.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-stone-500 font-medium mt-1 flex items-center space-x-1">
            <span>बाकी उधारी वसूली</span>
            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:translate-x-1 transition" />
          </p>
        </div>

        {/* Metric 3: Today's Collection */}
        <div 
          onClick={() => onNavigate('payments')}
          className="bg-white p-5 rounded-3xl border border-chai-border shadow-soft hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Today's Collection
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            ₹{metrics.todaysCollection.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-stone-500 font-medium mt-1 flex items-center space-x-1">
            <span>आज की नकद/UPI जमा</span>
            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:translate-x-1 transition" />
          </p>
        </div>

        {/* Metric 4: Low Stock Alerts */}
        <div 
          onClick={() => onNavigate('inventory')}
          className={`p-5 rounded-3xl border shadow-soft transition cursor-pointer group ${
            metrics.lowStockCount > 0 
              ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400' 
              : 'bg-white border-chai-border hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Low Stock Alerts
            </span>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition ${
              metrics.lowStockCount > 0
                ? 'bg-amber-200 text-amber-900 group-hover:bg-amber-500 group-hover:text-white'
                : 'bg-stone-100 text-stone-700 group-hover:bg-stone-700 group-hover:text-white'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black mt-2 ${metrics.lowStockCount > 0 ? 'text-amber-700' : 'text-stone-700'}`}>
            {metrics.lowStockCount} Items
          </p>
          <p className="text-xs text-stone-500 font-medium mt-1 flex items-center space-x-1">
            <span>सामग्री खत्म होने वाली</span>
            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:translate-x-1 transition" />
          </p>
        </div>
      </div>

      {/* Quick Action Touch Buttons Pad */}
      <QuickActionPad 
        customers={customers}
        onAddCredit={onAddCredit}
        onReceivePayment={onReceivePayment}
        onOpenAddCustomer={onOpenAddCustomer}
      />

      {/* Two Column Layout: Recent Activity & Inventory Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 border border-chai-border shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-chai-border">
              <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
                <span>हाल की गतिविधियां (Recent Activity)</span>
              </h3>
              <button
                onClick={() => onNavigate('udhaar')}
                className="text-xs font-bold text-primary hover:text-orange-700 flex items-center space-x-0.5"
              >
                <span>सब देखें</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 mt-2">
              {metrics.recentTransactions && metrics.recentTransactions.length > 0 ? (
                metrics.recentTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                        tx.type === 'credit'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {tx.type === 'credit' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-chai-dark">
                          {tx.customerName}
                        </p>
                        <p className="text-xs text-stone-500 truncate max-w-[200px]">
                          {tx.description || (tx.type === 'credit' ? 'Udhaar Added' : 'Payment Received')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-extrabold ${
                        tx.type === 'credit' ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {tx.type === 'credit' ? `+ ₹${tx.amount}` : `- ₹${tx.amount}`}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-stone-400 text-sm">
                  कोई हाल की लेनदेन नहीं है
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-chai-border text-center">
            <button
              onClick={() => onNavigate('udhaar')}
              className="text-xs font-bold text-stone-600 hover:text-primary transition"
            >
              पूर्ण खाता और लेनदेन इतिहास खोलें →
            </button>
          </div>
        </div>

        {/* Inventory Overview (Milk, Sugar, Tea Leaves, Cups) */}
        <div className="bg-white rounded-3xl p-6 border border-chai-border shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-chai-border">
              <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-primary" />
                <span>सामग्री स्टॉक (Inventory Overview)</span>
              </h3>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-bold text-primary hover:text-orange-700 flex items-center space-x-0.5"
              >
                <span>मैनेज करें</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {inventory.slice(0, 4).map((item) => {
                const isLow = Number(item.quantity) <= Number(item.minStock);
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition ${
                      isLow 
                        ? 'bg-amber-50/70 border-amber-300' 
                        : 'bg-[#FFF9F2] border-chai-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-chai-dark truncate">
                        {item.nameHi || item.name}
                      </span>
                      {isLow && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          Low
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-extrabold text-chai-dark">
                      {item.quantity}{' '}
                      <span className="text-xs font-medium text-stone-500">
                        {item.unit}
                      </span>
                    </p>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (item.quantity / (item.minStock * 3)) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-chai-border mt-4 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              कम स्टॉक होने पर तुरंत सप्लायर ऑर्डर भेजें
            </span>
            <button
              onClick={() => onNavigate('supplier')}
              className="px-3 py-1.5 rounded-xl bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs font-bold transition"
            >
              सप्लायर आर्डर →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
