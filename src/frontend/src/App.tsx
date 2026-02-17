import LoginPage from './pages/LoginPage';
import { Toaster } from './components/ui/sonner';

export default function App() {
  // App is in discontinued mode - always show discontinued login page
  // No authentication flow, no shop/admin access
  return (
    <>
      <LoginPage />
      <Toaster />
    </>
  );
}
