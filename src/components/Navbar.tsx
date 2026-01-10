import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link2, LogOut, LayoutDashboard, Plus, BarChart3 } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Link2 className="h-6 w-6 text-primary" />
          <span>SwiftLink</span>
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/links">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  My Links
                </Link>
              </Button>
              <div className="ml-2 flex items-center gap-2 border-l pl-4">
                <span className="text-sm text-muted-foreground">{user?.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
