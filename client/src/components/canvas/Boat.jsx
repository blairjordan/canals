import { useGLTF } from '@react-three/drei'
import { forwardRef, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAppContext } from '@/context'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

const baseBoatObjects = new Set([
  'hull_flooring',
  'house_boat_main_body',
  // 🚪 door
  'house_boat_main_door_01',
  // 🪟 windows
  'house_boat_main_window_02',
  'house_boat_main_window_03',
  'house_boat_main_window_04',
  'house_boat_main_window_05',
  'house_boat_main_window_06',
  'house_boat_main_window_07',
  'house_boat_main_window_08',
  'house_boat_main_window_09',
  'house_boat_main_window_10',
  'house_boat_main_window_11',
])

const itemObjects = new Map([
  // 🎣 Fishing rods
  ['spincast_rod', ['decor_fishing_rod_01']],
  ['spinning_rod', ['decor_fishing_rod_02']],
  ['baitcasting_rod', ['decor_fishing_rod_03']],
  // Sterns ⛴
  ['traditional_stern', [
    'house_boat_stern_traditional',
    'house_boat_stern_traditional_window_01',
    'house_boat_stern_traditional_window_02',
    'house_boat_stern_traditional_window_03',
    'house_boat_stern_traditional_window_04',
  ]],
  ['semi_traditional_stern', [
    'house_boat_stern_semi_traditional_door',
    'house_boat_stern_semi_traditional_seating',
    'house_boat_stern_semi_traditional_walls',
    'house_boat_stern_semi_traditional_window_01',
  ]],
  ['cruiser_stern', [
    'house_boat_main_door_02',
    'house_boat_stern_semi_cruiser_handrail',
    'house_boat_stern_semi_cruiser_wall',
    'house_boat_stern_semi_cruiser_window_01',
  ]],
  // 🚤 Hulls
  ['flat_hull', ['hull_flat_bottom']],
  ['vshaped_hull', ['hull_v_shaped']],
  ['multi_chine_hull', ['hull_multichine']],
  ['round_hull', ['hull_round']],
  // ☀ Solar panels
  ['solar_panels', [
    'decor_solar_panel_01',
    'decor_solar_panel_02',
    'decor_solar_panel_03',
    'decor_solar_panel_04',
  ]],
  // 🪣 Bucket
  ['fishing_bucket', ['bucket']],
  // 🪑 Deck chair
  ['deck_chair', ['decor_deck_chair', 'decor_deck_chair_material']],
  // 📦 Packages
  ['art_supplies', ['box']],
  ['boating_magazines', ['box']],
  ['propellers', ['box']],
  ['lures', ['box']],
  // 🛟 life buoy
  ['life_buoy', ['life_buoy']],
  // 🌬 air conditioner
  ['air_conditioner', ['decor_air_con']],
  // ⚙ engines
  ['electric_engine', ['engine_electric']],
  ['outboard_engine', ['engine_outboard']],
  ['inboard_engine', ['engine_inboard']],
  ['inboard_diesel_engine', ['engine_inboard_diesel']],
]);

const Boat = forwardRef(({
  playerId = 0,
  isRemotePlayer = false,
  ...props
}, ref) => {
  const [state] = useAppContext()
  const [prevPlayerItemsHash, setPrevPlayerItemsHash] = useState('');
  
  // TODO: Split into its own file eventually
  const { scene, nodes } = useGLTF('/models/canals.glb')

  useEffect(() => {
    setPrevPlayerItemsHash(getPlayerItemsHash())
  }, [nodes])

  const player = useMemo(() => (
    isRemotePlayer ?
      state.remotePlayers.find((player) => player.id === playerId) :
      state.player
  ), [playerId, isRemotePlayer, state.remotePlayers, state.player])

  const getPlayerItemsHash = useCallback(() => (
    isRemotePlayer ? player?.hashedPlayerItems : player.hashedPlayerItems
  ), [player])

  const playerGroup = useMemo(() => ({ group: new THREE.Group() }), []);

  const { objectsToAdd, objectsToRemove } = useMemo(() => {
    if (!(state.player && state.player.id) || !player.playerItems?.nodes) {
      return { objectsToAdd: [], objectsToRemove: [] }
    }
  
    const playerItems = player.playerItems.nodes;
  
    return Object.entries(nodes).reduce((prev, [key, object]) => {
      const isBaseObject = baseBoatObjects.has(key);
      const isItemObject = playerItems.some(({ item, props }) =>
        props?.equipped && itemObjects.get(item.itemKey)?.includes(key)
      );
  
      ((isBaseObject || isItemObject) ? prev.objectsToAdd : prev.objectsToRemove).push(object);
  
      return prev;
    }, { objectsToAdd: [], objectsToRemove: []});
  }, [
    nodes,
    (getPlayerItemsHash() !== prevPlayerItemsHash)
  ]);
  
  useEffect(() => {
    playerGroup.group.rotation.order = "YXZ";

    objectsToAdd && objectsToAdd.forEach((object) => {
      const cloned = clone(object);
      cloned.rotateY(Math.PI * 4);
      playerGroup.group.add(cloned);
    });

    console.log(objectsToRemove && objectsToRemove.length)

    objectsToRemove && objectsToRemove && objectsToRemove.forEach((object) => {
      const objectToRemove = playerGroup.group.getObjectByName(object.name);
      playerGroup.group.remove(objectToRemove)
    });

    setPrevPlayerItemsHash(getPlayerItemsHash());

  }, [objectsToAdd, objectsToRemove, playerGroup]);

  return <primitive
    object={playerGroup.group}
    ref={ref}
    {...props}
  />
});

Boat.displayName = 'Boat';

export { Boat }