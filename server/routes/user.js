const express = require('express');
const User = require('../models/User');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/subscribe/:id', auth, async (req, res) => {
    try {
        const channelId = req.params.id;
        const myId = req.user.id;
        
        if (channelId === myId) {
            return res.status(400).json({ message: "Cannot subscribe to yourself" });
        }

        const channel = await User.findById(channelId);
        const me = await User.findById(myId);

        if (!channel) return res.status(404).json({ message: "Channel not found" });

        if (!channel.subscribers) channel.subscribers = [];
        if (!me.subscriptions) me.subscriptions = [];

        const isSubscribed = channel.subscribers.includes(myId);

        if (isSubscribed) {
            channel.subscribers = channel.subscribers.filter(id => id.toString() !== myId);
            me.subscriptions = me.subscriptions.filter(id => id.toString() !== channelId);
        } else {
            channel.subscribers.push(myId);
            me.subscriptions.push(channelId);
        }

        await channel.save();
        await me.save();

        res.json({ subscribed: !isSubscribed, subscribersCount: channel.subscribers.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/analytics', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('subscribers', 'name avatar');
        
        if (!user) return res.status(404).json({ message: "User not found" });

        const videos = await Video.find({ user: userId });
        
        const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);
        // Mock average duration roughly to 10% of total views dynamically.
        const watchTime = (totalViews * 0.1).toFixed(1); 
        const totalSubscribers = user.subscribers ? user.subscribers.length : 0;
        const recentSubscribers = user.subscribers ? user.subscribers.slice(-5).reverse() : [];
        
        res.json({
            views: totalViews,
            watchTime,
            subscribers: totalSubscribers,
            recentSubscribers,
            videoCount: videos.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/history/:videoId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.history) user.history = [];
        
        // Remove if exists to bring to front
        user.history = user.history.filter(vid => vid.toString() !== req.params.videoId);
        user.history.unshift(req.params.videoId);
        
        if (user.history.length > 50) user.history = user.history.slice(0, 50); // cap history

        await user.save();
        res.json({ message: "History updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/history', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'history',
            populate: { path: 'user', select: 'name avatar' }
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Filter out nulls in case video was deleted
        const validHistory = (user.history || []).filter(v => v !== null);
        res.json(validHistory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/watchlater/:videoId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.watchLater) user.watchLater = [];
        
        const videoId = req.params.videoId;
        const index = user.watchLater.findIndex(id => id.toString() === videoId);

        if (index > -1) {
            user.watchLater.splice(index, 1);
        } else {
            user.watchLater.unshift(videoId);
        }

        await user.save();
        res.json({ saved: index === -1, watchLaterCount: user.watchLater.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/watchlater', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'watchLater',
            populate: { path: 'user', select: 'name avatar' }
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        const validWatchLater = (user.watchLater || []).filter(v => v !== null);
        res.json(validWatchLater);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/channel/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name avatar subscribers');
        if (!user) return res.status(404).json({ message: "User not found" });

        const videos = await Video.find({ user: req.params.id })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        
        res.json({
            user: {
                id: user._id,
                name: user.name,
                avatar: user.avatar,
                subscriberCount: user.subscribers ? user.subscribers.length : 0,
                // Send the full array so clients can check if the viewer is subscribed
                subscribers: user.subscribers || []
            },
            videos
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/all-channels', async (req, res) => {
    try {
        // Get all unique users who have uploaded at least one video
        const Video = require('../models/Video');
        const uploads = await Video.distinct('user');
        const users = await User.find({ _id: { $in: uploads } }).select('name avatar _id');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
