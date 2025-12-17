import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, Download } from 'lucide-react';

const STORAGE_KEY = 'traycer_download_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * DownloadHistory Component
 * Displays and manages download history stored in localStorage
 * @param {Object} props
 * @param {Function} props.onRedownload - Callback when user wants to re-download a video
 */
export function DownloadHistory({ onRedownload }) {
  const [history, setHistory] = useState([]);

  /**
   * Loads download history from localStorage
   */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } catch (error) {
        console.error('Failed to parse download history:', error);
      }
    }
  }, []);

  /**
   * Adds a new item to download history
   * @param {Object} item - Download history item
   */
  const addToHistory = (item) => {
    setHistory((prev) => {
      const newHistory = [
        { ...item, timestamp: Date.now() },
        ...prev.filter((h) => h.url !== item.url)
      ].slice(0, MAX_HISTORY_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  /**
   * Clears all download history
   */
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Deletes a single item from history
   * @param {number} timestamp - Timestamp of the item to delete
   */
  const deleteItem = (timestamp) => {
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.timestamp !== timestamp);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Expose addToHistory to parent component
  useEffect(() => {
    if (onRedownload) {
      window.addToDownloadHistory = addToHistory;
    }
  }, [onRedownload]);

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Downloads</CardTitle>
            <CardDescription>Your download history</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.timestamp}
              className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
              onClick={() => onRedownload && onRedownload(item.url, item.format, item.quality, false)}
            >
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-16 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {item.format}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.quality}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.timestamp);
                  }}
                  title="Remove from history"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:text-primary/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRedownload && onRedownload(item.url, item.format, item.quality, true);
                  }}
                  title="Download again"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

