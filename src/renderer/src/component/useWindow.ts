import React, { useContext } from 'react'

export const WindowContext = React.createContext(window)
export const useWindow = () => useContext(WindowContext)