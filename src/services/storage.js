/**
 * ChaiKhata AI - Local Storage & Data Persistence Layer
 * Provides persistent state management with robust validation,
 * sample data for demonstrations, and atomic updates.
 */

const STORAGE_KEYS = {
  CUSTOMERS: 'chaikhata_customers_v1',
  TRANSACTIONS: 'chaikhata_transactions_v1',
  INVENTORY: 'chaikhata_inventory_v1',
  SUPPLIER_ORDERS: 'chaikhata_supplier_orders_v1',
  SETTINGS: 'chaikhata_settings_v1',
};

// Default Realistic Seed Data
const DEFAULT_SETTINGS = {
  shopName: 'Sharma Chai Point',
  ownerName: 'Manoj Sharma',
  ownerPhone: '9876543210',
  upiVpa: 'sharmachai@upi',
  voiceEnabled: true,
  voiceLanguage: 'hi-IN', // 'hi-IN' or 'en-IN'
  autoSpeak: true,
};

const DEFAULT_INVENTORY = [
  {
    id: 'inv-milk',
    key: 'milk',
    name: 'Milk (दूध)',
    nameHi: 'दूध',
    aliases: ['milk', 'doodh', 'dudh', 'दूध', 'दोध'],
    quantity: 10,
    unit: 'packet',
    minStock: 5,
    category: 'dairy',
    pricePerUnit: 32,
  },
  {
    id: 'inv-sugar',
    key: 'sugar',
    name: 'Sugar (चीनी)',
    nameHi: 'चीनी',
    aliases: ['sugar', 'cheeni', 'chini', 'shakkar', 'चीनी', 'शक्कर'],
    quantity: 5,
    unit: 'kg',
    minStock: 2,
    category: 'dry',
    pricePerUnit: 44,
  },
  {
    id: 'inv-tea',
    key: 'tea',
    name: 'Tea Leaves (चाय पत्ती)',
    nameHi: 'चाय पत्ती',
    aliases: ['tea', 'chai patti', 'tea leaves', 'patti', 'चाय पत्ती', 'पत्ती'],
    quantity: 2,
    unit: 'kg',
    minStock: 1,
    category: 'dry',
    pricePerUnit: 360,
  },
  {
    id: 'inv-cups',
    key: 'cups',
    name: 'Paper Cups (कुल्हड़ / कप)',
    nameHi: 'पेपर कप',
    aliases: ['cup', 'cups', 'paper cup', 'paper cups', 'kulhad', 'कप', 'कुल्हड़'],
    quantity: 100,
    unit: 'pcs',
    minStock: 30,
    category: 'disposables',
    pricePerUnit: 0.8,
  },
];

const DEFAULT_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Ramesh',
    nameHi: 'रमेश',
    phone: '9876543211',
    balance: 40,
    notes: 'Office regular, pays weekly',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'cust-2',
    name: 'Suresh',
    nameHi: 'सुरेश',
    phone: '9823012345',
    balance: 50,
    notes: 'Bank employee, morning tea',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'cust-3',
    name: 'Amit',
    nameHi: 'अमित',
    phone: '9811223344',
    balance: 30,
    notes: 'Auto driver bhai',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'cust-4',
    name: 'Priya',
    nameHi: 'प्रिया',
    phone: '9988776655',
    balance: 0,
    notes: 'Clinic staff, clear account',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'cust-5',
    name: 'Vikram',
    nameHi: 'विक्रम',
    phone: '9765432109',
    balance: 85,
    notes: 'Courier delivery team',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 18000000).toISOString(),
  },
];

const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx-1',
    customerId: 'cust-1',
    customerName: 'Ramesh',
    type: 'credit', // 'credit' (udhaar added) or 'payment' (paid)
    amount: 40,
    description: '4 Chai + 1 Samosa (Udhaar)',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'tx-2',
    customerId: 'cust-2',
    customerName: 'Suresh',
    type: 'credit',
    amount: 50,
    description: 'Chai + Bun Maska (Udhaar)',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'tx-3',
    customerId: 'cust-3',
    customerName: 'Amit',
    type: 'credit',
    amount: 30,
    description: '3 Chai (Udhaar)',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'tx-4',
    customerId: 'cust-4',
    customerName: 'Priya',
    type: 'payment',
    amount: 40,
    description: 'UPI Payment received (Google Pay)',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_SUPPLIER_ORDERS = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-101',
    supplierName: 'Verma Milk & Grocery Dairy',
    supplierPhone: '9899001122',
    items: [
      { name: 'Milk (दूध)', quantity: 20, unit: 'packet' },
      { name: 'Sugar (चीनी)', quantity: 2, unit: 'kg' },
    ],
    deliveryTime: 'Tomorrow Morning 6:00 AM (कल सुबह)',
    status: 'Draft',
    sentViaWhatsapp: false,
    createdAt: new Date(Date.now() - 12000000).toISOString(),
  },
];

