import React, { useState, useEffect } from 'react';

function Popup({ children, timeoutDuration = undefined, onClose = () => {}, tabs = [] }) {
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

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

  const renderTabs = () => {
    if (tabs.length === 0) {
      return null;
    }

    return (
      <div
        className={'flex justify-start mb-4 border-b-2 border-gray-600'}
      >
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`px-4 py-2 font-medium cursor-pointer ${
              activeTab === index ? 'text-white bg-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    if (tabs.length === 0) {
      return children;
    }

    return tabs[activeTab].content;
  };

  return (
    <div className={`transition-opacity duration-${FADEOUT_DURATION} ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className='px-10 py-8 text-sm shadow-xl rounded-lg bg-zinc-800 md:text-base z-50'>
        <div
          className='flex flex-col h-full'
          style={{ userSelect: 'none' }}
        >
          {renderTabs()}
          <div className='flex-1 tracking-wider'>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

Popup.displayName = 'Popup';

export default Popup;
