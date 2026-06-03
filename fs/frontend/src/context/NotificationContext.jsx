import { createContext, useCallback, useState } from 'react'

export const NotificationContext = createContext(null)

let idCounter = 0

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = `notif-${++idCounter}`
    setNotifications((prev) => [...prev, { id, type, message, duration }])

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const toast = {
    success: (message, opts) => addNotification({ type: 'success', message, ...opts }),
    error: (message, opts) => addNotification({ type: 'error', message, ...opts }),
    warning: (message, opts) => addNotification({ type: 'warning', message, ...opts }),
    info: (message, opts) => addNotification({ type: 'info', message, ...opts }),
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, toast }}>
      {children}
    </NotificationContext.Provider>
  )
}
