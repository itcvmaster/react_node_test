const mongoose = require('mongoose');

const UserLogSchema = new mongoose.Schema({
  userId: String,
  username: String,
  role: String,
  action: String,
  loginTime: Date,
  logoutTime: Date,
  ipAddress: String,
  tokenName: String
});

module.exports = mongoose.model('UserLog', UserLogSchema); 