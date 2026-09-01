import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const RESEND_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Mdeavercharityfoundation@outlook.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Mdeaver Charity Foundation <notifications@mdeavercharity.org>';

const isPlaceholder = (val) =>
  !val ||
  val.includes('mock') ||
  val.includes('your_') ||
  val.includes('placeholder') ||
  val.startsWith('re_mock_') ||
  val === 'mock_smtp_app_password';

const hasValidResend = RESEND_KEY && !isPlaceholder(RESEND_KEY);
const resend = hasValidResend ? new Resend(RESEND_KEY) : null;

// Fallback SMTP Transporter if valid Nodemailer credentials are provided
const createSmtpTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass && !isPlaceholder(user) && !isPlaceholder(pass)) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
  }
  return null;
};

const maskCardNumber = (cardNum) => {
  if (!cardNum) return null;
  const digits = String(cardNum).replace(/\D/g, '');
  if (digits.length >= 4) {
    return `•••• •••• •••• ${digits.slice(-4)}`;
  }
  return '••••';
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    // 1. Try Resend if live key provided
    if (resend) {
      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      console.log(`[RESEND EMAIL SUCCESS] Sent to: ${to} | Subject: "${subject}"`);
      return { success: true, provider: 'resend', data };
    }

    // 2. Try SMTP if live SMTP credentials provided
    const smtpTransporter = createSmtpTransporter();
    if (smtpTransporter) {
      const info = await smtpTransporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      console.log(`[SMTP EMAIL SUCCESS] Sent to: ${to} | Subject: "${subject}"`);
      return { success: true, provider: 'smtp', info };
    }

    // 3. Fallback for Local / Dev testing when live email credentials are not supplied
    console.log(`\n=================================================`);
    console.log(`[SIMULATED EMAIL DISPATCH] (Live key missing or mock value)`);
    console.log(`  To: ${to}`);
    console.log(`  From: ${FROM_EMAIL}`);
    console.log(`  Subject: "${subject}"`);
    console.log(`=================================================\n`);

    return {
      success: true,
      provider: 'console_fallback',
      message: 'Email simulated in development mode. Add live RESEND_API_KEY in .env for actual inbox delivery.',
    };
  } catch (err) {
    console.error('[EMAIL SERVICE ERROR]:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 1. Website Visit Alert
 */
export const sendVisitNotification = async ({ ip, userAgent, timestamp }) => {
  const subject = '🔔 Website Visit Alert — Mdeaver Charity';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #23933a;">New Visitor Alert</h2>
      <p>Someone just visited the <strong>Mdeaver Charity Foundation</strong> website!</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Timestamp:</td><td style="padding: 8px; border: 1px solid #ddd;">${timestamp}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">IP Address:</td><td style="padding: 8px; border: 1px solid #ddd;">${ip || 'Unknown'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">User Agent:</td><td style="padding: 8px; border: 1px solid #ddd;">${userAgent || 'Unknown'}</td></tr>
      </table>
    </div>
  `;

  return sendEmail({ to: ADMIN_EMAIL, subject, html });
};

/**
 * 2. Contact Inquiry Notification
 */
export const sendContactEmail = async ({ name, email, phone, subject: userSubject, message }) => {
  const adminSubject = `📩 New Contact Message from ${name}`;
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #23933a;">New Message Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Subject:</strong> ${userSubject || 'General Inquiry'}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f8f9fa; padding: 15px; border-left: 4px solid #23933a;">${message}</blockquote>
    </div>
  `;

  const userSubjectReply = `Thank you for contacting Mdeaver Charity Foundation`;
  const userHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #23933a;">Hello ${name},</h2>
      <p>Thank you for reaching out to <strong>Mdeaver Charity Foundation Ltd.</strong></p>
      <p>We have received your message regarding "<em>${userSubject || 'your inquiry'}</em>" and a member of our team will respond to you shortly.</p>
      <p>Best regards,<br/>Mdeaver Charity Foundation Team</p>
    </div>
  `;

  await sendEmail({ to: ADMIN_EMAIL, subject: adminSubject, html: adminHtml });
  return sendEmail({ to: email, subject: userSubjectReply, html: userHtml });
};

/**
 * 3. Donation Confirmation & Invoice Receipt
 */
export const sendDonationEmail = async ({
  invoiceNumber,
  donorName,
  email,
  amount,
  paymentMethod,
  cardNumber,
  cardExpiry,
  billingAddress,
  timestamp,
}) => {
  const maskedCard = maskCardNumber(cardNumber);
  const donorSubject = `🎉 Donation Receipt #${invoiceNumber} — Mdeaver Charity Foundation`;
  const donorHtml = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; border: 3px solid #23933a;">
      <h2 style="color: #23933a; margin-top: 0;">Donation Payment Confirmed</h2>
      <p>Dear <strong>${donorName}</strong>,</p>
      <p>Thank you for your generous contribution to Mdeaver Charity Foundation Ltd. Your support empowers us to provide critical aid to families and individuals in need.</p>
      
      <div style="background: #f9fbf9; padding: 20px; border: 1px dashed #23933a; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #23933a;">Official Receipt Invoice #${invoiceNumber}</h3>
        <p><strong>Date:</strong> ${timestamp}</p>
        <p><strong>Donor Name:</strong> ${donorName}</p>
        <p><strong>Email Address:</strong> ${email}</p>
        <p><strong>Payment Gateway:</strong> ${paymentMethod}</p>
        <p style="font-size: 18px; font-weight: bold; color: #23933a;">Total Amount Donated: $${Number(amount).toLocaleString()}.00</p>
      </div>

      <p>Please keep this receipt for your personal tax and financial records.</p>
      <p>Warmest regards,<br/><strong>Mdeaver Charity Foundation Ltd.</strong></p>
    </div>
  `;

  const adminSubject = `💰 New Donation Alert: $${amount} from ${donorName}`;
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #23933a;">New Donation Notification & Payment Details</h2>
      <p>A new payment request/donation has been received!</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Invoice Number:</td><td style="padding: 8px; border: 1px solid #ddd;">${invoiceNumber}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Donor Name:</td><td style="padding: 8px; border: 1px solid #ddd;">${donorName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Amount:</td><td style="padding: 8px; border: 1px solid #ddd; color: #23933a; font-weight: bold;">$${Number(amount).toLocaleString()}.00</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Payment Method:</td><td style="padding: 8px; border: 1px solid #ddd;">${paymentMethod}</td></tr>
        ${maskedCard ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Card Number:</td><td style="padding: 8px; border: 1px solid #ddd;">${maskedCard}</td></tr>` : ''}
        ${cardExpiry ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Card Expiry:</td><td style="padding: 8px; border: 1px solid #ddd;">${cardExpiry}</td></tr>` : ''}
        ${billingAddress ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Billing Address:</td><td style="padding: 8px; border: 1px solid #ddd;">${billingAddress}</td></tr>` : ''}
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Timestamp:</td><td style="padding: 8px; border: 1px solid #ddd;">${timestamp}</td></tr>
      </table>
    </div>
  `;

  await sendEmail({ to: ADMIN_EMAIL, subject: adminSubject, html: adminHtml });
  return sendEmail({ to: email, subject: donorSubject, html: donorHtml });
};
