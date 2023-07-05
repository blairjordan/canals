import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import Popup from '@/components/dom/Popup'
import PopupStack from '@/components/dom/PopupStack'
import { useAppContext } from '@/context'
import { useMutation } from '@apollo/client'
import {
  PURCHASE,
  SELL,
  REFUEL,
  OPERATE_LOCK,
  PICKUP_PACKAGE,
  DELIVER_PACKAGE,
  EQUIP_ITEM,
  UNEQUIP_ITEM,
} from '@/graphql/action'
import ItemGrid from '@/components/dom/ItemGrid'
import ItemDisplay from '@/components/dom/ItemDisplay'
import { Dialog } from '@/components/dom/Dialog'
import { FlagUploader } from './FlagUploader'

function PopupManager(props) {
  const [state, dispatch] = useAppContext()

  // TODO: Debounce all actions

  // 💸 Purchase item mutation
  const [purchaseItem] = useMutation(PURCHASE, {
    onCompleted: (data) => console.log('Item purchased:', data),
    onError: (error) => console.log('Error purchasing item:', error),
  })

  // 💰 Sell item mutation
  const [sellItem] = useMutation(SELL, {
    onCompleted: (data) => console.log('Item sold:', data),
    onError: (error) => console.log('Error purchasing item:', error),
  })

  // ⛽ Refuel mutation
  const [refuel] = useMutation(REFUEL, {
    onCompleted: (data) => console.log('Refueled:', data),
    onError: (error) => console.log('Error refueling:', error),
  })

  // 🚪 Use lock
  const [operateLock] = useMutation(OPERATE_LOCK, {
    onCompleted: (data) => console.log('Used lock:', data),
    onError: (error) => console.log('Error using lock:', error),
  })

  // 📦 Pickup package
  const [pickupPackage] = useMutation(PICKUP_PACKAGE, {
    onCompleted: (data) => {
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'marina' } })
      console.log('Package picked up:', data)
    },
    onError: (error) => console.log('Error picking up package:', error),
  })

  // 📮 Deliver package
  const [deliverPackage] = useMutation(DELIVER_PACKAGE, {
    onCompleted: (data) => {
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'marina' } })
      console.log('Package delivered:', data)
    },
    onError: (error) => console.log('Error delivering package:', error),
  })

  // ✅ Equip item
  const [equipItem] = useMutation(EQUIP_ITEM, {
    onCompleted: (data) => {
      console.log('Item equipped:', data)
    },
    onError: (error) => console.log('Error equipping package:', error),
  })

  // ➖ Unequip item
  const [unequipItem] = useMutation(UNEQUIP_ITEM, {
    onCompleted: (data) => {
      console.log('Item unequipped:', data)
    },
    onError: (error) => console.log('Error unequipping package:', error),
  })

  const handleInventoryClick = ({ itemContainer: { id: playerItemId, props }, item }) => {
    if (!props) {
      return
    }

    if (!props.equipped) {
      equipItem({
        variables: {
          playerId: parseInt(state.player.id),
          playerItemId: parseInt(playerItemId),
        },
      })
    } else {
      unequipItem({
        variables: {
          playerId: parseInt(state.player.id),
          playerItemId: parseInt(playerItemId),
        },
      })
    }
  }

  const addPopup = useCallback(
    ({ id, type, payload }) => {
      const popupExists = state.popups.some((popup) => popup.id === id)
      if (!popupExists) {
        // 🗨 Add a popup when the player is inside a marker zone
        dispatch({
          type: 'UI_POPUP_ADD',
          payload: {
            id,
            type,
            ...payload,
          },
        })
      }
    },
    [state.popups, dispatch],
  )

  useEffect(() => {
    const geofenceMarkers = state.geofences.filter((geofence) =>
      ['vendor', 'fuel_station', 'lock', 'marina', 'npc'].includes(geofence.type),
    )

    const popups = state.popups.filter((popups) =>
      ['vendor', 'fuel_station', 'lock', 'marina', 'npc'].includes(popups.type),
    )

    // Remove the first popup in the stack if there are more than one
    popups.map(({ marker: popupMarker }) => {
      if (!geofenceMarkers.some((geofenceMarker) => geofenceMarker.id === popupMarker.id)) {
        dispatch({ type: 'UI_POPUP_REMOVE', payload: { id: `marker-${popupMarker.id}` } })
      }
    })

    if (geofenceMarkers.length === 1) {
      const marker = geofenceMarkers[geofenceMarkers.length - 1]

      // 🚢 Marina-specific conditions
      const isMarina = marker.type === 'marina'
      const hasPickup = isMarina && marker.packages && !state.player.packageItem
      const hasDelivery =
        isMarina &&
        state.player.packageItem &&
        parseInt(marker.id) === state.player.packageItem.props.destination_marker_id

      const message = (() => {
        switch (marker.type) {
          case 'vendor':
            return `(Press E to interact)`
          case 'fuel_station':
            return `(Press E to refuel)`
          case 'npc':
            return `(Press E to speak)`
          case 'marina':
            return hasPickup ? '(Press E to pickup package)' : hasDelivery ? '(Press E to deliver package)' : ''
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
          marker,
        },
      })
    }

    // Remove popups if the player is no longer inside a geofence
    if (geofenceMarkers.length === 0) {
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'vendor' } })
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'fuel_station' } })
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'marina' } })
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'npc' } })
    }
  }, [state.player, state.markers, state.geofences])

  // 🐠 Fishing popups
  useEffect(() => {
    if (state.player.isFishing) {
      addPopup({
        id: `fishing-${state.player.id}`,
        type: 'fishing_status',
        payload: {
          title: 'Fishing 🎣',
          message: `Press E to stop fishing`,
        },
      })
    } else {
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'fishing_status' } })
    }
  }, [state.player.isFishing])

  // 🎒 Inventory popup
  useEffect(() => {
    if (state.player.isInventoryOpen) {
      addPopup({
        id: `inventory-${state.player.id}`,
        type: 'inventory',
      })
    } else {
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'inventory' } })
    }
  }, [state.player.isInventoryOpen])

  // ⚙ Settings popup
  useEffect(() => {
    if (state.player.isSettingsOpen) {
      addPopup({
        id: `settings-${state.player.id}`,
        type: 'settings',
      })
    } else {
      dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'settings' } })
    }
  }, [state.player.isSettingsOpen])

  useEffect(() => {
    state.popups.forEach((popup) => {
      const { type, interacted } = popup

      if (['lock', 'fuel_station', 'marina'].includes(type) && interacted) {
        switch (type) {
          case 'fuel_station':
            refuel()
            break
          case 'lock':
            operateLock()
            break
          case 'marina':
            pickupPackage()
            deliverPackage()
            break
          default:
            break
        }

        dispatch({
          type: 'SET_UI_POPUP_INTERACT',
          payload: {
            popup,
            interacted: false,
          },
        })
      }
    })
  }, [state.popups])

  return (
    <>
      <PopupStack>
        {/* 🎣 Fishing status popup */}
        {state.popups.some(({ type }) => type === 'fishing_status') && (
          <Popup key='fishing-status-popup'>
            <h2>Fishing 🎣</h2>
            <p>Press Esc to stop fishing</p>
          </Popup>
        )}
        {/* 🎒 Inventory popup */}
        {state.popups.some(({ type }) => type === 'inventory') && (
          <Popup
            key='inventory-popup'
            title='Inventory 🎒'
            tabs={['decor', 'plant', 'boat_hull', 'boat_engine', 'boat_stern', 'fishing_rod'].map((type) => ({
              // Format the type to be more human-readable
              label: type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
              content: (
                <ItemGrid
                  numBoxes={16}
                  items={state.player.playerItems.nodes?.filter(({ item }) => item.type === type)}
                  displayEquipped={true}
                  onItemClick={handleInventoryClick}
                />
              ),
            }))}>
            <div className='mt-4 flex justify-end'>(Click items to equip / unequip)</div>
          </Popup>
        )}
        {/* ⚙ Settings popup */}
        {state.popups.some(({ type }) => type === 'settings') && (
          <Popup key='settings-popup' title='Settings ⚙'>
            <h1>🚩 Upload a flag</h1>
            <br />
            <div>
              <FlagUploader />
            </div>
          </Popup>
        )}
        {/* 🐟 Caugh fish popup */}
        {state.popups
          .filter(({ type }) => type === 'fish_caught')
          .map(({ id, item }) => (
            <Popup
              key={id}
              timeoutDuration={5_000}
              onClose={() => dispatch({ type: 'UI_POPUP_CLEAR', payload: { type: 'fish_caught' } })}>
              <h2>
                You caught a <strong>{item.name}</strong> !
              </h2>{' '}
              <br />
              <ItemDisplay item={item} />
            </Popup>
          ))}
        {/* ⛽ Refuel, 🔒 lock, and 🛥 marina popups */}
        {state.popups
          .filter(({ type }) => ['fuel_station', 'lock', 'marina'].includes(type))
          .map(({ id, title, message }) => (
            <Popup key={id}>
              <h1>{title}</h1>
              {message}
            </Popup>
          ))}
        {/* 🧍 NPC */}
        {state.popups
          .filter(({ type }) => ['npc'].includes(type))
          .map(({ id, title, message, marker, interacted }) => (
            <Popup key={id}>
              {!interacted ? (
                <>
                  <h1>{title}</h1>
                  {message}
                </>
              ) : (
                <Dialog markerKey={marker.props.key} name={marker.props.name} data={marker.props.dialog} />
              )}
            </Popup>
          ))}
        {/* 🏪 Vendor popups */}
        {state.popups
          .filter(({ type }) => type === 'vendor')
          .map(({ id, title, message, marker, interacted }) => (
            <Popup
              key={id}
              title={title}
              tabs={
                !interacted
                  ? []
                  : [
                      ...(marker.markerItems.nodes.length !== 0
                        ? [
                            {
                              label: 'Buy',
                              content: (
                                <ItemGrid
                                  numBoxes={8}
                                  items={marker.markerItems.nodes}
                                  onItemClick={({ item }) => {
                                    purchaseItem({
                                      variables: {
                                        itemId: parseInt(item.id),
                                      },
                                    })
                                  }}
                                  displayPrice={true}
                                />
                              ),
                            },
                          ]
                        : []),
                      // Add selling tab if vendor props.purchase_item_types is truthy
                      ...(marker.props && marker.props.purchase_item_types
                        ? [
                            {
                              label: 'Sell',
                              content: (
                                <ItemGrid
                                  numBoxes={8}
                                  items={state.player.playerItems.nodes.filter((playerItemNode) => {
                                    return marker.props.purchase_item_types.includes(playerItemNode.item.type)
                                  })}
                                  onItemClick={({ itemContainer: playerItem }) => {
                                    sellItem({
                                      variables: {
                                        markerId: parseInt(marker.id),
                                        playerItemId: parseInt(playerItem.id),
                                      },
                                    })
                                  }}
                                  displayPrice={true}
                                />
                              ),
                            },
                          ]
                        : []),
                    ]
              }>
              {!interacted && (
                <>
                  <h1>{title}</h1>
                  <p>{message}</p>
                </>
              )}
            </Popup>
          ))}
      </PopupStack>
    </>
  )
}

PopupManager.displayName = 'PopupManager'

export default PopupManager
