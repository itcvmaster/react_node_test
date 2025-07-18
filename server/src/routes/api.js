const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const UserLog = require('../models/UserLog');
const jwt = require('jsonwebtoken');

// JWT Middleware
function auth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- TASK ROUTES ---

// Get all tasks (for current user)
router.get('/tasks', auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.userId });
  res.json(tasks);
});

// Create task
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({ ...req.body, userId: req.user.userId, createdAt: new Date(), updatedAt: new Date() });
  await task.save();
  res.json(task);
});

// Update task
router.put('/tasks/:id', auth, async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { ...req.body, updatedAt: new Date() },
    { new: true }
  );
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
  const result = await Task.deleteOne({ _id: req.params.id, userId: req.user.userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

// --- USER LOG ROUTES ---

// Get all logs (admin only)
router.get('/user-logs', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const logs = await UserLog.find();
  res.json(logs);
});

// Add a log
router.post('/user-logs', async (req, res) => {
  const log = new UserLog(req.body);
  await log.save();
  res.json(log);
});

// Delete a log
router.delete('/user-logs/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const result = await UserLog.deleteOne({ _id: req.params.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Log not found' });
  res.json({ message: 'Log deleted' });
});

module.exports = router; 