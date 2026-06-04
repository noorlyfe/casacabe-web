import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const BODY_LENGTH = 14;
const CHECK_LENGTH = 2;

function normalizeLicenseKey(key) {
  return String(key || '')
    .replace(/-/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function formatLicenseKey(raw16) {
  const clean = normalizeLicenseKey(raw16);
  if (clean.length !== 16) return clean;
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}`;
}

function charIndex(char) {
  return CHARSET.indexOf(char);
}

function checksumForBody(body14) {
  let sum = 0;
  for (let i = 0; i < body14.length; i += 1) {
    const idx = charIndex(body14[i]);
    if (idx < 0) return null;
    sum = (sum + idx * (i + 3)) % 1024;
  }

  const reversed = body14.split('').reverse().join('');
  let revSum = 0;
  for (let i = 0; i < reversed.length; i += 1) {
    const idx = charIndex(reversed[i]);
    if (idx < 0) return null;
    revSum = (revSum + idx * (i + 7)) % 1024;
  }

  const c1 = sum % CHARSET.length;
  const c2 = (revSum + sum) % CHARSET.length;
  return CHARSET[c1] + CHARSET[c2];
}

function randomCharIndex() {
  const random = new Uint8Array(1);
  const max = 256 - (256 % CHARSET.length);
  let value;
  do {
    crypto.getRandomValues(random);
    value = random[0];
  } while (value >= max);
  return value % CHARSET.length;
}

function generateLicenseKey() {
  const bodyChars = [];
  for (let i = 0; i < BODY_LENGTH; i += 1) {
    bodyChars.push(CHARSET[randomCharIndex()]);
  }
  const body = bodyChars.join('');
  const check = checksumForBody(body);
  return formatLicenseKey(body + check);
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
