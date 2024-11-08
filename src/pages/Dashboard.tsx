'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/layout/Navbar'
import ExpenseCard from '@/components/expenses/ExpenseCard'
import { useNavigate } from 'react-router-dom'

interface Expense {
  id: string
  amount: number
  description: string
  paidBy: string
  paidByUsername: string
  date: Date
  participants: string[]
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) return

    const expensesRef = collection(db, 'expenses')
    const q = query(
      expensesRef,
      where('participants', 'array-contains', currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      })) as Expense[]

      setExpenses(expensesList.sort((a, b) => b.date.getTime() - a.date.getTime()))
    })

    return () => unsubscribe()
  }, [currentUser])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 sm:mb-0">Recent Expenses</h2>
          <Button onClick={() => navigate('/split-bill')} className="w-full sm:w-auto gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>New Split</span>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              amount={expense.amount}
              description={expense.description}
              paidBy={expense.paidByUsername}
              date={expense.date}
              participants={expense.participants}
            />
          ))}

          {expenses.length === 0 && (
            <div className="col-span-full text-center py-12 sm:py-16">
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">No expenses yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Start splitting bills with your friends
              </p>
              <Button onClick={() => navigate('/split-bill')} variant="outline" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Create your first split</span>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}