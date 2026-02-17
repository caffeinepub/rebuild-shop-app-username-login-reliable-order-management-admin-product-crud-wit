import { useState } from 'react';
import { useCustomAuth } from '../hooks/useCustomAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useQueryClient } from '@tanstack/react-query';

export default function LoginPage() {
  const [username] = useState('');
  const { clearAuth } = useCustomAuth();
  const queryClient = useQueryClient();

  const handleClearSession = () => {
    clearAuth();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Discontinued Banner */}
      <div className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 dark:from-amber-500 dark:via-yellow-500 dark:to-amber-500 py-3 overflow-hidden relative">
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="text-gray-900 dark:text-gray-950 font-bold text-lg px-8">
              ⚠️ Dieser Shop wurde eingestellt und wird nicht mehr weiterentwickelt
            </span>
            <span className="text-gray-900 dark:text-gray-950 font-bold text-lg px-8">
              ⚠️ Dieser Shop wurde eingestellt und wird nicht mehr weiterentwickelt
            </span>
            <span className="text-gray-900 dark:text-gray-950 font-bold text-lg px-8">
              ⚠️ Dieser Shop wurde eingestellt und wird nicht mehr weiterentwickelt
            </span>
            <span className="text-gray-900 dark:text-gray-950 font-bold text-lg px-8">
              ⚠️ Dieser Shop wurde eingestellt und wird nicht mehr weiterentwickelt
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-xl border-border">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg opacity-50">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Shop Discontinued
            </CardTitle>
            <CardDescription className="text-base">
              This shop has been discontinued and is no longer accepting sign-ins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                <AlertDescription className="text-amber-800 dark:text-amber-300">
                  The shop is no longer operational. Login has been disabled.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 opacity-50 pointer-events-none">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Login disabled"
                  value={username}
                  disabled
                  className="h-11"
                />
              </div>

              <Button
                disabled
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-600 opacity-50 cursor-not-allowed"
                size="lg"
              >
                Sign In (Disabled)
              </Button>

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleClearSession}
                  variant="outline"
                  className="w-full"
                >
                  Clear Session Data
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Clear any locally stored authentication data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
