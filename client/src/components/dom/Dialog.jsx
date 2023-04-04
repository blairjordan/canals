import React from 'react';

const Dialog = ({ avatarUrl, name, children }) => {
  return (
    <div className="flex items-start py-4">
      <div className="h-12 w-12 rounded-full bg-gray-300 mr-4"></div>
      <div className="bg-gray-200 rounded-lg px-4 py-3">
        <p className="font-semibold text-gray-800">{name}</p>
        <div className="text-gray-800">{children}</div>
      </div>
    </div>
  );
};

Dialog.displayName = 'Dialog';

export default Dialog;
