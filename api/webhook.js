import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = [];
  const random = new Uint8Array(16);
  crypto.getRandomValues(random);
  let i = 0;
  for (let s = 0; s < 4; s++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars[random[i++] % chars.length];
    }
    segments.push(segment);
  }
  return segments.join('-');
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return new Response('Webhook error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email;
    if (!email) {
      return new Response('Missing customer email', { status: 400 });
    }

    const name = session.customer_details?.name || 'there';
    const licenseKey = generateLicenseKey();

    try {
      await resend.emails.send({
        from: 'Casacabe <support@casacabe.com>',
        to: email,
        subject: 'Your Casacabe License Key',
        html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; color: #111;">Welcome to Casacabe, ${name}!</h1>
          <p style="color: #555;">Thank you for your purchase. Here is your license key:</p>
          <div style="background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; text-align: center; margin: 32px 0;">
            <p style="font-size: 28px; font-weight: 600; letter-spacing: 4px; color: #111; margin: 0;">${licenseKey}</p>
          </div>
          <p style="color: #555;"><strong>How to activate:</strong></p>
          <ol style="color: #555; line-height: 2;">
            <li>Download and install Casacabe on your computer</li>
            <li>Open the app</li>
            <li>Enter your license key on the activation screen</li>
          </ol>
          <p style="color: #555;">Download links: <a href="https://casacabe.com/success" style="color: #22c55e;">casacabe.com/success</a></p>
          <p style="color: #aaa; font-size: 12px; margin-top: 40px;">Questions? Email us at support@casacabe.com</p>
        </div>
      `,
      });
    } catch {
      return new Response('Email failed', { status: 500 });
    }
  }

  return new Response('OK', { status: 200 });
}

export const config = { runtime: 'edge' };
