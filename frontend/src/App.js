import React, { useState } from 'react';
import './App.css';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import Header from './components/Header';
import MemoryPrompt from './components/MemoryPrompt';
import WritingInterface from './components/WritingInterface';
import PastEntries from './components/PastEntries';
import { mockEntries } from './data/mockData';

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
      {currentView === 'prompt' && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={handleViewEntries}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3 text-xl"
          >
            <span>📚</span>
            <span>My Memories</span>
            <span className="bg-blue-400 px-3 py-1 rounded-full text-lg font-bold">
              {entries.length}
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