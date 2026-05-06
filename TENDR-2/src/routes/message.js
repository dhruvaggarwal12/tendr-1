const express      = require('express');
const router       = express.Router();
const mongoose     = require('mongoose');
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const { getIO } = require('../sockets/chat.socket');

// POST /conversations/:id/message
// Body: { sender: 'user'|'customer-care', content: String }
router.post('/:id/message', async (req, res) => {
  try {
    const convId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(convId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    // 1) Load and gate by state
    const convo = await Conversation.findById(convId);
    if (!convo) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    if (['AWAITING_REQUEST','CLOSED'].includes(convo.state)) {
      
      return res
        .status(400)
        .json({ error: 'Chat not available in the current state.' });
    }

    // 2) Validate body
    const { sender, content } = req.body;
    if (!['user','customer-care'].includes(sender)) {
      return res.status(400).json({ error: "sender must be 'user' or 'customer-care'" });
    }
    if (typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'content is required' });
    }

    // 3) Save message
    const msg = await Message.create({ conversationId: convId, sender, content });

    // 4) Return it (and you could emit over Socket.io here)
    const io = getIO();
if (io) {
  io.to(convId).emit('new_message', msg);
}


    return res.status(201).json(msg);
  } catch (err) {
    console.error('Message error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /conversations/:id/messages
// Fetch all messages for a conversation
router.get('/:id/messages', async (req, res) => {
  try {
    const convId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(convId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }
    const messages = await Message.find({ conversationId: convId })
      .sort('createdAt')
      .lean();
    return res.status(200).json(messages);
  } catch (err) {
    console.error('Fetch messages error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
