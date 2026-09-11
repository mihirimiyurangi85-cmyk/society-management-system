import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { smsService } from '../../services/sms/mockSmsProvider';

export const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast('error', 'Validation Error', 'Please enter your Member ID or registered Phone Number');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      // Simulate SMS OTP dispatch
      await smsService.sendSms({
        recipientPhone: identifier,
        messageText: 'Your Society System password reset OTP code is 482910. Valid for 10 minutes.',
      });

      showToast('success', 'Reset OTP Sent', 'Password reset code sent via SMS notification.');
      navigate('/reset-password', { state: { identifier } });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-bold text-white tracking-tight">Forgot Password</h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enter your Member ID or registered phone number to receive a recovery code.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Member ID / Phone Number"
              placeholder="e.g. M001 or +94771234567"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Send Reset Code via SMS
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
