import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Tag, BookOpen, Heart, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mockEntries, moodOptions, categoryColors, formatDate } from '../data/mockData';

const PastEntries = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = mockEntries;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.content.toLowerCase().includes(query) ||
        entry.prompt.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Mood filter
    if (filterMood !== 'all') {
      filtered = filtered.filter(entry => entry.mood === filterMood);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === filterCategory);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'wordCount':
          return b.wordCount - a.wordCount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, filterMood, filterCategory, sortBy]);

  const getMoodEmoji = (mood) => {
    const moodOption = moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.emoji : '💭';
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

  const categories = [...new Set(mockEntries.map(entry => entry.category))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Memory Journal</h2>
            <p className="text-gray-600">{filteredAndSortedEntries.length} memories found</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterMood} onValueChange={setFilterMood}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                {moodOptions.map((mood) => (
                  <SelectItem key={mood.value} value={mood.value}>
                    <div className="flex items-center space-x-2">
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center space-x-2">
                      <span>{getCategoryIcon(category)}</span>
                      <span>{category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="wordCount">Word Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedEntries.map((entry) => (
          <Card
            key={entry.id}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 hover:-translate-y-1"
            style={{ borderLeftColor: categoryColors[entry.category] }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge 
                  variant="secondary" 
                  className="flex items-center space-x-1 mb-2"
                  style={{ 
                    backgroundColor: categoryColors[entry.category] + '40',
                    color: categoryColors[entry.category].replace(/^#/, '').match(/.{2}/g).reduce((acc, hex) => acc + Math.max(0, parseInt(hex, 16) - 80).toString(16).padStart(2, '0'), '#')
                  }}
                >
                  <span className="text-sm">{getCategoryIcon(entry.category)}</span>
                  <span>{entry.category}</span>
                </Badge>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                  {entry.audioRecording && (
                    <div className="w-2 h-2 bg-red-500 rounded-full" title="Audio recording"></div>
                  )}
                </div>
              </div>
              <CardTitle className="text-sm text-gray-600 font-medium leading-relaxed">
                {entry.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 mb-4 line-clamp-3 leading-relaxed">
                {entry.content}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {entry.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {entry.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{entry.tags.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(entry.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{entry.wordCount} words</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedEntries.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4 text-4xl">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No memories found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
          <Button onClick={() => {
            setSearchQuery('');
            setFilterMood('all');
            setFilterCategory('all');
          }}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default PastEntries;