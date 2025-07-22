import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Mic, MicOff, Palette, Tag, Calendar, Type } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { moodOptions, categoryColors, getWordCount } from '../data/mockData';

const WritingInterface = ({ prompt, onSave, onBack }) => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showSaved, setShowSaved] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setWordCount(getWordCount(content));
  }, [content]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (content.trim()) {
      const entry = {
        id: Date.now(), // Mock ID
        prompt: prompt.prompt,
        content: content,
        date: new Date().toISOString(),
        mood: selectedMood,
        tags: tags,
        category: prompt.category,
        wordCount: wordCount,
        audioRecording: isRecording
      };
      
      onSave(entry);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
      
      // Reset form
      setContent('');
      setSelectedMood('');
      setTags([]);
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop voice recording
    console.log(isRecording ? 'Stopping recording' : 'Starting recording');
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
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Prompts</span>
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Type className="h-4 w-4" />
            <span>{wordCount} words</span>
          </div>
          <Badge 
            variant="secondary" 
            className="flex items-center space-x-1"
            style={{ 
              backgroundColor: categoryColors[prompt.category] + '40',
              color: categoryColors[prompt.category].replace(/^#/, '').match(/.{2}/g).reduce((acc, hex) => acc + Math.max(0, parseInt(hex, 16) - 80).toString(16).padStart(2, '0'), '#')
            }}
          >
            <span className="text-sm">{getCategoryIcon(prompt.category)}</span>
            <span>{prompt.category}</span>
          </Badge>
        </div>
      </div>

      <Card className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg text-purple-800">Your Memory Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 font-medium">{prompt.prompt}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span>Share Your Memory</span>
                </CardTitle>
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleRecording}
                  className="flex items-center space-x-2"
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span>{isRecording ? 'Stop' : 'Record'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing your memory here... Take your time and let the words flow naturally."
                className="min-h-96 resize-none text-base leading-relaxed border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                style={{ height: 'auto' }}
              />
              
              {isRecording && (
                <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Recording in progress...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>How are you feeling?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-3">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button onClick={handleAddTag} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            className="w-full flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 transition-all duration-200"
            disabled={!content.trim()}
          >
            <Save className="h-4 w-4" />
            <span>Save Memory</span>
          </Button>
          
          {showSaved && (
            <div className="text-center p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">
              ✅ Memory saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingInterface;