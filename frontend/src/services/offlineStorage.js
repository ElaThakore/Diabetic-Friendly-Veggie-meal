// Offline Storage Service for Memory Keeper
class OfflineStorage {
  constructor() {
    this.dbName = 'MemoryKeeperDB';
    this.version = 1;
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create memories store
        if (!db.objectStoreNames.contains('memories')) {
          const memoriesStore = db.createObjectStore('memories', { keyPath: 'id' });
          memoriesStore.createIndex('date', 'date', { unique: false });
          memoriesStore.createIndex('category', 'category', { unique: false });
        }
        
        // Create prompts store
        if (!db.objectStoreNames.contains('prompts')) {
          const promptsStore = db.createObjectStore('prompts', { keyPath: 'id' });
          promptsStore.createIndex('category', 'category', { unique: false });
        }
        
        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async addMemory(memory) {
    const transaction = this.db.transaction(['memories'], 'readwrite');
    const store = transaction.objectStore('memories');
    
    // Add timestamp if not present
    if (!memory.id) {
      memory.id = Date.now().toString();
    }
    if (!memory.date) {
      memory.date = new Date().toISOString();
    }
    
    return new Promise((resolve, reject) => {
      const request = store.add(memory);
      request.onsuccess = () => resolve(memory);
      request.onerror = () => reject(request.error);
    });
  }

  async updateMemory(id, updates) {
    const transaction = this.db.transaction(['memories'], 'readwrite');
    const store = transaction.objectStore('memories');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const memory = getRequest.result;
        if (memory) {
          Object.assign(memory, updates);
          memory.updated_at = new Date().toISOString();
          
          const putRequest = store.put(memory);
          putRequest.onsuccess = () => resolve(memory);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Memory not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteMemory(id) {
    const transaction = this.db.transaction(['memories'], 'readwrite');
    const store = transaction.objectStore('memories');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMemories() {
    const transaction = this.db.transaction(['memories'], 'readonly');
    const store = transaction.objectStore('memories');
    const index = store.index('date');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => {
        // Sort by date descending (newest first)
        const memories = request.result.sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(memories);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getMemory(id) {
    const transaction = this.db.transaction(['memories'], 'readonly');
    const store = transaction.objectStore('memories');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addPrompts(prompts) {
    const transaction = this.db.transaction(['prompts'], 'readwrite');
    const store = transaction.objectStore('prompts');
    
    const promises = prompts.map(prompt => {
      return new Promise((resolve, reject) => {
        const request = store.put(prompt);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
    
    return Promise.all(promises);
  }

  async getPrompts() {
    const transaction = this.db.transaction(['prompts'], 'readonly');
    const store = transaction.objectStore('prompts');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getRandomPrompt() {
    const prompts = await this.getPrompts();
    if (prompts.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  }

  async setSetting(key, value) {
    const transaction = this.db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key) {
    const transaction = this.db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async getStats() {
    const memories = await this.getMemories();
    const totalEntries = memories.length;
    const totalWords = memories.reduce((sum, memory) => sum + (memory.word_count || 0), 0);
    const averageWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
    
    const categories = memories.reduce((acc, memory) => {
      const category = memory.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalEntries,
      totalWords,
      averageWords,
      categories,
      recentEntries: memories.slice(0, 5)
    };
  }

  async exportData() {
    const memories = await this.getMemories();
    const prompts = await this.getPrompts();
    
    return {
      memories,
      prompts,
      exportDate: new Date().toISOString(),
      version: this.version
    };
  }

  async importData(data) {
    if (data.memories) {
      const transaction = this.db.transaction(['memories'], 'readwrite');
      const store = transaction.objectStore('memories');
      
      for (const memory of data.memories) {
        await new Promise((resolve, reject) => {
          const request = store.put(memory);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;