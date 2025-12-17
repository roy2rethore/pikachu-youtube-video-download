import { useState, useEffect } from 'react';
import { VideoDownloader } from './components/VideoDownloader';
import { ToastProvider } from './components/ui/toast';
import { Button } from './components/ui/button';
import { NetworkMonitor } from './components/NetworkMonitor';
import { Moon, Sun, Download } from 'lucide-react';
import './styles/globals.css';

/**
 * Main App Component
 * Provides layout, dark mode toggle, and toast notifications
 */
function App() {
  const [darkMode, setDarkMode] = useState(false);

  /**
   * Initializes dark mode from localStorage or system preference
   */
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'true' : prefersDark;
    setDarkMode(isDark);
    updateDarkMode(isDark);
  }, []);

  /**
   * Updates dark mode class on document
   * @param {boolean} isDark - Whether dark mode should be enabled
   */
  const updateDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  /**
   * Toggles dark mode
   */
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    updateDarkMode(newMode);
  };

  return (
    <ToastProvider>
      <NetworkMonitor />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/pikachu-ash.png" alt="Pikachu & Ash" className="h-10 w-10 object-contain" />
                <h1 className="text-2xl font-bold">Pikachu</h1>
                <span className="text-sm text-muted-foreground">YouTube Downloader</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Download YouTube Videos & Audio</h2>
            <p className="text-muted-foreground">
              Enter a YouTube URL below to get started
            </p>
          </div>

          <VideoDownloader />
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2025-26 Pikachu
            </p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}

export default App;

