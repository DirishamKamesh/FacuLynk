import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export const HodActivatePage: React.FC = () => {
  const { currentUser, activateHodAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialHodId = location.state?.hodId || currentUser?.facultyId || 'HOD-001';
  const initialEmail = location.state?.email || currentUser?.email || 'hod@university.edu';
  const initialName = location.state?.name || currentUser?.name || 'Dr. Department Head';
  const initialDept = location.state?.department || currentUser?.department || 'Computer Science & Engineering';

  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [department, setDepartment] = useState(initialDept);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError('Please fill in your full name and university email.');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await activateHodAccount({
        hodId: initialHodId,
        fullName,
        email,
        department,
      });

      navigate('/hod/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to activate HOD account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-[#1E293B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-[#172554] text-white rounded-xl mx-auto flex items-center justify-center font-bold text-2xl border border-[#172554] shadow-xs">
          <GraduationCap className="w-9 h-9 text-teal-400" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-[#1E293B] tracking-tight">
          Activate Your HOD Account
        </h1>
        <p className="mt-1 text-xs text-[#64748B] font-medium">
          Set up your institutional credentials for department leadership
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xs border border-[#E2E8F0] rounded-xl sm:px-10 space-y-6">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-2.5 text-xs text-[#0F766E]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Institution-Provisioned HOD Account</p>
              <p className="text-2xs text-teal-800 mt-0.5">
                Verify your department details and set your password to complete account activation.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-[#B91C1C]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                HOD Institutional ID (Read-only)
              </label>
              <input
                type="text"
                value={initialHodId}
                readOnly
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg text-slate-500 bg-slate-100 font-mono font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Arthur Pendelton"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hod@university.edu"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                />
              </div>
              <div>
                <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#172554] hover:bg-[#1E3A8A] text-white font-bold text-sm rounded-lg transition-colors border border-[#172554] shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Activating Account...' : 'Activate HOD Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
