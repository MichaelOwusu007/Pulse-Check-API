const express = require('express');

const monitorRoutes = require('./routes/monitorRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/monitors', monitorRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
