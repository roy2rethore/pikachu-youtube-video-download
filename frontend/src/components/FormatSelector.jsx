import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Badge } from './ui/badge';
import { Download } from 'lucide-react';

/**
 * FormatSelector Component
 * Allows users to select video/audio format and quality
 * @param {Object} props
 * @param {Object} props.videoInfo - Video information object
 * @param {Function} props.onDownload - Callback when download is triggered
 */
export function FormatSelector({ videoInfo, onDownload, isDownloading, format, setFormat, quality, setQuality }) {
  // Local state removed, using props


  // Get dynamic quality options from videoInfo
  const getQualityOptions = () => {
    if (!videoInfo || !videoInfo.formats) return [];

    if (format === 'video') {
      return videoInfo.formats.video.map(f => f.quality);
    } else {
      return videoInfo.formats.audio.map(f => `${f.bitrate}kbps`);
    }
  };

  const currentQualities = getQualityOptions();

  // Hardcoded fallback ONLY if no info available (e.g. initial load glitch, though rare)
  const defaultQualities = format === 'video'
    ? ['1080p', '720p', '480p', '360p']
    : ['192kbps', '128kbps'];

  const displayQualities = currentQualities.length > 0 ? currentQualities : defaultQualities;

  /**
   * Handles format change (video/audio)
   * @param {string} newFormat - New format selection
   */
  const handleFormatChange = (newFormat) => {
    setFormat(newFormat);
    // Reset quality when format changes
    setQuality('');
  };

  const handleDownload = () => {
    if (!quality) {
      return;
    }
    // Remove "kbps" suffix for audio if present in the value for clean backend handling
    // or keep it if backend expects it. Backend regex parses it typically. 
    // Backend expects numeric or numeric string. 
    // videoController: parseInt(quality) (works for "480p")
    // videoController: audio sort uses bitrate. 
    // Let's pass the raw string "128kbps" or "480p" as selected.
    onDownload(format, quality);
  };

  // Set default quality when format changes or when options load
  // We use a useEffect-like pattern here by checking render state
  if ((!quality || !displayQualities.includes(quality)) && displayQualities.length > 0) {
    // Default to best quality (first item)
    setQuality(displayQualities[0]);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label>Format</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={format === 'video' ? 'default' : 'outline'}
            onClick={() => handleFormatChange('video')}
            className="flex-1"
            disabled={isDownloading}
          >
            Video
          </Button>
          <Button
            type="button"
            variant={format === 'audio' ? 'default' : 'outline'}
            onClick={() => handleFormatChange('audio')}
            className="flex-1"
            disabled={isDownloading}
          >
            Audio
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quality-select">
          Quality {format === 'video' ? '(Resolution)' : '(Bitrate)'}
        </Label>
        <Select
          id="quality-select"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          disabled={isDownloading || displayQualities.length === 0}
        >
          {displayQualities.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-4">
        {isDownloading && (
          <div className="bg-primary/10 text-primary px-4 py-3 rounded-md flex items-center justify-center gap-2 animate-pulse">
            <Download className="h-4 w-4 animate-bounce" />
            <span className="font-medium">File is downloading... please wait</span>
          </div>
        )}

        <Button
          onClick={handleDownload}
          disabled={!quality || isDownloading}
          className="w-full"
          size="lg"
        >
          {isDownloading ? (
            'Downloading...'
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download {format === 'video' ? 'Video' : 'Audio'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

