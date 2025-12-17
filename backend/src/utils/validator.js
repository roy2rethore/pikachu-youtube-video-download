/**
 * Validates if a string is a valid YouTube URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid YouTube URL, false otherwise
 */
export function isValidYouTubeURL(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

/**
 * Sanitizes a video title to be used as a filename
 * Removes invalid characters and limits length
 * @param {string} title - The video title to sanitize
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(title) {
  if (!title || typeof title !== 'string') {
    return 'video';
  }

  // Remove invalid filename characters
  let sanitized = title
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .trim();

  // Limit length to 100 characters
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  return sanitized || 'video';
}

/**
 * Validates format parameter
 * @param {string} format - The format to validate (video or audio)
 * @returns {boolean} - True if valid format, false otherwise
 */
export function isValidFormat(format) {
  return format === 'video' || format === 'audio';
}

/**
 * Validates quality parameter for video
 * @param {string} quality - The quality to validate
 * @returns {boolean} - True if valid quality, false otherwise
 */
export function isValidVideoQuality(quality) {
  const validQualities = ['1080p', '720p', '480p', '360p', '240p'];
  return validQualities.includes(quality);
}

/**
 * Validates quality parameter for audio
 * @param {string} quality - The quality to validate
 * @returns {boolean} - True if valid quality, false otherwise
 */
export function isValidAudioQuality(quality) {
  const validQualities = ['320kbps', '256kbps', '192kbps', '128kbps'];
  return validQualities.includes(quality);
}

