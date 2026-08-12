import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, XCircle, LogOut, Mail } from 'lucide-react';

export const RejectedPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-[#1E293B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-[#B91C1C] text-white rounded-xl mx-auto flex items-center justify-center font-bold text-2xl border border-[#B91C1C] shadow-xs">
          <GraduationCap className="w-9 h-9 text-rose-200" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-[#1E293B] tracking-tight">
          Registration Not Approved
        </h1>
        <p className="mt-1 text-xs text-[#64748B] font-medium">
          Faculty registration review decision
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xs border border-[#E2E8F0] rounded-xl sm:px-10 space-y-6">
          <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-[#B91C1C] border border-rose-300 rounded-full text-2xs font-extrabold uppercase tracking-wider">
              <XCircle className="w-3.5 h-3.5 text-[#B91C1C]" />
              <span>Status: REGISTRATION REJECTED</span>
            </div>
            <div>
              <p className="text-2xs text-rose-800 uppercase font-bold tracking-wider mt-2">Faculty ID</p>
              <p className="text-xl font-extrabold text-[#B91C1C] font-mono">
                {currentUser?.facultyId || 'FAC-1009'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <p className="text-2xs font-bold text-slate-500 uppercase tracking-wider">HOD Rejection Reason</p>
            <p className="text-xs font-semibold text-[#1E293B] italic">
              "{currentUser?.rejectionReason || 'Institutional records mismatch or duplicate faculty record detected.'}"
            </p>
          </div>

          <div className="space-y-3 text-xs text-[#64748B] leading-relaxed">
            <p className="text-[#1E293B]">
              Contact your department administration if you believe this decision was made in error or if your credentials need updating.
            </p>
            <div className="p-3 bg-slate-100 rounded-lg flex items-center gap-2 text-2xs font-medium text-slate-700">
              <Mail className="w-4 h-4 text-[#172554] shrink-0" />
              <span>Department Admin: <strong>hod@university.edu</strong></span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleBackToLogin}
              className="w-full py-2.5 px-4 bg-[#172554] hover:bg-[#1E3A8A] text-white font-bold text-xs rounded-lg transition-colors border border-[#172554] shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
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
