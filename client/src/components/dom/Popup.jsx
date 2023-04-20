import React, { useState, useEffect } from 'react';

function Popup({ children, timeoutDuration = undefined, onClose = () => {} }) {
  const [isVisible, setIsVisible] = useState(true);

  const FADEOUT_DURATION = 500;
  const CLOSE_DURATION = FADEOUT_DURATION + 500;

  useEffect(() => {
    if (typeof timeoutDuration === 'undefined') {
      return
    } 
    let timer = undefined;

    timer = setTimeout(() => {

      // Fade out
      setIsVisible(false);

      // Wait for fade out to complete
      setTimeout(() => {
        onClose();
      }, CLOSE_DURATION);

    }, timeoutDuration);

    return () => {
      clearTimeout(timer);
    };
  }, [timeoutDuration]);

  return (
    <div className={`transition-opacity duration-${FADEOUT_DURATION} ease-out ${ isVisible ? 'opacity-100' : 'opacity-0' }`}>
      <div
        className='px-10 py-8 text-sm shadow-xl rounded-lg bg-zinc-800 md:text-base z-50'
        >
        <div className='tracking-wider'>
          {children}
        </div>
      </div>
    </div>
  )
}

Popup.displayName = 'Popup';

export default Popup;
