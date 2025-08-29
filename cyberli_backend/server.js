const express = require('express');
const connectDB = require('./config/db');

require('dotenv').config();

const app = express();

connectDB();

app.use(express.json());


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));