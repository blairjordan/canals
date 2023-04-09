import React, { createContext, useContext, useReducer } from 'react'

export const AppContext = createContext()

const initialState = {
  loggedIn: false,
  player: null,
  markers: [],
  geofences: [],
  popups: [],
  actions: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    fish: false,
    interact: false,
    boosting: false,
  }
}

// Reducers should be a pure functions & should not cause side effects (like gql calls).
const appReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        loggedIn: true,
        player: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        loggedIn: false,
        player: null,
      }
    case 'PLAYER_MOVE':
      return {
        ...state,
        player: {
          ...state.player,
          position: action.payload,
        },
      }
    case 'MARKER_ADD':
      return {
        ...state,
        markers: [...state.markers, action.payload],
      }
    case 'MARKER_REMOVE':
      return {
        ...state,
        markers: state.markers.filter((marker) => marker.id !== action.payload.id),
      }
    case 'GEOFENCE_ADD':
      return {
        ...state,
        geofences: [...state.geofences, action.payload],
      }
    case 'GEOFENCE_REMOVE':
      return {
        ...state,
        geofences: state.geofences.filter((geofence) => geofence.id !== action.payload.id),
      }
    case 'UI_POPUP_ADD':
      return {
        ...state,
        popups: [...state.popups, action.payload],
      }
      case 'UI_POPUP_INTERACT':
      return {
        ...state,
        popups: state.popups.map((popup) =>
          popup.id === action.payload.id ? { ...popup, interacted: true } : popup
        ),
      }
    case 'UI_POPUP_REMOVE':
      return {
        ...state,
        popups: state.popups.filter((popup) => popup.id !== action.payload.id),
      }
    case 'UI_POPUP_CLEAR':
      return {
        ...state,
        popups: [],
      }
    // ⌨ Actions
    case 'ACTION_MOVE_FORWARD':
      return {
        ...state,
        actions: {
          ...state.actions,
          forward: action.payload,
        },
      }
    case 'ACTION_MOVE_BACKWARD':
      return {
        ...state,
        actions: {
          ...state.actions,
          backward: action.payload,
        },
      }
    case 'ACTION_MOVE_LEFT':
      return {
        ...state,
        actions: {
          ...state.actions,
          left: action.payload,
        },
      }
    case 'ACTION_MOVE_RIGHT':
      return {
        ...state,
        actions: {
          ...state.actions,
          right: action.payload,
        },
      }
    case 'ACTION_FISH':
      return {
        ...state,
        actions: {
          ...state.actions,
          fish: action.payload,
        },
      }
    case 'ACTION_INTERACT':
      return {
        ...state,
        actions: {
          ...state.actions,
          interact: action.payload,
        },
      }
    case 'ACTION_BOOST':
      return {
        ...state,
        actions: {
          ...state.actions,
          boosting: action.payload,
        },
      }
      
    default:
      return state
  }
}

export const AppContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return <AppContext.Provider value={[state, dispatch]}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const [state, dispatch] = useContext(AppContext)
  return [state, dispatch]
}
