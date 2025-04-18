import { account } from '@/services/dataAppwrite'
import { useEffect, useState } from 'react'
import { EventEmitter } from 'events'

const userEventEmitter = new EventEmitter()

export default function useUser() {
    const [user, setUser] = useState<any>(null)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)

    const get_user = async () => {
      setLoading(true)
      try {
        const userData = await account.get()
        setUser(userData)
        setIsLoggedIn(true)
        userEventEmitter.emit('userChanged', userData)
      } catch (error) {
        setUser(null)
        setIsLoggedIn(false)
        userEventEmitter.emit('userChanged', null)
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
        get_user()
        
        // Cleanup
        return () => {
          userEventEmitter.removeAllListeners()
        }
    }, [])

    const logout = async () => {
        try {
            await account.deleteSession("current")
            await get_user()
        } catch (error) {
        }
    }
    
    return { 
      user, 
      isLoggedIn, 
      logout, 
      loading,
      subscribeToUserChanges: (callback: (user: any) => void) => {
        userEventEmitter.on('userChanged', callback)
        return () => userEventEmitter.off('userChanged', callback)
      }
    }
}