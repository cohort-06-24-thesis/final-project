const { User } = require("../Database/index.js");

const createUser = async (req, res) => {
  try {
    const { name, email, password , id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required.' 
      });
    }

    const newUser = await User.create({
      id,
      name,
      email,
      password,
      role: 'user',
      rating: 0,
      
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
const deleteUser= async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user.', error: error.message });
  }
};

const updateUser= async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    await user.update({ name, email, password });
    res.status(200).json({ message: 'User updated successfully.', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user.', error: error.message });
  }
}
const getUser= async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user.', error: error.message });
  }
}
const getAllUsers= async (req, res) => { 
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
}
const getUserByEmail= async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ message: 'Error fetching user by email.', error: error.message });
  }
}
const getUserByName= async (req, res) => {
  try {
    const { name } = req.params;
    const user = await User.findOne({ where: { name } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by name:', error);
    res.status(500).json({ message: 'Error fetching user by name.', error: error.message });
  }
}
const getUserById= async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Error fetching user by ID.', error: error.message });
  }
}

const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's recent donations
    const donations = await DonationItems.findAll({
      where: { UserId: userId },
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    // Get user's recent events
    const events = await Event.findAll({
      where: { UserId: userId },
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    // Combine and format activities
    const activities = [...donations, ...events].map(item => ({
      type: item.constructor.name === 'DonationItems' ? 'donation' : 'event',
      description: item.title,
      date: item.createdAt
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalHelped: donations.length + events.length,
        recent: activities
      }
    });
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity'
    });
  }
};

module.exports = { createUser, deleteUser, updateUser, getUser, getAllUsers, getUserByEmail, getUserByName, getUserById, getUserActivity };
