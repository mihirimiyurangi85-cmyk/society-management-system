import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('error', 'Validation Error', 'Please enter your Username / Member ID and password');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(username, password);
      setLoading(false);

      if (result.success) {
        showToast('success', 'Welcome Back!', 'Logged in successfully.');
        // Redirect based on role
        if (username.toLowerCase() === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/member/dashboard');
        }
      } else {
        showToast('error', 'Authentication Failed', result.error || 'Invalid credentials');
      }
    }, 400);
  };

  const fillDemo = (userStr: string, passStr: string) => {
    setUsername(userStr);
    setPassword(passStr);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30">
            🏛️
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black text-white tracking-tight">
          Society Management & Welfare Fund
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Secure Portal for Members & Administration
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Member ID / Username"
              type="text"
              placeholder="e.g. admin or M001"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              leftIcon={<span className="text-sm">👤</span>}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<span className="text-sm">🔒</span>}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-400">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span className="ml-2">Remember login</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-lg shadow-emerald-500/20"
              isLoading={loading}
            >
              Sign In to Account
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              ⚡ Quick Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin', 'admin123')}
                className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 text-xs font-semibold text-emerald-400 transition-colors"
              >
                🔑 Admin Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemo('M001', 'member123')}
                className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 text-xs font-semibold text-sky-400 transition-colors"
              >
                👤 Member Demo (M001)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
