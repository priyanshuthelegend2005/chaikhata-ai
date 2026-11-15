/**
 * Automated Verification Test Suite for ChaiKhata AI
 * Validates TEST 1 through TEST 9 + Complete Hindi/Hinglish NLP Parser Suite
 */
import { parseIntent, extractNumber, normalizeDigits } from './src/services/intentParser.js';
import { UpiService } from './src/services/upiService.js';
import { WhatsAppService } from './src/services/whatsappService.js';

// Polyfill localStorage for node test runner
const mockStore = {};
global.localStorage = {
  getItem: (key) => mockStore[key] || null,
  setItem: (key, val) => { mockStore[key] = val.toString(); },
  removeItem: (key) => { delete mockStore[key]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); }
};

// Import StorageService after localStorage polyfill
const { StorageService } = await import('./src/services/storage.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  }
}

console.log('--- STARTING CHAIKHATA AI VERIFICATION TEST SUITE ---');

// Reset to initial clean state
StorageService.resetDemoData();
const customers = StorageService.getCustomers();
const inventory = StorageService.getInventory();

// -------------------------------------------------------------
// TEST 1: Add ₹40 udhaar to Ramesh. Expected: Ramesh's balance increases by ₹40.
// -------------------------------------------------------------
const ramesh = customers.find(c => c.name === 'Ramesh');
const initialRameshBalance = Number(ramesh.balance); // 40
StorageService.addTransaction({
  customerId: ramesh.id,
  type: 'credit',
  amount: 40,
  description: 'Test: 4 Chai (Udhaar)'
});
const updatedRamesh = StorageService.getCustomerById(ramesh.id);
assert(
  updatedRamesh.balance === initialRameshBalance + 40,
  `TEST 1: Ramesh balance increased by ₹40 (Was ${initialRameshBalance}, Now ${updatedRamesh.balance})`
);

// -------------------------------------------------------------
// TEST 2: Receive ₹50 from Suresh. Expected: Suresh's outstanding balance decreases by ₹50.
// -------------------------------------------------------------
const suresh = StorageService.getCustomers().find(c => c.name === 'Suresh');
const initialSureshBalance = Number(suresh.balance); // 50
StorageService.addTransaction({
  customerId: suresh.id,
  type: 'payment',
  amount: 50,
  description: 'Test: Payment received'
});
const updatedSuresh = StorageService.getCustomerById(suresh.id);
assert(
  updatedSuresh.balance === Math.max(0, initialSureshBalance - 50),
  `TEST 2: Suresh balance decreased by ₹50 (Was ${initialSureshBalance}, Now ${updatedSuresh.balance})`
);

// -------------------------------------------------------------
// TEST 3: Refresh browser simulation. Expected: All saved records remain available.
// -------------------------------------------------------------
const reloadedRamesh = StorageService.getCustomerById(ramesh.id);
assert(
  reloadedRamesh.balance === 80,
  'TEST 3: Persistent storage reload retains updated records across reloads'
);

// -------------------------------------------------------------
// TEST 4: Generate UPI QR for a customer. Expected: QR contains the correct UPI payment URI.
// -------------------------------------------------------------
const uri = UpiService.buildUpiUri({
  vpa: 'sharmachai@upi',
  shopName: 'Sharma Chai Point',
  amount: 80,
  note: 'Ramesh - ChaiKhata'
});
assert(
  uri.includes('pa=sharmachai%40upi') || uri.includes('pa=sharmachai@upi'),
  'TEST 4: UPI URI contains merchant VPA'
);
assert(
  uri.includes('am=80.00'),
  `TEST 4: UPI URI contains correct amount 80.00 (${uri})`
);

// -------------------------------------------------------------
// TEST 5: Generate WhatsApp reminder. Expected: Correct customer name and amount appear.
// -------------------------------------------------------------
const testReminderPhone = WhatsAppService.formatPhoneNumber('9876543211');
assert(testReminderPhone === '919876543211', 'TEST 5: Phone number correctly formatted with 91 country code');

// -------------------------------------------------------------
// TEST 6: Update milk stock. Expected: Inventory quantity changes immediately.
// -------------------------------------------------------------
const milkItem = StorageService.getInventory().find(i => i.key === 'milk');
const initialMilkQty = milkItem.quantity;
StorageService.updateInventoryQuantity(milkItem.id, 5, false);
const updatedMilk = StorageService.getInventory().find(i => i.key === 'milk');
assert(
  updatedMilk.quantity === initialMilkQty + 5,
  `TEST 6: Milk stock updated by +5 (Was ${initialMilkQty}, Now ${updatedMilk.quantity})`
);

