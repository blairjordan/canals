import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import Popup from '@/components/dom/Popup'
import Login from '@/components/dom/Login'
import PopupStack from '@/components/dom/PopupStack'
import { useAppContext } from '@/context'
import { useMutation } from '@apollo/client'
import { PURCHASE, SELL, REFUEL, USE_LOCK } from '@/graphql/action'
import ItemGrid from '@/components/dom/ItemGrid'
import ItemDisplay from '@/components/dom/ItemDisplay'
import usePlayer from '../hooks/usePlayer';

const PLAYER_POLL_INTERVAL=5_000

function PopupManager(props) {
  const [state, dispatch] = useAppContext()
  const [getPlayer, playerStartPolling, { loading: loadingPlayer, data: playerData, error: playerError }] = usePlayer();

  // 💸 Purchase item mutation
  const [purchaseItem] = useMutation(PURCHASE, {
    onCompleted: (data) => {
      console.log('Item purchased successfully:', data)
      getPlayer({ variables: { id: state.player.id } })
    },
    onError: (error) => {
      console.log('Error purchasing item:', error)
    },
  })

  // 💰 Sell item mutation
  const [sellItem] = useMutation(SELL, {
    onCompleted: (data) => {
      console.log('Item sold successfully:', data)
      getPlayer({ variables: { id: state.player.id } })
    },
    onError: (error) => {
      console.log('Error purchasing item:', error)
    },
  })

  // ⛽ Refuel mutation
  const [refuel] = useMutation(REFUEL, {
    // TODO: debounce refueling
    onCompleted: (data) => {
      console.log('Refueled successfully:', data)
      getPlayer({ variables: { id: state.player.id } })
    },
    onError: (error) => {
      console.log('Error refueling:', error)
    },
  })

  // 🚪 Use lock
  const [useLock] = useMutation(USE_LOCK, {
    // TODO: debounce lock usage
    onCompleted: (data) => {
      console.log('Used lock successfully:', data)
      getPlayer({ variables: { id: state.player.id } })
    },
    onError: (error) => {
      console.log('Error using lock:', error)
    },
  })

  const handleLogin = (id) => {
    getPlayer({ variables: { id } })
    playerStartPolling(PLAYER_POLL_INTERVAL)
  }

  const addPopup = useCallback(({ id, type, payload }) => {
    const popupExists = state.popups.some((popup) => popup.id === id)
    if (!popupExists) {
      // 🗨 Add a popup when the player is inside a marker zone
      dispatch({
        type: 'UI_POPUP_ADD',
        payload: {
          id,
          type,
          ...payload
        },
      })
    }
  }, [state.popups, dispatch])

  useEffect(() => {
    // state.player && state.player.id is truthy when the player is logged in
    if (!(state.player && state.player.id)) {
      return
    }

    const geofenceMarkers = state.geofences.filter((geofence) =>
      ['vendor', 'fuel_station', 'lock'].includes(geofence.type)
    )

    const popups = state.popups.filter((popups) =>
      ['vendor', 'fuel_station', 'lock'].includes(popups.type)
    )

    // Remove the first popup in the stack if there are more than one
    popups.map(({ marker: popupMarker }) => {
      if (!geofenceMarkers.some((geofenceMarker) => geofenceMarker.id === popupMarker.id )) {
        dispatch({ type: 'UI_POPUP_REMOVE', payload: { id: `marker-${popupMarker.id}` } })
      }
    })

    if (geofenceMarkers.length === 1) {
      const marker = geofenceMarkers[geofenceMarkers.length - 1]

      const message = (() => {
        switch (marker.type) {
          case 'vendor':
            return `(Press E to interact)`
          case 'fuel_station':
            return `(Press E to refuel)`
          case 'lock':
            return `(Press E to use lock)`
        }
      })()

      addPopup({
        id: `marker-${marker.id}`,
        type: marker.type,
        payload: {
          title: marker.props.name,
          message,
          marker
        }
      })
    }
    

    // Remove popups if the player is no longer inside a geofence
    if (geofenceMarkers.length === 0) {
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'vendor' } })
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'fuel_station' } })
    }

  }, [state.player, state.markers, state.geofences])

  // Fishing popups
  useEffect(() => {
    // state.player && state.player.id is truthy when the player is logged in
    if (!(state.player && state.player.id)) {
      return
    }

    if (state.player.isFishing) {
      addPopup({
        id: `fishing-${state.player.id}`,
        type: 'fishing_status',
        payload: {
          title: 'Fishing 🎣',
          message: `Press E to stop fishing`,
        }
      })
    } else {
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'fishing_status' } })
    }

  }, [state.player.isFishing])

  useEffect(() => {
    // state.player && state.player.id is truthy when the player is logged in
    if (!(state.player && state.player.id)) {
      return
    }
    
    state.popups.filter(({ type, interacted }) =>
      ['lock', 'fuel_station'].includes(type)
      && interacted
    ).map((popup) => {

      if (popup.type === 'fuel_station') {
        refuel({
          variables: {
            playerId: parseInt(state.player.id),
          },
        })
      }

      if (popup.type === 'lock') {
        useLock({
          variables: {
            playerId: parseInt(state.player.id),
            markerId: parseInt(popup.marker.id),
          },
        })
      }

      dispatch({
        type: 'SET_UI_POPUP_INTERACT',
        payload: {
          popup,
          interacted: false
        }
      })
    })

  }, [state.popups])

  return (
    <>
    <PopupStack>
      {
        // state.player.id is truthy when the player is logged in
        !(state.player && state.player.id) && (
          <Popup key='login'>
            <Login onLogin={handleLogin} />
          </Popup>
        )
      }
      {/* 🎣 Fishing status popup */}
      {state.popups.some(({type}) => type === 'fishing_status') && (
        <Popup key='fishing-status-popup'>
          <h2>Fishing 🎣</h2>
          <p>Press Esc to stop fishing</p>
        </Popup>
      )}
      {/* 🐟 Caugh fish popup */}
      {state.popups
        .filter(({type}) => type === 'fish_caught')
        .map(({ id, item }) => (
        <Popup
          key={id}
          timeoutDuration={5_000}
          onClose={() => dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'fish_caught' } })}
        >
          <h2>You caught a <strong>{item.name}</strong> !</h2> <br />
          <ItemDisplay item={item} />
        </Popup>
        )
      )}
      {/* ⛽ Refuel popup */}
      {state.popups
        .filter(({type}) => ['fuel_station', 'lock'].includes(type))
        .map(({ id, title, message }) => (
        <Popup
          key={id}
        >
        <h1>{title}</h1>
        {message}
        </Popup>
        ))
      }
      {/* 🏪 Vendor popups */}
      {state.popups
        .filter(({type}) => type === 'vendor')
        .map(({ id, title, message, marker, interacted }) => (
        <Popup
          key={id}
          title={title}
          tabs={
            !interacted ? [] : [
            ...((marker.markerItems.nodes.length !== 0) ? [
            {
              label: 'Buy',
              content: (
                <ItemGrid
                  numBoxes={8}
                  items={marker.markerItems.nodes}
                  onItemClick={({ item }) => {
                    purchaseItem({
                      variables: {
                        playerId: parseInt(state.player.id),
                        itemId: parseInt(item.id),
                      },
                    })
                  }}
                />
              )
            }] : []),
            // Add selling tab if vendor props.purchase_item_types is truthy
            ...((marker.props && marker.props.purchase_item_types) ? [
              {
                label: 'Sell',
                content: <ItemGrid
                  numBoxes={8}
                  items={
                    state.player.playerItems.nodes.filter((playerItemNode) => {
                      return marker.props.purchase_item_types.includes(playerItemNode.item.type)
                    })
                  }
                  onItemClick={( { itemContainer: playerItem }) => {
                    sellItem({
                      variables: {
                        markerId: parseInt(marker.id),
                        playerItemId: parseInt(playerItem.id),
                      },
                    })
                  }}
                />
              }] : [])
          ]
        }
        >
          <h1>{title}</h1>
          <p>{message}</p>
        </Popup>))
      }
      </PopupStack>
    </>
  )
}

PopupManager.displayName = 'PopupManager';

export default PopupManager;

