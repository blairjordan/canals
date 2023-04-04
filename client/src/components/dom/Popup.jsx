function Popup({ children }) {
  return (
    <div
      className='absolute top-16 left-1/2 max-w-lg -translate-x-1/2 rounded-lg bg-zinc-800 px-10 py-8 text-sm shadow-xl md:text-base z-50'
      style={{ maxWidth: 'calc(100% - 28px)' }}>
      <div className='tracking-wider'>
        {children}
      </div>
    </div>
  )
}

Popup.displayName = 'Popup';

export default Popup;