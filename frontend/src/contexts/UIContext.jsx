/**
 * UI Context - Tárolja, hogy melyik UI-ban vagyunk (Game UI vagy Retro)
 */
import React, { createContext, useContext } from 'react';

const UIContext = createContext({
  isGameUI: true,
  setIsGameUI: () => {}
});

export const UIProvider = ({ children, value }) => {
  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  return useContext(UIContext);
};

export default UIContext;

