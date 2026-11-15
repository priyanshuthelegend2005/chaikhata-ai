import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Edit3, 
  Check, 
  PackagePlus, 
  Truck,
  Sparkles
} from 'lucide-react';

export default function InventoryView({
  inventory,
  onUpdateQuantity,
  onSaveItem,
  onNavigate
}) {
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    nameHi: '',
    quantity: '10',
    unit: 'packet',
    minStock: '5',
    category: 'general',
  });

  const [quickAdjustModal, setQuickAdjustModal] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('1');

  const openAddModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        nameHi: item.nameHi || item.name,
        quantity: item.quantity.toString(),
        unit: item.unit || 'pcs',
        minStock: item.minStock.toString(),
        category: item.category || 'general',
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        nameHi: '',
        quantity: '10',
        unit: 'packet',
        minStock: '5',
        category: 'general',
      });
    }
    setAddItemModalOpen(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!itemForm.name.trim()) return;

    onSaveItem({
      id: editingItem ? editingItem.id : undefined,
      name: itemForm.name.trim(),
      nameHi: itemForm.nameHi.trim() || itemForm.name.trim(),
      quantity: Math.max(0, parseFloat(itemForm.quantity) || 0),
      unit: itemForm.unit.trim() || 'pcs',
      minStock: Math.max(0, parseFloat(itemForm.minStock) || 0),
      category: itemForm.category,
    });

    setAddItemModalOpen(false);
  };

  const handleQuickDelta = (item, delta) => {
    onUpdateQuantity(item.id, delta, false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-chai-dark tracking-tight flex items-center space-x-2">
            <Boxes className="w-6 h-6 text-primary" />
            <span>इन्वेंटरी व स्टॉक मैनेजमेंट (Inventory)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            दूध, चीनी, चाय पत्ती व कप का लाइव स्टॉक ट्रैक करें और कम होने पर अलर्ट पाएं
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('supplier')}
            className="px-4 py-2.5 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Truck className="w-4 h-4" />
            <span>सप्लायर ऑर्डर भेजें</span>
          </button>
          <button
            onClick={() => openAddModal()}
            className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-orange-600 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition active:scale-95"
          >
            <PackagePlus className="w-4 h-4" />
            <span>+ नई सामग्री जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner if applicable */}
      {inventory.some(i => Number(i.quantity) <= Number(i.minStock)) && (
        <div className="rounded-3xl bg-amber-50 border-2 border-amber-300 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-200 text-amber-900">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-950">
                सावधान: कुछ सामान न्यूनतम स्तर से कम है!
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {inventory.filter(i => Number(i.quantity) <= Number(i.minStock)).map(i => `${i.nameHi || i.name} (${i.quantity} ${i.unit})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('supplier')}
            className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
          >
            तुरंत ऑर्डर करें →
          </button>
        </div>
      )}

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventory.map((item) => {
          const isLow = Number(item.quantity) <= Number(item.minStock);
          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-5 border shadow-soft transition flex flex-col justify-between ${
                isLow ? 'border-amber-400 ring-2 ring-amber-100' : 'border-chai-border hover:border-orange-200'
              }`}
            >
              <div>
                {/* Header: Name, Unit, and Edit */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-chai-dark leading-tight">
                      {item.nameHi || item.name}
                    </h3>
                    <p className="text-xs text-stone-400 font-medium">
                      {item.name}
                    </p>
                  </div>
                  <button
                    onClick={() => openAddModal(item)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                    title="Edit Item"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Stock Number & Status */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-chai-dark">
                      {item.quantity}
                    </span>
                    <span className="text-sm font-bold text-stone-500 ml-1.5">
                      {item.unit}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isLow ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isLow ? 'कम स्टॉक (Low)' : 'पर्याप्त (In Stock)'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{
                      width: `${Math.min(100, (item.quantity / Math.max(1, item.minStock * 2.5)) * 100)}%`,
                    }}
                  ></div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 font-medium">
                  <span>न्यूनतम सीमा (Min): {item.minStock} {item.unit}</span>
                </div>
              </div>

              {/* Action Buttons: Quick Increment/Decrement (+/-) */}
              <div className="mt-5 pt-3 border-t border-stone-100 space-y-2">
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => handleQuickDelta(item, -5)}
                    className="py-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 font-black text-xs active:scale-95 transition"
                    title="Minus 5"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleQuickDelta(item, -1)}
                    className="py-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 font-black text-xs active:scale-95 transition"
                    title="Minus 1"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleQuickDelta(item, +1)}
                    className="py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-black text-xs active:scale-95 transition"
                    title="Plus 1"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleQuickDelta(item, +5)}
                    className="py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-black text-xs active:scale-95 transition"
                    title="Plus 5"
                  >
                    +5
                  </button>
                </div>

                <p className="text-[10px] text-center text-stone-400">
                  या बोलें: "{item.name.split(' ')[0]} 5 {item.unit} add karo"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add or Edit Inventory Item */}
      {addItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-orange-200">
            <div className="flex items-center justify-between pb-3 border-b border-chai-border mb-4">
              <h3 className="font-extrabold text-base text-chai-dark flex items-center space-x-2">
                <PackagePlus className="w-5 h-5 text-primary" />
                <span>{editingItem ? 'सामग्री विवरण बदलें' : 'नई सामग्री जोड़ें'}</span>
              </h3>
              <button
                onClick={() => setAddItemModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  सामग्री का नाम (Item Name English) *
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="उदा. Ginger, Cardamom..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  हिंदी नाम (Hindi Name)
                </label>
                <input
                  type="text"
                  value={itemForm.nameHi}
                  onChange={(e) => setItemForm({ ...itemForm, nameHi: e.target.value })}
                  placeholder="उदा. अदरक, इलायची..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    वर्तमान मात्रा (Quantity) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    इकाई (Unit)
                  </label>
                  <select
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                  >
                    <option value="packet">packet (पैकेट)</option>
                    <option value="kg">kg (किलो)</option>
                    <option value="liter">liter (लीटर)</option>
                    <option value="pcs">pcs (पीस / कप)</option>
                    <option value="box">box (डिब्बा)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  न्यूनतम अलर्ट सीमा (Minimum Stock Level)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={itemForm.minStock}
                  onChange={(e) => setItemForm({ ...itemForm, minStock: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  स्टॉक इस स्तर से कम होने पर चेतावनी दिखाई देगी
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddItemModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  रद्द करें
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
    </div>
  );
}
