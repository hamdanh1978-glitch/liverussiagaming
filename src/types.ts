export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'offline';

export type MemberRank =
  | 'Recruit'
  | 'Member'
  | 'Veteran'
  | 'Officer'
  | 'Senior Officer'
  | 'Commander'
  | 'Director'
  | 'Founder';

export type StaffDepartment =
  | 'Command'
  | 'Verification'
  | 'Loan Center Management'
  | 'Discord Operations'
  | 'Events'
  | 'Moderation'
  | 'Junior Administrator'
  | 'Support Team';

export interface Member {
  id: string;
  handle: string;
  displayName: string;
  avatarInitials: string;
  accent: string;
  rank: MemberRank;
  department: StaffDepartment | null;
  verified: boolean;
  joinedDate: string;
  level: number;
  xp: number;
  reputation: number;
  status: DiscordStatus;
  activity?: string;
  lastSeen?: string;
  discordConnected: boolean;
  discordUsername?: string;
  country: string;
  bio?: string;
  achievements: string[];
  game: string;
  staffRole?: string;
}

export interface ActivityRecord {
  id: string;
  memberId: string;
  type: 'verification' | 'promotion' | 'loan' | 'event' | 'discord' | 'announcement' | 'join' | 'achievement';
  label: string;
  detail: string;
  timestamp: string;
  actor?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: 'Community' | 'Event' | 'Policy' | 'System' | 'Staff';
  pinned: boolean;
  author: string;
  date: string;
}

export interface LoanRecord {
  id: string;
  memberHandle: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'repaid' | 'overdue';
  officer?: string;
  issuedDate: string;
  dueDate: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  target: string;
  actor: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface VerificationRequest {
  id: string;
  handle: string;
  game: string;
  submittedDate: string;
  status: 'pending' | 'review' | 'approved' | 'rejected';
  notes?: string;
}

export type PageId =
  | 'login'
  | 'dashboard'
  | 'profile'
  | 'community'
  | 'staff'
  | 'activity'
  | 'discord'
  | 'leaderboard'
  | 'announcements'
  | 'admin'
  | 'suggestions'
  | 'support'
  | 'events'
  | 'radio';