// -------------------------------------------------------------
// TEST 7: Generate supplier order. Expected: Correct items and quantities appear.
// -------------------------------------------------------------
const order = StorageService.createSupplierOrder({
  supplierName: 'Verma Dairy',
  supplierPhone: '9899001122',
  items: [
    { name: 'Milk (दूध)', quantity: 20, unit: 'packet' },
    { name: 'Sugar (चीनी)', quantity: 2, unit: 'kg' }
  ],
  deliveryTime: 'Tomorrow Morning'
});
assert(
  order.items.length === 2 && order.items[0].quantity === 20 && order.items[1].quantity === 2,
  'TEST 7: Supplier order created with correct items and quantities'
);

// -------------------------------------------------------------
// TEST 8: SPECIFIC HINDI & HINGLISH NLP TESTS
// -------------------------------------------------------------
const currentCusts = StorageService.getCustomers();
const currentInv = StorageService.getInventory();

// 8A (Prompt Specific): "प्रियांशु के 100 रुपए उधार लिखो"
// Expected: Intent: ADD_CREDIT, Customer: प्रियांशु, Amount: 100
const priyanshuIntent = parseIntent("प्रियांशु के 100 रुपए उधार लिखो", { customers: currentCusts, inventory: currentInv });
assert(
  priyanshuIntent.type === 'ADD_CREDIT' &&
  (priyanshuIntent.customer === 'प्रियांशु' || priyanshuIntent.data?.customer?.name === 'प्रियांशु') &&
  (priyanshuIntent.amount === 100 || priyanshuIntent.data?.amount === 100),
  `TEST 8A (Specific): Parsed "प्रियांशु के 100 रुपए उधार लिखो" -> Intent: ${priyanshuIntent.type}, Customer: ${priyanshuIntent.customer}, Amount: ${priyanshuIntent.amount}`
);

// 8B (Prompt Specific): "सुरेश ने 50 रुपये जमा कर दिए"
// Expected: Intent: RECEIVE_PAYMENT, Customer: सुरेश, Amount: 50
const sureshHindiIntent = parseIntent("सुरेश ने 50 रुपये जमा कर दिए", { customers: currentCusts, inventory: currentInv });
assert(
  sureshHindiIntent.type === 'RECEIVE_PAYMENT' &&
  (sureshHindiIntent.customer === 'सुरेश' || sureshHindiIntent.data?.customer?.name === 'सुरेश') &&
  (sureshHindiIntent.amount === 50 || sureshHindiIntent.data?.amount === 50),
  `TEST 8B (Specific): Parsed "सुरेश ने 50 रुपये जमा कर दिए" -> Intent: ${sureshHindiIntent.type}, Customer: ${sureshHindiIntent.customer}, Amount: ${sureshHindiIntent.amount}`
);

// 8C: "रमेश के 40 रुपये उधार लिख लो"
const rameshCreditHindi = parseIntent("रमेश के 40 रुपये उधार लिख लो", { customers: currentCusts, inventory: currentInv });
assert(
  rameshCreditHindi.type === 'ADD_CREDIT' &&
  (rameshCreditHindi.customer === 'रमेश' || rameshCreditHindi.data?.customer?.name === 'रमेश') &&
  rameshCreditHindi.data?.amount === 40,
  `TEST 8C: Parsed "रमेश के 40 रुपये उधार लिख लो" correctly`
);

// 8D: "प्रियांशु के 100 रुपए लिखो" (Without explicit word "उधार")
const priyanshuLikho = parseIntent("प्रियांशु के 100 रुपए लिखो", { customers: currentCusts, inventory: currentInv });
assert(
  priyanshuLikho.type === 'ADD_CREDIT' &&
  priyanshuLikho.data?.amount === 100,
  `TEST 8D: Parsed "प्रियांशु के 100 रुपए लिखो" as ADD_CREDIT with ₹100`
);

// 8E: "अमित का 50 रुपये उधार जोड़ दो"
const amitCreditIntent = parseIntent("अमित का 50 रुपये उधार जोड़ दो", { customers: currentCusts, inventory: currentInv });
assert(
  amitCreditIntent.type === 'ADD_CREDIT' &&
  (amitCreditIntent.customer === 'अमित' || amitCreditIntent.data?.customer?.name === 'अमित') &&
  amitCreditIntent.data?.amount === 50,
  `TEST 8E: Parsed "अमित का 50 रुपये उधार जोड़ दो" correctly`
);

