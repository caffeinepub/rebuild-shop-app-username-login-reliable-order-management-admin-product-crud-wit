import { useCustomAuth } from './hooks/useCustomAuth';
import LoginPage from './pages/LoginPage';
import ShopPage from './pages/ShopPage';
import AdminPage from './pages/AdminPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const { isAuthenticated, isAdmin } = useCustomAuth();

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  // Show main app - user is authenticated
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {isAdmin ? <AdminPage /> : <ShopPage />}
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}
