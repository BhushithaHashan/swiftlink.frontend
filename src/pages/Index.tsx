import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { linksApi, type Link as LinkType } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Link2, Copy, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react';

const Index = () => {
  const [url, setUrl] = useState('');
  const [createdLink, setCreatedLink] = useState<LinkType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      const response = await linksApi.create(url);
      setCreatedLink(response.data);
      setUrl('');
      toast({
        title: 'Link created!',
        description: 'Your short link is ready to use.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create short link.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!createdLink) return;
    const shortUrl = `${window.location.origin}/r/${createdLink.code}`;
    await navigator.clipboard.writeText(shortUrl);
    toast({
      title: 'Copied!',
      description: 'Short link copied to clipboard.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <main className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span>Fast, secure, and free to use</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Shorten your links{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              in seconds
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            Create short, memorable links that redirect to your long URLs. 
            Track clicks and analytics for free. No signup required.
          </p>

          {/* URL Shortener Form */}
          <Card className="mt-10">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  type="url"
                  placeholder="Paste your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Shorten'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {createdLink && (
                <div className="mt-4 animate-fade-in rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Your short link:</p>
                      <p className="truncate font-mono text-lg font-semibold text-primary">
                        {window.location.origin}/r/{createdLink.code}
                      </p>
                    </div>
                    <Button onClick={copyToClipboard} variant="secondary">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <p className="mt-2 truncate text-sm text-muted-foreground">
                    Original: {createdLink.url}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="mt-4 text-sm text-muted-foreground">
            Want more features?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Create a free account
            </Link>
          </p>
        </div>

        {/* Features Section */}
        <section className="mx-auto mt-24 grid max-w-5xl gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Lightning Fast</CardTitle>
              <CardDescription>
                Create short links instantly. No delays, no waiting.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Detailed Analytics</CardTitle>
              <CardDescription>
                Track clicks, locations, and devices for each link.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Secure & Private</CardTitle>
              <CardDescription>
                Your data is encrypted and never shared with third parties.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link2 className="h-4 w-4" />
            <span>SwiftLink © {new Date().getFullYear()}</span>
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground">
              Login
            </Link>
            <Link to="/register" className="hover:text-foreground">
              Register
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
