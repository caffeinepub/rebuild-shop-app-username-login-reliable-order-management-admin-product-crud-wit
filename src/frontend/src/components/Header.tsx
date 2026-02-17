import { useCustomAuth } from '../hooks/useCustomAuth';
import { Button } from './ui/button';
import { ShoppingBag } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function Header() {
  const { username, isAdmin, logout } = useCustomAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-md">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Shop
            </h1>
            {isAdmin && (
              <span className="text-xs text-muted-foreground">Admin</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            {username}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
          >
            Abmelden
          </Button>
        </div>
      </div>
    </header>
  );
}
