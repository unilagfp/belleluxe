const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BRAND_MAGENTA = "#d6127e";
const BRAND_INK = "#1a1a1a";

function getSender() {
  const email = process.env.BREVO_SENDER_EMAIL;
  const name = process.env.BREVO_SENDER_NAME || "BELLÉLUXE";
  if (!process.env.BREVO_API_KEY || !email) {
    throw new Error(
      "Brevo isn't configured yet — set BREVO_API_KEY and BREVO_SENDER_EMAIL to enable email sending."
    );
  }
  return { email, name };
}

function renderEmailLayout(preheader: string, bodyHtml: string) {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f2f6;font-family:Helvetica,Arial,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f2f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:${BRAND_INK};padding:24px 32px;">
                <span style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:${BRAND_MAGENTA};letter-spacing:0.5px;">BELLÉLUXE</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:${BRAND_INK};font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#faf9fb;border-top:1px solid #eee;">
                <p style="margin:0;font-size:12px;color:#8a8a8a;">
                  Beauty, Attitude, Luxe. — © ${new Date().getFullYear()} BELLÉLUXE. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmail(to: string, subject: string, htmlContent: string) {
  const sender = getSender();

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo send failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { messageId?: string };
  return { messageId: data.messageId };
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  customerName: string;
  itemsHtml: string;
  subtotalNgn: number;
}) {
  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;">Order confirmed</h1>
    <p style="margin:0 0 8px;">Hi ${params.customerName},</p>
    <p style="margin:0 0 16px;">Thanks for your order! Here's a quick summary of <strong>${params.orderNumber}</strong>:</p>
    <div style="background-color:#faf9fb;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
      ${params.itemsHtml}
    </div>
    <p style="margin:0 0 20px;font-size:16px;"><strong>Subtotal: ₦${params.subtotalNgn.toLocaleString("en-NG")}</strong></p>
    <p style="margin:0;">We'll follow up on WhatsApp shortly to confirm payment and delivery details.</p>
  `;
  return sendEmail(
    params.to,
    `Order confirmed: ${params.orderNumber}`,
    renderEmailLayout(`Your order ${params.orderNumber} has been received.`, body)
  );
}

export async function sendContactNotificationEmail(params: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_NOTIFICATION_EMAIL isn't set — can't route contact form notifications.");
  }
  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;">New contact message</h1>
    <p style="margin:0 0 4px;"><strong>${params.name}</strong> (${params.email}${params.phone ? `, ${params.phone}` : ""})</p>
    <div style="background-color:#faf9fb;border-radius:10px;padding:16px 20px;margin-top:12px;border-left:3px solid ${BRAND_MAGENTA};">
      ${params.message.replace(/\n/g, "<br/>")}
    </div>
  `;
  return sendEmail(
    adminEmail,
    `New contact message from ${params.name}`,
    renderEmailLayout("New contact form submission", body)
  );
}

export async function sendBroadcast(emails: string[], subject: string, message: string) {
  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;">${subject}</h1>
    <p style="margin:0;">${message.replace(/\n/g, "<br/>")}</p>
  `;
  const html = renderEmailLayout(subject, body);
  let lastMessageId: string | undefined;
  for (const email of emails) {
    const result = await sendEmail(email, subject, html);
    lastMessageId = result.messageId;
  }
  return { messageId: lastMessageId };
}
