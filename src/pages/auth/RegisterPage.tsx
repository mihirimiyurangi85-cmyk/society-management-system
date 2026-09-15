import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { db } from '../../services/db/mockDatabase';
import { smsService } from '../../services/sms/mockSmsProvider';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !nicNumber.trim() || !phoneNumber.trim() || !password) {
      showToast('error', 'Validation Error', 'Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Password Mismatch', 'Password and confirm password do not match.');
      return;
    }

    if (!agreeTerms) {
      showToast('error', 'Terms Required', 'Please accept the LKR 200/month welfare contribution agreement.');
      return;
    }

    setLoading(true);

    try {
      const result = db.registerMember({
        full_name: fullName,
        nic_number: nicNumber,
        address,
        phone_number: phoneNumber,
        whatsapp_number: whatsappNumber || phoneNumber,
        username,
        password_hash: password,
      });

      // Dispatch Welcome SMS Notification
      const welcomeSms = `Welcome to Society Management & Welfare Fund! Your Member ID is ${result.member.id}. Monthly Contribution: LKR 200.00.`;
      await smsService.sendSms({
        recipientPhone: phoneNumber,
        messageText: welcomeSms,
      });

      db.addNotification({
        user_id: result.member.id,
        title: 'Membership Registered Successfully',
        message: welcomeSms,
        type: 'SYSTEM',
        sms_status: 'SENT',
      });

      setLoading(false);
      showToast(
        'success',
        'Registration Successful!',
        `Welcome ${fullName}! Your Member ID is ${result.member.id}.`
      );

      // Auto login user
      const loginRes = await login(result.user.username, password);
      if (loginRes.success) {
        navigate('/member/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      setLoading(false);
      showToast('error', 'Registration Failed', err.message || 'Could not complete registration.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30">
            🏛️
          </div>
        </div>
        <h2 className="mt-3 text-center text-2xl font-black text-white tracking-tight">
          Member Self-Registration
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Register as an active member of the Society Management & Welfare Fund
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Kamal Perera"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="NIC Number"
                type="text"
                placeholder="e.g. 199012345678 or 901234567V"
                value={nicNumber}
                onChange={(e) => setNicNumber(e.target.value)}
                required
              />

              <Input
                label="Username / Login Handle (Optional)"
                type="text"
                placeholder="Defaults to Member ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <Input
              label="Residential Address"
              type="text"
              placeholder="No. 12, Main Street, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number (SMS Notifications)"
                type="text"
                placeholder="e.g. +94771234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />

              <Input
                label="WhatsApp Number (Optional)"
                type="text"
                placeholder="e.g. +94771234567"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Fee & Contribution Agreement Notice */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-400">
                <span>💳 Society Welfare Contribution Policy</span>
              </div>
              <p className="text-[11px] text-slate-400">
                As a registered society member, you agree to contribute <strong>LKR 200.00 per month</strong> to the common welfare fund pool. Eligible relatives are entitled to death/welfare financial assistance.
              </p>
              <label className="flex items-center gap-2 pt-1 font-semibold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span>I accept the LKR 200/month contribution agreement</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-lg shadow-emerald-500/20"
              isLoading={loading}
            >
              Complete Registration & Create Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already a registered society member?{' '}
              <Link to="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Sign in to your account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