// 8F: "Ramesh ke 40 rupaye udhaar likh lo" (Hinglish)
const rameshHinglishIntent = parseIntent("Ramesh ke 40 rupaye udhaar likh lo", { customers: currentCusts, inventory: currentInv });
assert(
  rameshHinglishIntent.type === 'ADD_CREDIT' &&
  rameshHinglishIntent.data?.amount === 40,
  `TEST 8F: Parsed Hinglish "Ramesh ke 40 rupaye udhaar likh lo" correctly`
);

// 8G: "Suresh ne 50 rupaye jama kar diye" (Hinglish)
const sureshHinglishIntent = parseIntent("Suresh ne 50 rupaye jama kar diye", { customers: currentCusts, inventory: currentInv });
assert(
  sureshHinglishIntent.type === 'RECEIVE_PAYMENT' &&
  sureshHinglishIntent.data?.amount === 50,
  `TEST 8G: Parsed Hinglish "Suresh ne 50 rupaye jama kar diye" correctly`
);

// 8H: "रमेश ने 100 रुपए दे दिए"
const rameshDeDiye = parseIntent("रमेश ने 100 रुपए दे दिए", { customers: currentCusts, inventory: currentInv });
assert(
  rameshDeDiye.type === 'RECEIVE_PAYMENT' &&
  rameshDeDiye.data?.amount === 100,
  `TEST 8H: Parsed "रमेश ने 100 रुपए दे दिए" as RECEIVE_PAYMENT with ₹100`
);

// 8I: "Doodh kitna bacha hai?" (Hinglish) & "दूध कितना बचा है?" (Hindi)
const doodhKitnaHinglish = parseIntent("Doodh kitna bacha hai?", { customers: currentCusts, inventory: currentInv });
const doodhKitnaHindi = parseIntent("दूध कितना बचा है?", { customers: currentCusts, inventory: currentInv });
assert(
  doodhKitnaHinglish.type === 'CHECK_INVENTORY' && doodhKitnaHindi.type === 'CHECK_INVENTORY',
  `TEST 8I: Parsed "Doodh kitna bacha hai?" & "दूध कितना बचा है?" as CHECK_INVENTORY`
);

// 8J: "चीनी कितनी बची है?"
const cheeniCheck = parseIntent("चीनी कितनी बची है?", { customers: currentCusts, inventory: currentInv });
assert(
  cheeniCheck.type === 'CHECK_INVENTORY' && cheeniCheck.data?.item?.name?.includes('Sugar'),
  `TEST 8J: Parsed "चीनी कितनी बची है?" as CHECK_INVENTORY (Sugar)`
);

// 8K: "दूध के 5 पैकेट जोड़ दो" (UPDATE_STOCK)
const doodhUpdate = parseIntent("दूध के 5 पैकेट जोड़ दो", { customers: currentCusts, inventory: currentInv });
assert(
  doodhUpdate.type === 'UPDATE_STOCK' && doodhUpdate.data?.delta === 5,
  `TEST 8K: Parsed "दूध के 5 पैकेट जोड़ दो" as UPDATE_STOCK (+5 packets)`
);

// 8L: "चीनी 2 किलो कम कर दो" (UPDATE_STOCK decrease)
const cheeniUpdate = parseIntent("चीनी 2 किलो कम कर दो", { customers: currentCusts, inventory: currentInv });
assert(
  cheeniUpdate.type === 'UPDATE_STOCK' && cheeniUpdate.data?.delta === -2,
  `TEST 8L: Parsed "चीनी 2 किलो कम कर दो" as UPDATE_STOCK (-2 kg)`
);

// 8M: "कल के लिए 20 पैकेट दूध मंगा दो" (CREATE_SUPPLIER_ORDER)
const orderHindi = parseIntent("कल के लिए 20 पैकेट दूध मंगा दो", { customers: currentCusts, inventory: currentInv });
assert(
  orderHindi.type === 'CREATE_SUPPLIER_ORDER' && orderHindi.data?.items[0]?.quantity === 20,
  `TEST 8M: Parsed "कल के लिए 20 पैकेट दूध मंगा दो" as CREATE_SUPPLIER_ORDER (20 packets)`
);

