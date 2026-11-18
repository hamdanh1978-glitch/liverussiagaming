import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ size = 'md', showText = true }: { size?: 'sm' | 'md' | 'lg'; showText?: boolean }) {
  const sz =
    size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const titleSize = size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl border border-gold-500/30 bg-gradient-to-br from-ink-800 to-ink-900 shadow-gold',
          sz,
        )}
      >
        <div className="absolute inset-0 rounded-xl bg-gold-sheen opacity-40" />
        <Crown className="relative h-1/2 w-1/2 text-gold-400" strokeWidth={2.2} />
      </div>
      {showText && (
        <div className="leading-tight">
          <p className={cn('font-display font-bold uppercase tracking-wide text-white', titleSize)}>
            Live <span className="gold-text">Russia</span> Gaming
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-300">LR Community Portal</p>
        </div>
      )}
    </div>
  );
}
