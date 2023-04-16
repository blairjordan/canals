import React from 'react';

function PopupStack({ children }) {
  return (
    <div className='absolute z-40 left-1/2 transform -translate-x-1/2'
    style={{ maxWidth: 'calc(100% - 28px)' }}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={` top-${index * 16}  transform  z-40 p-2`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export default PopupStack;

