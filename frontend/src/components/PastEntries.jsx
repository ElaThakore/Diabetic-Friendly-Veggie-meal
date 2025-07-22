import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Calendar, BookOpen, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { memoryApi, base64ToBlob } from '../services/offlineApi';

const PastEntries = ({ onBack, onEditEntry }) => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEntries = await memoryApi.getEntries();
      setEntries(fetchedEntries);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError('Unable to load memories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const readEntryAloud = (entry) => {
    if ('speechSynthesis' in window) {
      setIsReading(true);
      
      // Add gentle framing to the reading
      const framedText = `Here's your memory. ${entry.prompt}. ${entry.content}. That's a beautiful memory.`;
      
      const utterance = new SpeechSynthesisUtterance(framedText);
      
      // Try to find a Canadian voice
      const voices = speechSynthesis.getVoices();
      const canadianVoice = voices.find(voice => 
        voice.lang.includes('en-CA') || 
        voice.name.toLowerCase().includes('canada') ||
        voice.name.toLowerCase().includes('canadian')
      );
      
      if (canadianVoice) {
        utterance.voice = canadianVoice;
      } else {
        // Use English voice with Canadian settings
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en-') && 
          (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('male'))
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      utterance.rate = 0.75; // Slower, more relaxed pace
      utterance.pitch = 0.9; // Slightly lower pitch
      utterance.volume = 0.9;
      
      utterance.onend = () => {
        setIsReading(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const playAudioRecording = (entry) => {
    if (entry.audio_data) {
      try {
        const audioBlob = base64ToBlob(entry.audio_data);
        if (audioBlob) {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play().catch(error => {
            console.error('Error playing audio:', error);
            alert('Unable to play audio. Please try again.');
          });
        } else {
          console.error('Failed to convert audio data to blob');
        }
      } catch (error) {
        console.error('Error playing audio recording:', error);
      }
    }
  };

  const handleEditEntry = (entry) => {
    onEditEntry(entry);
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this memory? This cannot be undone.')) {
      try {
        setDeleting(entryId);
        await memoryApi.deleteEntry(entryId);
        setEntries(entries.filter(entry => entry.id !== entryId));
        if (selectedEntry && selectedEntry.id === entryId) {
          setSelectedEntry(null);
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Error deleting memory. Please try again.');
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your memories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            size="lg"
            className="flex items-center space-x-3 text-lg px-6 py-4 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Button>
        </div>
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button onClick={loadEntries} size="lg" className="bg-blue-500 hover:bg-blue-600">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (selectedEntry) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setSelectedEntry(null)}
            size="lg"
            className="flex items-center space-x-3 text-lg px-6 py-4 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to List</span>
          </Button>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
              Your Memory
            </CardTitle>
            <div className="flex justify-center space-x-4 mb-4">
              <Button
                onClick={() => readEntryAloud(selectedEntry)}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2"
                disabled={isReading}
              >
                <Volume2 className="h-5 w-5" />
                <span>{isReading ? 'Reading...' : 'Read Aloud'}</span>
              </Button>
              
              {selectedEntry.audio_recording && selectedEntry.audio_data && (
                <Button
                  onClick={() => playAudioRecording(selectedEntry)}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <Volume2 className="h-5 w-5" />
                  <span>Play Recording</span>
                </Button>
              )}
            </div>
            
            {/* Edit and Delete buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => handleEditEntry(selectedEntry)}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Edit className="h-5 w-5" />
                <span>Edit Memory</span>
              </Button>
              
              <Button
                onClick={() => handleDeleteEntry(selectedEntry.id)}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={deleting === selectedEntry.id}
              >
                <Trash2 className="h-5 w-5" />
                <span>{deleting === selectedEntry.id ? 'Deleting...' : 'Delete Memory'}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Question:</h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                {selectedEntry.prompt}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Answer:</h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                {selectedEntry.content}
              </p>
            </div>
            
            <div className="mt-6 text-center text-gray-500">
              <p className="text-lg">
                <Calendar className="inline h-5 w-5 mr-2" />
                {formatDate(selectedEntry.date)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            size="lg"
            className="flex items-center space-x-3 text-lg px-6 py-4 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Memories</h2>
            <p className="text-xl text-gray-600">{entries.length} memories saved on your device</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-gray-200 hover:border-blue-300 bg-white"
            onClick={() => setSelectedEntry(entry)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-lg font-semibold text-gray-700">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {entry.audio_recording && (
                    <div className="flex items-center space-x-1 text-red-500">
                      <Volume2 className="h-4 w-4" />
                      <span className="text-sm">Audio</span>
                    </div>
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEntry(entry);
                    }}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 font-medium mb-3 text-lg">
                {entry.prompt}
              </p>
              <p className="text-gray-800 mb-4 line-clamp-3 leading-relaxed text-lg">
                {entry.content}
              </p>
              
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Read Full Memory
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4 text-6xl">📝</div>
          <h3 className="text-2xl font-medium text-gray-900 mb-2">No memories yet</h3>
          <p className="text-xl text-gray-600 mb-6">Start sharing your first memory!</p>
          <Button onClick={onBack} size="lg" className="text-lg px-8 py-4">
            Share a Memory
          </Button>
        </div>
      )}
    </div>
  );
};

export default PastEntries;