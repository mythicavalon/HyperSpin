function getQuery() {
  const params = new URLSearchParams(location.search);
  return { item: params.get('item'), user: params.get('user'), amount: params.get('amount') };
}

function getJwt() {
  try {
    return window.opener?.HyperSpin?.auth?.jwt || null;
  } catch (_) {
    return null;
  }
}

async function getClientConfig() {
  const res = await fetch('/api/config/paypal');
  return res.json();
}

async function loadPayPalSdk(clientId, currency = 'USD') {
  const s = document.createElement('script');
  s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${currency}&intent=capture`; 
  s.async = true;
  return new Promise((resolve, reject) => { s.onload = resolve; s.onerror = reject; document.head.appendChild(s); });
}

(async function init() {
  const { item, amount } = getQuery();
  if (!item) { document.getElementById('error').textContent = 'Missing item'; return; }
  const jwt = getJwt();
  if (!jwt) { document.getElementById('error').textContent = 'Login required'; return; }
  document.getElementById('item').textContent = `Item: ${item} ${amount ? `($${amount})` : ''}`;
  try {
    const cfg = await getClientConfig();
    await loadPayPalSdk(cfg.clientId);

    // eslint-disable-next-line no-undef
    paypal.Buttons({
      createOrder: async () => {
        const res = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
          body: JSON.stringify({ itemID: item, amount })
        });
        const data = await res.json();
        if (!data.orderID) throw new Error('Create order failed');
        return data.orderID;
      },
      onApprove: async (data) => {
        const res = await fetch('/api/payments/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
          body: JSON.stringify({ orderID: data.orderID })
        });
        const ack = await res.json();
        if (ack.ok) {
          window.opener?.postMessage({ type: 'purchase_completed', itemID: item }, '*');
          window.close();
        } else {
          document.getElementById('error').textContent = ack.error || 'Capture failed';
          window.opener?.postMessage({ type: 'purchase_failed', itemID: item }, '*');
        }
      },
      onCancel: () => {
        document.getElementById('error').textContent = 'Payment canceled';
      },
      onError: (err) => {
        document.getElementById('error').textContent = 'Payment error';
        console.error(err);
      },
    }).render('#paypal-button-container');
  } catch (err) {
    document.getElementById('error').textContent = 'Failed to load payments';
    console.error(err);
  }
})();