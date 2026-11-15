import React, { useState } from 'react';
import { 
  Truck, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  Calendar, 
  FileText,
  Phone,
  Sparkles
} from 'lucide-react';
import { WhatsAppService } from '../services/whatsappService';

export default function SupplierOrdersView({
  orders,
  inventory,
  settings,
  onCreateOrder,
  onUpdateOrderStatus
}) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('Verma Milk & Grocery Dairy');
  const [supplierPhone, setSupplierPhone] = useState('9899001122');
  const [deliveryTime, setDeliveryTime] = useState('Tomorrow Morning 6:00 AM (कल सुबह)');
  
  // Dynamic order items list
  const [orderItems, setOrderItems] = useState([
    { name: 'Milk (दूध)', quantity: 20, unit: 'packet' },
    { name: 'Sugar (चीनी)', quantity: 2, unit: 'kg' },
  ]);

  const handleAddItemRow = () => {
    setOrderItems([...orderItems, { name: 'Tea Leaves (चाय पत्ती)', quantity: 1, unit: 'kg' }]);
  };

  const handleRemoveItemRow = (idx) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx, field, val) => {
    const updated = [...orderItems];
    updated[idx][field] = val;
    setOrderItems(updated);
  };

  const handleCreateOrderSubmit = (e) => {
    e.preventDefault();
    if (orderItems.length === 0) return;

    onCreateOrder({
      supplierName: supplierName.trim(),
      supplierPhone: supplierPhone.trim(),
      items: orderItems,
      deliveryTime,
      status: 'Draft',
      sentViaWhatsapp: false,
    });

    setCreateModalOpen(false);
  };

  const handleSendViaWhatsApp = (order) => {
    WhatsAppService.sendSupplierOrder({
      order,
      shopName: settings.shopName,
      ownerPhone: settings.ownerPhone,
    });

    onUpdateOrderStatus(order.id, {
      status: 'Sent via WhatsApp',
      sentViaWhatsapp: true,
      sentAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-chai-dark tracking-tight flex items-center space-x-2">
            <Truck className="w-6 h-6 text-primary" />
            <span>सप्लायर ऑर्डर प्रबंधन (Supplier Orders)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            दूध, चीनी, पत्ती व कप का सप्लायर आर्डर तैयार करें और WhatsApp पर सीधे भेजें
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-md hover:bg-orange-600 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ नया सप्लायर ऑर्डर बनाएं</span>
        </button>
      </div>

      {/* Voice Hint Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 text-orange-800 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-orange-950 uppercase tracking-wider">
              वॉइस असिस्टेंट द्वारा सप्लायर ऑर्डर:
            </p>
            <p className="text-xs text-stone-700 font-medium italic mt-0.5">
              "Kal subah ke liye 20 packet doodh aur 2 kilo cheeni order kar do"
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => {
            const isSent = Boolean(order.sentViaWhatsapp);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-chai-border shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-black text-sm text-chai-dark bg-stone-100 px-2.5 py-1 rounded-xl">
                      {order.orderNumber}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isSent
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {isSent ? 'WhatsApp Sent' : 'Draft Order'}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
                      <span>{order.supplierName}</span>
                      <span className="text-xs font-medium text-stone-500 flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{order.supplierPhone}</span>
                      </span>
                    </h3>
                  </div>

                  {/* Items badge list */}
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 font-bold text-xs"
                      >
                        {it.name}: <strong>{it.quantity} {it.unit}</strong>
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-stone-600 font-medium flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <span>डिलीवरी: <strong>{order.deliveryTime}</strong></span>
                  </p>
                </div>

                {/* Right Action: Send via WhatsApp */}
                <div className="flex flex-col items-end justify-center shrink-0 space-y-2">
                  <button
                    onClick={() => handleSendViaWhatsApp(order)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2 active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp पर भेजें (Send)</span>
                  </button>
                  <p className="text-[10px] text-stone-400 text-center sm:text-right">
                    {isSent ? 'Order dispatched via WhatsApp' : 'भेजने के बाद ही स्टेटस अपडेट होगा'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300">
            <p className="text-base font-bold text-stone-600">
              कोई सप्लायर आर्डर नहीं है
            </p>
            <p className="text-xs text-stone-400 mt-1">
              दूध, चीनी या पत्ती का नया आर्डर तैयार करने के लिए ऊपर दिए गए बटन पर क्लिक करें
            </p>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-orange-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-chai-border mb-4">
              <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
                <Truck className="w-5 h-5 text-primary" />
                <span>नया सप्लायर ऑर्डर (New Supplier Order)</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    सप्लायर का नाम (Dairy/Shop)
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    सप्लायर WhatsApp नंबर
                  </label>
                  <input
                    type="tel"
                    required
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  डिलीवरी समय (Delivery Date & Time)
                </label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="उदा. Tomorrow Morning 6:00 AM (कल सुबह)"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    सामान सूची (Items to Order) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-primary hover:text-orange-700 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ और सामान जोड़ें</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-[#FFF9F2] p-2.5 rounded-2xl border border-chai-border">
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                        placeholder="सामान (उदा. Milk, Sugar)"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:outline-none"
                      />
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                        placeholder="मात्रा"
                        className="w-20 px-2 py-1.5 rounded-lg border border-stone-300 text-xs font-bold focus:outline-none text-center"
                      />
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                        placeholder="packet/kg"
                        className="w-20 px-2 py-1.5 rounded-lg border border-stone-300 text-xs focus:outline-none text-center"
                      />
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-chai-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs shadow-md"
                >
                  ऑर्डर ड्राफ्ट सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
