import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [language, setLanguage] = useState('en');
  const [inventory, setInventory] = useState([]);

  const login = () => setIsLoggedIn(true);

  const logout = () => setIsLoggedIn(false);

  const toggleLanguage = () => setLanguage(prev => (prev === 'en' ? 'he' : 'en'));

  const addItem = (item) => {
    setInventory(prev => [
      ...prev,
      { ...item, id: Date.now().toString() + Math.random().toString(36).slice(2) },
    ]);
  };

  const updateItem = (id, updates) => {
    setInventory(prev => prev.map(i => (i.id === id ? { ...i, ...updates } : i)));
  };

  const removeItem = (id) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const addScannedItems = (scannedItems) => {
    setInventory(prev => {
      const updated = [...prev];
      scannedItems.forEach(scanned => {
        const existingIndex = updated.findIndex(
          i => i.item.toLowerCase() === scanned.item.toLowerCase()
        );
        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], qty: scanned.qty };
        } else {
          updated.push({
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            item: scanned.item,
            qty: scanned.qty,
            category: scanned.category || 'Other',
            minQty: scanned.minQty ?? 2,
            units: 'bottle',
            costPrice: 0,
            barcode: '',
            storageLocation: 'Bar',
            expirationDate: '',
            notes: '',
            supplier: scanned.supplier || 'Unknown',
          });
        }
      });
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        language,
        toggleLanguage,
        inventory,
        addItem,
        updateItem,
        removeItem,
        addScannedItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
