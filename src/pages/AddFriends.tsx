import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
}

export default function AddFriends() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const fetchFriends = async () => {
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('__name__', '==', currentUser.uid)
      ));
      
      if (!userDoc.empty) {
        setFriends(userDoc.docs[0].data().friends || []);
      }
    };

    fetchFriends();
  }, [currentUser]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || !currentUser) return;

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('username', '>=', searchTerm),
      where('username', '<=', searchTerm + '\uf8ff')
    );

    try {
      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as User))
        .filter(user => user.id !== currentUser.uid);
      
      setSearchResults(users);
    } catch (error) {
      toast.error('Failed to search users');
    }
  };

  const addFriend = async (friendId: string) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        friends: arrayUnion(friendId)
      });
      
      setFriends([...friends, friendId]);
      toast.success('Friend added successfully');
    } catch (error) {
      toast.error('Failed to add friend');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Add Friends</h2>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mb-8">
          <Input
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-4">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div>
                <h3 className="font-medium">{user.username}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button
                onClick={() => addFriend(user.id)}
                disabled={friends.includes(user.id)}
              >
                {friends.includes(user.id) ? 'Added' : 'Add Friend'}
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}