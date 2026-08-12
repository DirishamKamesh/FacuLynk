import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, ShieldCheck, ArrowRight, AlertCircle, Info, KeyRound, Building2, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState<'HOD' | 'FACULTY'>('HOD');
  const [idOrEmail, setIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleModeChange = (mode: 'HOD' | 'FACULTY') => {
    setLoginMode(mode);
    setError(null);
    if (mode === 'HOD') {
      setIdOrEmail('HOD-001');
      setPassword('');
    } else {
      setIdOrEmail('FAC-1001');
      setPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idOrEmail.trim()) {
      setError(
        loginMode === 'HOD'
          ? 'Please enter your Institutional HOD ID.'
          : 'Please enter your Faculty ID or Email address.'
      );
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await login(idOrEmail, password);

      if (user.role === 'HOD') {
        if (user.accountStatus === 'pending_activation') {
          navigate('/hod-activate', { state: { hodId: user.facultyId, email: user.email, name: user.name, department: user.department } });
        } else {
          navigate('/hod/dashboard');
        }
      } else {
        if (user.accountStatus === 'PENDING') {
          navigate('/pending-approval');
        } else if (user.accountStatus === 'REJECTED') {
          navigate('/rejected');
        } else if (user.isNewlyVerified || user.profileCompleted === false) {
          navigate('/faculty/profile', { state: { newlyVerified: true } });
        } else if (user.accountStatus === 'ACTIVE' || user.accountStatus === 'APPROVED') {
          navigate('/faculty/dashboard');
        } else {
          setError('Account inactive. Please contact department administration.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify institutional credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (id: string, mode: 'HOD' | 'FACULTY') => {
    setLoginMode(mode);
    setIdOrEmail(id);
    setPassword('password123'); // Demo password
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-[#1E293B]">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-[#172554] text-white rounded-xl mx-auto flex items-center justify-center font-bold text-2xl border border-[#172554] shadow-xs">
          <GraduationCap className="w-9 h-9 text-teal-400" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-[#1E293B] tracking-tight">
          FacuLynk
        </h1>
        <p className="mt-1 text-xs text-[#64748B] font-medium">
          Institutional Workload Management System
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xs border border-[#E2E8F0] rounded-xl sm:px-10 space-y-6">
          {/* Mode Tabs (HOD vs Faculty) */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleModeChange('HOD')}
              className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'HOD'
                  ? 'bg-[#172554] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>HOD Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('FACULTY')}
              className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'FACULTY'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Faculty Sign In</span>
            </button>
          </div>

          {/* Form Header */}
          <div className="border-b border-[#E2E8F0] pb-3">
            <h2 className="text-base font-bold text-[#1E293B] tracking-tight">
              {loginMode === 'HOD' ? 'HOD Institutional Sign In' : 'Faculty Institutional Sign In'}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {loginMode === 'HOD'
                ? 'Enter your verified institutional credentials to access department workload management.'
                : 'Enter your verified institutional credentials to access your faculty dashboard.'}
            </p>
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
                {loginMode === 'HOD' ? 'Institutional HOD ID' : 'Institutional Faculty ID or Email'}
              </label>
              <input
                type="text"
                value={idOrEmail}
                onChange={(e) => setIdOrEmail(e.target.value)}
                placeholder={loginMode === 'HOD' ? 'HOD-001' : 'FAC-1001 or faculty@university.edu'}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B] bg-slate-50/50 font-medium"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-2xs font-semibold text-[#0F766E] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B] bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 text-white font-bold text-sm rounded-lg transition-colors border shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 ${
                loginMode === 'HOD'
                  ? 'bg-[#172554] hover:bg-[#1E3A8A] border-[#172554]'
                  : 'bg-[#0F766E] hover:bg-[#0D655E] border-[#0F766E]'
              }`}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Secondary Action Link */}
          <div className="pt-4 border-t border-[#E2E8F0] text-center">
            <p className="text-2xs text-[#64748B] mb-1">Faculty member?</p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#0F766E] hover:text-[#0D655E] transition-colors group cursor-pointer"
            >
              <span>Register with your Institutional ID →</span>
            </Link>
          </div>

          {/* Demo Credentials Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#1E293B] uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-[#172554]" />
              <span>Prototype Demo Credentials</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => fillQuickAccount('HOD-001', 'HOD')}
                className="p-2 bg-white border border-slate-200 rounded text-left hover:border-[#172554] transition-colors cursor-pointer"
              >
                <p className="font-bold text-[#172554]">HOD-001</p>
                <p className="text-slate-600 text-3xs font-medium">HOD Administrator</p>
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('FAC-1001', 'FACULTY')}
                className="p-2 bg-white border border-slate-200 rounded text-left hover:border-[#0F766E] transition-colors cursor-pointer"
              >
                <p className="font-bold text-[#0F766E]">FAC-1001</p>
                <p className="text-slate-600 text-3xs font-medium">Active Faculty Member</p>
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('HOD-002', 'HOD')}
                className="p-2 bg-white border border-slate-200 rounded text-left hover:border-indigo-600 transition-colors cursor-pointer"
              >
                <p className="font-bold text-indigo-800">HOD-002</p>
                <p className="text-slate-600 text-3xs font-medium">Pending Activation HOD</p>
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('FAC-1009', 'FACULTY')}
                className="p-2 bg-white border border-slate-200 rounded text-left hover:border-amber-600 transition-colors cursor-pointer"
              >
                <p className="font-bold text-amber-700">FAC-1009</p>
                <p className="text-slate-600 text-3xs font-medium">Pending Verification</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-[#172554]">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-base font-bold">Institutional Credential Recovery</h3>
            </div>
            <p className="text-xs text-[#64748B]">
              For security compliance, institutional account passwords must be reset through your university IT Single Sign-On portal or department administrative desk.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-2xs space-y-1">
              <p className="font-bold text-[#1E293B]">Prototype Recovery Instructions:</p>
              <p className="text-slate-600">You may use demo credentials (e.g., HOD-001 or FAC-1001) with any password to sign in immediately.</p>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-[#172554] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
