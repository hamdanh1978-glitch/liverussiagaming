import { useState } from 'react';
import { Crown, Shield, ArrowRight, Eye, EyeOff, Lock, Mail, Info, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Logo } from '@/components/Logo';

export function LoginPage() {
  const { supabaseSignIn, supabaseSignUp } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await supabaseSignIn(email, password);
      if (error) setError(error);
    } else {
      if (handle.trim().length < 3) {
        setError('Handle must be at least 3 characters.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const { error } = await supabaseSignUp(email, password, handle.trim(), displayName.trim() || handle.trim());
      if (error) {
        setError(error);
      } else {
        setSuccess('Account created! You can now sign in.');
        setMode('signin');
        setPassword('');
      }
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-grid-32 opacity-40" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gold-500/5 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Left brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/5 p-12 lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-radial-gold" />
          <div className="relative">
            <Logo size="lg" />
          </div>

          <div className="relative space-y-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">Est. 2023 · Community Portal</p>
              <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[1.05] tracking-tight text-white">
                One Community.
                <br />
                <span className="gold-text">One Identity.</span>
                <br />
                One Platform.
              </h1>
              <p className="mt-5 max-w-md text-balance text-ink-200">
                The premium digital command centre for LIVE RUSSIA GAMING — members, staff, verification, loans,
                Discord presence and community operations in one place.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { k: '1,284', v: 'Members' },
                { k: '1,097', v: 'Verified' },
                { k: '19', v: 'Staff' },
              ].map((s) => (
                <div key={s.v} className="rounded-xl border border-white/5 bg-ink-900/50 p-4">
                  <p className="font-display text-2xl font-bold text-gold-300">{s.k}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-300">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-6 text-xs text-ink-400">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-gold-500" /> Verified members only
            </span>
            <span className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-gold-500" /> Command-led
            </span>
          </div>
        </div>

        {/* Right auth panel */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo size="md" />
            </div>

            <div className="panel relative overflow-hidden p-7 sm:p-9">
              <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

              <div className="mb-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-400">Secure Access</p>
                <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-white">
                  {mode === 'signin' ? 'Enter the Portal' : 'Create Account'}
                </h2>
                <p className="mt-1 text-sm text-ink-300">
                  {mode === 'signin'
                    ? 'Sign in to access your community dashboard.'
                    : 'Join the LIVE RUSSIA GAMING community.'}
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <p>{error}</p>
                </div>
              )}

              {/* Success banner */}
              {success && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <p>{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="label" htmlFor="handle">
                        Community Handle
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <input
                          id="handle"
                          type="text"
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          placeholder="NikitaVolkov"
                          className="input-field pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor="displayName">
                        Display Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Nikita Volkov"
                          className="input-field pl-9"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="commander@liverussia.gg"
                      className="input-field pl-9"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field px-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-white"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signin' && (
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-ink-300">
                      <input type="checkbox" className="rounded border-white/10 bg-ink-900 text-gold-500 focus:ring-gold-500/30" />
                      Remember me
                    </label>
                    <button type="button" className="font-semibold text-gold-400 hover:text-gold-300">
                      Forgot?
                    </button>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {mode === 'signin' ? 'Sign In to Portal' : 'Create Account'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center text-sm text-ink-300">
                {mode === 'signin' ? (
                  <>
                    New to the community?{' '}
                    <button
                      onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                      className="font-semibold text-gold-400 hover:text-gold-300"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                      className="font-semibold text-gold-400 hover:text-gold-300"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>

              <div className="mt-6 flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-200/80">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                <p>
                  Real authentication is active. Your email and password are securely handled by Supabase.
                  Discord OAuth2 will be added in a future update.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-ink-400">
              By signing in you agree to the community code of conduct.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
