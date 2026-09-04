"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
  users: User[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
        const storedUserId = localStorage.getItem('mockUserId')
        if (storedUserId) {
          const found = data.find((u: User) => u.id === storedUserId)
          if (found) setUser(found)
        } else if (data.length > 0) {
          setUser(data[0]) // default to first user (Owner)
          localStorage.setItem('mockUserId', data[0].id)
        }
      })
      .catch((err) => console.error("Failed to fetch users", err))
  }, [])

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('mockUserId', newUser.id)
    } else {
      localStorage.removeItem('mockUserId')
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, users }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
