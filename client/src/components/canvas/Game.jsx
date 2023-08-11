import { CanalWater } from './CanalWater'
import { Player } from './Player'
import { useEffect, useRef, useMemo } from 'react'
import { Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useAppContext } from '@/context'
import { useMutation } from '@apollo/client'
import { DebugMarker } from './DebugMarker'
import { DebugAreaLine } from './DebugAreaLine'
import { RemotePlayer } from './RemotePlayer'
import { Particles } from './Particles'
import TWEEN from '@tweenjs/tween.js'
import { Seagull } from './Seagulls'
import { Objects } from './Objects'
import { NPC } from './NPC'
import { FISH } from '@/graphql/action'
import usePlayer from '../hooks/usePlayer'

export default function Game({ route, ...props }) {
  const [state, dispatch] = useAppContext()

  const [getPlayerSelf] = usePlayer()
  const canalRef = useRef(null)

  const playerAreas = useMemo(() => state.player.areas?.nodes?.map(({ id }) => id) || [], [state])

  const markerMap = useMemo(
    () =>
      state.areas.reduce((map, { id: areaId, areaMarkers }) => {
        areaMarkers.nodes.forEach(({ fromMarker, toMarker }) => {
          const combinedHash = [fromMarker.positionHash, toMarker.positionHash].sort().join('')
          map[combinedHash] = map[combinedHash] || { areaIds: new Set() }
          map[combinedHash].areaIds.add(areaId)
        })

        return map
      }, {}),
    [state.player.areas],
  )

  // 🎣 Fish mutation
  const [fish, { data: fishData, loading: fishLoading }] = useMutation(FISH)

  // 🎣 Start fishing when player is in fishing state
  useEffect(() => {
    if (!(state.player && state.player.id)) {
      return
    }

    if (state.player.isFishing) {
      const intervalId = setInterval(() => {
        fish()
      }, 5000)

      return () => clearInterval(intervalId)
    }
  }, [state.player?.isFishing])

  // 🐟 Add popup when fish is caught and update player
  useEffect(() => {
    if (fishLoading) return

    if (fishData && fishData.fish && fishData.fish.playerItem) {
      const {
        playerItem: { id, item },
      } = fishData.fish
      getPlayerSelf({ variables: { id: state.player.id } })
      dispatch({
        type: 'UI_POPUP_ADD',
        payload: {
          id: `player-item-${id}`,
          item,
          type: 'fish_caught',
        },
      })
    }
  }, [fishLoading, fishData])

  useEffect(() => {
    if (!(state.player && state.player.id)) return
    const { x: playerX, z: playerZ } = state.player.position

    state.markers
      .filter((marker) => marker.type !== 'geo_marker')
      .map((marker) => {
        const {
          position: { x: markerX, z: markerZ },
          radius,
        } = marker
        const distance = Math.sqrt(Math.pow(playerX - markerX, 2) + Math.pow(playerZ - markerZ, 2)) * 0.5
        if (distance < radius) {
          dispatch({ type: 'GEOFENCE_ADD', payload: marker })
        } else {
          dispatch({ type: 'GEOFENCE_REMOVE', payload: marker })
        }
      })
  }, [state.markers, state.player, state.player.position, state.geofences])

  // Check if player is inside marker zone
  useFrame(() => {
    TWEEN.update()

    // 📍 Check if player is interacting with a marker
    if (state.popups.length > 0) {
      if (state.actions.interact) {
        // 🛑 Cancel any fishing activity or inventory browsing
        dispatch({ type: 'PLAYER_SET_IS_FISHING', payload: false })
        dispatch({ type: 'PLAYER_SET_INVENTORY_OPEN', payload: false })
        dispatch({ type: 'PLAYER_SET_SETTINGS_OPEN', payload: false })

        dispatch({
          type: 'SET_UI_POPUP_INTERACT',
          payload: {
            popup: state.popups[state.popups.length - 1],
            interacted: true,
          },
        })
      }

      // Close all popups if cancel is pressed
      state.popups.map((popup) => {
        if (state.actions.cancel) {
          dispatch({
            type: 'SET_UI_POPUP_INTERACT',
            payload: {
              popup,
              interacted: false,
            },
          })
        }
      })
    }

    // If cancel key pressed ...
    if (state.actions.cancel) {
      // Close all popups
      state.popups.map((popup) => {
        dispatch({
          type: 'SET_UI_POPUP_INTERACT',
          payload: {
            popup,
            interacted: false,
          },
        })
      })

      // 🐡 Stop fishing
      dispatch({ type: 'PLAYER_SET_IS_FISHING', payload: false })
      // 🙅‍♂️ Close inventory and config
      dispatch({ type: 'PLAYER_SET_INVENTORY_OPEN', payload: false })
      dispatch({ type: 'PLAYER_SET_SETTINGS_OPEN', payload: false })
    }

    // 🎣 If player hits fishing key, set fishing state
    if (state.actions.fish) {
      dispatch({ type: 'PLAYER_SET_IS_FISHING', payload: true })
    }

    // 🎒 If player hits inventory key, set inventory state
    if (state.actions.inventoryToggle && !state.player.isInventoryOpen) {
      dispatch({ type: 'PLAYER_SET_INVENTORY_OPEN', payload: true })
    }

    // ⚙ If player hits settings key, set settings state
    if (state.actions.settingsToggle && !state.player.isSettingsOpen) {
      dispatch({ type: 'PLAYER_SET_SETTINGS_OPEN', payload: true })
    }
  }, -100)

  return (
    <>
      {/* <Terrain /> */}
      <Environment files='/textures/kloppenheim_06_puresky_2k.hdr' background />
      <CanalWater ref={canalRef} />
      {/* <Locks canalRef={canalRef} /> */}
      <Objects canalRef={canalRef} />
      {state.markers
        .filter((marker) => ['npc'].includes(marker.type))
        .map(({ id, position: { x, z, r }, type, props }) =>
          (() => {
            switch (type) {
              case 'npc':
                // 🧍 NPC
                return <NPC key={`npc-${id}`} position={[x, 0, z]} rotation={r} markerKey={props.key} />
              default:
                return <></>
            }
          })(),
        )}
      <Player />
      {Object.keys(state.remotePlayers).map((id) => (
        <RemotePlayer key={`player-${id}`} playerId={id} />
      ))}
      <Particles count={50} />
      <Seagull />
      {process.env.NEXT_PUBLIC_DEBUG_MARKERS === 'true' &&
        state.markers.map(({ id, position: { x, z }, radius, type, props }) => {
          // 🚩 Add DebugMarker for each marker
          return (
            <DebugMarker
              key={id}
              isDebugMode={true}
              scale={2}
              position={{ x, z }}
              radius={radius}
              color={(() => {
                switch (type) {
                  case 'vendor':
                    return '#B60019'
                  case 'fishing_spot':
                    return '#33B600'
                  case 'fuel_station':
                    return '#F18118'
                  case 'npc':
                    return '#6A07D0'
                  case 'lock':
                    if (props.state.openGate === 'lower') {
                      return '#0000ff'
                    } else {
                      return '#E500DF'
                    }
                  case 'marina':
                    return '#48CFE2'
                  default:
                    return '#999999'
                }
              })()}
            />
          )
        })}
      <>
        {process.env.NEXT_PUBLIC_DEBUG_AREAS === 'true' &&
          state.areas.flatMap(({ areaMarkers }) =>
            areaMarkers.nodes.map(({ fromMarker, toMarker }) => {
              const combinedHash = [fromMarker.positionHash, toMarker.positionHash].sort().join('')
              const areaIds = Array.from(markerMap[combinedHash].areaIds)
              const isInPlayerArea = playerAreas.some((pa) => areaIds.includes(pa))

              return (
                <DebugAreaLine
                  key={`area-line-${fromMarker.id}-${toMarker.id}`}
                  fromPosition={fromMarker.position}
                  toPosition={toMarker.position}
                  color={isInPlayerArea ? 'green' : 'red'}
                />
              )
            }),
          )}
      </>
    </>
  )
}
