import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Loader2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../lib/auth';
import { HOSPITAL_NAME } from '../lib/constants';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = login(username, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid username or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-medical-50/30 to-slate-100 px-4 py-8">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-medical-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-200/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        <button
          onClick={() => navigate('/rx')}
          className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft size={16} />
          Back to Customer Page
        </button>

        <div className="card overflow-hidden">
          {/* Header section */}
          <div className="bg-gradient-to-br from-medical-600 to-medical-800 px-8 py-8 text-white">
            <div className="mb-4">
              <Logo size="lg" variant="light" />
            </div>
            <h1 className="text-xl font-bold">Pharmacist Login</h1>
            <p className="mt-1 text-sm text-white/80">{HOSPITAL_NAME}</p>
          </div>

          {/* Form section */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="animate-slide-down flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Authorized personnel only. Customers should use the /rx page.
        </p>
      </div>
    </div>
  );
}
