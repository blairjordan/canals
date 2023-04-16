import React from 'react';
function Popup({ children }) {
  return (
    <div
      className='px-10 py-8 text-sm shadow-xl rounded-lg bg-zinc-800 md:text-base z-50'
      >
      <div className='tracking-wider'>
        {children}
      </div>
    </div>
  )
}

Popup.displayName = 'Popup';

export default Popup;