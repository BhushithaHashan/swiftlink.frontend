import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { LinkCard } from '@/components/LinkCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { linksApi, type Link as LinkType } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Link2, Loader2 } from 'lucide-react';

const Links = () => {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Links</h1>
            <p className="text-muted-foreground">Manage all your short links</p>
          </div>
          <Button asChild>
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Link
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Links</CardTitle>
            <CardDescription>
              {links.length} total link{links.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by code or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="py-8 text-center">
                <Link2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No links match your search' : 'No links yet'}
                </p>
                {!searchQuery && (
                  <Button asChild className="mt-4">
                    <Link to="/create">Create your first link</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLinks.map((link) => (
                  <LinkCard key={link.code} link={link} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Links;
