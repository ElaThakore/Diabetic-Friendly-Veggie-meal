import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { memoryApi } from '../services/api';

const MemoryPrompt = ({ onPromptSelect }) => {
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRandomPrompt();
  }, []);

  const loadRandomPrompt = async () => {
    try {
      setLoading(true);
      setError(null);
      const prompt = await memoryApi.getRandomPrompt();
      setCurrentPrompt(prompt);
    } catch (err) {
      console.error('Error loading prompt:', err);
      setError('Unable to load question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSurpriseMe = async () => {
    setIsAnimating(true);
    try {
      await loadRandomPrompt();
      setTimeout(() => setIsAnimating(false), 300);
    } catch (err) {
      setIsAnimating(false);
    }
  };

  const handleStartWriting = () => {
    if (currentPrompt) {
      onPromptSelect(currentPrompt);
    }
  };

  const readPromptAloud = () => {
    if (currentPrompt && 'speechSynthesis' in window) {
      setIsReading(true);
      const utterance = new SpeechSynthesisUtterance(currentPrompt.prompt);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      
      utterance.onend = () => {
        setIsReading(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your question...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button onClick={loadRandomPrompt} size="lg" className="bg-blue-500 hover:bg-blue-600">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!currentPrompt) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-600">No question available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Let's Share a Memory
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          I'll give you a question about your life. You can answer by speaking or typing.
        </p>
      </div>

      <Card className={`mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg transition-all duration-300 ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
            Your Memory Question
          </CardTitle>
          <Button
            onClick={readPromptAloud}
            variant="outline"
            size="lg"
            className="flex items-center space-x-2 mx-auto text-lg px-6 py-3"
            disabled={isReading}
          >
            <Volume2 className="h-5 w-5" />
            <span>{isReading ? 'Reading...' : 'Read Question Aloud'}</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-blue-100">
            <p className="text-2xl font-medium text-gray-800 leading-relaxed text-center">
              {currentPrompt.prompt}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <Button
          onClick={handleSurpriseMe}
          variant="outline"
          size="lg"
          className="flex items-center space-x-3 px-8 py-6 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold text-lg transition-all duration-200 shadow-md"
          disabled={isAnimating}
        >
          <RefreshCw className={`h-6 w-6 ${isAnimating ? 'animate-spin' : ''}`} />
          <span>Different Question</span>
        </Button>
        
        <Button
          onClick={handleStartWriting}
          size="lg"
          className="flex items-center space-x-3 px-8 py-6 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Sparkles className="h-6 w-6" />
          <span>Answer This Question</span>
        </Button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 text-lg max-w-lg mx-auto">
          Take your time. There's no rush. Share whatever comes to mind.
        </p>
      </div>
    </div>
  );
};

export default MemoryPrompt;