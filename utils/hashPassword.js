const bcrypt = require('bcrypt');
const password = 'your-secret-password';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log(hash); // Save this hash in the .env file
});