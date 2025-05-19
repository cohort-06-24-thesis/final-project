const { inNeed, User, Notification } = require('../Database/index.js');
const { getIO } = require('../socket');

exports.createInNeed = async (req, res) => {
  try {
    const {
      title,
      description,
      images,
      location,
      latitude,
      longitude,
      UserId
    } = req.body;

    // Fetch the user who created the in-need
    const user = await User.findByPk(UserId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newInNeed = await inNeed.create({
      title,
      description,
      images,
      location,
      latitude,
      longitude,
      UserId,
      isApproved: false,
      isDone: false,
      doneReason: null
    });

    // Construct custom message
    const message = `New In-Need Request: "${title}" by ${user.name}`;

    // 1. Create and save notification in DB
    const notification = await Notification.create({
      message,
      isRead: false,
      userId: UserId,
      itemId: newInNeed.id,
      itemType: 'inNeed'
    });

    // 2. Emit notification to admin clients
    const io = getIO();
    io.to('admins').emit('new_inNeed_notification', {
      ...notification.dataValues,
      inNeed: newInNeed,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(newInNeed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all InNeed entries with user info
exports.getAllInNeeds = async (req, res) => {
  try {
    const items = await inNeed.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'rating', 'profilePic'] }]
    });
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get an InNeed by ID
exports.getInNeedById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await inNeed.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'name', 'email', 'rating', 'profilePic'] }]
    });
    if (!item) return res.status(404).json({ message: 'InNeed item not found' });
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update an InNeed
// exports.updateInNeed = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, images, location, isDone, isApproved, doneReason } = req.body;

//     const item = await inNeed.findByPk(id);
//     if (!item) return res.status(404).json({ message: 'InNeed item not found' });

//     if (title) item.title = title;
//     if (description) item.description = description;
//     if (images) item.images = images;
//     if (location) item.location = location;
//     if (isDone !== undefined) item.isDone = isDone;
//     if (isApproved !== undefined) item.isApproved = isApproved;
//     if (doneReason) item.doneReason = doneReason;

//     await item.save();

//     res.status(200).json(item);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
exports.updateInNeed = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      images,
      location,
      isDone,
      isApproved,
      doneReason
    } = req.body;

    const item = await inNeed.findByPk(id);
    if (!item) return res.status(404).json({ message: 'InNeed item not found' });

    const wasApproved = item.isApproved;

    if (title) item.title = title;
    if (description) item.description = description;
    if (images) item.images = images;
    if (location) item.location = location;
    if (isDone !== undefined) item.isDone = isDone;
    if (isApproved !== undefined) item.isApproved = isApproved;
    if (doneReason) item.doneReason = doneReason;

    await item.save();

    // ✅ Send notification if approval status changed to true
    if (isApproved === true && wasApproved !== true) {
      const userId = item.userId;

      // Save notification in DB
      await Notification.create({
        userId,
        title: 'Approval Granted',
        message: `Your request "${item.title}" has been approved.`,
        type: 'inNeed'
      });

      // Optional: emit real-time notification if using socket.io
      if (req.io) {
        req.io.to(`user_${userId}`).emit('newNotification', {
          title: 'Approval Granted',
          message: `Your request "${item.title}" has been approved.`
        });
      }
    }

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// Delete an InNeed
exports.deleteInNeed = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await inNeed.findByPk(id);
    if (!item) return res.status(404).json({ message: 'InNeed item not found' });
    await item.destroy();
    res.status(200).json({ message: 'InNeed deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

