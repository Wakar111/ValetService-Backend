const nodemailer = require('nodemailer');
require('dotenv').config();

const formatDate = (date) => {
  return new Date(date).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const generateBookingNumber = () => {
  return `PB${Date.now().toString().slice(-6)}`;
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const services = [
  { name: 'Auto Außenwäsche', price: 25 },
  { name: 'Auto Innenwäsche', price: 45 },
  { name: 'Auto Innen- und Außenwäsche', price: 60 },
  { name: 'Auto Innenwäsche Bus/SUV', price: 80 },
  { name: 'Tankservice', price: 20 },
  { name: 'E-WALLBOX', price: 40 }
];

const emailTemplate = require('./emailTemplate');

const createEmailContent = (booking, isCustomerEmail) => {
  const additionalServicesWithPrices = booking.additionalServices && booking.additionalServices.length > 0
    ? booking.additionalServices.map(service => {
      const serviceInfo = services.find(s => s.name === service);
      return { name: service, price: serviceInfo ? serviceInfo.price : 0 };
    })
    : [];

  const additionalServicesTotal = additionalServicesWithPrices.reduce((sum, service) => sum + service.price, 0);
  const nightSurcharge = booking.hasNightSurcharge ? 25 : 0;

  const additionalServicesHtml = additionalServicesWithPrices.length > 0
    ? additionalServicesWithPrices.map(service => 
      `<tr><td style="padding: 4px 8px">${service.name}</td><td style="padding: 4px 8px">${service.price.toFixed(2)} €</td></tr>`
    ).join('') + 
    (booking.hasNightSurcharge ? `<tr><td style="padding: 4px 8px">Nachtzuschlag (An-/Abreise 22:00 - 06:00 Uhr)</td><td style="padding: 4px 8px">25.00 €</td></tr>` : '') + 
    `<tr style="border-top: 1px solid #eee"><td style="padding: 12px 8px 4px; font-weight: bold">Gesamtbetrag der Zusatzleistungen:</td><td style="padding: 12px 8px 4px; font-weight: bold">${(additionalServicesTotal + nightSurcharge).toFixed(2)} €</td></tr>`
    : '';

  return emailTemplate(booking, isCustomerEmail, additionalServicesHtml, generateBookingNumber, formatDate);
};

const sendBookingConfirmation = async (booking) => {
  try {
    // Send to customer
    await transporter.sendMail({
      from: process.env.COMPANY_EMAIL,
      to: booking.email,
      subject: 'Ihre Buchungsbestätigung - Parkbereit',
      html: createEmailContent(booking, true),
    });

    // Send to company
    await transporter.sendMail({
      from: process.env.COMPANY_EMAIL,
      to: process.env.COMPANY_EMAIL,
      subject: `Neue Buchung: ${booking.name} ${booking.lastname} - ${formatDate(booking.departureDateTime)}`,
      html: createEmailContent(booking, false),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendBookingConfirmation };
