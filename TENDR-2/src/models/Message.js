const mongoose = require('mongoose');
const { Schema } = mongoose;
const { MESSAGE_SENDER, Message } = require('../constants');

const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Conversation'
  },
  sender: {
    type: String,
    enum: Message.SENDER,
    required: true
  },
  content: { 
    type: String, 
    required: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
