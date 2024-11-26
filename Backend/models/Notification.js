const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true
  },
  
  date: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  from: {
    type: String,
    required: true
  },

  target: {
    type: String,
    required: true
  },
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
