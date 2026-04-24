const express = require('express');
const app = express();

app.use(express.json());

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Pulse Check API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});