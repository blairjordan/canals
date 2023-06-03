import { useAppContext } from '@/context';
import { useCallback } from 'react';

function PlayerInfo() {
  const [state] = useAppContext();

  const itemDeliveryLocation = useCallback(() => {
    if (!state.player.packageItem) { return null; }

    const destinationMarker = state.markers.find(
      (marker) => parseInt(marker.id) === state.player.packageItem.props.destination_marker_id
    );
    return destinationMarker ? destinationMarker.props.name : null;
  }, [state.player.packageItem, state.markers]);

  if (!(state.player && state.player.id)) {
    return null;
  }

  const fuel = Math.round(state.player.fuel);
  const formattedBalance = Math.floor(state.player.balance).toLocaleString();

  return (
    <div className="fixed bottom-0 right-0 p-4 text-white text-sm bg-gray-900 rounded-tl-lg shadow-md z-40 opacity-70">
      <p>⛽ {fuel}%</p>
      <p>🪙 {formattedBalance}</p>
      {state.player.packageItem && (
        <div className="group flex relative">
          <span className="text-white">📦 x1</span>
          <span className="group-hover:opacity-100 transition-opacity bg-gray-800 px-2 py-1 text-sm text-gray-100 rounded-md absolute bottom-full transform -translate-x-1/2 opacity-0 mx-auto w-48">
            {state.player.packageItem.item.name}<br />
            (Deliver to <strong>{itemDeliveryLocation()}</strong>)
          </span>
        </div>
      )}
    </div>
  );
}

export default PlayerInfo;
