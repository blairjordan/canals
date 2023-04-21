import React from 'react';

const ImageItem = ({ item }) => {
  return (
    <div className="flex gap-4">
      {item && (
        <div className="relative bg-gray-200 rounded-lg h-32 w-32">
          <img 
            src={`img/items/${item.type}/${item.itemKey}.png`} 
            alt={item.name} 
            className="h-full w-full object-cover rounded-lg"
          />
        </div>
      )}
      <div className="flex flex-col justify-center">
        <div>{item.description}</div>
      </div>
    </div>
  );
};

ImageItem.displayName = 'ImageItem';

export default ImageItem;
