import React, { useState } from 'react';
import './App.css';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import Header from './components/Header';
import MemoryPrompt from './components/MemoryPrompt';
import WritingInterface from './components/WritingInterface';
import PastEntries from './components/PastEntries';
import { mockEntries, getRandomQuote } from './data/mockData';

const App = () => {
  const [currentView, setCurrentView] = useState('prompt'); // 'prompt', 'writing', 'entries'
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [entries, setEntries] = useState(mockEntries);

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    setCurrentView('writing');
  };

  const handleSaveEntry = (entry) => {
    setEntries([entry, ...entries]);
    toast.success('Memory saved successfully!', {
      description: 'Your precious memory has been added to your journal.',
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
    toast.info('Memoir Download', {
      description: 'Your memoir is being prepared. This feature will be available soon!',
      duration: 3000,
    });
  };

  const handleOpenSettings = () => {
    toast.info('Settings', {
      description: 'Settings panel coming soon!',
      duration: 2000,
    });
  };

  const renderCurrentView = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header
        onDownloadMemoir={handleDownloadMemoir}
        onOpenSettings={handleOpenSettings}
      />
      
      <main className="pb-8">
        {renderCurrentView()}
      </main>

      {/* Floating Action Button for Past Entries */}
      {currentView === 'prompt' && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={handleViewEntries}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 transform hover:-translate-y-1"
          >
            <span>📚</span>
            <span>Past Entries</span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
              {entries.length}
            </span>
          </button>
        </div>
      )}

      {/* Inspirational Quote at Bottom */}
      {currentView === 'prompt' && (
        <div className="fixed bottom-8 left-8 max-w-md z-40">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-purple-100">
            <p className="text-sm text-gray-600 italic">
              "{getRandomQuote()}"
            </p>
          </div>
        </div>
      )}

      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            color: '#374151',
          },
        }}
      />
    </div>
  );
};

export default App;