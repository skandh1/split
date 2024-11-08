import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ExpenseCardProps {
  amount: number
  description: string
  paidBy: string
  date: Date
  participants: string[]
}

// Mock database query function
async function fetchUserNameById(friends: string): Promise<string> {
  // Replace this with actual database call logic
  const userNames = { "user1": "Alice", "user2": "Bob", "user3": "Charlie" }
  return userNames[friends] || "Unknown User"
}

export default function ExpenseCard({
  amount,
  description,
  paidBy,
  date,
  participants,
}: ExpenseCardProps) {
  const [participantNames, setParticipantNames] = useState<string[]>([])

  useEffect(() => {
    async function fetchParticipants() {
      const names = await Promise.all(
        participants.map((participant) => fetchUserNameById(participant))
      )
      setParticipantNames(names)
    }

    fetchParticipants()
  }, [participants])

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)

  const otherParticipants = participantNames.filter((name, index) => participants[index] !== paidBy)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{description}</span>
          <span className="text-xl font-bold">{formattedAmount}</span>
        </CardTitle>
        <CardDescription>
          Paid by {participantNames[participants.indexOf(paidBy)] || paidBy} • {formatDistanceToNow(date, { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{participantNames[participants.indexOf(paidBy)] || paidBy}</span>
          <ArrowRight className="h-4 w-4" />
          {otherParticipants.length > 0 ? (
            <>
              <span>{otherParticipants[0]}</span>
              {otherParticipants.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {` +${otherParticipants.length - 1} ${
                    otherParticipants.length === 2 ? 'other' : 'others'
                  }`}
                </span>
              )}
            </>
          ) : (
            <span>No other participants</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
