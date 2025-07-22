import React, { useState, useEffect } from 'react';
import './App.css';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import Header from './components/Header';
import MemoryPrompt from './components/MemoryPrompt';
import WritingInterface from './components/WritingInterface';
import PastEntries from './components/PastEntries';
import { memoryApi, testConnection } from './services/api';

const App = () => {
  const [currentView, setCurrentView] = useState('prompt'); // 'prompt', 'writing', 'entries'
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [entryCount, setEntryCount] = useState(0);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    // Test API connection and load entry count
    const initializeApp = async () => {
      try {
        const connected = await testConnection();
        setApiConnected(connected);
        
        if (connected) {
          const entries = await memoryApi.getEntries();
          setEntryCount(entries.length);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    setCurrentView('writing');
  };

  const handleSaveEntry = (entry) => {
    setEntryCount(prev => prev + 1);
    toast.success('Memory saved!', {
      description: 'Your story has been saved.',
      duration: 3000,
    });
  };

  const handleBackToPrompt = () => {
    setCurrentView('prompt');
    setSelectedPrompt(null);
  };

  const handleViewEntries = () => {
    setCurrentView('entries');
  };

  const handleBackFromEntries = () => {
    setCurrentView('prompt');
  };

  const handleDownloadMemoir = () => {
    toast.info('Saving memories...', {
      description: 'Your memories are being prepared for download.',
      duration: 3000,
    });
  };

  const renderCurrentView = () => {
    if (!apiConnected) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Connecting to your memory keeper...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'writing':
        return (
          <WritingInterface
            prompt={selectedPrompt}
            onSave={handleSaveEntry}
            onBack={handleBackToPrompt}
          />
        );
      case 'entries':
        return (
          <PastEntries
            onBack={handleBackFromEntries}
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
      <Header onDownloadMemoir={handleDownloadMemoir} />
      
      <main className="pb-8">
        {renderCurrentView()}
      </main>

      {/* Large, Simple Button for Past Entries */}
      {currentView === 'prompt' && apiConnected && (
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