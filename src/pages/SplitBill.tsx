import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';

const formSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().min(1, 'Amount is required'),
  splitWith: z.array(z.string()).min(1, 'Select at least one friend'),
});

interface Friend {
  id: string;
  username: string;
}

export default function SplitBill() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '',
      splitWith: [],
    },
  });

  useState(() => {
    const fetchFriends = async () => {
      if (!currentUser) return;

      const userDoc = await getDocs(
        query(collection(db, 'users'), where('__name__', '==', currentUser.uid))
      );

      if (!userDoc.empty) {
        const friendIds = userDoc.docs[0].data().friends || [];
        const friendsData = await Promise.all(
          friendIds.map(async (id: string) => {
            const friendDoc = await getDocs(
              query(collection(db, 'users'), where('__name__', '==', id))
            );
            if (!friendDoc.empty) {
              return {
                id,
                username: friendDoc.docs[0].data().username,
              };
            }
            return null;
          })
        );

        setFriends(friendsData.filter((f): f is Friend => f !== null));
      }
    };

    fetchFriends();
  }, [currentUser]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) return;

    try {
      const amount = parseFloat(values.amount);
      const splitAmount = amount / (values.splitWith.length + 1);

      await addDoc(collection(db, 'expenses'), {
        description: values.description,
        amount,
        paidBy: currentUser.uid,
        paidByUsername: currentUser.displayName,
        participants: [currentUser.uid, ...values.splitWith],
        splitAmount,
        date: new Date(),
        settled: false,
      });

      toast.success('Bill split successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to split bill');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Split a Bill</h2>

        <div className="max-w-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Dinner, Movie tickets, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="splitWith"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Split with</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange([...field.value, value])}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select friends" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {friends.map((friend) => (
                          <SelectItem
                            key={friend.id}
                            value={friend.id}
                            disabled={field.value.includes(friend.id)}
                          >
                            {friend.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                {form.watch('splitWith').map((friendId) => {
                  const friend = friends.find((f) => f.id === friendId);
                  return (
                    friend && (
                      <div
                        key={friend.id}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {friend.username}
                        <button
                          type="button"
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            const current = form.getValues('splitWith');
                            form.setValue(
                              'splitWith',
                              current.filter((id) => id !== friend.id)
                            );
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )
                  );
                })}
              </div>

              <Button type="submit" className="w-full">
                Split Bill
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}