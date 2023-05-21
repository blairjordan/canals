import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context'

function ChatWindow(props) {
  const [state, dispatch] = useAppContext()
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef(null);

  const handleInputChange = (e) => { setInputValue(e.target.value); };

  const handleMessageSend = () => {
    const message = inputValue.trim()
    if (message === '') { return; }
    if (props.handleMessageSend) {
      props.handleMessageSend(message)
    }
    setInputValue('');
  };

  useEffect(() => {
    // ⬇ scroll to the bottom of the chat window when new messages are added
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [state.messages]);

  const handleFocus = () => {
    dispatch({ type: 'SET_UI_FOCUS', payload: true });
  };

  const handleBlur = () => {
    dispatch({ type: 'SET_UI_FOCUS', payload: false });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleMessageSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-2/3 min-w-[380px] p-2 bg-gray-900 rounded-lg shadow-md z-50 opacity-70">
      <div className="overflow-auto h-32" ref={chatContainerRef}>
        {state.messages.map(({ id, message, player: { username }}) => (
          <div key={id} className="mb-2">
            <strong>{username}:</strong> {message}
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        <input
          type="text"
          className="border rounded-l-lg p-2 flex-grow outline-none text-gray-800"
          placeholder="Type a message..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg"
          onClick={handleMessageSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
