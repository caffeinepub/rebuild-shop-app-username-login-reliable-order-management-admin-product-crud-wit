import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'unknown-app'
  );

  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container flex h-16 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground text-center">
          © {currentYear} · Mit{' '}
          <Heart className="inline h-4 w-4 text-orange-500 fill-orange-500 mx-1" />
          erstellt mit{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
