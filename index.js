// This file is just a wrapper to import the main application
require('dotenv').config();
const app = require('./src/index.js');

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Allowed origins: ${process.env.ALLOWED_ORIGINS}`);
}); 