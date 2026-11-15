/**
 * ChaiKhata AI - UPI Payment & QR Code Generation Service
 * Generates standard NPCI UPI Intent links and scannable QR codes
 */
import QRCode from 'qrcode';

export const UpiService = {
  /**
   * Generates standard UPI URI:
   * upi://pay?pa=MERCHANT_VPA&pn=SHOP_NAME&am=AMOUNT&cu=INR&tn=NOTE
   */
  buildUpiUri({ vpa, shopName, amount, note = 'ChaiKhata Payment' }) {
    if (!vpa) throw new Error('Merchant VPA is required');
    
    const params = new URLSearchParams();
    params.set('pa', vpa.trim());
    params.set('pn', shopName ? shopName.trim() : 'Chai Shop');
    
    if (amount !== undefined && amount !== null && Number(amount) > 0) {
      params.set('am', Number(amount).toFixed(2));
    }
    params.set('cu', 'INR');
    if (note) {
      params.set('tn', note.trim());
    }

    return `upi://pay?${params.toString()}`;
  },

  /**
   * Generates Base64 Data URL for QR Code
   */
  async generateQrCodeDataUrl(upiUri, options = {}) {
    try {
      const qrDataUrl = await QRCode.toDataURL(upiUri, {
        width: options.width || 320,
        margin: options.margin || 2,
        color: {
          dark: '#3B2418', // Chai dark brown
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
      return qrDataUrl;
    } catch (err) {
      console.error('Error generating UPI QR Code:', err);
      throw err;
    }
  },

  /**
   * Generates deep link for mobile UPI apps (GPay, PhonePe, Paytm, BHIM)
   */
  openUpiIntent(upiUri) {
    if (!upiUri) return false;
    window.location.href = upiUri;
    return true;
  }
};
