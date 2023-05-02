import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import Popup from '@/components/dom/Popup'
import Login from '@/components/dom/Login'
import PopupStack from '@/components/dom/PopupStack'
import { useAppContext } from '@/context'
import { useLazyQuery, useMutation } from '@apollo/client'
import { PURCHASE, SELL } from '@/graphql/action'
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

  const handleLogin = (id) => {
    getPlayer({ variables: { id } })
    playerStartPolling(PLAYER_POLL_INTERVAL)
  }

  const addPopup = useCallback(({ id, type, payload }) => {
    const popupId = `${type}-${id}`
    const popupExists = state.popups.some((popup) => popup.id === popupId)
    if (!popupExists) {
      // 🗨 Add a popup when the player is inside a marker zone
      dispatch({
        type: 'UI_POPUP_ADD',
        payload: {
          id: popupId,
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

    const vendorGeofenceMarkers = state.geofences.filter((geofence) => geofence.type === 'vendor')

    // Remove the first popup in the stack if there are more than one
    if (vendorGeofenceMarkers.length > 1) {
      dispatch({ type: 'UI_POPUP_REMOVE', payload: { id: `vendor-${vendorGeofenceMarkers[0].id}` } })
    }

    if (vendorGeofenceMarkers.length > 0) {
      const vendor = vendorGeofenceMarkers[vendorGeofenceMarkers.length - 1]

      addPopup({
        id: vendor.id,
        type: 'vendor',
        payload: {
          title: vendor.props.name,
          message: `Press E to interact with ${vendor.props.name}`,
          vendor,
        }
      })
    }
    

    // Remove popups if the player is no longer inside a geofence
    if (vendorGeofenceMarkers.length === 0) {
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'vendor' } })
    }

  }, [state.player, state.markers, state.geofences])


  useEffect(() => {
    // state.player && state.player.id is truthy when the player is logged in
    if (!(state.player && state.player.id)) {
      return
    }

    if (state.player.isFishing) {
      addPopup({
        id: state.player.id,
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
      {/* 🏪 Vendor popups */}
      {state.popups
        .filter(({type}) => type === 'vendor')
        .map(({ id, title, message, vendor, interacted }) => (
        <Popup
          key={id}
          title={title}
          tabs={
            !interacted ? [] : [
            ...((vendor.markerItems.nodes.length !== 0) ? [
            {
              label: 'Buy',
              content: (
                <ItemGrid
                  numBoxes={8}
                  items={vendor.markerItems.nodes}
                  onItemClick={( { item }) => {
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
            ...((vendor.props && vendor.props.purchase_item_types) ? [
              {
                label: 'Sell',
                content: <ItemGrid
                  numBoxes={8}
                  items={
                    state.player.playerItems.nodes.filter((playerItemNode) => {
                      return vendor.props.purchase_item_types.includes(playerItemNode.item.type)
                    })
                  }
                  onItemClick={( { itemContainer: playerItem }) => {
                    sellItem({
                      variables: {
                        markerId: parseInt(vendor.id),
                        playerItemId: parseInt(playerItem.id),
                      },
                    })
                  }}
                />
              }] : [])
          ]
        }
        >
          <p>{message}</p>
        </Popup>))
      }
      </PopupStack>
    </>
  )
}

PopupManager.displayName = 'PopupManager';

export default PopupManager;

