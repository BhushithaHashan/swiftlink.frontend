import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { linksApi } from '@/lib/api';
import { Loader2, AlertCircle, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Redirect = () => {
  const { code } = useParams<{ code: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveAndRedirect = async () => {
      if (!code) {
        setError('Invalid link code');
        return;
      }

      try {
        const response = await linksApi.resolve(code);
        // Redirect to the original URL
        window.location.href = response.data.url;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Link not found or has been revoked');
      }
    };

    resolveAndRedirect();
  }, [code]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Link Not Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">
                <Link2 className="mr-2 h-4 w-4" />
                Go to SwiftLink
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
};

export default Redirect;
