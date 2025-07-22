import React, { useState } from 'react';
import { RefreshCw, Sparkles, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { getRandomPrompt, memoryPrompts, categoryColors } from '../data/mockData';

const MemoryPrompt = ({ onPromptSelect }) => {
  const [currentPrompt, setCurrentPrompt] = useState(getRandomPrompt());
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSurpriseMe = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPrompt(getRandomPrompt());
      setIsAnimating(false);
    }, 300);
  };

  const handleStartWriting = () => {
    onPromptSelect(currentPrompt);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Childhood': '🌈',
      'Family': '👨‍👩‍👧‍👦',
      'Adventures': '🗺️',
      'Relationships': '💕',
      'Achievements': '🏆',
      'Challenges': '⛰️',
      'Love': '💖',
      'Dreams': '✨',
      'Wisdom': '🦉',
      'Moments': '⏰'
    };
    return icons[category] || '💫';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Share Your Story?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Every memory is a treasure. Choose a prompt that speaks to your heart, or let serendipity guide you with "Surprise Me!"
        </p>
      </div>

      <Card className={`mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg transition-all duration-300 ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Badge 
              className={`${getDifficultyColor(currentPrompt.difficulty)} border-0 font-medium px-3 py-1`}
            >
              {currentPrompt.difficulty}
            </Badge>
            <div 
              className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: categoryColors[currentPrompt.category] + '40',
                color: categoryColors[currentPrompt.category].replace(/^#/, '').match(/.{2}/g).reduce((acc, hex) => acc + Math.max(0, parseInt(hex, 16) - 80).toString(16).padStart(2, '0'), '#')
              }}
            >
              <span className="text-lg">{getCategoryIcon(currentPrompt.category)}</span>
              <span>{currentPrompt.category}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-purple-100">
              <p className="text-xl font-medium text-gray-800 leading-relaxed">
                {currentPrompt.prompt}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleSurpriseMe}
          variant="outline"
          size="lg"
          className="flex items-center space-x-2 px-8 py-3 bg-white hover:bg-purple-50 border-purple-200 hover:border-purple-300 text-purple-700 font-medium transition-all duration-200 shadow-sm"
          disabled={isAnimating}
        >
          <RefreshCw className={`h-5 w-5 ${isAnimating ? 'animate-spin' : ''}`} />
          <span>Surprise Me!</span>
        </Button>
        
        <Button
          onClick={handleStartWriting}
          size="lg"
          className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Sparkles className="h-5 w-5" />
          <span>Start Writing</span>
        </Button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          <Heart className="inline h-4 w-4 text-pink-500 mr-1" />
          Take your time. There's no rush. Your memories deserve to be told with care and love.
        </p>
      </div>
    </div>
  );
};

export default MemoryPrompt;