import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { linksApi, type Link as LinkType } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, ExternalLink, Loader2, Check } from 'lucide-react';

const Create = () => {
  const [url, setUrl] = useState('');
  const [createdLink, setCreatedLink] = useState<LinkType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isAuthenticated } = useAuth();
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Short link copied to clipboard.',
    });
  };

  const shortUrl = createdLink ? `${window.location.origin}/r/${createdLink.code}` : '';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold">Create Short Link</h1>
          <p className="mb-8 text-muted-foreground">
            Enter a URL to generate a short link
            {!isAuthenticated && ' (no account required)'}
          </p>

          <Card>
            <CardHeader>
              <CardTitle>New Link</CardTitle>
              <CardDescription>
                Paste your long URL below to create a short, shareable link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Destination URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/your-very-long-url..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Short Link
                </Button>
              </form>
            </CardContent>
          </Card>

          {createdLink && (
            <Card className="mt-6 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-success flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Link Created Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Short Link</Label>
                  <div className="flex gap-2">
                    <Input value={shortUrl} readOnly className="font-mono" />
                    <Button onClick={copyToClipboard} variant="secondary">
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="secondary" asChild>
                      <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Original URL</Label>
                  <Input value={createdLink.url} readOnly className="text-muted-foreground" />
                </div>

                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Code: <code className="text-foreground">{createdLink.code}</code></span>
                  <span>Created: {new Date(createdLink.createdAt).toLocaleString()}</span>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCreatedLink(null)}
                >
                  Create Another Link
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Create;
