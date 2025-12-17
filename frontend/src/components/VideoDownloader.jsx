import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { DownloadForm } from './DownloadForm';
import { FormatSelector } from './FormatSelector';
import { DownloadHistory } from './DownloadHistory';
import { useToast } from './ui/toast';
import { fetchVideoInfo, downloadVideo } from '../lib/api';
import { Loader2 } from 'lucide-react';

/**
 * VideoDownloader Component
 * Main component managing the download flow and state
 */
export function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [format, setFormat] = useState('video');
  const [quality, setQuality] = useState('');
  const [error, setError] = useState('');
  const { addToast } = useToast();

  /**
   * Handles URL submission and fetches video information
   * @param {string} submittedUrl - YouTube URL submitted by user
   */
  const handleUrlSubmit = async (submittedUrl) => {
    setUrl(submittedUrl);
    setIsLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const info = await fetchVideoInfo(submittedUrl);
      setVideoInfo(info);
      addToast({
        title: 'Video information loaded',
        description: 'Select your preferred format and quality to download.',
        variant: 'default',
      });
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch video information';
      setError(errorMessage);
      addToast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles download trigger
   * @param {string} format - Format type: 'video' or 'audio'
   * @param {string} quality - Quality/bitrate selection
   */
  /**
   * Handles download trigger
   * @param {string} format - Format type: 'video' or 'audio'
   * @param {string} quality - Quality/bitrate selection
   */
  const handleDownload = async (format, quality) => {
    if (!url || !videoInfo) {
      return;
    }

    try {
      // Add to download history
      if (window.addToDownloadHistory) {
        window.addToDownloadHistory({
          url,
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          format,
          quality,
        });
      }

      // Show starting toast
      addToast({
        title: 'Download Started',
        description: 'Please wait while we process and download your file...',
        variant: 'default',
      });

      setIsDownloading(true);

      // Trigger download
      await downloadVideo(url, format, quality);

      setIsDownloading(false);

      // Show success toast
      addToast({
        title: 'Download Completed!',
        description: 'Your file has been saved successfully.',
        variant: 'default', // Use green styling in CSS if available, or default
        className: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none shadow-xl shadow-green-500/20' // Premium Green
      });

    } catch (error) {
      setIsDownloading(false);
      addToast({
        title: 'Download failed',
        description: error.message || 'Failed to start download',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handles re-download from history
   * @param {string} historyUrl - URL from history
   * @param {string} format - Format from history
   * @param {string} quality - Quality from history
   * @param {boolean} autoStart - Whether to start download automatically
   */
  const handleRedownload = async (historyUrl, format, quality, autoStart = true) => {
    setUrl(historyUrl);
    setIsLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const info = await fetchVideoInfo(historyUrl);
      setVideoInfo(info);
      setFormat(format);
      setQuality(quality);

      if (autoStart) {
        // Auto-trigger download with saved format/quality
        setTimeout(async () => {
          try {
            // Show starting toast
            addToast({
              title: 'Download Started',
              description: 'Please wait while we process and download your file...',
              variant: 'default',
            });

            setIsDownloading(true);

            // Trigger download
            await downloadVideo(historyUrl, format, quality);

            // Show success toast
            addToast({
              title: 'Download Completed!',
              description: 'Your file has been saved successfully.',
              variant: 'default',
              className: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none shadow-xl shadow-green-500/20'
            });
          } catch (error) {
            addToast({
              title: 'Download failed',
              description: error.message || 'Failed to start download',
              variant: 'destructive',
            });
          } finally {
            setIsDownloading(false);
          }
        }, 500);
      } else {
        // Just notify that it's loaded
        addToast({
          title: 'Video Loaded',
          description: 'Video details restored. You can now download.',
          variant: 'default',
        });
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch video information';
      setError(errorMessage);
      addToast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DownloadForm onSubmit={handleUrlSubmit} isLoading={isLoading} />

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center animate-pulse">
              <img src="/pikachu-ash.png" alt="Loading..." className="h-16 w-16 animate-bounce" />
              <span className="mt-3 text-muted-foreground font-medium">Fetching video information...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {videoInfo && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full sm:w-32 h-48 sm:h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <CardTitle className="line-clamp-2">{videoInfo.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {videoInfo.channel} • {videoInfo.duration}
                    {videoInfo.viewCount && ` • ${parseInt(videoInfo.viewCount).toLocaleString()} views`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormatSelector
                videoInfo={videoInfo}
                onDownload={handleDownload}
                isDownloading={isDownloading}
                format={format}
                setFormat={setFormat}
                quality={quality}
                setQuality={setQuality}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <DownloadHistory onRedownload={handleRedownload} />
    </div>
  );
}

