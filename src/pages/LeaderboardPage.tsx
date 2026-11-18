import { Trophy, Crown, Medal, Flame, Star, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { PageHeader } from '@/components/AppShell';
import { Panel, PanelHeader, Badge, DemoTag, ProgressBar } from '@/components/ui';
import { Avatar, StatusBadge } from '@/components/Status';
import { demoLeaderboard } from '@/data/demo';
import { cn } from '@/lib/utils';

export function LeaderboardPage() {
  const { navigate, setProfileId } = useApp();
  const top3 = demoLeaderboard.slice(0, 3);
  const rest = demoLeaderboard.slice(3);

  const openProfile = (id: string) => {
    setProfileId(id);
    navigate('profile');
  };

  const podiumOrder = [1, 0, 2];
  const podiumIcons = [
    <Crown key="1" className="h-5 w-5" />,
    <Medal key="2" className="h-5 w-5" />,
    <Medal key="3" className="h-5 w-5" />,
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        subtitle="Top community members by XP"
        icon={<Trophy className="h-5 w-5" />}
        actions={<DemoTag />}
      />

      {/* Podium */}
      <Panel className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-radial-gold" />
        <div className="relative grid grid-cols-3 items-end gap-4">
          {podiumOrder.map((idx, i) => {
            const m = top3[idx];
            const place = idx + 1;
            const heights = ['h-28', 'h-36', 'h-24'];
            const colors = ['from-ink-700 to-ink-800', 'from-gold-600 to-gold-800', 'from-ink-600 to-ink-750'];
            return (
              <button key={m.id} onClick={() => openProfile(m.id)} className="flex flex-col items-center">
                <div className="mb-3 flex flex-col items-center">
                  <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-full', place === 1 ? 'bg-gold-gradient text-ink-950' : 'bg-ink-800 text-gold-400')}>
                    {podiumIcons[idx]}
                  </div>
                  <div className="ring-2 ring-ink-850 rounded-xl">
                    <Avatar initials={m.avatarInitials} accent={m.accent} status={m.status} size={place === 1 ? 'xl' : 'lg'} ring={false} />
                  </div>
                  <p className="mt-2 truncate font-display text-sm font-semibold text-white">{m.handle}</p>
                  <p className="text-xs text-gold-300">{(m.xp / 1000).toFixed(0)}K XP</p>
                </div>
                <div className={cn('w-full rounded-t-lg bg-gradient-to-b', colors[i], heights[i])}>
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-3xl font-bold text-white/90">{place}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      {/* Full ranking table */}
      <Panel>
        <PanelHeader title="Full Ranking" subtitle="Top 10 by XP" icon={<Flame className="h-4 w-4" />} />
        <div className="divide-y divide-white/5">
          {rest.map((m) => (
            <button
              key={m.id}
              onClick={() => openProfile(m.id)}
              className="flex w-full items-center gap-4 px-5 py-3.5 text-left table-row-hover"
            >
              <span className="w-8 text-center font-display text-lg font-bold text-ink-300">
                {(m as typeof demoLeaderboard[number]).rank_position}
              </span>
              <Avatar initials={m.avatarInitials} accent={m.accent} status={m.status} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{m.handle}</p>
                <p className="text-xs text-ink-300">{m.rank} · Level {m.level}</p>
              </div>
              <div className="hidden w-40 sm:block">
                <ProgressBar value={m.xp % 100000} max={100000} />
              </div>
              <div className="hidden text-right sm:block">
                <p className="font-display text-sm font-bold text-gold-300">{(m.xp / 1000).toFixed(0)}K</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-400">XP</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-gold-400" />
                <span className="text-xs font-semibold text-white">{m.reputation}</span>
              </div>
              <StatusBadge status={m.status} withDot={false} />
            </button>
          ))}
        </div>
      </Panel>

      {/* Category leaders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Most Reputation', icon: <Star className="h-4 w-4" />, member: demoLeaderboard[0] },
          { label: 'Highest Level', icon: <Crown className="h-4 w-4" />, member: demoLeaderboard[0] },
          { label: 'Rising Star', icon: <Flame className="h-4 w-4" />, member: demoLeaderboard[6] },
        ].map((cat) => (
          <Panel key={cat.label} hover className="p-5">
            <div className="flex items-center gap-2 text-gold-400">
              {cat.icon}
              <p className="text-[11px] font-semibold uppercase tracking-wider">{cat.label}</p>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar initials={cat.member.avatarInitials} accent={cat.member.accent} status={cat.member.status} size="md" />
              <div>
                <p className="font-semibold text-white">{cat.member.handle}</p>
                <p className="text-xs text-ink-300">{cat.member.rank}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
