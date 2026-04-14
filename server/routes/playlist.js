const express = require('express');
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');
const router = express.Router();

// Get My Playlists
router.get('/my-playlists', auth, async (req, res) => {
    try {
        const playlists = await Playlist.find({ user: req.user.id })
            .populate('videos', 'title thumbnailUrl duration views createdAt')
            .sort({ createdAt: -1 });
        res.json(playlists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Playlist
router.post('/create', auth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Playlist name is required" });

        const playlist = new Playlist({
            name,
            user: req.user.id,
            videos: []
        });

        await playlist.save();
        res.json(playlist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add/Remove video to/from Playlist
router.post('/:id/toggle-video', auth, async (req, res) => {
    try {
        const { videoId } = req.body;
        const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (!videoId) return res.status(400).json({ message: "Video ID is required" });

        const index = playlist.videos.findIndex(id => id.toString() === videoId);

        if (index > -1) {
            playlist.videos.splice(index, 1);
        } else {
            playlist.videos.push(videoId);
        }

        await playlist.save();
        res.json({ message: index > -1 ? "Removed from playlist" : "Added to playlist", playlist });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Playlist
router.delete('/:id', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        res.json({ message: "Playlist deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
