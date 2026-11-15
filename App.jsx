import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import UdhaarKhataView from './components/UdhaarKhataView';
import PaymentsView from './components/PaymentsView';
import InventoryView from './components/InventoryView';
import SupplierOrdersView from './components/SupplierOrdersView';
import SettingsView from './components/SettingsView';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import QrModal from './components/QrModal';
import { StorageService } from './services/storage';
import { WhatsAppService } from './services/whatsappService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [qrModalCustomer, setQrModalCustomer] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Core Persistent State
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [settings, setSettings] = useState(StorageService.getSettings());
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalOutstandingUdhaar: 0,
    todaysCollection: 0,
    lowStockCount: 0,
    recentTransactions: [],
  });

  // Reload all state from persistent storage
  const refreshState = useCallback(() => {
    const custs = StorageService.getCustomers();
    const txs = StorageService.getTransactions();
    const inv = StorageService.getInventory();
    const ords = StorageService.getSupplierOrders();
    const sets = StorageService.getSettings();
    const met = StorageService.getDashboardMetrics();

    setCustomers(custs);
    setTransactions(txs);
    setInventory(inv);
    setSupplierOrders(ords);
    setSettings(sets);
    setMetrics(met);
  }, []);

  // Initial load
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- ACTIONS ---

  const handleAddCredit = ({ customerId, amount, description }) => {
    try {
      const result = StorageService.addTransaction({
        customerId,
        type: 'credit',
        amount,
        description,
      });
      refreshState();
      showToast(`₹${amount} udhaar joda gaya: ${result.customer.name}`, 'success');
      return result;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleReceivePayment = ({ customerId, amount, description }) => {
    try {
      const result = StorageService.addTransaction({
        customerId,
        type: 'payment',
        amount,
        description,
      });
      refreshState();
      showToast(`₹${amount} payment prapt hua: ${result.customer.name}`, 'success');
      return result;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleSaveCustomer = (customerData) => {
    const saved = StorageService.saveCustomer(customerData);
    refreshState();
    showToast(`Grahak "${saved.name}" surakshit kiya gaya`, 'success');
    return saved;
  };

  const handleDeleteCustomer = (id) => {
    StorageService.deleteCustomer(id);
    refreshState();
    showToast('Grahak hata diya gaya', 'info');
  };

  const handleUpdateQuantity = (itemId, delta, isAbsolute) => {
    const updated = StorageService.updateInventoryQuantity(itemId, delta, isAbsolute);
    refreshState();
    showToast(`${updated.nameHi || updated.name} stock update: ${updated.quantity} ${updated.unit}`, 'success');
    return updated;
  };

  const handleSaveInventoryItem = (itemData) => {
    const saved = StorageService.saveInventoryItem(itemData);
    refreshState();
    showToast(`${saved.name} samagri surakshit ki gayi`, 'success');
    return saved;
  };

  const handleCreateSupplierOrder = (orderData) => {
    const newOrder = StorageService.createSupplierOrder(orderData);
    refreshState();
    showToast(`Supplier Order ${newOrder.orderNumber} taiyar hai`, 'success');
    return newOrder;
  };

  const handleUpdateOrderStatus = (orderId, updates) => {
    const updated = StorageService.updateSupplierOrderStatus(orderId, updates);
    refreshState();
    return updated;
  };

  const handleUpdateSettings = (newSettings) => {
    const saved = StorageService.saveSettings(newSettings);
    setSettings(saved);
    showToast('Settings update ho gayi hain', 'success');
    return saved;
  };

  const handleResetData = () => {
    StorageService.resetDemoData();
    refreshState();
    showToast('Hackathon sample demo data reset ho gaya', 'info');
  };

  // --- VOICE INTENT EXECUTOR ---
  const handleExecuteVoiceAction = (intent) => {
    if (!intent || !intent.data) return;

    if (intent.type === 'ADD_CREDIT') {
      const { customer, amount, description } = intent.data;
      // Find existing customer by ID or bilingual name to prevent duplicates
      let targetCust = (customer.id && customers.find(c => c.id === customer.id)) ||
                       StorageService.findCustomerByName(customer.name) ||
                       (customer.canonicalName && StorageService.findCustomerByName(customer.canonicalName)) ||
                       customers.find(c => c.name.toLowerCase() === customer.name.toLowerCase());

      if (!targetCust) {
        targetCust = StorageService.saveCustomer({
          name: customer.name,
          nameHi: customer.name,
          phone: '',
          balance: 0,
          notes: 'Added via Voice Assistant',
        });
      }
      return handleAddCredit({
        customerId: targetCust.id,
        amount,
        description: description || `Voice Udhaar: ₹${amount}`,
      });
    }

    if (intent.type === 'RECEIVE_PAYMENT') {
      const { customer, amount, description } = intent.data;
      let targetCust = (customer.id && customers.find(c => c.id === customer.id)) ||
                       StorageService.findCustomerByName(customer.name) ||
                       (customer.canonicalName && StorageService.findCustomerByName(customer.canonicalName)) ||
                       customers.find(c => c.name.toLowerCase() === customer.name.toLowerCase());

      if (!targetCust) {
        throw new Error(`Customer "${customer.name}" record me nahi mila.`);
      }
      return handleReceivePayment({
        customerId: targetCust.id,
        amount,
        description: description || `Voice Payment: ₹${amount}`,
      });
    }

    if (intent.type === 'UPDATE_STOCK' || intent.type === 'UPDATE_INVENTORY') {
      const { itemId, delta } = intent.data;
      return handleUpdateQuantity(itemId, delta, false);
    }

    if (intent.type === 'CREATE_SUPPLIER_ORDER' || intent.type === 'SUPPLIER_ORDER') {
      const { items, deliveryTime } = intent.data;
      return handleCreateSupplierOrder({
        supplierName: 'Verma Milk & Grocery Dairy',
        supplierPhone: '9899001122',
        items,
        deliveryTime,
        status: 'Draft',
        sentViaWhatsapp: false,
      });
    }

    if (intent.type === 'CHECK_INVENTORY') {
      // Read-only stock check
      return true;
    }
  };

  // WhatsApp Trigger from Ledger Card
  const handleSendWhatsAppReminder = (customer) => {
    WhatsAppService.sendCustomerReminder({
      customer,
      shopName: settings.shopName,
      upiVpa: settings.upiVpa,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-chai-dark">
      {/* Top Navigation Bar */}
      <Navbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenVoice={() => setVoiceModalOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          metrics={metrics}
        />

        {/* Dynamic Main Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              inventory={inventory}
              customers={customers}
              onOpenVoice={() => setVoiceModalOpen(true)}
              onAddCredit={handleAddCredit}
              onReceivePayment={handleReceivePayment}
              onOpenAddCustomer={() => {
                setActiveTab('udhaar');
              }}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'voice' && (
            <div className="max-w-2xl mx-auto py-4">
              <div className="bg-white rounded-3xl p-6 border border-chai-border shadow-soft text-center space-y-4">
                <h2 className="text-xl font-black text-chai-dark">
                  AI Voice Assistant Fullscreen Mode
                </h2>
                <p className="text-xs text-stone-500">
                  हैंड्स-फ्री मोड में बातचीत करने के लिए नीचे दिए गए बटन पर टैप करें
                </p>
                <button
                  onClick={() => setVoiceModalOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-lg hover:scale-105 active:scale-95 transition"
                >
                  🎙️ असिस्टेंट शुरू करें (Launch Voice Assistant)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'udhaar' && (
            <UdhaarKhataView
              customers={customers}
              transactions={transactions}
              settings={settings}
              onSaveCustomer={handleSaveCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onAddCredit={handleAddCredit}
              onReceivePayment={handleReceivePayment}
              onGenerateQr={(cust) => setQrModalCustomer(cust)}
              onSendWhatsApp={handleSendWhatsAppReminder}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              customers={customers}
              transactions={transactions}
              settings={settings}
              onReceivePayment={handleReceivePayment}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              onUpdateQuantity={handleUpdateQuantity}
              onSaveItem={handleSaveInventoryItem}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'supplier' && (
            <SupplierOrdersView
              orders={supplierOrders}
              inventory={inventory}
              settings={settings}
              onCreateOrder={handleCreateSupplierOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenVoice={() => setVoiceModalOpen(true)}
      />

      {/* Interactive AI Voice Modal */}
      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        customers={customers}
        inventory={inventory}
        settings={settings}
        onExecuteAction={handleExecuteVoiceAction}
      />

      {/* Direct UPI QR Code Modal */}
      <QrModal
        isOpen={Boolean(qrModalCustomer)}
        onClose={() => setQrModalCustomer(null)}
        customer={qrModalCustomer}
        settings={settings}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-2xl shadow-xl text-xs font-black text-white flex items-center space-x-2 ${
            toastMessage.type === 'error' ? 'bg-red-600' : 'bg-chai-dark border border-orange-500'
          }`}>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
