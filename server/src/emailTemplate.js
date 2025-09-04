const emailTemplate = (booking, isCustomerEmail, additionalServicesHtml, generateBookingNumber, formatDate) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .header { text-align: center; margin-bottom: 30px; position: relative; padding-right: 120px; }
  .header h3 { color: #28a745; font-size: 1.1em; margin: 15px 0; font-weight: normal; line-height: 1.4; }
  .section { margin-bottom: 24px; }
  .section-title { background: #f8f9fa; padding: 8px 12px; font-weight: bold; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; }
  tr:last-child td { border-bottom: none; }
  td:first-child { font-weight: bold; width: 40%; }
  .total-row { font-weight: bold; font-size: 1.1em; border-top: 1px solid #eee; }
  .total-row td { padding: 12px 8px 4px; }
  .discount { color: #28a745; }
  .footer { text-align: center; margin-top: 30px; color: #666; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${isCustomerEmail ? 'Buchungsbestätigung' : 'Neue Buchung'}</h2>
      <h3>${isCustomerEmail ? 'Vielen Dank für Ihre Buchung. Die Buchung ist bei uns eingegangen. Wir werden uns so schnell wie möglich mit Ihnen in Verbindung setzen, um die Details zu besprechen.' : ''}</h3>
      <p>Buchungsnummer: #${generateBookingNumber()}</p>
    </div>

    ${!isCustomerEmail ? `
    <div class="section">
      <div class="section-title">Persönliche Daten</div>
      <table>
        <tr><td>Name:</td><td>${booking.name} ${booking.lastname}</td></tr>
        <tr><td>E-Mail:</td><td>${booking.email}</td></tr>
        <tr><td>Telefon:</td><td>${booking.phone}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Fahrzeugdaten</div>
      <table>
        <tr><td>Modell:</td><td>${booking.carModel}</td></tr>
        <tr><td>Kennzeichen:</td><td>${booking.licensePlate}</td></tr>
      </table>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">Parkdetails</div>
      <table>
        <tr><td>Anreise:</td><td>${formatDate(booking.departureDateTime)}</td></tr>
        ${booking.departureFlight ? `<tr><td>Abflug:</td><td>${booking.departureFlight}</td></tr>` : ''}
        <tr><td>Abreise:</td><td>${formatDate(booking.returnDateTime)}</td></tr>
        ${booking.returnFlight ? `<tr><td>Rückflug:</td><td>${booking.returnFlight}</td></tr>` : ''}
      </table>
    </div>

    ${booking.hasNightSurcharge ? `
    <div class="section">
      <div class="section-title">Nachtzuschlag</div>
      <table>
        <tr><td>Nachtzuschlag (An-/Abreise 22:00 - 06:00 Uhr)</td><td>30.00 €</td></tr>
      </table>
    </div>
    ` : ''}

    ${additionalServicesHtml ? `
    <div class="section">
      <div class="section-title">Zusatzleistungen</div>
      <table>
        ${additionalServicesHtml}
      </table>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">Zahlungsinformationen</div>
      <table>
        <tr><td>Zahlungsmethode:</td><td>${booking.paymentMethod === 'cash' ? 'Barzahlung' : 'PayPal'}</td></tr>
        ${Number(process.env.ONLINE_BOOKING_DISCOUNT) > 0 ? `
        <tr><td>Ursprünglicher Preis:</td><td>${booking.totalPrice.toFixed(2)} €</td></tr>
        <tr class="discount"><td>Online-Buchungsrabatt (${Number(process.env.ONLINE_BOOKING_DISCOUNT) * 100}%):</td><td>-${(booking.totalPrice * Number(process.env.ONLINE_BOOKING_DISCOUNT)).toFixed(2)} €</td></tr>
        <tr class="total-row"><td>Gesamtbetrag:</td><td>${(booking.totalPrice * (1 - Number(process.env.ONLINE_BOOKING_DISCOUNT))).toFixed(2)} €</td></tr>
        ` : `
        <tr class="total-row"><td>Gesamtbetrag:</td><td>${booking.totalPrice.toFixed(2)} €</td></tr>
        `}
      </table>
      <p style="text-align: right; font-size: 0.9em;">* inkl. 19% MwSt</p>
    </div>

    <div class="footer">
      <p>${isCustomerEmail ? 'Bei Verspätungen oder Stornierungen kontaktieren Sie uns bitte telefonisch unter <a href="tel:+491726935941"><strong>+49 172 6935941</strong></a>.' : 'Eine neue Buchung wurde über die Website bestätigt.'}</p>
      <p>Mit freundlichen Grüßen<br>Ihr Parkbereit-Team</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = emailTemplate;
