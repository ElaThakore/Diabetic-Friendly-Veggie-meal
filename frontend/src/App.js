import React, { useState, useEffect } from 'react';
import './App.css';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import Header from './components/Header';
import MemoryPrompt from './components/MemoryPrompt';
import WritingInterface from './components/WritingInterface';
import PastEntries from './components/PastEntries';
import { memoryApi, testConnection } from './services/offlineApi';
import { Wifi, WifiOff } from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('prompt'); // 'prompt', 'writing', 'entries'
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryCount, setEntryCount] = useState(0);
  const [appReady, setAppReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Initialize offline app
    const initializeApp = async () => {
      try {
        const connected = await testConnection();
        setAppReady(connected);
        
        if (connected) {
          const entries = await memoryApi.getEntries();
          setEntryCount(entries.length);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setAppReady(true); // Continue anyway for offline functionality
      }
    };

    initializeApp();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      if (result.outcome === 'accepted') {
        setIsInstallable(false);
        toast.success('App installed!', {
          description: 'Memory Keeper is now installed on your device.',
          duration: 3000,
        });
      }
    }
  };

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    setEditingEntry(null);
    setCurrentView('writing');
  };

  const handleEditEntry = (entry) => {
    const pseudoPrompt = {
      id: 'edit',
      prompt: entry.prompt,
      category: entry.category
    };
    setSelectedPrompt(pseudoPrompt);
    setEditingEntry(entry);
    setCurrentView('writing');
  };

  const handleSaveEntry = async (entry) => {
    try {
      const entries = await memoryApi.getEntries();
      setEntryCount(entries.length);
      
      if (editingEntry) {
        toast.success('Memory updated!', {
          description: 'Your memory has been updated successfully.',
          duration: 3000,
        });
      } else {
        toast.success('Memory saved!', {
          description: 'Your story has been saved on your device.',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error refreshing entry count:', error);
      toast.success(editingEntry ? 'Memory updated!' : 'Memory saved!', {
        description: editingEntry ? 'Your memory has been updated.' : 'Your story has been saved.',
        duration: 3000,
      });
    }
  };

  const handleBackToPrompt = () => {
    setCurrentView('prompt');
    setSelectedPrompt(null);
    setEditingEntry(null);
  };

  const handleViewEntries = () => {
    setCurrentView('entries');
  };

  const handleBackFromEntries = () => {
    setCurrentView('prompt');
  };

  const handleDownloadMemoir = async () => {
    try {
      // Get all memories directly from the API
      const memories = await memoryApi.getEntries();
      
      if (memories.length === 0) {
        toast.info('No memories to export', {
          description: 'You need to create some memories first!',
          duration: 3000,
        });
        return;
      }

      // Create export data
      const exportData = {
        memories: memories,
        exportDate: new Date().toISOString(),
        totalMemories: memories.length,
        appVersion: "1.0.0"
      };

      // Create filename with current date
      const dateString = new Date().toISOString().split('T')[0];
      const filename = `memory-keeper-backup-${dateString}.json`;

      // For mobile devices, use a different approach
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile approach - copy to clipboard and show instructions
        const jsonString = JSON.stringify(exportData, null, 2);
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(jsonString);
            toast.success('Memories copied to clipboard!', {
              description: 'Paste this into a text file to save your memories.',
              duration: 5000,
            });
          } catch (clipboardError) {
            // Fallback to showing the text
            showExportText(jsonString);
          }
        } else {
          // Fallback to showing the text
          showExportText(jsonString);
        }
      } else {
        // Desktop approach - direct download
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Memories exported!', {
          description: `Downloaded as ${filename}`,
          duration: 3000,
        });
      }
      
    } catch (error) {
      console.error('Error exporting memories:', error);
      toast.error('Export failed', {
        description: 'Unable to export memories. Please try again.',
        duration: 3000,
      });
    }
  };

  const showExportText = (jsonString) => {
    // Create a modal or new window to show the export text
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Memory Keeper - Export</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .container { max-width: 800px; margin: 0 auto; }
              .instructions { background: #f0f8ff; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
              .export-text { background: #f5f5f5; padding: 20px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word; max-height: 400px; overflow-y: auto; }
              .copy-button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Memory Keeper - Export</h1>
              <div class="instructions">
                <h3>Instructions:</h3>
                <p>1. Copy the text below</p>
                <p>2. Paste it into a text file</p>
                <p>3. Save the file as "memory-keeper-backup-${new Date().toISOString().split('T')[0]}.json"</p>
                <p>4. Keep this file safe as your backup!</p>
              </div>
              <div class="export-text" id="exportText">${jsonString}</div>
              <button class="copy-button" onclick="copyToClipboard()">Copy to Clipboard</button>
            </div>
            <script>
              function copyToClipboard() {
                const text = document.getElementById('exportText').textContent;
                navigator.clipboard.writeText(text).then(() => {
                  alert('Copied to clipboard!');
                }).catch(() => {
                  // Fallback for older browsers
                  const textArea = document.createElement('textarea');
                  textArea.value = text;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('Copied to clipboard!');
                });
              }
            </script>
          </body>
        </html>
      `);
    } else {
      // If popup blocked, show in current window
      alert('Export data ready! Please copy the text that will appear next.');
      console.log('MEMORY KEEPER EXPORT DATA:');
      console.log(jsonString);
      toast.info('Export data in console', {
        description: 'Check browser console (F12) for export data.',
        duration: 5000,
      });
    }
  };

  const renderCurrentView = () => {
    if (!appReady) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Setting up your memory keeper...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'writing':
        return (
          <WritingInterface
            prompt={selectedPrompt}
            existingEntry={editingEntry}
            onSave={handleSaveEntry}
            onBack={handleBackToPrompt}
          />
        );
      case 'entries':
        return (
          <PastEntries
            onBack={handleBackFromEntries}
            onEditEntry={handleEditEntry}
          />
        );
      default:
        return (
          <MemoryPrompt
            onPromptSelect={handlePromptSelect}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header 
        onDownloadMemoir={handleDownloadMemoir}
        isOnline={isOnline}
        isInstallable={isInstallable}
        onInstallApp={handleInstallApp}
      />
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center justify-center space-x-2 text-yellow-800">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Working offline - Your memories are saved on this device</span>
          </div>
        </div>
      )}
      
      <main className="pb-8">
        {renderCurrentView()}
      </main>

      {/* Large, Simple Button for Past Entries */}
      {currentView === 'prompt' && appReady && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={handleViewEntries}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3 text-xl"
          >
            <span>📚</span>
            <span>My Memories</span>
            <span className="bg-blue-400 px-3 py-1 rounded-full text-lg font-bold">
              {entryCount}
            </span>
          </button>
        </div>
      )}

      {/* Online status indicator */}
      {isOnline && (
        <div className="fixed bottom-8 left-8 z-50">
          <div className="bg-green-100 border border-green-200 rounded-lg px-3 py-2 flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">Online</span>
          </div>
        </div>
      )}

      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'white',
            border: '2px solid #e5e7eb',
            color: '#374151',
            fontSize: '18px',
            padding: '16px',
          },
        }}
      />
    </div>
  );
};

export default App;