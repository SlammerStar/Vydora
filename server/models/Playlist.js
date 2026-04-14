const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    isPrivate: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
