const bcrypt = require('bcrypt');

// Middleware to authenticate the user based on the password hash in .env
const authenticate = async (req, res, next) => {
  const password = req.headers['x-password']; // Expecting password in the header 'x-password'
  
  try {
    // Compare the provided password with the hashed password stored in the .env file
    const isPasswordValid = await bcrypt.compare(password, process.env.PASSWORD_HASH);

    if (isPasswordValid) {
      return next(); // Password is correct, proceed with the request
    }

    res.status(401).json({ error: 'Unauthorized' }); // Unauthorized if password doesn't match
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = authenticate;