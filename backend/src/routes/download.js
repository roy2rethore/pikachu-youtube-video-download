import express from 'express';
import { getVideoInfo, downloadVideo } from '../controllers/videoController.js';

const router = express.Router();

/**
 * GET /api/video/info
 * Fetches video information from YouTube URL
 * Query parameters:
 *   - url: YouTube video URL (required)
 */
router.get('/info', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const videoInfo = await getVideoInfo(url);
    res.json(videoInfo);
  } catch (error) {
    console.error('Info endpoint error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch video information' });
  }
});

/**
 * GET /api/video/download
 * Downloads video or audio from YouTube URL
 * Query parameters:
 *   - url: YouTube video URL (required)
 *   - format: 'video' or 'audio' (required)
 *   - quality: Quality/bitrate selection (required)
 *   - play: Set to 'true' to play inline instead of downloading
 */
router.get('/download', async (req, res) => {
  try {
    const { url, format, quality, play } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    if (!format) {
      return res.status(400).json({ error: 'Format parameter is required (video or audio)' });
    }

    if (!quality) {
      return res.status(400).json({ error: 'Quality parameter is required' });
    }

    const playInline = play === 'true';
    await downloadVideo(url, format, quality, res, playInline);
  } catch (error) {
    console.error('Download endpoint error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Download failed' });
    }
  }
});

export default router;

