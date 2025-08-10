export class PaymentsClient {
  openPayment(itemID, amount) {
    const url = `/payments/?item=${encodeURIComponent(itemID)}${amount ? `&amount=${encodeURIComponent(amount)}` : ''}`;
    const w = window.open(url, 'hs_payments', 'width=480,height=720');
    return new Promise((resolve) => {
      const handler = (e) => {
        if (e.data && (e.data.type === 'purchase_completed' || e.data.type === 'purchase_failed')) {
          window.removeEventListener('message', handler);
          resolve(e.data);
        }
      };
      window.addEventListener('message', handler);
    });
  }
}