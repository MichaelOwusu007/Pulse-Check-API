const express = require('express');
const app = express();

const monitorRoutes = require('./routes/monitorRoutes');

app.use(express.json());
app.use('/monitors', monitorRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});