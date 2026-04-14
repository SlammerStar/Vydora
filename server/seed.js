/**
 * Seed Script: Educational Content Creators for Vidora
 * Run with: /opt/homebrew/bin/node seed.js
 *
 * This seeds 8 educational channels with real YouTube video IDs
 * so the embed player works and thumbnails are pulled directly from YouTube.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/devtube')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => { console.error(err); process.exit(1); });

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

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  videoUrl: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  thumbnailUrl: { type: String, required: true },
  youtubeVideoId: { type: String, default: null },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

// Real YouTube educator-inspired channels with actual avatar thumbnails
const channels = [
  {
    name: 'Physics Wallah',
    email: 'physicswallah@vidora.com',
    password: 'seed123',
    avatar: 'https://ui-avatars.com/api/?name=PW&background=e74c3c&color=fff&size=200&bold=true',
  },
  {
    name: 'Alakh Pandey',
    email: 'alakhpandey@vidora.com',
    password: 'seed123',
    avatar: 'https://ui-avatars.com/api/?name=AP&background=e67e22&color=fff&size=200&bold=true',
  },
  {
    name: 'CodeWithHarry',
    email: 'codewithharry@vidora.com',
    password: 'seed123',
    avatar: 'https://ui-avatars.com/api/?name=CWH&background=2c3e50&color=fff&size=200&bold=true',
  },
  {
    name: 'Apna College',
    email: 'apnacollege@vidora.com',
    password: 'seed123',
    avatar: 'https://ui-avatars.com/api/?name=AC&background=8e44ad&color=fff&size=200&bold=true',
  },
  {
    name: 'Striver DSA',
    email: 'striverdsa@vidora.com',
    password: 'seed123',
    avatar: 'https://ui-avatars.com/api/?name=ST&background=16a085&color=fff&size=200&bold=true',
  },
  {
    name: 'MIT OpenCourseWare',
    email: 'mitocw@vidora.com',
    password: 'seed123',
    avatar: 'https://ui-avatars.com/api/?name=MIT&background=a93226&color=fff&size=200&bold=true',
  },
  {
    name: 'Khan Academy',
    email: 'khanacademy@vidora.com',
    password: 'seed123',
    avatar: 'https://ui-avatars.com/api/?name=KA&background=27ae60&color=fff&size=200&bold=true',
  },
  {
    name: '3Blue1Brown',
    email: '3blue1brown@vidora.com',
    password: 'seed123',
    avatar: 'https://ui-avatars.com/api/?name=3B1B&background=1a6b9a&color=fff&size=200&bold=true',
  },
];

/*
 * Real YouTube video IDs — thumbnail extracted automatically as:
 * https://img.youtube.com/vi/{id}/maxresdefault.jpg
 * Views are approximate real-world numbers.
 */
