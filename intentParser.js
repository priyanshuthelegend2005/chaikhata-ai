/**
 * ChaiKhata AI - Local Voice Intent & NLP Parser
 * Supports Natural Hindi (Devanagari), Hinglish, and English voice commands
 * with zero external LLM API dependency.
 */

// Devanagari Numerals Map (० to ९ -> 0 to 9)
const DEVANAGARI_DIGITS = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

// Hindi & Hinglish Number Words Map
const HINDI_NUMBER_WORDS = {
  // Compound & Large numbers
  'डेढ़ सौ': 150, 'dedh sau': 150,
  'ढाई सौ': 250, 'dhai sau': 250,
  'एक सौ पचास': 150, 'ek sau pachaas': 150, 'ek sau pachas': 150,
  'एक सौ चालीस': 140, 'ek sau chalis': 140,
  'एक सौ तीस': 130, 'ek sau tees': 130,
  'एक सौ बीस': 120, 'ek sau bees': 120,
  'एक सौ दस': 110, 'ek sau das': 110,
  'एक सौ': 100, 'ek sau': 100,
  'दो सौ पचास': 250, 'do sau pachaas': 250,
  'दो सौ': 200, 'do sau': 200,
  'तीन सौ': 300, 'teen sau': 300,
  'चार सौ': 400, 'char sau': 400,
  'पाँच सौ': 500, 'पांच सौ': 500, 'paanch sau': 500, 'panch sau': 500,
  'हज़ार': 1000, 'हजार': 1000, 'hazar': 1000, 'hazaar': 1000,

  // Units & Tens
  'सौ': 100, 'sau': 100,
  'नब्बे': 90, 'nabbe': 90,
  'पिचानवे': 95, 'pichanve': 95,
  'अस्सी': 80, 'assi': 80,
  'पचासी': 85, 'pachasi': 85,
  'सत्तर': 70, 'sattar': 70,
  'पचहत्तर': 75, 'pachhattar': 75,
  'साठ': 60, 'saath': 60,
  'पैंसठ': 65, 'painsath': 65,
  'पचास': 50, 'pachaas': 50, 'pachas': 50,
  'पचपन': 55, 'pachpan': 55,
  'पैंतालीस': 45, 'paintalis': 45,
  'चालीस': 40, 'chalis': 40, 'chaalis': 40,
  'पैंतीस': 35, 'pentees': 35,
  'तीस': 30, 'tees': 30,
  'पच्चीस': 25, 'pachees': 25,
  'बीस': 20, 'bees': 20,
  'पंद्रह': 15, 'pandrah': 15,
  'चौदह': 14, 'chaudah': 14,
  'तेरह': 13, 'terah': 13,
  'बारह': 12, 'barah': 12,
  'ग्यारह': 11, 'gyarah': 11,
  'दस': 10, 'das': 10,
  'नौ': 9, 'nau': 9,
  'आठ': 8, 'aath': 8,
  'सात': 7, 'saat': 7,
  'छह': 6, 'छः': 6, 'chhe': 6, 'chhah': 6,
  'पाँच': 5, 'पांच': 5, 'paanch': 5, 'panch': 5,
  'चार': 4, 'char': 4, 'chaar': 4,
  'तीन': 3, 'teen': 3,
  'दो': 2, 'do': 2,
  'एक': 1, 'ek': 1,
};

