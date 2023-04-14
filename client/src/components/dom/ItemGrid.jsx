import React from 'react';

const ItemGrid = ({ numBoxes, items, onItemClick }) => {
  const handleClick = (item) => {
    if (onItemClick && item) {
      onItemClick(item);
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: numBoxes }, (_, index) => (
        <div className="relative bg-gray-200 rounded-lg h-32 w-32" key={index} onClick={() => handleClick(items[index].item)} style={{ cursor: 'pointer' }}>
          {items[index] && (
            <div className="h-full w-full relative">
              <img 
                src={`img/items/${items[index].item.itemKey}.png`} 
                alt={items[index].item.name} 
                className="h-full w-full object-cover rounded-lg"
              />
              <div className="absolute bottom-0 left-0 w-full bg-black text-white text-sm rounded-b-md p-2 flex flex-col justify-center items-center z-10" style={{ opacity: 0.7 }}>
                <div className="mb-1">{items[index].item.name}</div>
                <div>🪙 {Math.round(items[index].item.price)}</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

ItemGrid.displayName = 'ItemGrid';

export default ItemGrid;
