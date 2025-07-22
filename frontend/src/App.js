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
      console.log('=== EXPORT DEBUG START ===');
      
      // Step 1: Get memories with detailed logging
      console.log('Step 1: Getting memories...');
      const memories = await memoryApi.getEntries();
      console.log('Memories retrieved:', memories);
      console.log('Memory count:', memories.length);
      
      if (memories.length === 0) {
        console.log('No memories found');
        toast.info('No memories to export', {
          description: 'You need to create some memories first!',
          duration: 3000,
        });
        return;
      }

      // Step 2: Create export data
      console.log('Step 2: Creating export data...');
      const exportData = {
        appName: "Memory Keeper",
        exportDate: new Date().toISOString(),
        totalMemories: memories.length,
        memories: memories.map(memory => ({
          id: memory.id,
          prompt: memory.prompt,
          content: memory.content,
          date: memory.date,
          category: memory.category,
          wordCount: memory.word_count,
          hasAudio: memory.audio_recording,
          audioData: memory.audio_data ? "Audio data present" : null // Don't export full audio in debug
        }))
      };
      
      console.log('Export data created:', exportData);
      
      // Step 3: Create JSON string
      console.log('Step 3: Creating JSON string...');
      const jsonString = JSON.stringify(exportData, null, 2);
      console.log('JSON string length:', jsonString.length);
      
      // Step 4: Simple and reliable export methods
      console.log('Step 4: Attempting export...');
      
      // Method A: Try direct download first
      try {
        console.log('Trying direct download...');
        const element = document.createElement('a');
        const file = new Blob([jsonString], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = `memory-keeper-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        console.log('Direct download attempted');
        toast.success('Export started!', {
          description: 'Check your Downloads folder for the backup file.',
          duration: 4000,
        });
        
      } catch (downloadError) {
        console.error('Direct download failed:', downloadError);
        
        // Method B: Copy to clipboard
        try {
          console.log('Trying clipboard...');
          await navigator.clipboard.writeText(jsonString);
          console.log('Clipboard copy successful');
          
          toast.success('Memories copied to clipboard!', {
            description: 'Open a text editor, paste (Ctrl+V), and save as .json file',
            duration: 6000,
          });
          
        } catch (clipboardError) {
          console.error('Clipboard failed:', clipboardError);
          
          // Method C: Alert with instructions
          alert(`Export ready! Follow these steps:
          
1. Press F12 to open browser console
2. Look for "EXPORT DATA BELOW" in the console
3. Copy the JSON data that appears
4. Paste it into a text file
5. Save as memory-keeper-backup.json

The data will appear in the console now...`);
          
          console.log('=== EXPORT DATA BELOW ===');
          console.log(jsonString);
          console.log('=== EXPORT DATA ABOVE ===');
          
          toast.info('Export data in console', {
            description: 'Check browser console (F12) and look for export data',
            duration: 8000,
          });
        }
      }
      
      console.log('=== EXPORT DEBUG END ===');
      
    } catch (error) {
      console.error('=== EXPORT ERROR ===', error);
      toast.error('Export failed', {
        description: `Error: ${error.message}`,
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