// Known common Hindi to English customer name equivalents for dual script support
const NAME_EQUIVALENTS = {
  'ramesh': ['रमेश', 'ramesh'],
  'suresh': ['सुरेश', 'suresh'],
  'amit': ['अमित', 'amit'],
  'priya': ['प्रिया', 'priya'],
  'vikram': ['विक्रम', 'vikram'],
  'priyanshu': ['प्रियांशु', 'priyanshu'],
  'rahul': ['राहुल', 'rahul'],
  'rohit': ['रोहित', 'rohit'],
  'manoj': ['मनोज', 'manoj'],
  'rajesh': ['राजेश', 'rajesh'],
  'deepak': ['दीपक', 'deepak'],
  'ajay': ['अजय', 'ajay'],
  'vijay': ['विजय', 'vijay'],
  'sachin': ['सचिन', 'sachin'],
  'sanjay': ['संजय', 'sanjay'],
  'sunil': ['सुनील', 'sunil'],
  'anil': ['अनिल', 'anil'],
  'sonu': ['सोनू', 'sonu'],
  'monu': ['मोनू', 'monu'],
  'raju': ['राजू', 'raju'],
  'mohit': ['मोहित', 'mohit'],
  'gaurav': ['गौरव', 'gaurav'],
  'vikas': ['विकास', 'vikas'],
  'alok': ['आलोक', 'alok'],
  'ashok': ['अशोक', 'ashok'],
  'mukesh': ['मुकेश', 'mukesh'],
  'dinesh': ['दिनेश', 'dinesh'],
  'mahesh': ['महेश', 'mahesh'],
};

// Words that should never be mistaken for customer names
const STOPWORDS = new Set([
  'दूध', 'दोध', 'चीनी', 'शक्कर', 'चाय', 'पत्ती', 'कप', 'कुल्हड़',
  'स्टॉक', 'समान', 'सामान', 'दुकान', 'कल', 'आज', 'परसों', 'सुबह', 'शाम', 'दोपहर', 'रात',
  'उधार', 'उधारी', 'खाता', 'खाते', 'रुपये', 'रुपए', 'रुपया', 'रुपैये', 'पैकेट', 'किलो', 'लीटर', 'पीस',
  'ऑर्डर', 'सप्लायर', 'पेमेंट', 'भुगतान',
  'doodh', 'dudh', 'milk', 'cheeni', 'chini', 'sugar', 'chai', 'tea', 'patti', 'cup', 'cups',
  'stock', 'kal', 'aaj', 'parso', 'subah', 'sham', 'udhar', 'udhaar', 'khata', 'rupaye', 'rupees', 'packet', 'kilo', 'order', 'supplier'
]);

/**
 * Normalizes Devanagari numerals (० to ९) to standard ASCII digits (0 to 9)
 */
export function normalizeDigits(text) {
  if (!text) return '';
  return text.replace(/[०-९]/g, d => DEVANAGARI_DIGITS[d] !== undefined ? DEVANAGARI_DIGITS[d] : d);
}

/**
 * Extracts number from text either via digits (100, १००, ₹40) or Hindi words (पचास, चालीस, सौ)
 */
export function extractNumber(text) {
  if (!text) return null;
  const normalized = normalizeDigits(text);

  // 1. Direct digits (e.g. 100, ₹100, 100 रुपए, 100 रुपये)
  const digitMatch = normalized.match(/(?:₹|rs\.?|rupees|rupaye|रुपये|रुपए|रुपया|रु)?\s*(\d+(?:\.\d+)?)/i);
  if (digitMatch && digitMatch[1]) {
    return parseFloat(digitMatch[1]);
  }

  // 2. Hindi number words (matched from longest compound phrase to shortest)
  const lower = normalized.toLowerCase();
  const sortedWords = Object.keys(HINDI_NUMBER_WORDS).sort((a, b) => b.length - a.length);
  for (const word of sortedWords) {
    if (lower.includes(word)) {
      return HINDI_NUMBER_WORDS[word];
    }
  }

  return null;
}

/**
 * Basic phonetic converter for Devanagari string to Latin
 */
function devanagariToLatinPhonetic(str) {
  if (!str) return '';
  const map = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
    'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    'ं': 'n', 'ँ': 'n', '्': '',
  };

  let out = '';
  for (const ch of str) {
    out += (map[ch] !== undefined ? map[ch] : ch);
  }
  return out.toLowerCase();
}

/**
 * Matches candidate name against existing customers with bilingual support
 */
