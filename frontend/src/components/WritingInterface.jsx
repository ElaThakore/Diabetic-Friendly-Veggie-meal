import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Mic, MicOff, Volume2, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { memoryApi, blobToBase64 } from '../services/api';

const WritingInterface = ({ prompt, onSave, onBack, existingEntry = null }) => {
  const [content, setContent] = useState(existingEntry?.content || '');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [audioChunks, setAudioChunks] = useState([]);
  const textareaRef = useRef(null);

  const isEditing = !!existingEntry;

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Load existing audio if editing
  useEffect(() => {
    if (existingEntry?.audio_data) {
      try {
        const byteCharacters = atob(existingEntry.audio_data.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/wav' });
        setAudioBlob(blob);
      } catch (error) {
        console.error('Error loading existing audio:', error);
      }
    }
  }, [existingEntry]);

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const startRecording = async () => {
    try {
      setRecordingError('');
      
      // Mobile-specific microphone request
      console.log('Mobile recording starting...');
      
      // For mobile devices, we need to be more direct
      const constraints = {
        audio: true,
        video: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Use the most basic MediaRecorder setup for mobile
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording immediately
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
    } catch (error) {
      console.error('Mobile microphone error:', error);
      
      // Mobile-specific error handling
      if (error.name === 'NotAllowedError') {
        setRecordingError('Microphone access denied. Please:\n\n1. Check your browser settings\n2. Allow microphone access for this site\n3. Try refreshing the page\n\nOn mobile: Look for a microphone icon in your browser or check your device settings.');
      } else if (error.name === 'NotFoundError') {
        setRecordingError('No microphone found. Please check that your device has a working microphone.');
      } else {
        setRecordingError('Unable to access microphone. This might be a browser limitation on mobile devices.\n\nYou can still type your memories using the text box below.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Unable to play audio. Please try again.');
      });
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setAudioChunks([]);
    setRecordingError('');
  };

  const readPromptAloud = () => {
    if ('speechSynthesis' in window) {
      setIsListening(true);
      
      // Add gentle encouragement to the prompt
      const encouragingPrompt = `${prompt.prompt} No rush, take your time.`;
      
      const utterance = new SpeechSynthesisUtterance(encouragingPrompt);
      
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
        setIsListening(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const handleSave = async () => {
    if (!content.trim() && !audioBlob) {
      return;
    }

    try {
      setSaving(true);
      
      // Prepare entry data
      const entryData = {
        prompt: prompt.prompt,
        content: content || "Audio recording saved",
        category: prompt.category,
        word_count: getWordCount(content),
        audio_recording: !!audioBlob,
        audio_data: null
      };

      // Convert audio blob to base64 if exists
      if (audioBlob) {
        const audioBase64 = await blobToBase64(audioBlob);
        entryData.audio_data = audioBase64;
      }

      let savedEntry;
      if (isEditing) {
        // Update existing entry
        savedEntry = await memoryApi.updateEntry(existingEntry.id, entryData);
      } else {
        // Create new entry
        savedEntry = await memoryApi.createEntry(entryData);
      }
      
      // Call parent callback
      onSave(savedEntry);
      
      setShowSaved(true);
      setTimeout(() => {
        setShowSaved(false);
        onBack();
      }, 2000);
      
    } catch (error) {
      console.error('Error saving memory:', error);
      alert('Error saving memory. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Simple Back Button */}
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

      {/* Memory Prompt - Large and Clear */}
      <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
            {isEditing ? 'Edit Your Memory' : 'Your Memory Question'}
          </CardTitle>
          <Button
            onClick={readPromptAloud}
            variant="outline"
            size="lg"
            className="flex items-center space-x-2 mx-auto"
            disabled={isListening}
          >
            <Volume2 className="h-5 w-5" />
            <span>{isListening ? 'Reading...' : 'Read Question Aloud'}</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-blue-100">
            <p className="text-2xl font-medium text-gray-800 leading-relaxed text-center">
              {prompt.prompt}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Simple Recording Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Voice Recording Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-gray-800 mb-4">
              Record Your Voice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex justify-center">
              <Button
                onClick={toggleRecording}
                size="lg"
                className={`w-32 h-32 rounded-full text-white font-bold text-lg transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isRecording ? (
                  <div className="flex flex-col items-center space-y-2">
                    <MicOff className="h-8 w-8" />
                    <span className="text-sm">Stop</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Mic className="h-8 w-8" />
                    <span className="text-sm">Start</span>
                  </div>
                )}
              </Button>
            </div>
            
            {/* Debug info */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Browser: {navigator.userAgent.split(' ')[0]} | 
                HTTPS: {window.location.protocol === 'https:' ? '✓' : '✗'} | 
                MediaDevices: {navigator.mediaDevices ? '✓' : '✗'} | 
                MediaRecorder: {window.MediaRecorder ? '✓' : '✗'}
              </p>
            </div>
            
            {recordingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 text-sm">
                  {recordingError}
                </div>
                <div className="mt-3 flex justify-center">
                  <Button
                    onClick={() => setRecordingError('')}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            
            {isRecording && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-red-600">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-medium">Recording...</span>
                </div>
                <p className="text-sm text-red-600 mt-2">Press "Stop" when you're done</p>
              </div>
            )}
            
            {audioBlob && !isRecording && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-4 mb-3">
                  <span className="text-green-600 font-medium">✓ Recording saved!</span>
                </div>
                <div className="flex justify-center space-x-2">
                  <Button
                    onClick={playAudio}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Play Back</span>
                  </Button>
                  <Button
                    onClick={clearRecording}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <span>Clear</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Text Writing Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-gray-800 mb-4">
              Or Type Your Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="You can type your memory here if you prefer..."
              className="min-h-48 text-lg leading-relaxed border-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
              style={{ height: 'auto' }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Simple Save Button */}
      <div className="text-center mt-8">
        <Button
          onClick={handleSave}
          size="lg"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl px-12 py-6 rounded-xl shadow-lg transition-all duration-200"
          disabled={(!content.trim() && !audioBlob) || saving}
        >
          {isEditing ? <Edit className="h-6 w-6 mr-3" /> : <Save className="h-6 w-6 mr-3" />}
          {saving ? 'Saving...' : (isEditing ? 'Update My Memory' : 'Save My Memory')}
        </Button>
        
        {showSaved && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 text-lg font-medium">
            ✅ Your memory has been {isEditing ? 'updated' : 'saved'}!
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingInterface;