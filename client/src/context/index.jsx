import React, { createContext, useContext, useReducer } from 'react';

export const AppContext = createContext();

const initialState = {
  loggedIn: false,
  player: null,
};

// Reducers should be a pure functions & should not cause side effects (like gql calls).
const appReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        loggedIn: true,
        player: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        loggedIn: false,
        player: null,
      };
    case 'MOVE':
      return {
        ...state,
        player: {
          ...state.player,
          position: action.payload,
        },
      };
    default:
      return state;
  }
};

export const AppContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const [state, dispatch] = useContext(AppContext);
  return [state, dispatch];
};
