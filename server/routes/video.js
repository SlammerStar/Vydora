const express = require('express');
const upload = require('../middleware/upload');
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/upload', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!req.files?.video || !req.files?.thumbnail) {
      return res.status(400).json({ message: "Video and thumbnail required" });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];

    const video = new Video({
      title,
      description,
      videoUrl: videoFile.path,
      thumbnailUrl: thumbnailFile.path,
      duration: req.body.duration || 0,
      user: userId
    });

    await video.save();

    res.json({ message: 'Video uploaded successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my-videos', auth, async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user.id }).populate('user', 'name avatar subscribers');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/comments/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('comments.user', 'name avatar');
    res.json(video?.comments || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'name avatar subscribers')
      .populate('comments.user', 'name avatar');

    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().populate('user', 'name avatar subscribers');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.user._id.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    
    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/like/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const userId = req.user.id;
    if (!video.likes) video.likes = [];
    if (!video.dislikes) video.dislikes = [];

    const alreadyLiked = video.likes.includes(userId);
    if (alreadyLiked) {
      video.likes = video.likes.filter(id => id.toString() !== userId);
    } else {
      video.likes.push(userId);
      video.dislikes = video.dislikes.filter(id => id.toString() !== userId);
    }

    await video.save();
    res.json({ likes: video.likes.length, dislikes: video.dislikes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/dislike/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const userId = req.user.id;
    if (!video.likes) video.likes = [];
    if (!video.dislikes) video.dislikes = [];

    const alreadyDisliked = video.dislikes.includes(userId);
    if (alreadyDisliked) {
      video.dislikes = video.dislikes.filter(id => id.toString() !== userId);
    } else {
      video.dislikes.push(userId);
      video.likes = video.likes.filter(id => id.toString() !== userId);
    }

    await video.save();
    res.json({ likes: video.likes.length, dislikes: video.dislikes.length, disliked: !alreadyDisliked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/view/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        
        video.views = (video.views || 0) + 1;
        await video.save();
        res.json({ views: video.views });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/comment/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const newComment = { user: req.user.id, text: req.body.text };
    video.comments.push(newComment);
    await video.save();
    await video.populate('comments.user', 'name avatar');

    res.json(video.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/comment/:id/:commentId', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const commentIndex = video.comments.findIndex(c => c._id.toString() === req.params.commentId);
    if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });

    // Verify user owns the comment
    if (video.comments[commentIndex].user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    video.comments.splice(commentIndex, 1);
    await video.save();
    
    await video.populate('comments.user', 'name avatar');
    res.json(video.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stream/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).send('Not Found');

        const videoPath = path.resolve(video.videoUrl);
        if (!fs.existsSync(videoPath)) {
            return res.status(404).send('File Not Found');
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 10 ** 6, fileSize - 1);
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/duration/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        if (video.duration && video.duration > 0) return res.json({ duration: video.duration });

        video.duration = req.body.duration || 0;
        await video.save();
        res.json({ duration: video.duration });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;