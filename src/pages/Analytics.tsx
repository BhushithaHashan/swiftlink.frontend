import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { linksApi, type Link as LinkType, type Click } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BarChart3, Copy, ExternalLink, Globe, Monitor, Loader2 } from 'lucide-react';

const Analytics = () => {
  const { code } = useParams<{ code: string }>();
  const [link, setLink] = useState<LinkType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLink = async () => {
      if (!code) return;
      try {
        const response = await linksApi.resolve(code);
        setLink(response.data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load link analytics.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLink();
  }, [code, toast]);

  const copyToClipboard = async () => {
    if (!link) return;
    const shortUrl = `${window.location.origin}/r/${link.code}`;
    await navigator.clipboard.writeText(shortUrl);
    toast({
      title: 'Copied!',
      description: 'Short link copied to clipboard.',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Link not found</p>
              <Button asChild className="mt-4">
                <Link to="/links">Back to Links</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const clicks = link.clicks || [];
  const shortUrl = `${window.location.origin}/r/${link.code}`;

  // Parse user agents for display
  const parseUserAgent = (ua: string): { browser: string; os: string } => {
    let browser = 'Unknown';
    let os = 'Unknown';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return { browser, os };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/links">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Links
          </Link>
        </Button>

        {/* Link Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics for /{link.code}
                </CardTitle>
                <CardDescription className="mt-2 break-all">{link.url}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-3xl font-bold">{clicks.length}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Short URL</p>
                <p className="truncate font-mono text-sm">{shortUrl}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">{new Date(link.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clicks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Click History</CardTitle>
            <CardDescription>Detailed log of all clicks on this link</CardDescription>
          </CardHeader>
          <CardContent>
            {clicks.length === 0 ? (
              <div className="py-8 text-center">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No clicks yet</p>
                <p className="text-sm text-muted-foreground">
                  Share your link to start tracking clicks
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>OS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clicks.map((click, index) => {
                      const { browser, os } = parseUserAgent(click.userAgent);
                      return (
                        <TableRow key={index}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(click.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <code className="text-sm">{click.ip}</code>
                            </div>
                          </TableCell>
                          <TableCell>{browser}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              {os}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
