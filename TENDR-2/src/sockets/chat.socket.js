// src/sockets/chat.socket.js
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');

let io;

/** Force all sockets in a conversation room to leave it */
function forceLeaveConversation(conversationId) {
  if (!io) return;
  const room = io.sockets.adapter.rooms.get(conversationId);
  if (!room) return;
  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} forced to leave conversation ${conversationId}`);
    }
  }
}

/** Returns all conversation IDs in state=OPEN for a given consumer */
async function getUserOpenConversations(consumerId) {
  const convos = await Conversation.find({
    $or: [{ customerId: consumerId }, { corporateCustomerId: consumerId }],
    status: 'OPEN'
  }).select('_id');
  return convos.map(c => c._id.toString());
}

/** Returns all conversation IDs in state=OPEN for admins */
async function getAllOpenConversations() {
  const convos = await Conversation.find({
    status: 'OPEN'
  }).select('_id');
  return convos.map(c => c._id.toString());
}

module.exports.initialize = (serverIo) => {
  io = serverIo;

  io.on('connection', async (socket) => {
    // Expect userId & role in handshake query
    const { userId, role } = socket.handshake.query;
    if (!userId || !role) {
      console.log('Socket missing userId or role, disconnecting');
      return socket.disconnect();
    }

    try {
      let rooms;
      if (role === 'admin') {
        rooms = await getAllOpenConversations();
      } else {
        rooms = await getUserOpenConversations(userId);
      }
      rooms.forEach(convoId => socket.join(convoId));
      console.log(`Socket ${socket.id} [${role}] joined rooms:`, rooms);
    } catch (err) {
      console.error('Error joining conversation rooms:', err);
    }

    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(conversationId);
    });

    // Frontend emits open_conversation to start or resume a chat session
    socket.on('open_conversation', async ({ chatType } = {}) => {
      try {
        // Find an existing open conversation for this user
        let conversation = await Conversation.findOne({
          $or: [{ customerId: userId }, { corporateCustomerId: userId }],
          status: 'OPEN'
        });

        // Create a new one if none exists
        if (!conversation) {
          conversation = await Conversation.create({
            customerId: userId,
            status: 'OPEN'
          });
        }

        const convoId = conversation._id.toString();
        socket.join(convoId);
        socket.emit('conversation_opened', { _id: conversation._id });
        console.log(`Socket ${socket.id} opened conversation ${convoId}`);
      } catch (err) {
        console.error('Error in open_conversation:', err);
        socket.emit('conversation_error', { message: 'Failed to open conversation' });
      }
    });

    socket.on('send_message', async ({ conversationId, sender, content }) => {
      try {
        const msg = await Message.create({ conversationId, sender, content });
        io.to(conversationId).emit('new_message', msg);
      } catch (err) {
        console.error('Error saving/broadcasting message:', err);
      }
    });
  });
};

module.exports.getIO                 = () => io;
module.exports.forceLeaveConversation = forceLeaveConversation;
