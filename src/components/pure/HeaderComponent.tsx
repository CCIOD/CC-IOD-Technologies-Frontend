export const HeaderComponent = () => {
  return (
    <div className='app-bg app-text h-14 flex gap-4 items-center justify-end px-5'>
      {/* <div></div> Toggle change Theme */}
      <div>
        <span>Víctor Manuel</span>
      </div>
      <button className='bg-blue-900 hover:bg-blue-800 px-3 py-2 rounded-md text-cciod-white-100 flex items-center gap-2'>Cerrar sesión</button>
    </div>
  )
}
