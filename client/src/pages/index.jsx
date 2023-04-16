import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import Popup from '@/components/dom/Popup'
import Login from '@/components/dom/Login'
import PopupStack from '@/components/dom/PopupStack'
import { useAppContext } from '@/context'
import { useLazyQuery, useSubscription, useMutation } from '@apollo/client'
import { PLAYER, PLAYERS_ALL, PLAYERS_NEARBY } from '@/graphql/player'
import { PURCHASE } from '@/graphql/action'
import ItemGrid from '@/components/dom/ItemGrid'

const Game = dynamic(() => import('@/components/canvas/Game'), { ssr: false })

export default function Page(props) {
  const [state, dispatch] = useAppContext()

  const [getPlayer, { loading: loadingPlayer, data: playerData, error: playerError }] = useLazyQuery(PLAYER, { fetchPolicy: 'no-cache' })
  const [getRemotePlayers, { loading: loadingRemotePlayers, data: remotePlayersData, error: remotePlayersError }] =
    useLazyQuery(PLAYERS_ALL)

  // 🪙 Purchase item mutation
  const [purchaseItem] = useMutation(PURCHASE, {
    onCompleted: (data) => {
      console.log('Item purchased successfully:', data)
      // Refresh player's items
      getPlayer({ variables: { id: state.player.id } })
    },
    onError: (error) => {
      console.log('Error purchasing item:', error)
    },
  })

  useSubscription(PLAYERS_NEARBY, {
    onData: (payload) => {
      if (!(payload.data && payload.data.listen && payload.data.listen.query)) {
        return
      }
      const { data: { listen: { query: { players: { nodes: playerNodes } } } } } = payload
      handlePlayerUpdate(playerNodes)
    },
  })

  const handleLogin = (id) => {
    getPlayer({ variables: { id } })
    getRemotePlayers()
  }

  const handlePlayerUpdate = useCallback(
    (updatedPlayers) => {
      if (!(state.player && state.player.id)) {
        return
      }
      updatedPlayers.map((updatedPlayer) => {
        if (updatedPlayer.id !== state.player.id) {
          dispatch({ type: 'REMOTE_PLAYER_UPDATE_POSITION', payload: updatedPlayer })
        }
      })
    },
    [dispatch, state.player],
  )

  useEffect(() => {
    if (!loadingPlayer && playerData && playerData.player) {
      if (!state.player.id) {
        dispatch({ type: 'LOGIN', payload: playerData.player })
      }
      console.log(playerData)
    }
  }, [loadingPlayer, playerData])

  useEffect(() => {
    if (!(state.player && state.player.id)) {
      return
    }

    if (!loadingRemotePlayers && remotePlayersData) {
      dispatch({
        type: 'REMOTE_PLAYERS_SET',
        payload: remotePlayersData.players.nodes.filter((player) => player.id !== state.player.id),
      })
    }
  }, [loadingRemotePlayers, remotePlayersData, state.player])

  useEffect(() => {
    const vendorMarkers = state.geofences.filter((geofence) => geofence.type === 'vendor')
    // state.player && state.player.id is truthy when the player is logged in
    if (!(state.player && state.player.id)) {
      return
    }

    if (vendorMarkers.length === 0) {
      dispatch({ type: 'UI_POPUP_CLEAR' })
    }

    if (vendorMarkers.length > 1) {
      dispatch({ type: 'UI_POPUP_REMOVE', payload: { id: `vendor-${vendorMarkers[0].id}` } })
    }

    if (vendorMarkers.length > 0) {
      // Popup opens for the last vendor geofence added to the array
      const vendor = vendorMarkers[vendorMarkers.length - 1]
      const popupId = `vendor-${vendor.id}`
      const popupExists = state.popups.some((popup) => popup.id === popupId)
      if (!popupExists) {
        // 🗨 Add a popup when the player is inside a marker zone
        dispatch({
          type: 'UI_POPUP_ADD',
          payload: {
            id: popupId,
            title: vendor.props.name,
            message: `Press E to interact with ${vendor.props.name}`,
            type: 'vendor',
            vendor,
          },
        })
      }
    }
  }, [state.player, state.geofences])

  return (
    <>
    <PopupStack>
      {
        // state.player.id is truthy when the player is logged in
        !(state.player && state.player.id) && (
          <Popup>
            <Login onLogin={handleLogin} />
          </Popup>
        )
      }
      {/* Map over the vendors in state and render a Popup component for each one */}
      {state.popups
        .filter(({type}) => type === 'vendor')
        .map(({ id, title, message, vendor, interacted }) => (
        <Popup key={id}>
          <h2>{title}</h2>
          {/* TODO: Move this to a separate Vendor component along with related gql */}
          {interacted ? (
            <>
              <ItemGrid
                numBoxes={16}
                items={vendor.markerItems.nodes}
                onItemClick={(item) => {
                  dispatch({ type: 'UI_POPUP_REMOVE', payload: { id } })
                  purchaseItem({
                    variables: {
                      playerId: parseInt(state.player.id),
                      itemId: parseInt(item.id),
                    },
                  })
                }}
              />
            </>
          ) : (
            <>
              <p>{message}</p>
            </>
          )}
        </Popup>
      ))}
      </PopupStack>
    </>
  )
}

Page.canvas = (props) => <Game />

export async function getStaticProps() {
  return { props: { title: 'Game' } }
}
