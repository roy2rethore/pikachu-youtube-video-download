import YTDlpWrap from 'yt-dlp-wrap';
import { isValidYouTubeURL, sanitizeFilename, isValidFormat } from '../utils/validator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream, unlink, readdirSync, existsSync } from 'fs';
import { randomBytes } from 'crypto';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize yt-dlp
// In production (Docker), we use the pip-installed 'yt-dlp' from system PATH
// In development, we let it download/use its own binary
const ytDlpBinary = process.env.NODE_ENV === 'production' ? 'yt-dlp' : undefined;
const ytDlp = new YTDlpWrap.default(ytDlpBinary);

/**
 * Fetches video information from YouTube
 * @param {string} url - YouTube video URL
 * @returns {Promise<Object>} - Video metadata including title, thumbnail, duration, and formats
 */
export async function getVideoInfo(url) {
  try {
    // Validate URL
    if (!isValidYouTubeURL(url)) {
      throw new Error('Invalid YouTube URL');
    }

    // Helper to execute yt-dlp with cookie fallbacks
    const executeWithRetry = async (baseArgs) => {
      const spoofArgs = [
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '--referer', 'https://www.youtube.com/',
        '--add-header', 'Accept-Language:en-US,en;q=0.9',
      ];

      // Strategy: Use cookies from ENV if provided (Highest Priority)
      let envCookiePath = null;
      if (process.env.COOKIES_TXT_CONTENT) {
        envCookiePath = path.join(os.tmpdir(), `yt-cookies-${randomBytes(4).toString('hex')}.txt`);
        // Write the cookies clean (remove potential \\n issues from some dashboards)
        const cookieContent = process.env.COOKIES_TXT_CONTENT.replace(/\\n/g, '\n');
        try {
          const fs = await import('fs/promises');
          await fs.writeFile(envCookiePath, cookieContent, 'utf8');
        } catch (e) {
          console.warn('Failed to write env cookies:', e);
          envCookiePath = null;
        }
      }

      const strategies = [
        // 1. Explicit Cookies from ENV (Best for Cloud/Docker)
        ...(envCookiePath ? [['--cookies', envCookiePath]] : []),

        // 2. Browser Cookies (Only works locally)
        ['--cookies-from-browser', 'chrome'],
        ['--cookies-from-browser', 'edge'],
        ['--cookies-from-browser', 'firefox'],
        ['--cookies-from-browser', 'brave'],
        ['--cookies-from-browser', 'opera'],
        ['--cookies-from-browser', 'vivaldi'],

        // 3. Fallbacks
        spoofArgs,
        []
      ];

      let lastError;
      let hadLockError = false;

      for (const cookieArgs of strategies) {
        try {
          // Identify if this is a "spoof" strategy or a "cookie" strategy for logging
          const strategyName = cookieArgs[0] === '--cookies' ? 'ENV Cookies' :
            (cookieArgs[0] === '--user-agent' ? 'Spoofed Headers' : (cookieArgs[1] || 'None'));

          const args = [...baseArgs, ...cookieArgs, '--js-runtimes', 'node'];
          const result = await ytDlp.execPromise(args);

          // Cleanup ENV cookie file if used
          if (envCookiePath && cookieArgs[0] === '--cookies') {
            const fs = await import('fs/promises');
            await fs.unlink(envCookiePath).catch(() => { });
          }
          return result;

        } catch (error) {
          lastError = error;
          const msg = error.message || '';

          // ... (existing lock error logic)
          if (msg.includes('Could not copy') || msg.includes('cookie database')) {
            // ...
          }

          console.warn(`Strategy failed (${cookieArgs[0] === '--cookies' ? 'ENV' : (cookieArgs[1] || 'none')}): ${msg.substring(0, 50)}...`);
        }
      }

      // Cleanup ENV cookie file if loop finishes
      if (envCookiePath) {
        const fs = await import('fs/promises');
        await fs.unlink(envCookiePath).catch(() => { });
      }

      throw lastError;
    };

    // Get video info
    const output = await executeWithRetry([
      url,
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
    ]);
    const info = JSON.parse(output);

    // Extract available video formats
    // We filter for distinct resolutions. We allow video-only streams (common for high quality)
    // because our download logic automatically merges video+audio.
    const videoFormats = (info.formats || [])
      .filter(f =>
        f.vcodec && f.vcodec !== 'none' &&
        (f.ext === 'mp4' || f.ext === 'webm') // Allow mp4 and webm (we merge to mp4)
      )
      .map(f => ({
        quality: f.format_note || (f.height ? `${f.height}p` : 'unknown'),
        format_id: f.format_id,
        height: f.height
      }))
      .filter(f => f.quality && f.quality !== 'unknown' && parseInt(f.quality) > 0)
      // Deduplicate by quality (resolution)
      .filter((f, index, self) =>
        index === self.findIndex(t => t.quality === f.quality)
      )
      .sort((a, b) => {
        const aHeight = parseInt(a.quality) || 0;
        const bHeight = parseInt(b.quality) || 0;
        return bHeight - aHeight; // Descending order (1080p -> 360p)
      });

    // Extract available audio formats
    const audioFormats = (info.formats || [])
      .filter(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'))
      .map(f => ({
        bitrate: f.abr || f.tbr || 128,
        format_id: f.format_id,
      }))
      .filter((f, index, self) =>
        index === self.findIndex(t => t.bitrate === f.bitrate)
      )
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    // Extract video details
    const videoDetails = {
      title: info.title || 'Unknown',
      thumbnail: info.thumbnail || '',
      duration: formatDuration(info.duration),
      channel: info.uploader || info.channel || 'Unknown',
      viewCount: info.view_count || 0,
      formats: {
        video: videoFormats.length > 0 ? videoFormats : [{ quality: '720p', format_id: '22' }, { quality: '360p', format_id: '18' }],
        audio: audioFormats.length > 0 ? audioFormats.slice(0, 4) : [{ bitrate: 128, format_id: '140' }]
      }
    };

    return videoDetails;
  } catch (error) {
    console.error('Video info fetch error:', error.message);

    if (error.message && error.message.includes('Private video')) {
      throw new Error('This video is private or unavailable');
    }
    if (error.message && error.message.includes('age')) {
      throw new Error('This video is age-restricted and cannot be downloaded');
    }
    throw new Error(error.message || 'Failed to fetch video information');
  }
}

/**
 * Downloads video or audio from YouTube
 * @param {string} url - YouTube video URL
 * @param {string} format - Format type: 'video' or 'audio'
 * @param {string} quality - Quality/bitrate selection
 * @param {Object} res - Express response object
 * @param {boolean} playInline - Whether to play inline or download as attachment
 */
export async function downloadVideo(url, format, quality, res, playInline = false) {
  const tempFileBaseName = `ytdl-${randomBytes(16).toString('hex')}`;
  const tempDir = os.tmpdir();

  try {
    // Validate URL
    if (!isValidYouTubeURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Validate format
    if (!isValidFormat(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be "video" or "audio"' });
    }

    // Get video info for filename
    const info = await ytDlp.getVideoInfo(url);
    const title = sanitizeFilename(info.title || 'video');
    const extension = format === 'video' ? 'mp4' : 'mp3';
    const filename = `${title}.${extension}`;
    const tempFilePath = path.join(tempDir, `${tempFileBaseName}.${extension}`);

    console.log(`Starting download: ${filename} (${format})`);
    console.log(`Temp file path: ${tempFilePath}`);

    // Configure yt-dlp options to download to temp file
    const ytDlpArgs = [
      url,
      '--no-warnings',
      '--no-playlist',
      '-o', tempFilePath,  // Use exact filename, not template
    ];

    if (format === 'video') {
      // Download best format that already has video+audio (no merging needed)
      // STRICTLY enforce H.264 (avc) and AAC for maximum compatibility
      // AND respect user's requested resolution

      const height = parseInt(quality) || 0; // Extract 480 from "480p"
      let formatSelector;

      if (height > 0) {
        // user requested specific height (e.g. 480p)
        // 1. Exact height + H.264 (Preferred)
        // 2. Exact height + Any codec (Will be converted to MP4)
        // 3. Fallback: Pre-merged mp4 with exact height
        formatSelector = `bestvideo[height=${height}][vcodec^=avc]+bestaudio[ext=m4a]/bestvideo[height=${height}]+bestaudio/best[height=${height}]`;
      } else {
        // "Best" or unknown - use previous safe default
        formatSelector = 'bestvideo[vcodec^=avc]+bestaudio[ext=m4a]/best[ext=mp4][vcodec^=avc]/best[ext=mp4]/best';
      }

      ytDlpArgs.push('-f', formatSelector);
      ytDlpArgs.push('--merge-output-format', 'mp4');
    } else {
      // Download best audio and convert to mp3
      ytDlpArgs.push('-f', 'bestaudio');
      ytDlpArgs.push('-x'); // Extract audio
      ytDlpArgs.push('--audio-format', 'mp3');
      ytDlpArgs.push('--audio-quality', '0'); // Best quality
    }

    // Use ffmpeg-static for reliable cross-platform FFmpeg path
    const ffmpegPath = (await import('ffmpeg-static')).default;
    if (ffmpegPath) {
      console.log(`Using ffmpeg-static: ${ffmpegPath}`);
      ytDlpArgs.push('--ffmpeg-location', ffmpegPath);
    } else {
      console.warn('ffmpeg-static path not found, falling back to system PATH');
    }

    // Execute yt-dlp with retry logic for cookies
    console.log('Executing yt-dlp...');

    const spoofArgs = [
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '--referer', 'https://www.youtube.com/',
      '--add-header', 'Accept-Language:en-US,en;q=0.9',
    ];

    const strategies = [
      ['--cookies-from-browser', 'chrome'],
      ['--cookies-from-browser', 'edge'],
      ['--cookies-from-browser', 'firefox'],
      ['--cookies-from-browser', 'brave'],
      ['--cookies-from-browser', 'opera'],
      ['--cookies-from-browser', 'vivaldi'],
      spoofArgs, // Fallback: Spoofed Headers
      [] // Fallback: no cookies
    ];

    let downloadSuccess = false;
    let lastError;
    let hadLockError = false;

    for (const cookieArgs of strategies) {
      try {
        const strategyName = cookieArgs[0] === '--user-agent' ? 'Spoofed Headers' : (cookieArgs[1] || 'None');
        const currentArgs = [...ytDlpArgs, ...cookieArgs, '--js-runtimes', 'node'];

        console.log(`[${strategyName}] Starting download...`);

        // Wrap exec in a Promise to handle success/fail and logging
        await new Promise((resolve, reject) => {
          const process = ytDlp.exec(currentArgs);

          process.on('progress', (progress) => {
            console.log(`[${strategyName}] Progress: ${progress.percent}% (${progress.totalSize || 'unknown size'})`);
          });

          process.on('error', (error) => {
            console.error(`[${strategyName}] Error:`, error);
            reject(error);
          });

          process.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Process exited with code ${code}`));
          });

          // Handle stdout/stderr for debugging hangs
          process.on('ytDlpEvent', (eventType, eventData) => {
            // events for debugging
          });
        });

        downloadSuccess = true;
        console.log(`[${strategyName}] Download success!`);
        break; // Success!
      } catch (error) {
        lastError = error;
        const msg = error.message || '';

        if (msg.includes('Could not copy') || msg.includes('cookie database')) {
          hadLockError = true;
          console.warn(`Download strategy failed (${cookieArgs[1] || 'none'}) due to lock, checking next...`);
          continue;
        }

        const isFallback = cookieArgs.length === 0 || cookieArgs[0] === '--user-agent';
        if (isFallback && (msg.includes('Sign in') || msg.includes('bot'))) {
          if (hadLockError) {
            throw new Error('Browser cookies are locked and anonymous access is blocked. Please close your browser (Chrome/Edge) temporarily and try again to allow access.');
          }
        }

        console.warn(`Download strategy warning (${cookieArgs[1] || 'none'}): ${msg.substring(0, 50)}...`);
        // Continue to retry other browsers
      }
    }

    if (!downloadSuccess) throw lastError;

    console.log('Download completed!');

    // List all files matching our basename to find the actual file
    // Exclude .part files which are incomplete downloads
    let tempFiles = readdirSync(tempDir).filter(f => f.startsWith(tempFileBaseName) && !f.endsWith('.part'));
    console.log(`Temp files found: ${JSON.stringify(tempFiles)}`);

    // Find the merged output file
    let actualTempFilePath;
    if (tempFiles.length === 0) {
      throw new Error('Downloaded file not found in temp directory');
    } else if (tempFiles.includes(path.basename(tempFilePath))) {
      // Exact filename exists - this is the merged file!
      actualTempFilePath = tempFilePath;
      console.log(`Using exact merged file: ${actualTempFilePath}`);
    } else {
      // yt-dlp created files with format codes
      // For video, find files WITHOUT format codes (merged output)
      // Format codes look like: .f140. or .f395.
      const targetExt = format === 'video' ? '.mp4' : '.mp3';

      // First try to find merged file (no format codes like f140, f395)
      const mergedFiles = tempFiles.filter(f => {
        return f.endsWith(targetExt) && !f.match(/\.f\d+\./); // No format codes
      });

      if (mergedFiles.length > 0) {
        actualTempFilePath = path.join(tempDir, mergedFiles[0]);
        console.log(`Using merged file (no format codes): ${actualTempFilePath}`);
      } else {
        // No merged file found - use the shortest file with correct extension (likely the best guess)
        const candidateFiles = tempFiles
          .filter(f => f.endsWith(targetExt))
          .sort((a, b) => a.length - b.length); // Shortest name often means cleanest name

        if (candidateFiles.length > 0) {
          actualTempFilePath = path.join(tempDir, candidateFiles[0]);
          console.log(`WARNING: Using fallback candidate file: ${actualTempFilePath}`);
        } else {
          // Absolute fallback
          actualTempFilePath = path.join(tempDir, tempFiles[0]);
          console.log(`WARNING: Using absolute fallback file: ${actualTempFilePath}`);
        }
      }
    }

    // Verify file exists
    if (!existsSync(actualTempFilePath)) {
      throw new Error(`Downloaded file not found: ${actualTempFilePath}`);
    }

    // Set response headers
    res.setHeader('Content-Type', format === 'video' ? 'video/mp4' : 'audio/mpeg');
    res.setHeader('Content-Disposition', playInline ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`);

    // Stream the file to response
    const fileStream = createReadStream(actualTempFilePath);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
      // Clean up temp file
      unlink(actualTempFilePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Failed to delete temp file:', err);
      });
    });

    fileStream.on('end', () => {
      console.log('File stream ended, cleaning up...');
      // Clean up temp file after streaming
      unlink(actualTempFilePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Failed to delete temp file:', err);
        else console.log('Temp file deleted');
      });
    });

    // Pipe file to response
    fileStream.pipe(res);

    // Handle client disconnect
    res.on('close', () => {
      if (!res.writableEnded) {
        console.log('Client disconnected');
        fileStream.destroy();
        // Clean up temp file
        unlink(actualTempFilePath, (err) => {
          if (err && err.code !== 'ENOENT') console.error('Failed to delete temp file:', err);
        });
      }
    });

  } catch (error) {
    console.error('Download controller error:', error);

    // Try to clean up any temp files
    const extension = format === 'video' ? 'mp4' : 'mp3';
    const tempFilePath = path.join(tempDir, `${tempFileBaseName}.${extension}`);
    unlink(tempFilePath, (err) => {
      if (err && err.code !== 'ENOENT') console.error('Failed to delete temp file:', err);
    });

    if (!res.headersSent) {
      if (error.message && error.message.includes('Private video')) {
        return res.status(404).json({ error: 'This video is private or unavailable' });
      }
      if (error.message && error.message.includes('age')) {
        return res.status(403).json({ error: 'This video is age-restricted and cannot be downloaded' });
      }
      if (error.message && error.message.includes('Requested format is not available')) {
        return res.status(404).json({ error: `The requested quality (${quality}) is not available for this video.` });
      }
      res.status(500).json({ error: error.message || 'Download failed' });
    }
  }
}

/**
 * Converts duration in seconds to readable format (MM:SS or HH:MM:SS)
 * @param {number|string} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const sec = parseInt(seconds, 10);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

