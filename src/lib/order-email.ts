type OrderEmail = {
  id: string;
  customerName: string;
  customerEmail: string;
  total: string;
  paymentMethod: "cod" | "razorpay";
  items: { productName: string; quantity: number; price: string }[];
};

function money(value: string) {
  return `₹${Number(value).toFixed(2)}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}

export async function sendOrderNotifications(order: OrderEmail) {
  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL;
  const shortId = order.id.slice(0, 8).toUpperCase();
  const payment = order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid online via Razorpay";
  const items = order.items
    .map((item) => `<li>${escapeHtml(item.productName)} × ${item.quantity} — ${money(item.price)}</li>`)
    .join("");
  const customerHtml = `<h1>Thanks for your order, ${escapeHtml(order.customerName)}!</h1><p>Your order <strong>#${shortId}</strong> has been received and is pending confirmation.</p><p><strong>Payment:</strong> ${payment}<br/><strong>Total:</strong> ${money(order.total)}</p><h2>Items</h2><ul>${items}</ul>`;
  const adminHtml = `<h1>New order #${shortId}</h1><p><strong>Customer:</strong> ${escapeHtml(order.customerName)} (${escapeHtml(order.customerEmail)})</p><p><strong>Payment:</strong> ${payment}<br/><strong>Total:</strong> ${money(order.total)}</p><h2>Items</h2><ul>${items}</ul>`;

  const notifications = [sendEmail(order.customerEmail, `Order #${shortId} received`, customerHtml)];
  if (adminEmail) notifications.push(sendEmail(adminEmail, `New order #${shortId}`, adminHtml));
  await Promise.all(notifications);
}
