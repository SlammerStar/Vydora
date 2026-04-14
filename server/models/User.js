const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    avatar: String,
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    watchLater: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);