// Offline API Service - Works without internet
import offlineStorage from './offlineStorage';

// Default prompts for offline use
const DEFAULT_PROMPTS = [
  {"id": 1, "category": "Family", "prompt": "Tell me about your wedding day. What do you remember most about that special day?"},
  {"id": 2, "category": "Childhood", "prompt": "What was your favorite thing to do as a child?"},
  {"id": 3, "category": "Family", "prompt": "Tell me about your children when they were little."},
  {"id": 4, "category": "Work", "prompt": "What kind of work did you do? What was a typical day like for you?"},
  {"id": 5, "category": "Home", "prompt": "Describe the house you grew up in. What was your favorite room?"},
  {"id": 6, "category": "Friends", "prompt": "Tell me about your best friend. How did you two meet?"},
  {"id": 7, "category": "Holidays", "prompt": "What was your favorite holiday? How did your family celebrate it?"},
  {"id": 8, "category": "Travel", "prompt": "Tell me about a place you visited that you'll never forget."},
  {"id": 9, "category": "School", "prompt": "What do you remember about your school days? Who was your favorite teacher?"},
  {"id": 10, "category": "Hobbies", "prompt": "What did you like to do in your free time? What made you happy?"},
  {"id": 11, "category": "Family", "prompt": "Tell me about your parents. What were they like?"},
  {"id": 12, "category": "Pets", "prompt": "Did you have any pets? Tell me about them."},
  {"id": 13, "category": "Food", "prompt": "What was your favorite meal? Who used to cook it for you?"},
  {"id": 14, "category": "Music", "prompt": "What songs do you remember from when you were young?"},
  {"id": 15, "category": "Weather", "prompt": "Tell me about the worst winter storm you remember. How did you get through it?"},
  {"id": 16, "category": "Community", "prompt": "Tell me about your neighborhood. Who were your neighbors?"},
  {"id": 17, "category": "Sports", "prompt": "Did you play any sports or watch games? Tell me about that."},
  {"id": 18, "category": "Traditions", "prompt": "What family traditions did you celebrate growing up?"}
];

class OfflineAPI {
  constructor() {
    this.isOnline = navigator.onLine;
    this.initialized = false;
    this.init();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncWhenOnline();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async init() {
    try {
      // Wait for storage to be ready
      await offlineStorage.init();
      
      // Check if prompts are already stored
      const existingPrompts = await offlineStorage.getPrompts();
      if (existingPrompts.length === 0) {
        // Store default prompts
        await offlineStorage.addPrompts(DEFAULT_PROMPTS);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }

  // Memory API methods
  async createEntry(entryData) {
    await this.ensureInitialized();
    
    const memory = {
      id: Date.now().toString(),
      prompt: entryData.prompt,
      content: entryData.content,
      category: entryData.category,
      word_count: entryData.word_count || 0,
      audio_recording: entryData.audio_recording || false,
      audio_data: entryData.audio_data || null,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return await offlineStorage.addMemory(memory);
  }

  async getEntries() {
    await this.ensureInitialized();
    return await offlineStorage.getMemories();
  }

  async getEntry(entryId) {
    await this.ensureInitialized();
    return await offlineStorage.getMemory(entryId);
  }

  async updateEntry(entryId, entryData) {
    await this.ensureInitialized();
    return await offlineStorage.updateMemory(entryId, entryData);
  }

  async deleteEntry(entryId) {
    await this.ensureInitialized();
    return await offlineStorage.deleteMemory(entryId);
  }

  // Prompt API methods
  async getPrompts() {
    await this.ensureInitialized();
    return await offlineStorage.getPrompts();
  }

  async getRandomPrompt() {
    await this.ensureInitialized();
    return await offlineStorage.getRandomPrompt();
  }

  // Stats API methods
  async getStats() {
    await this.ensureInitialized();
    return await offlineStorage.getStats();
  }

  // Utility methods
  async exportData() {
    await this.ensureInitialized();
    return await offlineStorage.exportData();
  }

  async importData(data) {
    await this.ensureInitialized();
    return await offlineStorage.importData(data);
  }

  isOffline() {
    return !this.isOnline;
  }

  async syncWhenOnline() {
    if (this.isOnline) {
      console.log('Device is online - sync functionality would go here');
      // Future: sync with cloud storage when online
    }
  }
}

// Create singleton instance
const offlineApi = new OfflineAPI();

// Export similar interface to original API
export const memoryApi = {
  createEntry: (data) => offlineApi.createEntry(data),
  getEntries: () => offlineApi.getEntries(),
  getEntry: (id) => offlineApi.getEntry(id),
  updateEntry: (id, data) => offlineApi.updateEntry(id, data),
  deleteEntry: (id) => offlineApi.deleteEntry(id),
  getPrompts: () => offlineApi.getPrompts(),
  getRandomPrompt: () => offlineApi.getRandomPrompt(),
  getStats: () => offlineApi.getStats()
};

export const testConnection = async () => {
  // Always return true for offline app
  return true;
};

export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const base64ToBlob = (base64, contentType = 'audio/wav') => {
  try {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    return null;
  }
};

export default offlineApi;