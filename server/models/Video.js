const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoUrl: String,
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    thumbnailUrl: {
        type: String,
        required: true
    },
    youtubeVideoId: {
        type: String,
        default: null
    },
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: String,
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

// Virtual for resolving play source
videoSchema.virtual('isYoutube').get(function() {
  return !!this.youtubeVideoId;
});

module.exports = mongoose.model('Video', videoSchema);