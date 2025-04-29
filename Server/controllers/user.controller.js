const { User } = require("../Database/index.js");

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required.' 
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: 'user',
      rating: 0
    });

    res.status(201).json({
      message: 'User created successfully.',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        message: 'Email already exists.' 
      });
    }
    res.status(500).json({ 
      message: 'Error creating user.', 
      error: error.message 
    });
  }
};

module.exports = { createUser };
