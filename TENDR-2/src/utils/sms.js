// SMS utility functions
// TODO: Implement actual SMS sending logic with your preferred SMS service
// Examples: Twilio, AWS SNS, MessageBird, etc.

const sendSMS = async (phoneNumber, type, data) => {
  try {
    // TODO: Implement SMS sending logic
    console.log(`[SMS] Sending ${type} to ${phoneNumber}:`, data);
    
    // Placeholder implementation
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // const message = await client.messages.create({
    //   body: getSMSText(type, data),
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
    
    return { success: true, messageId: 'placeholder' };
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

const getSMSText = (type, data) => {
  const messages = {
    'booking-created': 'Your booking has been confirmed!',
    'booking-cancelled': 'Your booking has been cancelled.',
    'payment-success': 'Payment successful!',
    'refund-processed': `Refund of ₹${data.refundAmount} processed.`,
    'new-review': 'You have received a new review.',
    'vendor-penalized': 'Account notice: Please check your email.'
  };
  return messages[type] || 'Tendr notification';
};

module.exports = {
  sendSMS,
  getSMSText
};