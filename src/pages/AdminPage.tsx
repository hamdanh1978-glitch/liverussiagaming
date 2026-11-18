import { useState } from 'react';
import {
  Lock,
  Users,
  ShieldCheck,
  Shield,
  Coins,
  Radio,
  Activity as ActivityIcon,
  CheckCircle2,
  Trophy,
  Megaphone,
  ScrollText,
  KeyRound,
  TrendingUp,
  AlertTriangle,
  Clock,
  Search,
  Eye,
  XCircle,
  Bell,
  Building2,
  ChevronRight,
  BadgeCheck,
  UserCog,
  Ban,
} from 'lucide-react';
import { PageHeader } from '@/components/AppShell';
import { Panel, PanelHeader, StatCard, Badge, DemoTag, ProgressBar } from '@/components/ui';
import { Avatar, StatusBadge } from '@/components/Status';
import {
  adminStats,
  demoMembers,
  demoLoans,
  demoVerificationRequests,
  demoAnnouncements,
  staffDepartments,
} from '@/data/demo';
import { useApp } from '@/store/AppContext';
import { rolePermissions, roleMeta, allRoles, usePermissions, type RbacRole, type RbacPermission } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import type { LoanRecord, VerificationRequest } from '@/types';

type AdminTab =
  | 'overview'
  | 'members'
  | 'staff'
  | 'loans'
  | 'verification'
  | 'discord'
  | 'activity'
  | 'rankings'
  | 'announcements'
  | 'audit'
  | 'access';

const tabPermissions: Record<AdminTab, RbacPermission | null> = {
  overview: 'admin.overview',
  members: 'admin.members',
  staff: 'admin.staff',
  loans: 'admin.loans',
  verification: 'admin.verification',
  discord: 'admin.discord',
  activity: 'admin.activity',
  rankings: 'admin.rankings',
  announcements: 'admin.announcements',
  audit: 'admin.audit',
  access: 'admin.access',
};

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Lock className="h-4 w-4" /> },
  { id: 'members', label: 'Member Management', icon: <Users className="h-4 w-4" /> },
  { id: 'staff', label: 'Staff Departments', icon: <Building2 className="h-4 w-4" /> },
  { id: 'loans', label: 'Loan Center', icon: <Coins className="h-4 w-4" /> },
  { id: 'verification', label: 'Verification Center', icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: 'discord', label: 'Discord Status', icon: <Radio className="h-4 w-4" /> },
  { id: 'activity', label: 'Activity Records', icon: <ActivityIcon className="h-4 w-4" /> },
  { id: 'rankings', label: 'Rankings & Achievements', icon: <Trophy className="h-4 w-4" /> },
  { id: 'announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" /> },
  { id: 'audit', label: 'Audit Logs', icon: <ScrollText className="h-4 w-4" /> },
  { id: 'access', label: 'Access Permissions', icon: <KeyRound className="h-4 w-4" /> },
];

