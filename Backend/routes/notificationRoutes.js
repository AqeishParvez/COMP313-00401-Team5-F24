const express = require("express");
const Notification = require("../models/Notification");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware.js");



router.get('/', async (req, res) => {
    try {
      const { userId } = req.query; // Get userId from query parameters
      const filter = userId ? {user: userId } : {}; // If userId is provided, filter by it; otherwise, return all notifications
      const notifications = await Notification.find({user: userId,target: "Customer"}).sort({ date: -1 });

      console.log(notifications);
      

      const filteredNotifications = notifications.filter(notification => notification.user === `${userId}`);



      res.json(notifications);
     
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });


  router.get('/maanager', async (req, res) => {
    try {
      const { userId } = req.query; // Get userId from query parameters
      const filter = userId ? {user: userId } : {}; // If userId is provided, filter by it; otherwise, return all notifications
      const notifications = await Notification.find({target: "Manager"}).sort({ date: -1 });

      console.log(notifications);
      

      const filteredNotifications = notifications.filter(notification => notification.user === `${userId}`);



      res.json(notifications);
     
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });



  

module.exports = router;