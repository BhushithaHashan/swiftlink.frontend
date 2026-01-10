import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { LinkCard } from '@/components/LinkCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { linksApi, type Link as LinkType } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Link2, BarChart3, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLinks = async () => {
    try {
      const response = await linksApi.getUserLinks();
      setLinks(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load links.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleDelete = async (code: string) => {
    try {
      await linksApi.delete(code);
      setLinks((prev) => prev.filter((link) => link.code !== code));
      toast({
        title: 'Link deleted',
        description: 'The link has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete link.',
        variant: 'destructive',
      });
    }
  };

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks?.length || 0), 0);
  const activeLinks = links.filter((link) => !link.revoked).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
          <Button asChild>
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Link
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Links</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{links.length}</div>
              <p className="text-xs text-muted-foreground">{activeLinks} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks}</div>
              <p className="text-xs text-muted-foreground">Across all links</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Clicks/Link</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {links.length > 0 ? (totalClicks / links.length).toFixed(1) : '0'}
              </div>
              <p className="text-xs text-muted-foreground">Per link average</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Links */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Links</CardTitle>
            <CardDescription>Your recently created short links</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : links.length === 0 ? (
              <div className="py-8 text-center">
                <Link2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No links yet</p>
                <Button asChild className="mt-4">
                  <Link to="/create">Create your first link</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {links.slice(0, 5).map((link) => (
                  <LinkCard key={link.code} link={link} onDelete={handleDelete} />
                ))}
                {links.length > 5 && (
                  <div className="pt-2 text-center">
                    <Button variant="outline" asChild>
                      <Link to="/links">View all {links.length} links</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
