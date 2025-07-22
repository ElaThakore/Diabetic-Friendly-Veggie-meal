// Simplified mock data for seniors with dementia/Alzheimer's
export const memoryPrompts = [
  {
    id: 1,
    category: "Family",
    prompt: "Tell me about your wedding day. What do you remember most?"
  },
  {
    id: 2,
    category: "Childhood",
    prompt: "What was your favorite thing to do as a child?"
  },
  {
    id: 3,
    category: "Family",
    prompt: "Tell me about your children when they were little."
  },
  {
    id: 4,
    category: "Work",
    prompt: "What kind of work did you do? What was a typical day like?"
  },
  {
    id: 5,
    category: "Home",
    prompt: "Describe the house you grew up in. What was your favorite room?"
  },
  {
    id: 6,
    category: "Friends",
    prompt: "Tell me about your best friend. How did you meet?"
  },
  {
    id: 7,
    category: "Holidays",
    prompt: "What was your favorite holiday? How did your family celebrate?"
  },
  {
    id: 8,
    category: "Travel",
    prompt: "Tell me about a place you visited that you'll never forget."
  },
  {
    id: 9,
    category: "School",
    prompt: "What do you remember about your school days? Who was your favorite teacher?"
  },
  {
    id: 10,
    category: "Hobbies",
    prompt: "What did you like to do in your free time? What made you happy?"
  },
  {
    id: 11,
    category: "Family",
    prompt: "Tell me about your parents. What were they like?"
  },
  {
    id: 12,
    category: "Pets",
    prompt: "Did you have any pets? Tell me about them."
  },
  {
    id: 13,
    category: "Food",
    prompt: "What was your favorite meal? Who used to cook it for you?"
  },
  {
    id: 14,
    category: "Music",
    prompt: "What songs do you remember from when you were young?"
  },
  {
    id: 15,
    category: "Neighbors",
    prompt: "Tell me about the neighborhood where you lived. Who were your neighbors?"
  }
];

export const mockEntries = [
  {
    id: 1,
    prompt: "Tell me about your wedding day. What do you remember most?",
    content: "It was a beautiful sunny day in May. I wore my mother's wedding dress, and it fit perfectly. My husband looked so handsome in his navy suit. We had the ceremony in the little church on Main Street, and afterwards we had cake and dancing at the community center. I remember feeling so happy and nervous at the same time.",
    date: "2024-01-15T10:30:00Z",
    category: "Family",
    wordCount: 65,
    audioRecording: false
  },
  {
    id: 2,
    prompt: "What was your favorite thing to do as a child?",
    content: "I loved playing outside with my brothers and sisters. We would build forts in the woods behind our house and pretend we were explorers. In the summer, we'd catch fireflies in mason jars and watch them glow. My mother would call us in when it got dark, and we'd all sit on the porch eating ice cream.",
    date: "2024-01-18T14:22:00Z",
    category: "Childhood",
    wordCount: 58,
    audioRecording: true
  },
  {
    id: 3,
    prompt: "Tell me about your children when they were little.",
    content: "They were such wonderful children. Sarah was always reading books, even when she was tiny. And Michael loved building things with his blocks. Every morning they would run into our bedroom and jump on the bed to wake us up. Those were the best mornings of my life.",
    date: "2024-01-20T09:15:00Z",
    category: "Family",
    wordCount: 48,
    audioRecording: false
  }
];

// Helper functions
export const getRandomPrompt = () => {
  const randomIndex = Math.floor(Math.random() * memoryPrompts.length);
  return memoryPrompts[randomIndex];
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};