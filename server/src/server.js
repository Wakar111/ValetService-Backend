const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sendBookingConfirmation } = require('./emailService');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/booking/confirm', async (req, res) => {
  try {
    const result = await sendBookingConfirmation(req.body);
    if (result.success) {
      res.json({ message: 'Booking confirmation sent successfully' });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
