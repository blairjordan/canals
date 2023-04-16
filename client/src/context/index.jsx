import React, { createContext, useContext, useReducer } from 'react'

export const AppContext = createContext()

const initialState = {
  loggedIn: false,
  player: null,
  remotePlayers: [],
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
    case 'PLAYER_SET_FISHING':
      return {
        ...state,
        player: {
          ...state.player,
          isFishing: action.payload,
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
    case 'REMOTE_PLAYER_UPDATE_POSITION':
      return {
        ...state,
        remotePlayers: state.remotePlayers.map((player) =>
          player.id === action.payload.player.id
          ? {
            ...player,
            position: action.payload.position,
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
    case 'ACTION_CANCEL':
      return {
        ...state,
        actions: {
          ...state.actions,
          cancel: action.payload,
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
