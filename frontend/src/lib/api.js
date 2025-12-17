const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetches video information from the backend API
 * @param {string} url - YouTube video URL
 * @returns {Promise<Object>} - Video metadata
 */
export async function fetchVideoInfo(url) {
  try {
    const response = await fetch(`${API_URL}/video/info?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch video information');
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
}

/**
 * Triggers a video/audio download
 * @param {string} url - YouTube video URL
 * @param {string} format - Format type: 'video' or 'audio'
 * @param {string} quality - Quality/bitrate selection
 */
/**
 * Triggers a video/audio download and tracks progress
 * @param {string} url - YouTube video URL
 * @param {string} format - Format type: 'video' or 'audio'
 * @param {string} quality - Quality/bitrate selection
 * @returns {Promise<void>}
 */
export async function downloadVideo(url, format, quality) {
  const downloadApiUrl = `${API_URL}/video/download?url=${encodeURIComponent(url)}&format=${format}&quality=${quality}`;

  const response = await fetch(downloadApiUrl);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Download failed');
  }

  // Get filename from header or default
  const disposition = response.headers.get('Content-Disposition');
  let filename = 'download';
  if (disposition && disposition.indexOf('attachment') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  } else {
    // Fallback extension
    filename += format === 'audio' ? '.mp3' : '.mp4';
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  // Trigger download
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