// Helper to safely read from localStorage
const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
    return fallback;
  }
};

// Helper to safely write to localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
    return false;
  }
};

export const StorageService = {
  // --- SETTINGS ---
  getSettings() {
    return loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // --- CUSTOMERS ---
  getCustomers() {
    return loadFromStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  },

  getCustomerById(id) {
    const customers = this.getCustomers();
    return customers.find(c => c.id === id) || null;
  },

  findCustomerByName(name) {
    if (!name) return null;
    const cleanQuery = name.trim().toLowerCase();
    const customers = this.getCustomers();
    
    // 1. Exact match on English name or Hindi name
    const exact = customers.find(c => 
      c.name.toLowerCase() === cleanQuery || 
      (c.nameHi && c.nameHi.toLowerCase() === cleanQuery)
    );
    if (exact) return exact;
    
    // 2. Starts with / Substring match on English or Hindi name
    const substring = customers.find(c => 
      c.name.toLowerCase().includes(cleanQuery) || 
      cleanQuery.includes(c.name.toLowerCase()) ||
      (c.nameHi && (c.nameHi.includes(cleanQuery) || cleanQuery.includes(c.nameHi)))
    );
    if (substring) return substring;

    return null;
  },

  saveCustomer(customerData) {
    const customers = this.getCustomers();
    const now = new Date().toISOString();

    if (customerData.id) {
      // Edit existing
      const index = customers.findIndex(c => c.id === customerData.id);
      if (index !== -1) {
        customers[index] = {
          ...customers[index],
          ...customerData,
          balance: Math.max(0, Number(customerData.balance ?? customers[index].balance)),
          updatedAt: now,
        };
        saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
        return customers[index];
      }
    }

    // Add new customer
    const newCustomer = {
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: customerData.name.trim(),
      phone: (customerData.phone || '').trim(),
      balance: Math.max(0, Number(customerData.balance || 0)),
      notes: customerData.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    customers.unshift(newCustomer);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return newCustomer;
  },

  deleteCustomer(id) {
    let customers = this.getCustomers();
    customers = customers.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);

    // Also clean up or preserve transactions
    let transactions = this.getTransactions();
    transactions = transactions.filter(t => t.customerId !== id);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    return true;
  },

  // --- TRANSACTIONS ---
  getTransactions() {
    return loadFromStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  },

  getTransactionsByCustomer(customerId) {
    const txs = this.getTransactions();
    return txs.filter(t => t.customerId === customerId);
  },

  /**
   * Records Udhaar (credit) or Payment received.
   * Updates customer balance atomically.
   */
  addTransaction({ customerId, type, amount, description }) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Valid positive amount is required');
    }

    const customers = this.getCustomers();
    const customerIndex = customers.findIndex(c => c.id === customerId);

    if (customerIndex === -1) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }

    const customer = customers[customerIndex];
    let newBalance = Number(customer.balance || 0);

    if (type === 'credit') {
      newBalance += numAmount;
    } else if (type === 'payment') {
      newBalance = Math.max(0, newBalance - numAmount);
    } else {
      throw new Error(`Invalid transaction type: ${type}`);
    }

    // Update customer record
    customer.balance = newBalance;
    customer.updatedAt = new Date().toISOString();
    customers[customerIndex] = customer;
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);

    // Create transaction log
    const transactions = this.getTransactions();
    const newTx = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId: customer.id,
      customerName: customer.name,
      type, // 'credit' | 'payment'
      amount: numAmount,
      description: description || (type === 'credit' ? 'Udhaar added' : 'Payment received'),
      timestamp: new Date().toISOString(),
    };

    transactions.unshift(newTx);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

    return { transaction: newTx, customer };
  },

  // --- INVENTORY ---
  getInventory() {
    return loadFromStorage(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
  },

  findInventoryItem(query) {
    if (!query) return null;
    const clean = query.trim().toLowerCase();
    const items = this.getInventory();

    return items.find(item => {
      if (item.key && item.key.toLowerCase() === clean) return true;
      if (item.name && item.name.toLowerCase().includes(clean)) return true;
      if (item.nameHi && item.nameHi.includes(clean)) return true;
      if (item.aliases && item.aliases.some(a => a.toLowerCase().includes(clean) || clean.includes(a.toLowerCase()))) {
        return true;
      }
      return false;
    }) || null;
  },

  updateInventoryQuantity(itemIdOrKey, deltaOrValue, isAbsolute = false) {
    const items = this.getInventory();
    let idx = items.findIndex(i => i.id === itemIdOrKey);
    if (idx === -1) {
      idx = items.findIndex(i => i.key === itemIdOrKey || i.id === `inv-${itemIdOrKey}`);
    }
    if (idx === -1) {
      const clean = String(itemIdOrKey).toLowerCase();
      idx = items.findIndex(i => 
        i.name.toLowerCase().includes(clean) || 
        (i.nameHi && i.nameHi.includes(clean)) ||
        (i.aliases && i.aliases.some(a => a.toLowerCase().includes(clean)))
      );
    }
    if (idx === -1) throw new Error(`Inventory item ${itemIdOrKey} not found`);

    const item = items[idx];
    let newQty;

    if (isAbsolute) {
      newQty = Math.max(0, Number(deltaOrValue));
    } else {
      newQty = Math.max(0, Number(item.quantity) + Number(deltaOrValue));
    }

    item.quantity = newQty;
    items[idx] = item;
    saveToStorage(STORAGE_KEYS.INVENTORY, items);
    return item;
  },

  saveInventoryItem(itemData) {
    const items = this.getInventory();
    if (itemData.id) {
      const idx = items.findIndex(i => i.id === itemData.id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...itemData };
        saveToStorage(STORAGE_KEYS.INVENTORY, items);
        return items[idx];
      }
    }

    const newItem = {
      id: `inv-${Date.now()}`,
      key: itemData.name.toLowerCase().replace(/\s+/g, '-'),
      name: itemData.name,
      nameHi: itemData.nameHi || itemData.name,
      aliases: [itemData.name.toLowerCase()],
      quantity: Math.max(0, Number(itemData.quantity || 0)),
      unit: itemData.unit || 'pcs',
      minStock: Math.max(0, Number(itemData.minStock || 5)),
      category: itemData.category || 'general',
      pricePerUnit: Number(itemData.pricePerUnit || 0),
    };

    items.push(newItem);
    saveToStorage(STORAGE_KEYS.INVENTORY, items);
    return newItem;
  },

  // --- SUPPLIER ORDERS ---
  getSupplierOrders() {
    return loadFromStorage(STORAGE_KEYS.SUPPLIER_ORDERS, DEFAULT_SUPPLIER_ORDERS);
  },

  createSupplierOrder(orderData) {
    const orders = this.getSupplierOrders();
    const count = orders.length + 101;
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${count}`,
      supplierName: orderData.supplierName || 'Verma Milk & Grocery Dairy',
      supplierPhone: orderData.supplierPhone || '9899001122',
      items: orderData.items || [], // [{ name, quantity, unit }]
      deliveryTime: orderData.deliveryTime || 'Tomorrow Morning (कल सुबह)',
      status: orderData.status || 'Draft',
      sentViaWhatsapp: Boolean(orderData.sentViaWhatsapp),
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    saveToStorage(STORAGE_KEYS.SUPPLIER_ORDERS, orders);
    return newOrder;
  },

  updateSupplierOrderStatus(orderId, updates) {
    const orders = this.getSupplierOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...updates };
      saveToStorage(STORAGE_KEYS.SUPPLIER_ORDERS, orders);
      return orders[idx];
    }
    return null;
  },

  // --- SUMMARY METRICS ---
  getDashboardMetrics() {
    const customers = this.getCustomers();
    const transactions = this.getTransactions();
    const inventory = this.getInventory();

    // Unique customers count
    const totalCustomers = customers.length;

    // Total outstanding balance
    const totalOutstandingUdhaar = customers.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);

    // Today's Collection (Payment transactions timestamped today)
    const today = new Date().toDateString();
    const todayPayments = transactions.filter(t => {
      const txDate = new Date(t.timestamp).toDateString();
      return txDate === today && t.type === 'payment';
    });
    const todaysCollection = todayPayments.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // Low stock items count
    const lowStockItems = inventory.filter(i => Number(i.quantity) <= Number(i.minStock));

    return {
      totalCustomers,
      totalOutstandingUdhaar,
      todaysCollection,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      recentTransactions: transactions.slice(0, 8),
    };
  },

  // --- BACKUP & RESET ---
  resetDemoData() {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
    saveToStorage(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
    saveToStorage(STORAGE_KEYS.SUPPLIER_ORDERS, DEFAULT_SUPPLIER_ORDERS);
    saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return true;
  },

  exportAllData() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      customers: this.getCustomers(),
      transactions: this.getTransactions(),
      inventory: this.getInventory(),
      supplierOrders: this.getSupplierOrders(),
      settings: this.getSettings(),
    };
  },

  importAllData(data) {
    if (!data || typeof data !== 'object') throw new Error('Invalid data format');
    if (data.customers) saveToStorage(STORAGE_KEYS.CUSTOMERS, data.customers);
    if (data.transactions) saveToStorage(STORAGE_KEYS.TRANSACTIONS, data.transactions);
    if (data.inventory) saveToStorage(STORAGE_KEYS.INVENTORY, data.inventory);
    if (data.supplierOrders) saveToStorage(STORAGE_KEYS.SUPPLIER_ORDERS, data.supplierOrders);
    if (data.settings) saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
    return true;
  }
};
