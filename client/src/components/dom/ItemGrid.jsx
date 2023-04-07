import React from 'react';

const ItemGrid = ({ numBoxes, items }) => {

  return <div className="grid grid-cols-4 gap-4">{
    Array.from({ length: numBoxes }, (_, index) => (
      <div className="bg-gray-200 rounded-lg h-32 w-32" key={index}></div>
    ))
  }</div>;
};

ItemGrid.displayName = 'ItemGrid';

export default ItemGrid;
