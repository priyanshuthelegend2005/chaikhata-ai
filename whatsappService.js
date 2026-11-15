/**
 * ChaiKhata AI - WhatsApp Communication Service
 * Generates polite Hindi reminders and formatted supplier orders
 * using WhatsApp Click-to-Chat API (wa.me)
 */

export const WhatsAppService = {
  /**
   * Cleans and formats Indian phone numbers for wa.me
   */
  formatPhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.toString().replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      // already has country code
    }
    return cleaned;
  },

  /**
   * Generates polite Hindi customer reminder text and returns wa.me URL
   */
  sendCustomerReminder({ customer, shopName = 'Sharma Chai Point', upiVpa }) {
    if (!customer) return null;

    const name = customer.name || 'Bhai';
    const amount = Number(customer.balance || 0);

    const message = `Namaste ${name} ji 🙏\n\n` +
      `Aapke ₹${amount} ${shopName} ka udhaar baki hai.\n\n` +
      `Jab suvidha ho, kripya payment kar dein.\n` +
      (upiVpa ? `UPI ID: ${upiVpa}\n\n` : '\n') +
      `Dhanyavaad!\n- ${shopName}`;

    const cleanPhone = this.formatPhoneNumber(customer.phone);
    const encoded = encodeURIComponent(message);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    return { url, message };
  },

  /**
   * Generates formatted Hindi/English supplier order message and returns wa.me URL
   */
  sendSupplierOrder({ order, shopName = 'Sharma Chai Point', ownerPhone }) {
    if (!order) return null;

    const itemsList = (order.items || [])
      .map((item, idx) => `${idx + 1}. ${item.name}: ${item.quantity} ${item.unit || ''}`)
      .join('\n');

    const message = `📦 *SUPPLIER ORDER - ${shopName}*\n` +
      `Order No: ${order.orderNumber || 'ORD-NEW'}\n\n` +
      `Kripya niche diya gaya samaan bhej dijiye:\n\n` +
      `${itemsList}\n\n` +
      `⏰ *Delivery:* ${order.deliveryTime || 'Tomorrow Morning'}\n\n` +
      `Kripya aate hi inform karein.\n` +
      `Dhanyavaad!\n- ${shopName} (${ownerPhone || ''})`;

    const cleanPhone = this.formatPhoneNumber(order.supplierPhone);
    const encoded = encodeURIComponent(message);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    return { url, message };
  }
};
