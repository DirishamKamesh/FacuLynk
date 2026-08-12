import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PendingRegistration } from '../../types/auth';
import { getMaxHoursByDesignation } from '../../utils/workloadCalculator';
import {
  ShieldCheck,
  UserCheck,
  XCircle,
  Eye,
  CheckCircle2,
  Clock,
  User,
  Mail,
  Building2,
  Briefcase,
  Phone,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const FacultyVerificationPage: React.FC = () => {
  const { pendingRegistrations, approveFaculty, rejectFaculty, refreshPendingRegistrations } = useAuth();
  const { addFaculty } = useData();

  const [selectedReg, setSelectedReg] = useState<PendingRegistration | null>(null);
  const [rejectingReg, setRejectingReg] = useState<PendingRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const handleApprove = async (reg: PendingRegistration) => {
    setProcessing(true);
    try {
      // 1. Approve in auth service - this handles user and profile creation in backend
      await approveFaculty(reg.id);

      showToast(`Faculty ${reg.fullName} approved successfully.`);
      setSelectedReg(null);
    } catch (err: any) {
      console.error('Failed to approve faculty:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingReg) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setProcessing(true);
    try {
      await rejectFaculty(rejectingReg.id, rejectionReason);
      setRejectingReg(null);
      setRejectionReason('');
      setSelectedReg(null);
      showToast(`Registration for ${rejectingReg.fullName} has been rejected.`);
    } catch (err: any) {
      console.error('Failed to reject registration:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#172554]" />
            Faculty Verification Portal
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Institutional verification and approval queue for new faculty registrants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs font-bold text-[#172554] bg-[#172554]/10 border border-[#172554]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Pending Queue: {pendingRegistrations.length}
          </span>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs font-bold text-[#15803D] shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-[#15803D] hover:underline cursor-pointer text-2xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Pending Registrations List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">
          Pending Faculty Registrations
        </h2>

        {pendingRegistrations.length === 0 ? (
          <Card bodyClassName="p-8 text-center">
            <UserCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-[#1E293B]">All Registrations Verified</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              There are currently no pending faculty registration requests waiting for HOD verification.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingRegistrations.map((reg) => (
              <Card key={reg.id} bodyClassName="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-2xs font-extrabold text-[#172554] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                        {reg.id}
                      </span>
                      <span className="text-2xs font-extrabold text-[#15803D] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                        ID: {reg.facultyId}
                      </span>
                      <span className="text-2xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        PENDING VERIFICATION
                      </span>
                      <span className="text-2xs text-slate-400">Submitted: {reg.submittedAt}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#1E293B]">{reg.fullName}</h3>
                      <p className="text-xs text-[#64748B] font-medium mt-0.5">
                        {reg.designation} • {reg.department} • <span className="font-mono">{reg.email}</span>
                      </p>
                    </div>

                    {/* Skills list */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider mr-1">Skills:</span>
                      {reg.skills.map((skill) => (
                        <span key={skill} className="text-3xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <button
                      onClick={() => setSelectedReg(reg)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    <button
                      onClick={() => setRejectingReg(reg)}
                      disabled={processing}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-[#B91C1C] border border-rose-200 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleApprove(reg)}
                      disabled={processing}
                      className="px-3.5 py-2 bg-[#172554] hover:bg-[#1E3A8A] text-white font-bold text-xs rounded-lg transition-colors border border-[#172554] shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>Approve Faculty</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* VERIFICATION DETAIL DRAWER / MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#172554] text-white flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Faculty Verification Detail</h3>
                  <p className="text-2xs text-[#64748B]">Registration ID: {selectedReg.id}</p>
                </div>
              </div>
              <span className="text-2xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                PENDING VERIFICATION
              </span>
            </div>

            {/* Grid details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Faculty ID</span>
                  <span className="font-bold text-[#172554] font-mono text-sm">{selectedReg.facultyId}</span>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Submitted Date</span>
                  <span className="font-semibold text-slate-800">{selectedReg.submittedAt}</span>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <span className="font-bold text-slate-900">{selectedReg.fullName}</span>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Institutional Email</span>
                  <span className="font-semibold text-slate-800 truncate block">{selectedReg.email}</span>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Designation</span>
                  <span className="font-semibold text-slate-800">{selectedReg.designation}</span>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Department</span>
                  <span className="font-semibold text-slate-800">{selectedReg.department}</span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Declared Expertise</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedReg.skills.map((s) => (
                    <span key={s} className="text-2xs font-semibold bg-slate-100 text-[#1E293B] px-2.5 py-1 rounded border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Declared Capacity</span>
                <span className="font-medium text-slate-800">{selectedReg.availability}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setRejectingReg(selectedReg);
                  setSelectedReg(null);
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-[#B91C1C] border border-rose-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Reject Registration
              </button>
              <button
                onClick={() => handleApprove(selectedReg)}
                disabled={processing}
                className="px-4 py-2 bg-[#172554] hover:bg-[#1E3A8A] text-white font-bold text-xs rounded-lg transition-colors border border-[#172554] shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Approve Faculty</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON PROMPT MODAL */}
      {rejectingReg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#B91C1C]">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold">Reject Faculty Registration</h3>
            </div>

            <p className="text-xs text-slate-600">
              Please state the specific reason for rejecting the registration request for <strong>{rejectingReg.fullName}</strong> ({rejectingReg.facultyId}).
            </p>

            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Rejection Reason (Required)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Institutional records mismatch or unverified faculty ID."
                rows={3}
                className="w-full p-2.5 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-[#1E293B]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectingReg(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={processing || !rejectionReason.trim()}
                className="px-4 py-2 bg-[#B91C1C] hover:bg-rose-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
