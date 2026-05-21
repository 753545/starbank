const dbName = 'StarBankDB';
const storeName = 'store';

const getDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const idb = {
  async get(key, defaultValue) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readonly');
        const request = transaction.objectStore(storeName).get(key);
        request.onsuccess = () => {
          resolve(request.result !== undefined ? request.result : defaultValue);
        };
        request.onerror = () => resolve(defaultValue);
      });
    } catch {
      return defaultValue;
    }
  },
  async set(key, val) {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const request = transaction.objectStore(storeName).put(val, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IndexedDB write failed:", e);
    }
  }
};
