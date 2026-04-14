const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

//CONNECT DB FIRST
mongoose.connect('mongodb://127.0.0.1:27017/devtube')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

//THEN ROUTES
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const videoRoutes = require('./routes/video');
app.use('/api/video', videoRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const playlistRoutes = require('./routes/playlist');
app.use('/api/playlist', playlistRoutes);

const reportRoutes = require('./routes/report');
app.use('/api/report', reportRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('DevTube API Running...');
});

app.use('/uploads', express.static('uploads'));

const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${PORT}`);
});