export function AdminPage() {
  const { rbacRole, logAudit, auditLogs } = useApp();
  const [tab, setTab] = useState<AdminTab>('overview');

  const can = (perm: RbacPermission | null) => (perm ? rolePermissions[rbacRole]?.includes(perm) ?? false : true);

  const visibleTabs = tabs.filter((t) => can(tabPermissions[t.id]));

  const handleTabChange = (t: AdminTab) => {
    if (can(tabPermissions[t])) {
      setTab(t);
      logAudit('Admin tab viewed', t, 'info');
    }
  };

  // If the current tab is not permitted, fall back to first permitted tab
  const effectiveTab = can(tabPermissions[tab]) ? tab : visibleTabs[0]?.id ?? 'overview';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Command Centre"
        subtitle="LIVE RUSSIA GAMING — administrative control panel"
        icon={<Lock className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="gold">{rbacRole}</Badge>
            <DemoTag />
          </div>
        }
      />

      {/* Security notice */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <p className="text-xs text-emerald-200/80">
          RBAC active — your access is gated by your role ({rbacRole}). Admin tabs and actions you lack permission for
          are hidden. Direct URL access cannot bypass these checks in production: server-side permission enforcement is
          required on every API and database operation.
        </p>
      </div>

      {/* Tab bar — only permitted tabs visible */}
      <Panel className="p-2">
        <div className="flex flex-wrap gap-1">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                effectiveTab === t.id
                  ? 'bg-gold-500/15 text-gold-200'
                  : 'text-ink-300 hover:bg-white/5 hover:text-white',
              )}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </Panel>

      {effectiveTab === 'overview' && <Overview />}
      {effectiveTab === 'members' && <MemberManagement />}
      {effectiveTab === 'staff' && <StaffManagement />}
      {effectiveTab === 'loans' && <LoanManagement />}
      {effectiveTab === 'verification' && <VerificationCenter />}
      {effectiveTab === 'discord' && <DiscordManagement />}
      {effectiveTab === 'activity' && <ActivityRecords />}
      {effectiveTab === 'rankings' && <RankingsManagement />}
      {effectiveTab === 'announcements' && <AnnouncementsManagement />}
      {effectiveTab === 'audit' && <AuditLogs />}
      {effectiveTab === 'access' && <AccessPermissions />}
    </div>
  );
}

function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Members" value={adminStats.totalMembers.toLocaleString()} icon={<Users className="h-5 w-5" />} trend="up" trendLabel="+24 this week" accent="gold" />
        <StatCard label="Verified Players" value={adminStats.verifiedPlayers.toLocaleString()} icon={<ShieldCheck className="h-5 w-5" />} trend="up" trendLabel="+18 this week" accent="green" />
        <StatCard label="Staff Members" value={adminStats.staffMembers} icon={<Shield className="h-5 w-5" />} trend="flat" trendLabel="Stable" accent="blue" />
        <StatCard label="Pending Verifications" value={adminStats.pendingVerifications} icon={<Clock className="h-5 w-5" />} trend="up" trendLabel="+5 today" accent="amber" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Loans" value={adminStats.activeLoans} icon={<Coins className="h-5 w-5" />} accent="amber" />
        <StatCard label="Overdue Loans" value={adminStats.overdueLoans} icon={<AlertTriangle className="h-5 w-5" />} accent="red" trend="down" trendLabel="−1 this week" />
        <StatCard label="Loan Capital" value={`$${(adminStats.totalLoanCapital / 1_000_000).toFixed(0)}M`} icon={<TrendingUp className="h-5 w-5" />} accent="gold" />
        <StatCard label="Discord Members" value={adminStats.discordMembers.toLocaleString()} icon={<Radio className="h-5 w-5" />} accent="violet" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader title="Verification Pipeline" subtitle="Demo queue" icon={<CheckCircle2 className="h-4 w-4" />} />
          <div className="space-y-4 p-5">
            <PipeRow label="Pending" value={adminStats.pendingVerifications} max={50} color="#f59e0b" />
            <PipeRow label="Under Review" value={8} max={50} color="#3b82f6" />
            <PipeRow label="Approved (this week)" value={18} max={50} color="#3ecf8e" />
            <PipeRow label="Rejected (this week)" value={4} max={50} color="#ef4444" />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Discord Sync" subtitle="Demo" icon={<Radio className="h-4 w-4" />} />
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-300">Synced</span>
              <span className="font-semibold text-emerald-300">{adminStats.discordSynced.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-300">Pending</span>
              <span className="font-semibold text-amber-300">{adminStats.discordPending}</span>
            </div>
            <ProgressBar value={81.7} />
            <Badge variant="amber">Not connected — demo data</Badge>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Recent Audit Events" subtitle="Demo log" icon={<ScrollText className="h-4 w-4" />} />
        <RecentAudit />
      </Panel>
    </div>
  );
}

