import React, { createContext, useContext, useReducer } from 'react'

export const AppContext = createContext()

const MESSAGES_MAX = 20

const initialState = {
  loggedIn: false,
  isUIFocus: false,
  player: {
    position: {
      x: undefined,
      y: undefined,
      z: undefined
    },
    isFishing: false,
    playerItems: []
  },
  remotePlayers: [],
  markers: [],
  geofences: [],
  popups: [],
  locks: [],
  messages: [],
  actions: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    fish: false,
    interact: false,
    boosting: false,
    cancel: false
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
    case 'SET_UI_FOCUS':
      return {
        ...state,
        isUIFocus: action.payload,
      }
    case 'PLAYER_SET_FISHING':
      return {
        ...state,
        player: {
          ...state.player,
          isFishing: action.payload,
        },
      }
    case 'PLAYER_UPDATE':
      return {
        ...state,
        player: {
          ...state.player,
          ...action.payload,
        },
      }
    case 'PLAYER_UPDATE_POSITION':
      return {
        ...state,
        player: {
          ...state.player,
          position: action.payload,
        },
      }
    case 'REMOTE_PLAYERS_SET':
      return {
        ...state,
        remotePlayers: action.payload,
      }
    case 'REMOTE_PLAYER_UPDATE':
      console.log(action.payload)
      return {
        ...state,
        remotePlayers: state.remotePlayers.map((player) =>
          player.id === action.payload.id
          ? {
            ...player,
            position: action.payload.position,
            playerItems: action.payload.playerItems
          } : player,
        ),
      }
    case 'REMOTE_PLAYERS_ADD':
      return {
        ...state,
        remotePlayers: [...state.remotePlayers, action.payload],
      }
    case 'REMOTE_PLAYERS_REMOVE':
      return {
        ...state,
        remotePlayers: state.remotePlayers.filter((player) => player.id !== action.payload.id),
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
        geofences: state.geofences.some(g => g.id === action.payload.id)
          ? [...state.geofences]
          : [...state.geofences, action.payload],
      }
    case 'MARKER_UPDATE':
      return {
        ...state,
        markers: state.markers.map((marker) =>
          marker.id === action.payload.id
          ? {
            ...marker,
            ...action.payload
          } : marker,
        ),
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
    case 'SET_UI_POPUP_INTERACT':
      return {
        ...state,
        popups: state.popups.map((popup) =>
          popup.id === action.payload.popup.id
          ? {
            ...popup,
            interacted: action.payload.interacted 
          } : popup,
        ),
      }
    case 'UI_POPUP_REMOVE':
      return {
        ...state,
        popups: state.popups.filter((popup) => popup.id !== action.payload.id),
      }
    case 'UI_POPUP_CLEAR':
      const { type } = action.payload;
      const popups = state.popups.filter(popup => (
        !!type && popup.type !== type
      ));
      return {
        ...state,
        popups,
      };
    // 💬 Messages
    case 'MESSAGE_ADD':
      return {
        ...state,
        messages: [...state.messages, action.payload].slice(-MESSAGES_MAX),
      }
    // ⌨ Actions
    case 'ACTION_SET':
      if (state.isUIFocus) { return state; }
      return {
        ...state,
        actions: {
          ...state.actions,
          [action.payload.action]: action.payload.value,
        }
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
