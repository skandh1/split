'use client'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import PrivateRoute from '@/components/PrivateRoute'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import AddFriends from '@/pages/AddFriends'
import SplitBill from '@/pages/SplitBill'
import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-4 right-4 z-50"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-b from-background to-muted dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <ThemeToggle />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/add-friends" element={<PrivateRoute><AddFriends /></PrivateRoute>} />
                <Route path="/split-bill" element={<PrivateRoute><SplitBill /></PrivateRoute>} />
              </Routes>
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App