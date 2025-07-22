// Mock data for WhispersBack app
export const memoryPrompts = [
  {
    id: 1,
    category: "Childhood",
    prompt: "What's your earliest memory of feeling truly happy?",
    difficulty: "easy"
  },
  {
    id: 2,
    category: "Family",
    prompt: "Describe a family tradition that meant a lot to you.",
    difficulty: "easy"
  },
  {
    id: 3,
    category: "Adventures",
    prompt: "Tell me about a time you took an unexpected journey.",
    difficulty: "medium"
  },
  {
    id: 4,
    category: "Relationships",
    prompt: "Who was the first person outside your family that you truly trusted?",
    difficulty: "medium"
  },
  {
    id: 5,
    category: "Achievements",
    prompt: "What's something you worked really hard for and finally achieved?",
    difficulty: "easy"
  },
  {
    id: 6,
    category: "Challenges",
    prompt: "Describe a time when you had to make a difficult decision.",
    difficulty: "hard"
  },
  {
    id: 7,
    category: "Love",
    prompt: "Tell me about the moment you knew you were in love.",
    difficulty: "hard"
  },
  {
    id: 8,
    category: "Dreams",
    prompt: "What was a childhood dream that you've never forgotten?",
    difficulty: "medium"
  },
  {
    id: 9,
    category: "Wisdom",
    prompt: "What's the best piece of advice you ever received?",
    difficulty: "easy"
  },
  {
    id: 10,
    category: "Moments",
    prompt: "Describe a moment when time seemed to stand still.",
    difficulty: "hard"
  }
];

export const mockEntries = [
  {
    id: 1,
    prompt: "What's your earliest memory of feeling truly happy?",
    content: "I remember being six years old, sitting in my grandmother's garden on a warm summer morning. She was watering her roses while I played with my toy cars in the dirt. The sun was shining through the leaves, and I could hear birds singing. She looked at me and smiled, then offered me a glass of fresh lemonade. In that moment, everything felt perfect and safe.",
    date: "2024-01-15T10:30:00Z",
    mood: "joyful",
    tags: ["childhood", "family", "summer", "grandmother"],
    category: "Childhood",
    wordCount: 89,
    audioRecording: false
  },
  {
    id: 2,
    prompt: "Describe a family tradition that meant a lot to you.",
    content: "Every Christmas Eve, our family would gather around the piano while my aunt played carols. We'd sing together, sometimes beautifully, sometimes terribly off-key, but always with so much love. My little cousin would always request 'Jingle Bells' three times in a row. Even now, whenever I hear piano music, I'm transported back to that warm living room filled with laughter and song.",
    date: "2024-01-18T14:22:00Z",
    mood: "nostalgic",
    tags: ["family", "Christmas", "music", "tradition"],
    category: "Family",
    wordCount: 76,
    audioRecording: true
  },
  {
    id: 3,
    prompt: "Tell me about a time you took an unexpected journey.",
    content: "I was supposed to fly to Chicago for work, but a storm grounded all flights. Instead of staying at the airport, I decided to rent a car and drive through the countryside. I discovered this tiny town with the most beautiful lake I'd ever seen. I spent the night at a local bed and breakfast, met the kindest elderly couple who owned it, and learned more about myself in those 24 hours than I had in months.",
    date: "2024-01-20T09:15:00Z",
    mood: "adventurous",
    tags: ["travel", "unexpected", "self-discovery", "nature"],
    category: "Adventures",
    wordCount: 102,
    audioRecording: false
  },
  {
    id: 4,
    prompt: "What's something you worked really hard for and finally achieved?",
    content: "Learning to play the guitar was my biggest challenge. I started when I was 25, and my fingers hurt so much in the beginning. I practiced every single day for two years, even when I wanted to give up. The day I finally played my first complete song without mistakes, I cried. It wasn't just about the guitar - it was about proving to myself that I could stick with something difficult and see it through.",
    date: "2024-01-22T19:45:00Z",
    mood: "proud",
    tags: ["music", "perseverance", "achievement", "growth"],
    category: "Achievements",
    wordCount: 88,
    audioRecording: true
  },
  {
    id: 5,
    prompt: "What was a childhood dream that you've never forgotten?",
    content: "I wanted to be a marine biologist and study dolphins. I was fascinated by their intelligence and the way they communicated with each other. I would spend hours at the aquarium, watching them play and interact. While I didn't become a marine biologist, I still feel that same wonder when I see dolphins. Last year, I finally went on a dolphin watching tour, and seeing them in their natural habitat brought back all those childhood dreams.",
    date: "2024-01-25T11:30:00Z",
    mood: "wistful",
    tags: ["childhood", "dreams", "dolphins", "nature"],
    category: "Dreams",
    wordCount: 95,
    audioRecording: false
  }
];

