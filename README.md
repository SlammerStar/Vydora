# Vydora 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**Vydora** is a state-of-the-art, professional educational video platform designed to provide a seamless learning experience. Built with a focus on visual excellence and robust functionality, Vydora serves as a modern alternative for creators and learners alike.

---

## ✨ Key Features

### 📺 Immersive Video Experience
- **Interactive Video Player**: Support for local video clips and high-quality thumbnails.
- **Auto-Generating Clips**: Integrated `ffmpeg` logic to generate synchronized video segments and thumbnails.
- **Playlists & History**: Track your learning journey with dedicated history and customizable playlists.
- **Watch Later**: Never miss a lesson with a localized "Watch Later" queue.

### 👥 Community & Social
- **Channel Pages**: Personalized user channels with video listings and profile customization.
- **Follow System**: Build connections and subscribe to your favorite educational creators.
- **Interactive Comments**: Robust commenting system with user profile integration and moderation tools.
- **Report System**: Built-in reporting mechanism to maintain community standards.

### 🔍 Discovery & Navigation
- **Voice Search**: Advanced search functionality using Google API for hands-free discovery.
- **Dynamic Search Suggestions**: Real-time results as you type.
- **Intuitive Sidebar**: Quick navigation across categories, subscriptions, and personal library.
- **Infinite Scrolling**: Explore content effortlessly with smooth, continuous loading.

### 🔐 Security & Auth
- **User Authentication**: Secure JWT-based authentication and Bcrypt password hashing.
- **Google OAuth**: Integrated Google Login for a seamless onboarding experience.
- **Profile Management**: Complete control over user avatars, details, and presence.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, React Router 7, React Icons, Axios, Recharts |
| **Backend** | Node.js, Express 5, Multer, Nodemailer |
| **Database** | MongoDB (via Mongoose 9) |
| **Media Handling** | Fluent-FFmpeg, Ffmpeg-static |
| **Authentication** | JWT, BcryptJS, Google Auth Library |
| **Styling** | Vanilla CSS (Modern Design System) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or Atlas connection)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Vydora
   ```

2. **Install all dependencies:**
   This project uses a unified monorepo framework. Install root, client, and server dependencies with one command:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `server/` directory:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/vydora
   JWT_SECRET=your_super_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   PORT=5001
   ```

### Running Locally

To start both the frontend and backend concurrently:
```bash
npm start
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001](http://localhost:5001)

---

## 📁 Project Structure

```text
Vydora/
├── client/          # React frontend application
│   ├── src/         # Core application logic & components
│   └── public/      # Static assets
├── server/          # Node.js Express backend
│   ├── routes/      # API endpoints (Auth, Video, User, etc.)
│   ├── models/      # Mongoose schemas
│   ├── middleware/  # Auth & Multer configurations
│   └── uploads/     # Local storage for avatars and thumbnails
└── package.json     # Root control scripts
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ by the Pratham Nigam</p>
