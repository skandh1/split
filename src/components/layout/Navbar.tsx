import { useNavigate } from 'react-router-dom';
import { Users, Receipt, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">SplitBuddy</h1>
          <span className="text-sm text-muted-foreground">
            Hi, {currentUser?.displayName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/add-friends')}
          >
            <Users className="h-4 w-4" />
            Friends
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/split-bill')}
          >
            <Receipt className="h-4 w-4" />
            Split Bill
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}