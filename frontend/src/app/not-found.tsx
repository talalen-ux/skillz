import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <Eyebrow className="justify-center">404 · Not found</Eyebrow>
      <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        We couldn't find <span className="mute-weight">that.</span>
      </h1>
      <p className="mt-4 text-sm text-fg-secondary md:text-base">
        The skill or creator may have been removed, or you may have followed a stale link.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/browse" trailingArrow>
          Explore skills
        </Button>
        <Button href="/" variant="secondary">
          Back home
        </Button>
      </div>
    </div>
  );
}