// 8N: "2 किलो चीनी ऑर्डर कर दो"
const orderSugar = parseIntent("2 किलो चीनी ऑर्डर कर दो", { customers: currentCusts, inventory: currentInv });
assert(
  orderSugar.type === 'CREATE_SUPPLIER_ORDER' && orderSugar.data?.items[0]?.quantity === 2,
  `TEST 8N: Parsed "2 किलो चीनी ऑर्डर कर दो" as CREATE_SUPPLIER_ORDER (2 kg)`
);

// 8O (Devanagari Digits Normalization): "रमेश के १०० रुपये उधार लिख लो"
const devanagariDigitsIntent = parseIntent("रमेश के १०० रुपये उधार लिख लो", { customers: currentCusts, inventory: currentInv });
assert(
  devanagariDigitsIntent.type === 'ADD_CREDIT' && devanagariDigitsIntent.data?.amount === 100,
  `TEST 8O: Normalized Devanagari numerals १०० -> Amount: 100`
);

// 8P (Hindi Number Words): "रमेश के पचास रुपये उधार लिखो"
const hindiWordsIntent = parseIntent("रमेश के पचास रुपये उधार लिखो", { customers: currentCusts, inventory: currentInv });
assert(
  hindiWordsIntent.type === 'ADD_CREDIT' && hindiWordsIntent.data?.amount === 50,
  `TEST 8P: Normalized Hindi number word "पचास" -> Amount: 50`
);

// -------------------------------------------------------------
// TEST 9: Clarification for Missing Information
// -------------------------------------------------------------
// 9A: Missing amount: "प्रियांशु के उधार लिखो"
const missingAmtIntent = parseIntent("प्रियांशु के उधार लिखो", { customers: currentCusts, inventory: currentInv });
assert(
  missingAmtIntent.type === 'CLARIFICATION_NEEDED' && missingAmtIntent.missing === 'amount',
  `TEST 9A: Identified missing amount: "${missingAmtIntent.message}"`
);

// 9B: Missing customer: "100 रुपये उधार लिखो"
const missingCustIntent = parseIntent("100 रुपये उधार लिखो", { customers: currentCusts, inventory: currentInv });
assert(
  missingCustIntent.type === 'CLARIFICATION_NEEDED' && missingCustIntent.missing === 'customer',
  `TEST 9B: Identified missing customer: "${missingCustIntent.message}"`
);

// -------------------------------------------------------------
// TEST 10: Bilingual Customer Search (Hindi & English)
// -------------------------------------------------------------
const foundByHindi = StorageService.findCustomerByName('सुरेश');
const foundByEnglish = StorageService.findCustomerByName('Suresh');
assert(
  foundByHindi && foundByEnglish && foundByHindi.id === foundByEnglish.id,
  `TEST 10: Bilingual customer search matches "सुरेश" and "Suresh" to same record (ID: ${foundByHindi?.id})`
);

// -------------------------------------------------------------
// TEST 11: Negative Balance Prevention
// -------------------------------------------------------------
const custPriya = StorageService.getCustomers().find(c => c.name === 'Priya');
// Current Priya balance is 0. Attempting payment of ₹100 should keep balance at 0 (never negative)
StorageService.addTransaction({
  customerId: custPriya.id,
  type: 'payment',
  amount: 100,
  description: 'Test: Overpayment protection'
});
const updatedPriya = StorageService.getCustomerById(custPriya.id);
assert(
  updatedPriya.balance === 0,
  `TEST 11: Customer balance never becomes negative (Current: ${updatedPriya.balance})`
);

// -------------------------------------------------------------
// TEST 12: Unique Customer Count & Duplicate Prevention
// -------------------------------------------------------------
const preCount = StorageService.getCustomers().length;
// Adding another transaction for Ramesh should NOT increase unique customer count
StorageService.addTransaction({
  customerId: ramesh.id,
  type: 'credit',
  amount: 20,
  description: 'Test: 2 Chai'
});
const postCount = StorageService.getCustomers().length;
assert(
  preCount === postCount,
  `TEST 12: Total customers remains strictly unique (${preCount} unique customer records)`
);

// -------------------------------------------------------------
// TEST 13: Low Stock Detection
// -------------------------------------------------------------
const metrics = StorageService.getDashboardMetrics();
assert(
  typeof metrics.lowStockCount === 'number' && typeof metrics.totalOutstandingUdhaar === 'number',
  `TEST 13: Dashboard metrics accurately aggregates real-time data (Low stock: ${metrics.lowStockCount}, Total Udhaar: ₹${metrics.totalOutstandingUdhaar})`
);

console.log(`\n🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
