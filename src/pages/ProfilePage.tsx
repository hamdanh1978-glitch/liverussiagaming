import { useState } from 'react';
import {
  User,
  Award,
  Trophy,
  Flame,
  Calendar,
  Globe,
  Gamepad2,
  CheckCircle2,
  Radio,
  Pencil,
  Share2,
  Star,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { PageHeader } from '@/components/AppShell';
import { Panel, PanelHeader, Badge, ProgressBar, DemoTag } from '@/components/ui';
import { Avatar, StatusBadge } from '@/components/Status';
import { demoMembers, demoActivity } from '@/data/demo';

export function ProfilePage() {
  const { profileId, setProfileId } = useApp();
  const [tab, setTab] = useState<'overview' | 'activity' | 'achievements'>('overview');

  const member = demoMembers.find((m) => m.id === profileId) ?? demoMembers[0];
  const memberActivity = demoActivity.filter((a) => a.memberId === member.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Profile"
        subtitle="Community identity and record"
        icon={<User className="h-5 w-5" />}
        actions={
          <>
            <DemoTag />
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="input-field w-auto py-1.5 text-xs"
            >
              {demoMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.handle}
                </option>
              ))}
            </select>
          </>
        }
      />

      {/* Profile hero */}
      <Panel className="relative overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-ink-800 via-ink-850 to-ink-900">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-grid-32 opacity-30" />
          <div
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ background: `${member.accent}15` }}
          />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="-mt-12 flex items-end gap-4">
              <div className="rounded-2xl ring-4 ring-ink-850">
                <Avatar initials={member.avatarInitials} accent={member.accent} status={member.status} size="xl" ring={false} />
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-bold text-white">{member.displayName}</h2>
                  {member.verified && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <p className="text-sm text-ink-300">@{member.handle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-ghost px-3 py-2 text-xs">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <button className="btn-gold px-3 py-2 text-xs">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant="gold">{member.rank}</Badge>
            {member.department && <Badge variant="blue">{member.department}</Badge>}
            <StatusBadge status={member.status} />
            {member.verified ? <Badge variant="green">Verified</Badge> : <Badge variant="amber">Pending</Badge>}
            {member.discordConnected && (
              <Badge variant="violet">
                <Radio className="h-3 w-3" /> Discord linked
              </Badge>
            )}
          </div>

          <p className="mt-4 max-w-2xl text-sm text-ink-200">{member.bio}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoChip icon={<Calendar className="h-3.5 w-3.5" />} label="Joined" value={member.joinedDate} />
            <InfoChip icon={<Globe className="h-3.5 w-3.5" />} label="Country" value={member.country} />
            <InfoChip icon={<Gamepad2 className="h-3.5 w-3.5" />} label="Main Game" value={member.game} />
            <InfoChip
              icon={<Radio className="h-3.5 w-3.5" />}
              label="Discord"
              value={member.discordConnected ? member.discordUsername ?? 'Linked' : 'Not connected'}
            />
          </div>
        </div>
      </Panel>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-white/5 bg-ink-900/60 p-1">
        {(['overview', 'activity', 'achievements'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === t ? 'bg-gold-500/15 text-gold-200' : 'text-ink-300 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHeader title="Progress" subtitle="Level, XP and reputation" icon={<Trophy className="h-4 w-4" />} />
            <div className="space-y-5 p-5">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-white">Level {member.level}</span>
                  <span className="text-ink-300">{(member.xp % 100000) / 1000}K / 100K XP</span>
                </div>
                <ProgressBar value={member.xp % 100000} max={100000} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-white">Reputation</span>
                  <span className="text-ink-300">{member.reputation} / 100</span>
                </div>
                <ProgressBar value={member.reputation} max={100} accent="#3ecf8e" />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <BigStat icon={<Flame className="h-4 w-4" />} label="Total XP" value={`${(member.xp / 1000).toFixed(0)}K`} />
                <BigStat icon={<Trophy className="h-4 w-4" />} label="Level" value={member.level} />
                <BigStat icon={<Star className="h-4 w-4" />} label="Reputation" value={member.reputation} />
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Presence" subtitle="Demo Discord status" icon={<Radio className="h-4 w-4" />} />
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-300">Current status</span>
                <StatusBadge status={member.status} />
              </div>
              <div className="rounded-lg border border-white/5 bg-ink-900/50 p-3">
                <p className="text-xs uppercase tracking-wider text-ink-400">Activity</p>
                <p className="mt-1 text-sm text-white">
                  {member.activity ?? (member.lastSeen ? `Last seen ${member.lastSeen}` : 'No current activity')}
                </p>
              </div>
              {member.lastSeen && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-300">Last seen</span>
                  <span className="font-mono text-xs text-ink-200">{member.lastSeen}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-300">Discord account</span>
                <span className={`text-xs font-semibold ${member.discordConnected ? 'text-emerald-300' : 'text-ink-400'}`}>
                  {member.discordConnected ? 'Connected' : 'Not linked'}
                </span>
              </div>
              <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-[11px] text-amber-200/80">
                Presence shown here is clearly labelled demo data. Real status requires authorized Discord integration.
              </p>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'activity' && (
        <Panel>
          <PanelHeader title="Member Activity" subtitle="Recent records" icon={<Flame className="h-4 w-4" />} />
          <div className="divide-y divide-white/5">
            {memberActivity.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-ink-300">No activity recorded yet.</p>
            )}
            {memberActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400">
                  <Award className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{a.label}</p>
                  <p className="text-xs text-ink-300">{a.detail}</p>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-ink-400">{a.timestamp}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === 'achievements' && (
        <Panel>
          <PanelHeader title="Achievements" subtitle={`${member.achievements.length} unlocked`} icon={<Award className="h-4 w-4" />} />
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
            {member.achievements.length === 0 && (
              <p className="col-span-full px-5 py-10 text-center text-sm text-ink-300">No achievements yet.</p>
            )}
            {member.achievements.map((ach) => (
              <div key={ach} className="group rounded-xl border border-gold-500/15 bg-gold-500/5 p-4 text-center transition-all hover:border-gold-500/40 hover:shadow-gold">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gold-gradient text-ink-950">
                  <Award className="h-6 w-6" />
                </div>
                <p className="font-display text-xs font-semibold uppercase tracking-wider text-gold-200">{ach}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-ink-900/50 p-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-400">
        {icon} {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function BigStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/5 bg-ink-900/40 p-3 text-center">
      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400">
        {icon}
      </div>
      <p className="font-display text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-ink-400">{label}</p>
    </div>
  );
}