export const moodOptions = [
  { value: "joyful", label: "Joyful", color: "#FFD700", emoji: "😊" },
  { value: "nostalgic", label: "Nostalgic", color: "#9370DB", emoji: "🌙" },
  { value: "adventurous", label: "Adventurous", color: "#FF6347", emoji: "🌟" },
  { value: "proud", label: "Proud", color: "#32CD32", emoji: "💪" },
  { value: "wistful", label: "Wistful", color: "#87CEEB", emoji: "🌸" },
  { value: "peaceful", label: "Peaceful", color: "#98FB98", emoji: "🕊️" },
  { value: "excited", label: "Excited", color: "#FF69B4", emoji: "🎉" },
  { value: "grateful", label: "Grateful", color: "#DDA0DD", emoji: "🙏" },
  { value: "contemplative", label: "Contemplative", color: "#B0E0E6", emoji: "🤔" },
  { value: "bittersweet", label: "Bittersweet", color: "#D2691E", emoji: "🍂" }
];

export const categoryColors = {
  "Childhood": "#FFB6C1",
  "Family": "#98FB98",
  "Adventures": "#87CEEB",
  "Relationships": "#DDA0DD",
  "Achievements": "#F0E68C",
  "Challenges": "#FFA07A",
  "Love": "#FF69B4",
  "Dreams": "#E6E6FA",
  "Wisdom": "#20B2AA",
  "Moments": "#F5DEB3"
};

export const inspirationalQuotes = [
  "Your story matters. Every memory is a thread in the tapestry of your life.",
  "The best stories are the ones we tell ourselves about who we are.",
  "Memory is the diary that we all carry about with us.",
  "Life is not what one lived, but what one remembers and how one remembers it.",
  "In the end, we'll all become stories.",
  "Every memory is a piece of the puzzle that makes you who you are.",
  "The stories we tell ourselves become our reality.",
  "Your memories are your treasures - guard them well and share them freely."
];

// Helper functions
export const getRandomPrompt = () => {
  const randomIndex = Math.floor(Math.random() * memoryPrompts.length);
  return memoryPrompts[randomIndex];
};

export const getPromptsByCategory = (category) => {
  return memoryPrompts.filter(prompt => prompt.category === category);
};

export const getEntriesByMood = (mood) => {
  return mockEntries.filter(entry => entry.mood === mood);
};

export const getEntriesByCategory = (category) => {
  return mockEntries.filter(entry => entry.category === category);
};

export const searchEntries = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return mockEntries.filter(entry => 
    entry.content.toLowerCase().includes(lowercaseQuery) ||
    entry.prompt.toLowerCase().includes(lowercaseQuery) ||
    entry.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
  return inspirationalQuotes[randomIndex];
};

export const getWordCount = (text) => {
  return text.trim().split(/\s+/).length;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const getEntryStats = () => {
  const totalEntries = mockEntries.length;
  const totalWords = mockEntries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const averageWords = Math.round(totalWords / totalEntries);
  const categoryCounts = mockEntries.reduce((counts, entry) => {
    counts[entry.category] = (counts[entry.category] || 0) + 1;
    return counts;
  }, {});
  
  return {
    totalEntries,
    totalWords,
    averageWords,
    categoryCounts
  };
};