const videoTemplates = [
  { channelEmail: 'physicswallah@vidora.com', videos: [
    {
      title: 'Gravitation | Complete Chapter | Class 11 Physics | JEE/NEET',
      description: 'Complete chapter of Gravitation for Class 11 Physics. Topics: Newton\'s law of gravitation, gravitational field, gravitational potential energy, escape velocity, orbital velocity, satellites.',
      youtubeVideoId: 'x7crbbQcqKY',
      views: 2300000, duration: 5640, daysAgo: 90
    },
    {
      title: 'Laws of Motion | NLM Complete Chapter | Class 11 | JEE/NEET',
      description: 'Laws of Motion complete chapter for JEE and NEET preparation. Newton\'s laws, friction, circular motion explained deeply.',
      youtubeVideoId: 'EumS6AOcYbQ',
      views: 1800000, duration: 6200, daysAgo: 45
    },
    {
      title: 'Electrostatics Class 12 | Full Chapter | JEE Physics',
      description: 'Full electrostatics chapter for class 12. Coulomb\'s law, electric field, potential, capacitors for JEE/NEET.',
      youtubeVideoId: 'INNsLBdJ79E',
      views: 3100000, duration: 7200, daysAgo: 300
    },
  ]},

  { channelEmail: 'alakhpandey@vidora.com', videos: [
    {
      title: 'Chemical Bonding | Full Chapter | Class 11 Chemistry | JEE/NEET',
      description: 'Complete chemical bonding chapter for Class 11 Chemistry. Covers ionic, covalent, coordinate bonds, VBT, MOT and VSEPR theory.',
      youtubeVideoId: 'AHKhbcgBbrY',
      views: 1500000, duration: 4800, daysAgo: 120
    },
    {
      title: 'Thermodynamics | Complete Chapter | JEE/NEET Chemistry',
      description: 'Thermodynamics full chapter for JEE and NEET. Laws of thermodynamics, enthalpy, entropy, Gibbs free energy explained with tricks.',
      youtubeVideoId: 'nGS-Wl3ACFY',
      views: 1200000, duration: 5100, daysAgo: 200
    },
  ]},

  { channelEmail: 'codewithharry@vidora.com', videos: [
    {
      title: 'Complete Python Tutorial in Hindi | Python Programming Full Course',
      description: 'Complete Python programming tutorial from zero to hero. Variables, data types, loops, functions, OOP, file handling and more in Hindi.',
      youtubeVideoId: 'gfDE2a7MKjA',
      views: 8700000, duration: 14400, daysAgo: 300
    },
    {
      title: 'React JS Full Tutorial for Beginners | Complete Course Hindi 2024',
      description: 'Learn React JS step by step from scratch. JSX, components, state, props, hooks, routing and projects.',
      youtubeVideoId: 'RGKi6LSPDLU',
      views: 4200000, duration: 18000, daysAgo: 180
    },
    {
      title: 'Full Stack Development Complete Roadmap 2024',
      description: 'Complete roadmap for becoming a full stack developer in 2024. HTML, CSS, JavaScript, React, Node.js, MongoDB, Express.',
      youtubeVideoId: 'ysEN5RaKOlA',
      views: 2800000, duration: 3600, daysAgo: 60
    },
  ]},

  { channelEmail: 'apnacollege@vidora.com', videos: [
    {
      title: 'Data Structures & Algorithms Full Course | Java | Apna College',
      description: 'Complete DSA course in Java. Arrays, Linked Lists, Trees, Graphs, Sorting, Searching algorithms with full problems and solutions.',
      youtubeVideoId: 'rZ41y93P2Qo',
      views: 5600000, duration: 21600, daysAgo: 365
    },
    {
      title: 'Operating System Full Course | OS for GATE & University Exams',
      description: 'Complete Operating System course. Process management, memory management, file system, deadlocks, scheduling algorithms.',
      youtubeVideoId: 'vBURTt97EkA',
      views: 2100000, duration: 10800, daysAgo: 250
    },
    {
      title: 'DBMS Full Course | Database Management System | SQL Tutorial',
      description: 'Database Management System complete course. ER diagrams, normalization, SQL queries, transactions, indexing explained.',
      youtubeVideoId: 'dl00fOOYLOM',
      views: 1900000, duration: 9600, daysAgo: 200
    },
  ]},

  { channelEmail: 'striverdsa@vidora.com', videos: [
    {
      title: 'A2Z DSA Course | Arrays | Coding Lessons for Beginners',
      description: 'Strivers A2Z DSA course. Complete array problems for beginners and competitive programmers. Step-by-step explanation.',
      youtubeVideoId: '37E9ckMDdTk',
      views: 3400000, duration: 4200, daysAgo: 150
    },
    {
      title: 'Binary Trees | Complete Chapter | Striver Tree Series',
      description: 'Complete binary tree concepts. Traversals, height, diameter, LCA, and 50+ coding problems explained with time/space complexity.',
      youtubeVideoId: 'W-7mfMO-hY8',
      views: 2200000, duration: 7800, daysAgo: 75
    },
  ]},

  { channelEmail: 'mitocw@vidora.com', videos: [
    {
      title: 'Introduction to Algorithms | Lecture 1 | MIT 6.006 Fall 2011',
      description: 'MIT 6.006 Introduction to Algorithms. Lecture 1: Algorithmic Thinking, Peak Finding. Professor Srini Devadas and Charles Leiserson.',
      youtubeVideoId: 'HtSuA80QTyo',
      views: 6800000, duration: 3120, daysAgo: 400
    },
    {
      title: 'Machine Learning | Lecture 1 | MIT 6.034 Artificial Intelligence',
      description: 'MIT 6.034 Artificial Intelligence Fall 2010. Introduction to machine learning. Classification, regression, neural networks overview.',
      youtubeVideoId: 'TjZBTDzGeGg',
      views: 4500000, duration: 3600, daysAgo: 500
    },
  ]},

  { channelEmail: 'khanacademy@vidora.com', videos: [
    {
      title: 'Introduction to Calculus | Limits and Derivatives | Khan Academy',
      description: 'Khan Academy calculus series. Learn about limits, derivatives, and their real-world applications. Crystal clear explanations.',
      youtubeVideoId: 'riXcZT2ICjA',
      views: 12000000, duration: 1800, daysAgo: 700
    },
    {
      title: 'Cell Structure and Function | Biology | Khan Academy',
      description: 'Introduction to cells and cell organelles. Prokaryotes and eukaryotes, mitochondria, nucleus, ribosomes explained clearly.',
      youtubeVideoId: '8IlzKri08kk',
      views: 9700000, duration: 2100, daysAgo: 800
    },
    {
      title: 'Introduction to Machine Learning | AI Basics | Khan Academy',
      description: 'What is machine learning? Supervised vs unsupervised learning. Neural networks, classification, clustering for beginners.',
      youtubeVideoId: '9gGnTQTYNaE',
      views: 7800000, duration: 1560, daysAgo: 300
    },
  ]},

  { channelEmail: '3blue1brown@vidora.com', videos: [
    {
      title: 'But what is a Neural Network? | Deep Learning Chapter 1',
      description: 'A visual introduction to neural networks and deep learning. Understanding activation functions, weights, and biases beautifully animated.',
      youtubeVideoId: 'aircAruvnKk',
      views: 16000000, duration: 1140, daysAgo: 400
    },
    {
      title: 'Essence of Linear Algebra — Chapter 1 | 3Blue1Brown',
      description: 'A preview of the linear algebra series. Vectors, linear transformations, matrices, eigenvalues visualized with animation.',
      youtubeVideoId: 'fNk_zzaMoSs',
      views: 13500000, duration: 876, daysAgo: 500
    },
  ]},
];

async function seed() {
  console.log('🌱  Starting Vidora educational seed...\n');

  const createdUsers = {};

  for (const ch of channels) {
    let user = await User.findOne({ email: ch.email });
    if (user) {
      // Update avatar if it changed
      user.avatar = ch.avatar;
      await user.save();
      console.log(`  ♻️  Updated channel: ${ch.name}`);
    } else {
      const hash = await bcrypt.hash(ch.password, 10);
      user = new User({ name: ch.name, email: ch.email, password: hash, avatar: ch.avatar });
      await user.save();
      console.log(`  ✅ Created channel: ${ch.name}`);
    }
    createdUsers[ch.email] = user;
  }

  let videoCount = 0;
  for (const template of videoTemplates) {
    const user = createdUsers[template.channelEmail];
    if (!user) continue;

    for (const v of template.videos) {
      // hqdefault (480x360) guaranteed to exist for ALL YouTube videos
      const thumbnail = `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`;

      let existing = await Video.findOne({ youtubeVideoId: v.youtubeVideoId });
      if (existing) {
        // Update fields in case we changed them
        existing.title = v.title;
        existing.description = v.description;
        existing.thumbnailUrl = thumbnail;
        existing.views = v.views;
        existing.duration = v.duration;
        existing.user = user._id;
        await existing.save();
        console.log(`  ♻️  Updated video: ${v.title.substring(0, 60)}...`);
      } else {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - v.daysAgo);

        const vid = new Video({
          title: v.title,
          description: v.description,
          videoUrl: 'uploads/placeholder.mp4', // not used for YouTube videos
          thumbnailUrl: thumbnail,
          youtubeVideoId: v.youtubeVideoId,
          duration: v.duration,
          views: v.views,
          user: user._id,
          likes: [],
          dislikes: [],
          comments: []
        });
        vid.createdAt = createdAt;
        await vid.save();
        videoCount++;
        console.log(`    📹 ${v.title.substring(0, 60)}`);
      }
    }
  }

  console.log(`\n✨  Seed complete! ${videoCount} new videos created / ${Object.keys(createdUsers).length} channels ready.\n`);
  mongoose.connection.close();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  mongoose.connection.close();
  process.exit(1);
});
