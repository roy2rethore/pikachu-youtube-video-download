import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';

/**
 * DownloadForm Component
 * Handles YouTube URL input and validation
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback when form is submitted with valid URL
 * @param {boolean} props.isLoading - Loading state indicator
 */
export function DownloadForm({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  /**
   * Validates YouTube URL format
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid YouTube URL
   */
  const isValidYouTubeURL = (url) => {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  /**
   * Handles form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeURL(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    onSubmit(url);
  };

  /**
   * Handles URL input change
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setUrl(e.target.value);
    if (error) setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="youtube-url">YouTube URL</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="youtube-url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={handleChange}
            disabled={isLoading}
            className="flex-1"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'url-error' : undefined}
          />
          <Button type="submit" disabled={isLoading || !url.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Get Info'
            )}
          </Button>
        </div>
        {error && (
          <p id="url-error" className="text-sm text-destructive animate-fade-in">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}

