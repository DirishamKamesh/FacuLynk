import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Clock, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';

export const PendingApprovalPage: React.FC = () => {
  const { currentUser, checkApprovalStatus, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      const latestStatus = await checkApprovalStatus();
      if (latestStatus === 'ACTIVE' || latestStatus === 'APPROVED') {
        setStatusMessage('Your account has been approved by the HOD! Redirecting to setup your profile details...');
        setTimeout(() => {
          navigate('/faculty/profile', { state: { newlyVerified: true } });
        }, 1500);
      } else if (latestStatus === 'REJECTED') {
        navigate('/rejected');
      } else {
        setStatusMessage('Status: Still PENDING HOD Approval. Please check back shortly.');
      }
    } catch (e) {
      setStatusMessage('Unable to check status right now. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleBackToLogin = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-[#1E293B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-[#172554] text-white rounded-xl mx-auto flex items-center justify-center font-bold text-2xl border border-[#172554] shadow-xs">
          <GraduationCap className="w-9 h-9 text-teal-400" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-[#1E293B] tracking-tight">
          Registration Submitted
        </h1>
        <p className="mt-1 text-xs text-[#64748B] font-medium">
          Your faculty registration has been submitted successfully.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xs border border-[#E2E8F0] rounded-xl sm:px-10 space-y-6">
          {/* Status Badge & Faculty ID */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-2xs font-extrabold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
              <span>Status: PENDING HOD APPROVAL</span>
            </div>
            <div>
              <p className="text-2xs text-amber-800 uppercase font-bold tracking-wider mt-2">Faculty ID</p>
              <p className="text-xl font-extrabold text-[#172554] font-mono">
                {currentUser?.facultyId || 'FAC-1009'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#64748B] leading-relaxed">
            <p className="text-[#1E293B] font-medium">
              Your account will become active after the Head of Department verifies and approves your registration.
            </p>
            <p className="text-3xs text-slate-400">
              Department: {currentUser?.department || 'Computer Science & Engineering'} • {currentUser?.email}
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border ${
                statusMessage.includes('approved')
                  ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {statusMessage}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full py-2.5 px-4 bg-[#172554] hover:bg-[#1E3A8A] text-white font-bold text-sm rounded-lg transition-colors border border-[#172554] shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking Status...' : 'Check Approval Status'}</span>
            </button>

            <button
              onClick={handleBackToLogin}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
