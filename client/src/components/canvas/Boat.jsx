import { useGLTF } from '@react-three/drei'
import { forwardRef, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAppContext } from '@/context'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { isEqual } from 'lodash'; 

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
]);

// TODO: This will currently just render everyones boat from current player state (state.player.playerItems),
// however we need to publish and subscribe to equipped items for all players and render those
// Just requires an update to player_updated subscription topic
// Also need to reference items from remotePlayers state, not just current player state
// Could pass in isRemotePlayer prop to Boat component and use that to determine which state to use

const Boat = forwardRef(({ playerId = 0, ...props }, ref) => {
  const [state, dispatch] = useAppContext()
  const { scene, nodes } = useGLTF('/models/canals.glb') 

  const [prevPlayerItems, setPrevPlayerItems] = useState(state.player.playerItems?.nodes);

  const playerGroup = useMemo(() => ({ group: new THREE.Group() }), []);

  // 🐙 A deep compare of playerItems (to see if we need to update the boat)
  const deepCompareUserItem = useCallback((a, b) => {
    if (!a || !b) {
      return false;
    }
    if (a.id !== b.id) {
      return false
    }
    if (a.props?.equipped !== b.props?.equipped) {
      return false;
    }
  }, [])

  const objectsToRender = useMemo(() => {
    if (!(state.player && state.player.id)) {
      return []
    }
    const { nodes: playerItems } = state.player.playerItems;

    return Object.entries(nodes).reduce((prev, [key, object]) => {
      if (baseBoatObjects.has(key)) {
        prev.push(object);
      }

      playerItems.forEach(({ item, props }) => {
        if (props?.equipped) {
          const itemObjectsKeys = itemObjects.get(item.itemKey) || [];
          if (itemObjectsKeys.includes(key)) {
            prev.push(object);
          }
        }
      });

      return prev;
    }, []);
  }, [
    nodes,
    deepCompareUserItem(state.player.playerItems?.nodes, prevPlayerItems),
    playerId
  ]);
  
  useEffect(() => {
    playerGroup.group.rotation.order = "YXZ";

    objectsToRender.forEach((object) => {
      const cloned = clone(object);
      cloned.rotateY(Math.PI * 4);
      playerGroup.group.add(cloned);
    });

    setPrevPlayerItems(state.player.playerItems?.nodes);

  }, [objectsToRender, playerGroup]);

  return <primitive
    object={playerGroup.group}
    ref={ref}
    {...props}
  />
});

Boat.displayName = 'Boat';

export { Boat }