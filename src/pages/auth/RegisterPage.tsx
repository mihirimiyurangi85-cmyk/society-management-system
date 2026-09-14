import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      showToast('error', 'Validation Error', 'Please complete all fields.');
      return;
    }
    if (password.length < 6) {
      showToast('error', 'Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);

    if (!result.success) {
      showToast('error', 'Registration Failed', result.error || 'Unable to create account.');
      return;
    }

    showToast('success', 'Account Created', 'Your account is ready. Please sign in.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30">
            🏛️
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black text-white tracking-tight">Create your account</h2>
        <p className="mt-1 text-center text-xs text-slate-400">Join the Society Management & Welfare Fund portal</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              leftIcon={<span className="text-sm">👤</span>}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              leftIcon={<span className="text-sm">✉️</span>}
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              leftIcon={<span className="text-sm">🔒</span>}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full font-bold shadow-lg shadow-emerald-500/20" isLoading={loading}>
              Create Account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
