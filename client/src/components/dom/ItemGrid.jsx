import React from 'react';

const ItemGrid = ({ numBoxes, items }) => {

  return <div className="flex flex-wrap gap-4">{
    Array.from({ length: numBoxes }, (_, index) => (
      <div className="bg-gray-200 rounded-lg h-32 w-32" key={index}>
        {items[index] && <img src={items[index].image} alt={items[index].name} />}
      </div>
    ))
  }</div>;
};

ItemGrid.displayName = 'ItemGrid';

export default ItemGrid;
