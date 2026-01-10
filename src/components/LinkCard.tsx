import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Trash2, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Link as LinkType } from '@/lib/api';

interface LinkCardProps {
  link: LinkType;
  onDelete?: (code: string) => void;
  showAnalytics?: boolean;
}

export const LinkCard = ({ link, onDelete, showAnalytics = true }: LinkCardProps) => {
  const { toast } = useToast();
  const shortUrl = `${window.location.origin}/r/${link.code}`;
  const clickCount = link.clicks?.length || 0;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shortUrl);
    toast({
      title: 'Copied!',
      description: 'Short link copied to clipboard.',
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-1 text-sm font-semibold text-primary">
                {link.code}
              </code>
              {link.revoked && (
                <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                  Revoked
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground" title={link.url}>
              {link.url}
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{new Date(link.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {clickCount} click{clickCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={copyToClipboard} title="Copy short link">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" asChild title="Open original URL">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            {showAnalytics && (
              <Button variant="ghost" size="icon" asChild title="View analytics">
                <Link to={`/analytics/${link.code}`}>
                  <BarChart3 className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(link.code)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                title="Delete link"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