function RecentAudit() {
  const { auditLogs } = useApp();
  return (
    <div className="divide-y divide-white/5">
      {auditLogs.slice(0, 5).map((log) => (
        <div key={log.id} className="flex items-center gap-3 px-5 py-3">
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              log.severity === 'critical' ? 'bg-red-500/10 text-red-400' : log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-ink-300',
            )}
          >
            {log.severity === 'critical' ? <AlertTriangle className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white"><span className="font-semibold">{log.action}</span> — {log.target}</p>
            <p className="text-xs text-ink-400">by {log.actor}</p>
          </div>
          <span className="shrink-0 font-mono text-[11px] text-ink-400">{log.timestamp}</span>
        </div>
      ))}
    </div>
  );
}

function PipeRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-ink-200">{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <ProgressBar value={value} max={max} accent={color} />
    </div>
  );
}

function MemberManagement() {
  const { logAudit, rbacRole } = useApp();
  const { canManageStaff } = usePermissions();
  const [q, setQ] = useState('');
  const [members, setMembers] = useState(demoMembers);
  const [assignTarget, setAssignTarget] = useState<typeof demoMembers[number] | null>(null);
  const filtered = members.filter((m) => !q || `${m.handle} ${m.displayName}`.toLowerCase().includes(q.toLowerCase()));

  const grantStaffRole = (memberId: string, role: string) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, staffRole: role } : m)));
    const m = members.find((x) => x.id === memberId);
    logAudit('Staff role granted', `${m?.handle} → ${role}`, 'warning');
    setAssignTarget(null);
  };

  const revokeStaffRole = (memberId: string) => {
    const m = members.find((x) => x.id === memberId);
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, staffRole: undefined } : m)));
    logAudit('Staff role revoked', m?.handle ?? memberId, 'warning');
  };

  return (
    <Panel>
      <PanelHeader title="Member Management" subtitle={`${members.length} total · demo roster`} icon={<Users className="h-4 w-4" />}
        action={
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-40 rounded-lg border border-white/5 bg-ink-900/60 py-1.5 pl-8 pr-3 text-xs text-white focus:border-gold-500/40 focus:outline-none" />
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-ink-400">
              <th className="px-5 py-3 font-semibold">Member</th>
              <th className="px-5 py-3 font-semibold">Rank</th>
              <th className="hidden px-5 py-3 font-semibold sm:table-cell">Status</th>
              <th className="hidden px-5 py-3 font-semibold md:table-cell">Verified</th>
              <th className="hidden px-5 py-3 font-semibold lg:table-cell">Staff Role</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((m) => (
              <tr key={m.id} className="table-row-hover">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={m.avatarInitials} accent={m.accent} size="sm" />
                    <div><p className="font-semibold text-white">{m.handle}</p><p className="text-xs text-ink-400">Lvl {m.level}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3"><Badge variant="gold">{m.rank}</Badge></td>
                <td className="hidden px-5 py-3 sm:table-cell"><StatusBadge status={m.status} withDot={false} /></td>
                <td className="hidden px-5 py-3 md:table-cell">{m.verified ? <Badge variant="green">Yes</Badge> : <Badge variant="amber">Pending</Badge>}</td>
                <td className="hidden px-5 py-3 lg:table-cell">
                  {m.staffRole ? <Badge variant="blue">{m.staffRole}</Badge> : <span className="text-ink-400">—</span>}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button className="rounded-lg p-1.5 text-ink-300 hover:bg-white/5 hover:text-gold-400"><Eye className="h-4 w-4" /></button>
                    {canManageStaff && (
                      <>
                        <button
                          onClick={() => setAssignTarget(m)}
                          className="rounded-lg p-1.5 text-ink-300 hover:bg-white/5 hover:text-gold-400"
                          title="Assign staff role"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                        {m.staffRole && (
                          <button
                            onClick={() => revokeStaffRole(m.id)}
                            className="rounded-lg p-1.5 text-ink-300 hover:bg-white/5 hover:text-red-400"
                            title="Revoke staff role"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign role modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAssignTarget(null)} />
          <Panel className="relative w-full max-w-sm overflow-hidden p-5 animate-fade-up">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gold-400">
                <UserCog className="h-4 w-4" />
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Assign Staff Role</h3>
              </div>
              <button onClick={() => setAssignTarget(null)} className="rounded-lg p-1 text-ink-300 hover:bg-white/5 hover:text-white">✕</button>
            </div>
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-white/5 bg-ink-900/60 p-3">
              <Avatar initials={assignTarget.avatarInitials} accent={assignTarget.accent} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{assignTarget.handle}</p>
                <p className="truncate text-xs text-ink-300">{assignTarget.department ?? 'No department'} · {assignTarget.rank}</p>
              </div>
            </div>
            <label className="label">Select role (granted by {rbacRole})</label>
            <div className="space-y-2">
              {allRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => grantStaffRole(assignTarget.id, r)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-ink-900/40 px-3 py-2.5 text-left text-sm text-ink-200 transition-colors hover:border-gold-500/30 hover:bg-gold-500/5"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: roleMeta[r].color }} />
                    {r}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] text-ink-400">Demo action — logged to Audit Logs.</p>
          </Panel>
        </div>
      )}
    </Panel>
  );
}

function StaffManagement() {
  const { logAudit } = useApp();
  const { canManageStaff } = usePermissions();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staffDepartments.map((d) => (
          <Panel key={d.name} hover className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${d.color}15`, color: d.color, boxShadow: `inset 0 0 0 1px ${d.color}30` }}>
                  <Building2 className="h-5 w-5" />
                </div>
                <div><h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">{d.name}</h3><p className="text-xs text-ink-300">Head: {d.head}</p></div>
              </div>
              <Badge variant="neutral">{d.count}</Badge>
            </div>
            {canManageStaff ? (
              <div className="mt-4 flex gap-2">
                <button onClick={() => logAudit('Department managed', d.name, 'info')} className="btn-ghost flex-1 py-1.5 text-xs">Manage</button>
                <button onClick={() => logAudit('Staff assigned', d.name, 'info')} className="btn-outline py-1.5 text-xs">Assign</button>
              </div>
            ) : (
              <p className="mt-4 text-[11px] text-ink-400">View only — role assignment requires elevated permissions.</p>
            )}
          </Panel>
        ))}
      </div>

      <Panel>
        <PanelHeader title="Loan Officer Department" subtitle="Position under Loan Center Management" icon={<Coins className="h-4 w-4" />} />
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {demoMembers.filter((m) => m.department === 'Loan Center Management').map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-3">
              <Avatar initials={m.avatarInitials} accent={m.accent} status={m.status} size="sm" />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold text-white">{m.handle}</p><p className="truncate text-xs text-ink-300">{m.staffRole ?? m.rank}</p></div>
              <StatusBadge status={m.status} withDot={false} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function LoanManagement() {
  const { logAudit } = useApp();
  const [loans, setLoans] = useState(demoLoans);
  const statusVariant: Record<LoanRecord['status'], 'amber' | 'green' | 'blue' | 'red'> = {
    pending: 'amber', approved: 'green', repaid: 'blue', overdue: 'red',
  };

  const approveLoan = (id: string) => {
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'approved' as const, officer: 'NikitaVolkov' } : l)));
    const l = loans.find((x) => x.id === id);
    logAudit('Loan approved', `${l?.memberHandle} — ${l?.amount.toLocaleString()}$`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Loans" value={adminStats.activeLoans} icon={<Coins className="h-5 w-5" />} accent="amber" />
        <StatCard label="Overdue" value={adminStats.overdueLoans} icon={<AlertTriangle className="h-5 w-5" />} accent="red" />
        <StatCard label="Total Capital" value={`$${(adminStats.totalLoanCapital / 1_000_000).toFixed(0)}M`} icon={<TrendingUp className="h-5 w-5" />} accent="gold" />
        <StatCard label="Loan Officers" value={4} icon={<Shield className="h-5 w-5" />} accent="blue" />
      </div>

      <Panel>
        <PanelHeader title="Loan Center" subtitle="Demo loan records" icon={<Coins className="h-4 w-4" />} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-ink-400">
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Purpose</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="hidden px-5 py-3 font-semibold lg:table-cell">Officer</th>
                <th className="hidden px-5 py-3 font-semibold lg:table-cell">Due</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loans.map((l) => (
                <tr key={l.id} className="table-row-hover">
                  <td className="px-5 py-3 font-semibold text-white">{l.memberHandle}</td>
                  <td className="hidden px-5 py-3 text-ink-300 sm:table-cell">{l.purpose}</td>
                  <td className="px-5 py-3 font-display font-bold text-gold-300">{l.amount.toLocaleString()}$</td>
                  <td className="px-5 py-3"><Badge variant={statusVariant[l.status]}>{l.status}</Badge></td>
                  <td className="hidden px-5 py-3 text-ink-300 lg:table-cell">{l.officer ?? '—'}</td>
                  <td className="hidden px-5 py-3 text-ink-300 lg:table-cell">{l.dueDate}</td>
                  <td className="px-5 py-3">
                    {l.status === 'pending' ? (
                      <button onClick={() => approveLoan(l.id)} className="btn-ghost px-2.5 py-1 text-[11px] text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </button>
                    ) : (
                      <span className="text-[11px] text-ink-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function VerificationCenter() {
  const { logAudit } = useApp();
  const [items, setItems] = useState<VerificationRequest[]>(demoVerificationRequests);
  const statusVariant: Record<VerificationRequest['status'], 'amber' | 'blue' | 'green' | 'red'> = {
    pending: 'amber', review: 'blue', approved: 'green', rejected: 'red',
  };

  const approve = (id: string) => {
    setItems((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'approved' as const } : v)));
    const v = items.find((x) => x.id === id);
    logAudit('Verification approved', v?.handle ?? id, 'info');
  };
  const reject = (id: string) => {
    setItems((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'rejected' as const } : v)));
    const v = items.find((x) => x.id === id);
    logAudit('Verification rejected', v?.handle ?? id, 'warning');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending" value={items.filter((v) => v.status === 'pending').length} icon={<Clock className="h-5 w-5" />} accent="amber" />
        <StatCard label="Under Review" value={items.filter((v) => v.status === 'review').length} icon={<Eye className="h-5 w-5" />} accent="blue" />
        <StatCard label="Approved" value={items.filter((v) => v.status === 'approved').length} icon={<CheckCircle2 className="h-5 w-5" />} accent="green" />
        <StatCard label="Rejected" value={items.filter((v) => v.status === 'rejected').length} icon={<XCircle className="h-5 w-5" />} accent="red" />
      </div>

      <Panel>
        <PanelHeader title="Verification Requests" subtitle="Demo review queue — interactive" icon={<CheckCircle2 className="h-4 w-4" />} />
        <div className="divide-y divide-white/5">
          {items.map((v) => (
            <div key={v.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400"><BadgeCheck className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{v.handle}</p>
                  <p className="truncate text-xs text-ink-300">{v.game} · submitted {v.submittedDate} · {v.notes}</p>
                </div>
              </div>
              <Badge variant={statusVariant[v.status]}>{v.status}</Badge>
              {(v.status === 'pending' || v.status === 'review') && (
                <div className="flex gap-2">
                  <button onClick={() => approve(v.id)} className="btn-ghost px-3 py-1.5 text-xs text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
                  <button onClick={() => reject(v.id)} className="btn-ghost px-3 py-1.5 text-xs text-red-300"><XCircle className="h-3.5 w-3.5" /> Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function DiscordManagement() {
  return (
    <div className="space-y-6">
      <Panel className="border-amber-500/20">
        <div className="flex items-start gap-3 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300"><Radio className="h-5 w-5" /></div>
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Discord Status Management</h3>
            <p className="mt-1 text-xs text-ink-300">Bot integration is not yet connected. Configure an authorized Discord bot with Presence and Server Members privileged intents to enable live management. All data shown is demo.</p>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Discord Members" value={adminStats.discordMembers.toLocaleString()} icon={<Users className="h-5 w-5" />} accent="violet" />
        <StatCard label="Synced" value={adminStats.discordSynced.toLocaleString()} icon={<ShieldCheck className="h-5 w-5" />} accent="green" />
        <StatCard label="Pending Sync" value={adminStats.discordPending} icon={<Clock className="h-5 w-5" />} accent="amber" />
        <StatCard label="Bot Status" value="Offline" icon={<Radio className="h-5 w-5" />} accent="red" />
      </div>

      <Panel>
        <PanelHeader title="Presence Distribution" subtitle="Demo" icon={<ActivityIcon className="h-4 w-4" />} />
        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          {(['online', 'idle', 'dnd', 'offline'] as const).map((s) => {
            const count = demoMembers.filter((m) => m.status === s).length;
            return (
              <div key={s} className="rounded-xl border border-white/5 bg-ink-900/40 p-4 text-center">
                <StatusBadge status={s} />
                <p className="mt-2 font-display text-2xl font-bold text-white">{count}</p>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function ActivityRecords() {
  return (
    <Panel>
      <PanelHeader title="Activity Records" subtitle="Admin event log — demo" icon={<ActivityIcon className="h-4 w-4" />} />
      <div className="divide-y divide-white/5">
        {[...demoMembers].slice(0, 8).map((m, i) => (
          <div key={m.id} className="flex items-center gap-3 px-5 py-3">
            <Avatar initials={m.avatarInitials} accent={m.accent} status={m.status} size="sm" />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{m.handle}</p><p className="truncate text-xs text-ink-300">{m.activity ?? `Last seen ${m.lastSeen ?? '—'}`}</p></div>
            <span className="font-mono text-[11px] text-ink-400">{['12m', '38m', '1h', '2h', '3h', '5h', '8h', '1d'][i]} ago</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RankingsManagement() {
  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="Rank Hierarchy" subtitle="Demo rank structure" icon={<Trophy className="h-4 w-4" />} />
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          {['Founder', 'Director', 'Commander', 'Senior Officer', 'Officer', 'Veteran', 'Member', 'Recruit'].map((r, i) => (
            <div key={r} className="rounded-xl border border-white/5 bg-ink-900/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-gold-300">Tier {i + 1}</span>
                <Badge variant="gold">{demoMembers.filter((m) => m.rank === r).length}</Badge>
              </div>
              <p className="text-sm font-semibold text-white">{r}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Achievement Catalog" subtitle="Demo achievements" icon={<BadgeCheck className="h-4 w-4" />} />
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
          {['Founder', 'Command Crest', '1000 Hours', 'Community Architect', 'Verification Lead', 'Loan Officer', 'Event Curator', 'Veteran', 'Raid Captain', 'Top Fragger', 'Sharpshooter', 'Guardian'].map((a) => (
            <div key={a} className="rounded-xl border border-gold-500/15 bg-gold-500/5 p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient text-ink-950"><BadgeCheck className="h-5 w-5" /></div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-gold-200">{a}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function AnnouncementsManagement() {
  const { logAudit } = useApp();
  return (
    <Panel>
      <PanelHeader title="Announcements Management" subtitle={`${demoAnnouncements.length} published`} icon={<Megaphone className="h-4 w-4" />}
        action={<button onClick={() => logAudit('Announcement created', 'New draft', 'info')} className="btn-gold py-1.5 text-xs"><Megaphone className="h-3.5 w-3.5" /> New</button>}
      />
      <div className="divide-y divide-white/5">
        {demoAnnouncements.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold text-white">{a.title}</p>
                {a.pinned && <Badge variant="gold">Pinned</Badge>}
              </div>
              <p className="truncate text-xs text-ink-300">by {a.author} · {a.date} · {a.category}</p>
            </div>
            <button onClick={() => logAudit('Announcement edited', a.title, 'info')} className="btn-ghost px-3 py-1.5 text-xs">Edit</button>
            <ChevronRight className="h-4 w-4 text-ink-400" />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AuditLogs() {
  const { auditLogs } = useApp();
  const sevVariant = { info: 'blue', warning: 'amber', critical: 'red' } as const;
  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="Audit Logs" subtitle={`${auditLogs.length} entries — live demo log`} icon={<ScrollText className="h-4 w-4" />} />
        <div className="divide-y divide-white/5">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 px-5 py-3.5">
              <Badge variant={sevVariant[log.severity]}>{log.severity}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white"><span className="font-semibold">{log.action}</span> — {log.target}</p>
                <p className="text-xs text-ink-400">by {log.actor}</p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-ink-400">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </Panel>
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <p className="text-xs text-amber-200/80">
          In production, audit logs must be written server-side on every privileged mutation (role grants, loan
          approvals, verification decisions, access changes). Frontend logging is illustrative only and must never be
          the sole record.
        </p>
      </div>
    </div>
  );
}

function AccessPermissions() {
  const { rbacRole } = useApp();
  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="RBAC Role Matrix" subtitle="8 access levels · demo permissions" icon={<KeyRound className="h-4 w-4" />} />
        <div className="space-y-3 p-5">
          {allRoles.map((r) => {
            const meta = roleMeta[r];
            const perms = rolePermissions[r] ?? [];
            const isCurrent = rbacRole === r;
            return (
              <div
                key={r}
                className={cn(
                  'rounded-xl border p-4 transition-colors',
                  isCurrent ? 'border-gold-500/40 bg-gold-500/5' : 'border-white/5 bg-ink-900/40',
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${meta.color}15`, color: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}30` }}>
                      <Shield className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{meta.label}{isCurrent && <span className="ml-2 text-[10px] uppercase tracking-wider text-gold-400">Your role</span>}</p>
                      <p className="text-xs text-ink-400">{meta.description}</p>
                    </div>
                  </div>
                  <Badge variant="neutral">Tier {meta.tier}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {perms.length === 0 ? (
                    <span className="text-[11px] text-ink-400">No admin permissions — community access only.</span>
                  ) : (
                    perms.map((p) => <Badge key={p} variant="neutral">{p}</Badge>)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Security Posture" icon={<ShieldCheck className="h-4 w-4" />} />
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
          <SecRow label="2FA enforced (staff)" value="Yes" ok />
          <SecRow label="RLS on all tables" value="Prepared" ok />
          <SecRow label="Server-side permission checks" value="Required" ok />
          <SecRow label="Direct URL access blocked" value="Yes" ok />
          <SecRow label="Audit logging (admin actions)" value="Active" ok />
          <SecRow label="Discord bot scopes" value="Pending" ok={false} />
        </div>
      </Panel>

      <Panel className="border-amber-500/20">
        <div className="flex items-start gap-3 p-5">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs text-amber-200/80">
            Frontend RBAC gates visibility and navigation only. In production, every admin API endpoint and database
            mutation must enforce the same permission checks server-side. Never rely on frontend-only permission
            checks — an attacker can bypass them. Use Supabase Row Level Security (RLS) policies and SECURITY DEFINER
            functions for all privileged operations.
          </p>
        </div>
      </Panel>
    </div>
  );
}

function SecRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-ink-900/40 p-3">
      <span className="text-xs text-ink-200">{label}</span>
      <span className={cn('flex items-center gap-1.5 text-xs font-semibold', ok ? 'text-emerald-300' : 'text-amber-300')}>
        <span className={cn('h-1.5 w-1.5 rounded-full', ok ? 'bg-emerald-400' : 'bg-amber-400')} /> {value}
      </span>
    </div>
  );
}
