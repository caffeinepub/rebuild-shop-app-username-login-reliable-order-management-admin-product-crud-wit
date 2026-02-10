import { useState } from 'react';
import { useCustomAuth } from '../hooks/useCustomAuth';
import { useLoginWithUsername } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { UserRole } from '../backend';

const ALLOWED_USERS = ['Aurelio', 'Ensar', 'Mohammed', 'Omar', 'Yassin', 'Steven'];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login } = useCustomAuth();
  const loginWithUsername = useLoginWithUsername();

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError('Please enter a username');
      return;
    }

    if (!ALLOWED_USERS.includes(trimmedUsername)) {
      setError('Invalid username. Please use an authorized username.');
      return;
    }

    setError('');

    try {
      // Call backend login() - registers username and returns role
      const role = await loginWithUsername.mutateAsync(trimmedUsername);

      // Set local auth state with role from backend
      const isAdmin = role === UserRole.admin;
      login(trimmedUsername, isAdmin);

      // Success - App component will handle navigation
    } catch (err: any) {
      console.error('Login error:', err);
      // Display backend error message directly
      const errorMessage = err?.message || 'Unknown login error';
      setError(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const isLoading = loginWithUsername.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Welcome
          </CardTitle>
          <CardDescription className="text-base">
            Enter your username to log in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Logging in...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-11"
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={!username.trim() || isLoading}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Only authorized users can log in
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
