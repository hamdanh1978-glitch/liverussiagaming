import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Music, Play, Pause, SkipForward, Loader2, Plus, Radio,
  ListMusic, CalendarDays, Mic2, Heart, Volume2, Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/store/AppContext';
import { PageHeader } from '@/components/AppShell';
import { Panel, PanelHeader, Badge, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration_seconds: number;
  source_url: string;
  cover_url: string | null;
}

interface PlaybackState {
  id: number;
  current_track_id: string | null;
  is_playing: boolean;
  position_seconds: number;
}

interface QueueItem {
  id: string;
  track_id: string;
  position: number;
  track?: Track;
}

interface Show {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
}

interface SongRequest {
  id: string;
  track_title: string;
  artist: string;
  status: string;
  created_at: string;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function RadioPage() {
  const { user, profile } = useApp();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'player' | 'queue' | 'schedule' | 'requests'>('player');
  const [reqForm, setReqForm] = useState({ track_title: '', artist: '' });
  const [submitting, setSubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchData = useCallback(async () => {
    const [{ data: trackData }, { data: pbData }, { data: queueData }, { data: showData }, { data: reqData }] = await Promise.all([
      supabase.from('radio_tracks').select('*').order('created_at', { ascending: false }),
      supabase.from('radio_playback_state').select('*').eq('id', 1).maybeSingle(),
      supabase.from('radio_queue').select('*, track:radio_tracks(*)').order('position', { ascending: true }),
      supabase.from('radio_shows').select('*').order('starts_at', { ascending: true }),
      supabase.from('song_requests').select('*').order('created_at', { ascending: false }).limit(20),
    ]);
    setTracks(trackData as Track[] || []);
    setPlayback(pbData as PlaybackState | null);
    setQueue(queueData as QueueItem[] || []);
    setShows(showData as Show[] || []);
    setRequests(reqData as SongRequest[] || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Subscribe to playback state changes for sync
  useEffect(() => {
    const channel = supabase
      .channel('radio-playback')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'radio_playback_state' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'radio_queue' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'song_requests' }, () => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const currentTrack = tracks.find((t) => t.id === playback?.current_track_id) || null;

  const handleRequestSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reqForm.track_title.trim()) return;
    setSubmitting(true);
    await supabase.from('song_requests').insert({
      user_id: user.id,
      track_title: reqForm.track_title.trim(),
      artist: reqForm.artist.trim(),
    });
    setReqForm({ track_title: '', artist: '' });
    setSubmitting(false);
    fetchData();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Community Radio"
        subtitle="Live music, DJ shows and song requests"
        icon={<Radio className="h-5 w-5" />}
      />

      {/* Now Playing */}
      <Panel className="mb-6 overflow-hidden">
        <div className="relative flex items-center gap-5 p-6">
          <div className="pointer-events-none absolute inset-0 bg-radial-gold opacity-10" />
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-gold-500/20 bg-ink-850">
            {currentTrack?.cover_url ? (
              <img src={currentTrack.cover_url} alt="" className="h-full w-full rounded-2xl object-cover" />
            ) : (
              <Music className="h-8 w-8 text-gold-500" />
            )}
          </div>
          <div className="relative min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-400">
              {playback?.is_playing ? 'Now Playing' : 'Paused'}
            </p>
            <h2 className="mt-1 truncate font-display text-xl font-bold text-white">
              {currentTrack?.title || 'No track loaded'}
            </h2>
            <p className="mt-0.5 truncate text-sm text-ink-200">
              {currentTrack?.artist || '—'}
            </p>
            {currentTrack && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] text-ink-400">{formatDuration(playback?.position_seconds || 0)}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
                    style={{ width: `${Math.min(100, ((playback?.position_seconds || 0) / currentTrack.duration_seconds) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-ink-400">{formatDuration(currentTrack.duration_seconds)}</span>
              </div>
            )}
          </div>
          <div className="relative flex items-center gap-2">
            <button className="rounded-full border border-white/10 bg-white/5 p-2.5 text-ink-200 hover:border-gold-500/30 hover:text-gold-400" title="Volume">
              <Volume2 className="h-4 w-4" />
            </button>
            <button className="rounded-full border border-white/10 bg-white/5 p-2.5 text-ink-200 hover:border-gold-500/30 hover:text-gold-400" title="Like">
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Panel>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto scrollbar-thin">
        {[
          { id: 'player' as const, label: 'Library', icon: <Music className="h-4 w-4" /> },
          { id: 'queue' as const, label: 'Queue', icon: <ListMusic className="h-4 w-4" /> },
          { id: 'schedule' as const, label: 'Schedule', icon: <CalendarDays className="h-4 w-4" /> },
          { id: 'requests' as const, label: 'Requests', icon: <Mic2 className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors',
              activeTab === tab.id
                ? 'border-gold-500/40 bg-gold-500/10 text-gold-300'
                : 'border-white/5 bg-white/5 text-ink-300 hover:border-white/10 hover:text-white'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'player' && (
        <Panel>
          <PanelHeader title="Track Library" subtitle={`${tracks.length} tracks available`} icon={<Music className="h-4 w-4" />} />
          {tracks.length === 0 ? (
            <EmptyState icon={<Music className="h-6 w-6" />} title="No tracks in the library" subtitle="Tracks will appear here once added by admins." />
          ) : (
            <div className="divide-y divide-white/5">
              {tracks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-ink-850">
                    {t.cover_url ? <img src={t.cover_url} alt="" className="h-full w-full rounded-lg object-cover" /> : <Music className="h-4 w-4 text-ink-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{t.title}</p>
                    <p className="truncate text-xs text-ink-300">{t.artist}</p>
                  </div>
                  <span className="text-xs text-ink-400">{formatDuration(t.duration_seconds)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {activeTab === 'queue' && (
        <Panel>
          <PanelHeader title="Up Next" subtitle={`${queue.length} tracks in queue`} icon={<ListMusic className="h-4 w-4" />} />
          {queue.length === 0 ? (
            <EmptyState icon={<ListMusic className="h-6 w-6" />} title="Queue is empty" subtitle="Tracks added to the queue will appear here." />
          ) : (
            <div className="divide-y divide-white/5">
              {queue.map((q, i) => (
                <div key={q.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="font-mono text-sm text-gold-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{q.track?.title || 'Unknown'}</p>
                    <p className="truncate text-xs text-ink-300">{q.track?.artist}</p>
                  </div>
                  <span className="text-xs text-ink-400">{q.track ? formatDuration(q.track.duration_seconds) : ''}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {activeTab === 'schedule' && (
        <Panel>
          <PanelHeader title="DJ Show Schedule" subtitle="Upcoming live shows" icon={<CalendarDays className="h-4 w-4" />} />
          {shows.length === 0 ? (
            <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No shows scheduled" subtitle="DJ shows will be listed here once scheduled." />
          ) : (
            <div className="divide-y divide-white/5">
              {shows.map((s) => (
                <div key={s.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/5">
                    <span className="font-display text-sm font-bold text-gold-300">{new Date(s.starts_at).getDate()}</span>
                    <span className="text-[9px] uppercase text-gold-400">{new Date(s.starts_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-sm font-semibold text-white">{s.title}</h3>
                    {s.description && <p className="mt-0.5 text-xs text-ink-200">{s.description}</p>}
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-400">
                      <Clock className="h-3 w-3" /> {formatTime(s.starts_at)}
                      {s.ends_at && ` — ${formatTime(s.ends_at)}`}
                    </p>
                  </div>
                  <Badge variant="gold"><Mic2 className="mr-1 h-3 w-3" /> Live Show</Badge>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <Panel className="p-5">
            <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-white">Request a Song</h3>
            <form onSubmit={handleRequestSong} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={reqForm.track_title}
                onChange={(e) => setReqForm((f) => ({ ...f, track_title: e.target.value }))}
                placeholder="Song title"
                className="input-field flex-1"
                required
              />
              <input
                type="text"
                value={reqForm.artist}
                onChange={(e) => setReqForm((f) => ({ ...f, artist: e.target.value }))}
                placeholder="Artist (optional)"
                className="input-field flex-1"
              />
              <button type="submit" disabled={submitting} className="btn-gold text-xs disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Request
              </button>
            </form>
          </Panel>

          <Panel>
            <PanelHeader title="Recent Requests" subtitle={`${requests.length} total`} icon={<Mic2 className="h-4 w-4" />} />
            {requests.length === 0 ? (
              <EmptyState icon={<Mic2 className="h-6 w-6" />} title="No song requests yet" subtitle="Request a song for the DJ to play." />
            ) : (
              <div className="divide-y divide-white/5">
                {requests.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{r.track_title}</p>
                      <p className="truncate text-xs text-ink-300">{r.artist || 'Unknown artist'}</p>
                    </div>
                    <Badge variant={r.status === 'played' ? 'green' : r.status === 'rejected' ? 'red' : 'amber'}>
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
