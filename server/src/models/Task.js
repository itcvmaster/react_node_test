const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  priority: String,
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date,
  userId: String
});

module.exports = mongoose.model('Task', TaskSchema); 