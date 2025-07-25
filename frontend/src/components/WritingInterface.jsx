import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Mic, MicOff, Volume2, Edit, Type } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { memoryApi, blobToBase64 } from '../services/offlineApi';

const WritingInterface = ({ prompt, onSave, onBack, existingEntry = null }) => {
  const [content, setContent] = useState(existingEntry?.content || '');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
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

  const startSpeechRecognition = () => {
    // Check if speech recognition is available
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported in this browser');
      setRecordingError('Speech-to-text is not supported in this browser. The audio will still be recorded.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      let finalTranscript = '';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsTranscribing(true);
        setTranscribedText('');
      };
      
      recognition.onresult = (event) => {
        console.log('Speech recognition result:', event);
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          console.log('Transcript:', transcript, 'Final:', event.results[i].isFinal);
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        const combinedText = finalTranscript + interimTranscript;
        setTranscribedText(combinedText);
        console.log('Combined text:', combinedText);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsTranscribing(false);
        
        let errorMessage = 'Speech recognition error: ';
        switch (event.error) {
          case 'not-allowed':
            errorMessage += 'Microphone access denied for speech recognition.';
            break;
          case 'no-speech':
            errorMessage += 'No speech detected. Try speaking louder.';
            break;
          case 'network':
            errorMessage += 'Network error. Speech-to-text may not work offline.';
            break;
          default:
            errorMessage += event.error;
        }
        setRecordingError(errorMessage);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsTranscribing(false);
        
        // Update the main content with the final transcribed text
        if (finalTranscript.trim()) {
          setContent(prevContent => {
            const newContent = prevContent ? prevContent + ' ' + finalTranscript : finalTranscript;
            console.log('Setting content to:', newContent);
            return newContent.trim();
          });
        }
      };
      
      console.log('Starting speech recognition...');
      recognition.start();
      setSpeechRecognition(recognition);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setRecordingError('Unable to start speech recognition. Audio will still be recorded.');
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecognition) {
      speechRecognition.stop();
      setSpeechRecognition(null);
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    try {
      setRecordingError('');
      
      // Start both audio recording and speech recognition
      console.log('Starting audio recording and speech recognition...');
      
      const constraints = {
        audio: true,
        video: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
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
        stream.getTracks().forEach(track => track.stop());
        
        // Stop speech recognition when recording stops
        stopSpeechRecognition();
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Start speech recognition
      startSpeechRecognition();
      
    } catch (error) {
      console.error('Recording error:', error);
      
      if (error.name === 'NotAllowedError') {
        setRecordingError('Microphone access denied. Please allow microphone access in your browser settings and try again.');
      } else if (error.name === 'NotFoundError') {
        setRecordingError('No microphone found. Please check that your device has a working microphone.');
      } else {
        setRecordingError('Unable to access microphone. You can still type your memories using the text box.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
    
    stopSpeechRecognition();
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
    setTranscribedText('');
  };

  const readPromptAloud = () => {
    if ('speechSynthesis' in window) {
      setIsListening(true);
      
      const encouragingPrompt = `${prompt.prompt} No rush, take your time.`;
      
      const utterance = new SpeechSynthesisUtterance(encouragingPrompt);
      
      const voices = speechSynthesis.getVoices();
      const canadianVoice = voices.find(voice => 
        voice.lang.includes('en-CA') || 
        voice.name.toLowerCase().includes('canada') ||
        voice.name.toLowerCase().includes('canadian')
      );
      
      if (canadianVoice) {
        utterance.voice = canadianVoice;
      } else {
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en-') && 
          (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('male'))
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      utterance.rate = 0.75;
      utterance.pitch = 0.9;
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
      
      const entryData = {
        prompt: prompt.prompt,
        content: content || "Audio recording saved",
        category: prompt.category,
        word_count: getWordCount(content),
        audio_recording: !!audioBlob,
        audio_data: null
      };

      if (audioBlob) {
        const audioBase64 = await blobToBase64(audioBlob);
        entryData.audio_data = audioBase64;
      }

      let savedEntry;
      if (isEditing) {
        savedEntry = await memoryApi.updateEntry(existingEntry.id, entryData);
      } else {
        savedEntry = await memoryApi.createEntry(entryData);
      }
      
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

      {/* Voice Recording Section with Speech-to-Text */}
      <Card className="bg-white shadow-lg mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
            Record Your Voice (Converts to Text)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            <Button
              onClick={toggleRecording}
              size="lg"
              className={`w-40 h-40 rounded-full text-white font-bold text-xl transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isRecording ? (
                <div className="flex flex-col items-center space-y-3">
                  <MicOff className="h-12 w-12" />
                  <span className="text-lg">Stop</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <Mic className="h-12 w-12" />
                  <span className="text-lg">Start</span>
                </div>
              )}
            </Button>
          </div>
          
          {recordingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-600 text-sm whitespace-pre-line">
                {recordingError}
              </div>
            </div>
          )}
          
          {isRecording && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xl font-medium">Recording & Converting to Text...</span>
              </div>
              {isTranscribing && (
                <div className="mt-2">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <Type className="h-4 w-4" />
                    <span className="text-sm">Speech-to-text active</span>
                  </div>
                  {transcribedText && (
                    <div className="mt-3 bg-white rounded-lg p-3 text-left">
                      <p className="text-gray-700 text-sm">"{transcribedText}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {audioBlob && !isRecording && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-4 mb-3">
                <span className="text-green-600 font-medium text-lg">✓ Recording saved & converted to text!</span>
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={playAudio}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <Volume2 className="h-5 w-5" />
                  <span>Play Audio</span>
                </Button>
                <Button
                  onClick={clearRecording}
                  variant="outline"
                  size="lg"
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
      <Card className="bg-white shadow-lg mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
            Your Memory (Text)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Your spoken words will appear here automatically, or you can type directly..."
            className="min-h-64 text-xl leading-relaxed border-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
            style={{ height: 'auto' }}
          />
          <div className="mt-2 text-sm text-gray-500 text-center">
            {content.trim() ? `${getWordCount(content)} words` : 'No text yet'}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="text-center">
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
            ✅ Your memory has been {isEditing ? 'updated' : 'saved'} with both audio and text!
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingInterface;