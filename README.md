# Traycer - YouTube Video & Audio Downloader

A modern, full-stack web application for downloading YouTube videos and audio files. Built with React, Express.js, and ytdl-core.

## Features

- 🎥 Download YouTube videos in multiple quality options (1080p, 720p, 480p, 360p, 240p)
- 🎵 Download audio-only files in various bitrates (320kbps, 256kbps, 192kbps, 128kbps)
- 🎨 Beautiful, modern UI built with React and shadcn/ui components
- 🌙 Dark mode support
- 📱 Fully responsive design for mobile, tablet, and desktop
- 📜 Download history tracking with localStorage
- ⚡ Fast and efficient streaming downloads
- 🔒 Secure API with rate limiting and CORS protection

## Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **ytdl-core** - YouTube video/audio extraction library
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting middleware

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (already provided) with the following variables:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

4. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (already provided) with the following variable:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`

## Running the Application

### Development Mode

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend server (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Production Build

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend in production mode:**
   ```bash
   cd backend
   npm start
   ```

## API Endpoints

### GET `/api/video/info`
Fetches video information from a YouTube URL.

**Query Parameters:**
- `url` (required) - YouTube video URL

**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": "10:30",
  "channel": "Channel Name",
  "viewCount": "1234567",
  "formats": {
    "video": [...],
    "audio": [...]
  }
}
```

### GET `/api/video/download`
Downloads video or audio file.

**Query Parameters:**
- `url` (required) - YouTube video URL
- `format` (required) - `video` or `audio`
- `quality` (required) - Quality/bitrate selection

**Response:**
Streams the video/audio file directly to the browser.

## Project Structure

```
traycer-new-project/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server setup
│   │   ├── routes/
│   │   │   └── download.js       # API routes
│   │   ├── controllers/
│   │   │   └── videoController.js # Business logic
│   │   └── utils/
│   │       └── validator.js      # Input validation
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # React entry point
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── VideoDownloader.jsx
│   │   │   ├── DownloadForm.jsx
│   │   │   ├── FormatSelector.jsx
│   │   │   └── DownloadHistory.jsx
│   │   ├── lib/
│   │   │   ├── api.js            # API service
│   │   │   └── utils.js          # Utility functions
│   │   └── styles/
│   │       └── globals.css       # Global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

## Usage

1. **Enter YouTube URL:** Paste a YouTube video URL in the input field
2. **Get Video Info:** Click "Get Info" to fetch video details
3. **Select Format:** Choose between Video or Audio format
4. **Choose Quality:** Select your preferred quality/bitrate
5. **Download:** Click the download button to start the download

## Known Limitations

- Some videos may be restricted or unavailable (private, age-restricted, region-locked)
- Playlist URLs are not supported (only single video URLs)
- Very long videos may take longer to process
- Download speed depends on your internet connection and YouTube's servers

## Legal Disclaimer

This application is for educational purposes only. Please respect YouTube's Terms of Service and copyright laws when downloading content. Users are responsible for ensuring they have the right to download and use the content they access through this application.

## Security Features

- **Helmet.js** - Sets various HTTP headers for security
- **CORS** - Configured to allow requests only from the frontend origin
- **Rate Limiting** - Prevents API abuse (100 requests per 15 minutes per IP)
- **Input Validation** - Validates and sanitizes all user inputs
- **Error Handling** - Comprehensive error handling with user-friendly messages

## Contributing

This is a greenfield project. Contributions are welcome! Please feel free to submit issues or pull requests.

## License

ISC

## Screenshots

*Note: Screenshots would be added here after the application is running*

---

Built with ❤️ using React, Express.js, and modern web technologies.