function matchCustomerRecord(candidate, customers = []) {
  if (!candidate) return null;
  const cleanCand = candidate.trim();
  const lowerCand = cleanCand.toLowerCase();
  const candPhonetic = devanagariToLatinPhonetic(cleanCand);

  for (const cust of customers) {
    const custNameLower = cust.name.toLowerCase();
    const custHiLower = (cust.nameHi || '').toLowerCase();

    // 1. Direct equality on English or Hindi name
    if (custNameLower === lowerCand || (custHiLower && custHiLower === lowerCand)) {
      return cust;
    }

    // 2. Check known dictionary equivalents
    for (const [key, variants] of Object.entries(NAME_EQUIVALENTS)) {
      if (variants.includes(lowerCand) && (variants.includes(custNameLower) || variants.includes(custHiLower))) {
        return cust;
      }
    }

    // 3. Phonetic matching (e.g. 'सुरेश' -> 'suresh' === 'suresh')
    if (candPhonetic && (candPhonetic === custNameLower || candPhonetic === devanagariToLatinPhonetic(cust.name))) {
      return cust;
    }
  }

  return null;
}

/**
 * Helper to match whole words in mixed script text
 */
function matchWholeWord(text, word) {
  if (!text || !word) return false;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?:^|[^\\u0900-\\u097Fa-zA-Z0-9])${escaped}(?:[^\\u0900-\\u097Fa-zA-Z0-9]|$)`, 'i');
  return regex.test(text);
}

/**
 * Extracts customer name from sentence
 */
export function findCustomerInText(text, customers = []) {
  if (!text) return null;
  const normalized = normalizeDigits(text);

  // 1. Primary: Extract name preceding Hindi or Hinglish postpositions (के, का, की, को, ने, से, ke, ka, ki, ko, ne, se)
  const match = normalized.match(/([a-zA-Z\u0900-\u097F]+)\s+(?:के|का|की|को|ने|से|ke|ka|ki|ko|ne|se)(?:\s+|$|[0-9])/i);
  if (match && match[1]) {
    const candidate = match[1].trim();
    if (!STOPWORDS.has(candidate.toLowerCase())) {
      const existing = matchCustomerRecord(candidate, customers);
      if (existing) {
        return { ...existing, spokenName: candidate };
      }
      // New customer candidate
      return { id: null, name: candidate, spokenName: candidate, isNew: true };
    }
  }

  // 2. Direct whole-word match with existing customers in the sentence
  for (const cust of customers) {
    if (cust.name && matchWholeWord(normalized, cust.name)) {
      return { ...cust, spokenName: cust.name };
    }
    if (cust.nameHi && matchWholeWord(normalized, cust.nameHi)) {
      return { ...cust, spokenName: cust.nameHi };
    }
    // Also check known Hindi variants of existing customer names
    const variants = NAME_EQUIVALENTS[cust.name.toLowerCase()] || [];
    for (const v of variants) {
      if (matchWholeWord(normalized, v)) {
        return { ...cust, spokenName: v };
      }
    }
  }

  // 3. Extract name from start of string if followed by amount (e.g. "प्रियांशु 100", "Ramesh 40")
  const startMatch = normalized.match(/^([a-zA-Z\u0900-\u097F]+)\s+(?:\d+|सौ|पचास|चालीस|बीस)/i);
  if (startMatch && startMatch[1]) {
    const candidate = startMatch[1].trim();
    if (!STOPWORDS.has(candidate.toLowerCase())) {
      const existing = matchCustomerRecord(candidate, customers);
      if (existing) {
        return { ...existing, spokenName: candidate };
      }
      return { id: null, name: candidate, spokenName: candidate, isNew: true };
    }
  }

  return null;
}

/**
 * Separate Handler: ADD_CREDIT
 */
function handleAddCreditIntent(raw, normalized, customers) {
  const customer = findCustomerInText(normalized, customers);
  const amount = extractNumber(normalized);

  const spokenName = customer ? (customer.spokenName || customer.name) : null;

  if (!customer && !amount) {
    return {
      type: 'CLARIFICATION_NEEDED',
      intent: 'CLARIFICATION_NEEDED',
      transcript: raw,
      message: 'किसके खाते में कितने रुपये लिखने हैं? कृपया ग्राहक का नाम और राशि बताएं।',
      speechResponse: 'किसके खाते में कितने रुपये लिखने हैं? कृपया ग्राहक का नाम और राशि बताएं।',
    };
  }

  if (!customer) {
    return {
      type: 'CLARIFICATION_NEEDED',
      intent: 'CLARIFICATION_NEEDED',
      transcript: raw,
      missing: 'customer',
      amount,
      message: `₹${amount} किसके खाते में लिखने हैं? कृपया ग्राहक का नाम बताएं।`,
      speechResponse: `${amount} रुपये किसके खाते में लिखने हैं? कृपया ग्राहक का नाम बताएं।`,
    };
  }

  if (!amount) {
    return {
      type: 'CLARIFICATION_NEEDED',
      intent: 'CLARIFICATION_NEEDED',
      transcript: raw,
      missing: 'amount',
      customer,
      message: `${spokenName} के कितने रुपये लिखने हैं? कृपया राशि बताएं।`,
      speechResponse: `${spokenName} के कितने रुपये लिखने हैं? कृपया राशि बताएं।`,
    };
  }

  // Standard customer object
  const customerObj = {
    ...customer,
    name: spokenName,
    canonicalName: customer.name || spokenName,
  };

  return {
    type: 'ADD_CREDIT',
    intent: 'ADD_CREDIT',
    customer: spokenName,
    amount,
    transcript: raw,
    data: {
      customer: customerObj,
      amount,
      description: `Udhaar added via Voice (₹${amount})`,
    },
    message: `${spokenName} के ₹${amount} उधार लिख लिए गए हैं।`,
    speechResponse: `${spokenName} के ${amount} रुपये उधार में लिख लिए गए हैं।`,
  };
}

/**
 * Separate Handler: RECEIVE_PAYMENT
 */
function handleReceivePaymentIntent(raw, normalized, customers) {
  const customer = findCustomerInText(normalized, customers);
  const amount = extractNumber(normalized);

  const spokenName = customer ? (customer.spokenName || customer.name) : null;

  if (!customer) {
    return {
      type: 'CLARIFICATION_NEEDED',
      intent: 'CLARIFICATION_NEEDED',
      transcript: raw,
      missing: 'customer',
      message: 'किसका पेमेंट जमा करना है? कृपया ग्राहक का नाम बताएं।',
      speechResponse: 'किसका पेमेंट जमा करना है? कृपया नाम बताएं।',
    };
  }

  if (!amount) {
    return {
      type: 'CLARIFICATION_NEEDED',
      intent: 'CLARIFICATION_NEEDED',
      transcript: raw,
      missing: 'amount',
      customer,
      message: `${spokenName} ने कितने रुपये जमा किए? कृपया राशि बताएं।`,
      speechResponse: `${spokenName} ने कितने रुपये जमा किए? कृपया राशि बताएं।`,
    };
  }

  const customerObj = {
    ...customer,
    name: spokenName,
    canonicalName: customer.name || spokenName,
  };

  return {
    type: 'RECEIVE_PAYMENT',
    intent: 'RECEIVE_PAYMENT',
    customer: spokenName,
    amount,
    transcript: raw,
    data: {
      customer: customerObj,
      amount,
      description: `Payment received via Voice (₹${amount})`,
    },
    message: `${spokenName} ने ₹${amount} जमा कर दिए हैं।`,
    speechResponse: `${spokenName} का ${amount} रुपये पेमेंट जमा हो गया है।`,
  };
}

/**
 * Separate Handler: CHECK_INVENTORY
 */
function handleCheckInventoryIntent(raw, normalized, inventory) {
  let matchedItem = null;
  const lower = normalized.toLowerCase();

  if (/दूध|दोध|milk|doodh|dudh/i.test(lower)) {
    matchedItem = inventory.find(i => i.key === 'milk') || { name: 'Milk', nameHi: 'दूध', quantity: 10, unit: 'packet' };
  } else if (/चीनी|शक्कर|sugar|cheeni|chini|shakkar/i.test(lower)) {
    matchedItem = inventory.find(i => i.key === 'sugar') || { name: 'Sugar', nameHi: 'चीनी', quantity: 5, unit: 'kg' };
  } else if (/चाय\s*पत्ती|पत्ती|tea|chai\s*patti/i.test(lower)) {
    matchedItem = inventory.find(i => i.key === 'tea') || { name: 'Tea Leaves', nameHi: 'चाय पत्ती', quantity: 2, unit: 'kg' };
  } else if (/कप|कुल्हड़|cup|cups/i.test(lower)) {
    matchedItem = inventory.find(i => i.key === 'cups') || { name: 'Paper Cups', nameHi: 'कप', quantity: 100, unit: 'pcs' };
  }

  if (matchedItem) {
    return {
      type: 'CHECK_INVENTORY',
      intent: 'CHECK_INVENTORY',
      transcript: raw,
      data: { item: matchedItem },
      message: `${matchedItem.nameHi || matchedItem.name}: ${matchedItem.quantity} ${matchedItem.unit} बचा है।`,
      speechResponse: `${matchedItem.nameHi || matchedItem.name} ${matchedItem.quantity} ${matchedItem.unit} बचा हुआ है।`,
    };
  }

  // General stock summary
  const overview = inventory.map(i => `${i.nameHi || i.name} ${i.quantity} ${i.unit}`).join(', ');
  return {
    type: 'CHECK_INVENTORY',
    intent: 'CHECK_INVENTORY',
    transcript: raw,
    data: { inventory },
    message: `स्टॉक विवरण: ${overview}`,
    speechResponse: `दूध ${inventory[0]?.quantity || 10} पैकेट, और चीनी ${inventory[1]?.quantity || 5} किलो बची है।`,
  };
}

/**
 * Separate Handler: UPDATE_STOCK
 */
function handleUpdateStockIntent(raw, normalized, inventory) {
  const lower = normalized.toLowerCase();
  const qty = extractNumber(normalized) || 1;
  const isDecrease = /कम\s*कर|कम\s*करो|घटा\s*दो|निकाल\s*लो|खत्म|kam\s*kar|ghata\s*do/i.test(lower);
  const delta = isDecrease ? -Math.abs(qty) : Math.abs(qty);

  let itemKey = 'milk';
  if (/चीनी|शक्कर|sugar|cheeni|chini/i.test(lower)) itemKey = 'sugar';
  if (/चाय\s*पत्ती|पत्ती|tea|chai/i.test(lower)) itemKey = 'tea';
  if (/कप|कुल्हड़|cup/i.test(lower)) itemKey = 'cups';

  const item = inventory.find(i => i.key === itemKey) || { id: `inv-${itemKey}`, name: itemKey, nameHi: itemKey };

  return {
    type: 'UPDATE_STOCK',
    intent: 'UPDATE_STOCK',
    transcript: raw,
    data: {
      itemId: item.id,
      item,
      delta,
      quantity: qty,
    },
    message: `${item.nameHi || item.name} स्टॉक ${isDecrease ? 'कम' : 'बढ़ा'} किया गया: ${qty} ${item.unit || ''}`,
    speechResponse: `${item.nameHi || item.name} का स्टॉक अपडेट हो गया है।`,
  };
}

/**
 * Separate Handler: CREATE_SUPPLIER_ORDER
 */
function handleSupplierOrderIntent(raw, normalized) {
  const lower = normalized.toLowerCase();
  const items = [];

  // Check milk
  const milkMatch = lower.match(/(\d+)\s*(?:packet|pkt|पैकेट|लीटर|lit(?:er|re)?)?\s*(?:दूध|दोध|doodh|dudh|milk)|(?:दूध|दोध|doodh|milk)\s*(?:के)?\s*(\d+)\s*(?:packet|pkt|पैकेट)?/i);
  if (milkMatch) {
    const qty = parseInt(milkMatch[1] || milkMatch[2] || '10', 10);
    items.push({ name: 'Milk (दूध)', quantity: qty, unit: 'packet' });
  }

  // Check sugar
  const sugarMatch = lower.match(/(\d+)\s*(?:kilo|kg|किलो|पैकेट)?\s*(?:चीनी|शक्कर|cheeni|chini|sugar|shakkar)|(?:चीनी|शक्कर|cheeni|sugar)\s*(?:के)?\s*(\d+)\s*(?:kilo|kg|किलो)?/i);
  if (sugarMatch) {
    const qty = parseInt(sugarMatch[1] || sugarMatch[2] || '5', 10);
    items.push({ name: 'Sugar (चीनी)', quantity: qty, unit: 'kg' });
  }

  // Check tea leaves
  const teaMatch = lower.match(/(\d+)\s*(?:kilo|kg|किलो|पैकेट)?\s*(?:चाय\s*पत्ती|पत्ती|chai\s*patti|patti|tea\s*leaves)|(?:चाय\s*पत्ती|tea)\s*(?:के)?\s*(\d+)/i);
  if (teaMatch) {
    const qty = parseInt(teaMatch[1] || teaMatch[2] || '2', 10);
    items.push({ name: 'Tea Leaves (चाय पत्ती)', quantity: qty, unit: 'kg' });
  }

  // Check cups
  const cupsMatch = lower.match(/(\d+)\s*(?:कप|कुल्हड़|cup|cups|kulhad|paper\s*cup)|(?:कप|कुल्हड़|cup|cups)\s*(\d+)/i);
  if (cupsMatch) {
    const qty = parseInt(cupsMatch[1] || cupsMatch[2] || '100', 10);
    items.push({ name: 'Paper Cups (कप)', quantity: qty, unit: 'pcs' });
  }

  if (items.length === 0) {
    items.push({ name: 'Milk (दूध)', quantity: 20, unit: 'packet' });
  }

  let deliveryTime = 'Tomorrow Morning (कल सुबह)';
  if (/आज\s*शाम|aaj\s*sham|today\s*evening/i.test(lower)) {
    deliveryTime = 'Today Evening (आज शाम)';
  } else if (/तुरंत|urgent|turant|abhi/i.test(lower)) {
    deliveryTime = 'Immediate (तुरंत)';
  }

  const itemsSummary = items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ');

  return {
    type: 'CREATE_SUPPLIER_ORDER',
    intent: 'CREATE_SUPPLIER_ORDER',
    transcript: raw,
    data: {
      items,
      deliveryTime,
    },
    message: `सप्लायर आर्डर ड्राफ्ट तैयार है: ${itemsSummary}`,
    speechResponse: `सप्लायर आर्डर ड्राफ्ट बना दिया है: ${items.map(i => `${i.quantity} ${i.name}`).join(' और ')}. डिलीवरी ${deliveryTime}.`,
  };
}

/**
 * Main Entry Point: Parses user speech into structured intent
 */
export function parseIntent(transcript, { customers = [], inventory = [] } = {}) {
  if (!transcript || !transcript.trim()) {
    return {
      type: 'UNKNOWN',
      intent: 'UNKNOWN',
      transcript,
      message: 'कुछ सुनाई नहीं दिया। कृपया दोबारा बोलें।',
      speechResponse: 'कुछ सुनाई नहीं दिया। कृपया दोबारा बोलें।',
    };
  }

  const raw = transcript.trim();
  const normalized = normalizeDigits(raw);
  const lower = normalized.toLowerCase();

  // 1. SUPPLIER ORDER INTENT
  // Examples:
  // "कल के लिए 20 पैकेट दूध मंगा दो"
  // "2 किलो चीनी ऑर्डर कर दो"
  // "Kal ke liye 20 packet doodh mangwa do"
  const isOrder = /मंगा\s*दो|मंगवा\s*दो|ऑर्डर\s*(?:कर\s*दो|करो|करें|bhejo)?|order\s*(?:kar\s*do|karo|bhejo)|supplier\s*order/i.test(lower);
  if (isOrder) {
    return handleSupplierOrderIntent(raw, normalized);
  }

  // 2. INVENTORY CHECK INTENT
  // Examples:
  // "Doodh kitna bacha hai?"
  // "दूध कितना बचा है?"
  // "चीनी कितनी बची है?"
  const isStockCheck = /कितन[ाेी]\s*(?:बच[ाेी]|है)|स्टॉक\s*(?:चेक|कितना|क्या)|kitn[aei]\s*(?:bach[aei]|hai)|stock\s*check|stock\s*kya\s*hai/i.test(lower);
  if (isStockCheck) {
    return handleCheckInventoryIntent(raw, normalized, inventory);
  }

  // 3. STOCK UPDATE INTENT (+/- Stock)
  // Examples:
  // "दूध के 5 पैकेट जोड़ दो"
  // "चीनी 2 किलो कम कर दो"
  // "Milk ke 5 packet stock mein add kar do"
  const hasInventoryItem = /दूध|दोध|milk|doodh|dudh|चीनी|शक्कर|sugar|cheeni|chini|चाय\s*पत्ती|पत्ती|tea|कप|कुल्हड़|cup/i.test(lower);
  const isStockUpdate = hasInventoryItem && (
    /जोड़\s*दो|जोड़ो|बढ़ा\s*दो|डाल\s*दो|ऐड\s*कर\s*दो|आया|add\s*kar\s*do|badha\s*do|jod\s*do|daal\s*do/i.test(lower) ||
    /कम\s*कर\s*दो|कम\s*करो|घटा\s*दो|निकाल\s*लो|खत्म|kam\s*kar\s*do|ghata\s*do|nikal\s*lo/i.test(lower)
  );
  if (isStockUpdate) {
    return handleUpdateStockIntent(raw, normalized, inventory);
  }

  // 4. RECEIVE PAYMENT INTENT
  // Examples:
  // "Suresh ne 50 rupaye jama kar diye"
  // "सुरेश ने 50 रुपये जमा कर दिए"
  // "रमेश ने 100 रुपए दे दिए"
  const isPayment = /जमा\s*(?:कर\s*दिए|कर\s*दो|करो|किए|हो\s*गया|हुए)?|दे\s*(?:दिए|दिया)|दिए|दिया|चुका\s*(?:दिए|दिया)|भुगतान|पेमेंट\s*(?:मिला|आया|प्राप्त|received|recieved)|jama|de\s*diye|paid|vasool|chukta/i.test(lower);
  if (isPayment) {
    return handleReceivePaymentIntent(raw, normalized, customers);
  }

  // 5. ADD CREDIT (UDHAAR) INTENT
  // Examples:
  // "Ramesh ke 40 rupaye udhaar likh lo"
  // "रमेश के 40 रुपये उधार लिख लो"
  // "प्रियांशु के 100 रुपए लिखो"
  // "अमित का 50 रुपये उधार जोड़ दो"
  const isCredit = (
    /उधार|उधारी|खाता|खाते|लिख\s*लो|लिखो|लिख\s*दो|लिखें|जोड़\s*दो|जोड़ो|डाल\s*दो|डालो/i.test(lower) ||
    /udhaar|udhar|khata|khate\s*mein|likh\s*lo|likho|likh\s*do|jod\s*do|jodo|daalo|credit/i.test(lower) ||
    /(?:के|का|ko|ke)\s*\d+/i.test(lower)
  );

  if (isCredit) {
    return handleAddCreditIntent(raw, normalized, customers);
  }

  // Fallback for simple "प्रियांशु 100" or "Ramesh 40"
  const customer = findCustomerInText(normalized, customers);
  const amount = extractNumber(normalized);
  if (customer && amount) {
    return handleAddCreditIntent(raw, normalized, customers);
  }

  // Default unrecognized command
  return {
    type: 'UNKNOWN',
    intent: 'UNKNOWN',
    transcript: raw,
    message: 'कमांड समझ नहीं आया। उदाहरण: "प्रियांशु के 100 रुपए उधार लिखो", "सुरेश ने 50 रुपये जमा कर दिए", या "दूध कितना बचा है?"',
    speechResponse: 'कमांड समझ नहीं आया। कृपया आसान शब्दों में दोबारा बोलें।',
  };
}
