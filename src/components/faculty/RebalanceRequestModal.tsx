import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Faculty } from '../../types/faculty';
import { Task } from '../../types/task';
import { RebalanceRequestType } from '../../types/rebalanceRequest';
import { calculateAvailableHours, calculateExcessHours, calculateWorkloadStatus } from '../../utils/workloadCalculator';
import { Send, Scale, AlertTriangle, Sparkles, CheckCircle, UserCheck } from 'lucide-react';

interface RebalanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPeer?: Faculty;
}

export const RebalanceRequestModal: React.FC<RebalanceRequestModalProps> = ({
  isOpen,
  onClose,
  preselectedPeer,
}) => {
  const { activeFacultyId } = useAuth();
  const { faculty, tasks, createRebalanceRequest } = useData();

  const currentFaculty = faculty.find((f) => f.id === activeFacultyId) || faculty[1]; // fallback

  const isCurrentFacultyOverloaded =
    currentFaculty &&
    calculateWorkloadStatus(currentFaculty.currentWorkloadHours, currentFaculty.maxWorkloadHours) ===
      'Overloaded';

  const overloadedFaculties = faculty.filter(
    (f) => calculateWorkloadStatus(f.currentWorkloadHours, f.maxWorkloadHours) === 'Overloaded'
  );

  const [requestType, setRequestType] = useState<RebalanceRequestType>('OVERLOAD_RELIEF');
  const [targetOverloadedId, setTargetOverloadedId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  // Sync modal state when modal opens or preselectedPeer changes
  useEffect(() => {
    if (!isOpen || !currentFaculty) return;

    const isPeerOverloaded =
      preselectedPeer &&
      calculateWorkloadStatus(preselectedPeer.currentWorkloadHours, preselectedPeer.maxWorkloadHours) ===
        'Overloaded';

    if (preselectedPeer) {
      if (isPeerOverloaded) {
        // User clicked an overloaded peer -> offer to assist them
        setRequestType('PEER_REBALANCE_OFFER');
        setTargetOverloadedId(preselectedPeer.id);
        setSelectedAssigneeId(currentFaculty.id);
      } else {
        // User clicked an underloaded peer -> request to shift a course to this underloaded colleague
        setRequestType('OVERLOAD_RELIEF');
        const sourceId = isCurrentFacultyOverloaded
          ? currentFaculty.id
          : overloadedFaculties[0]?.id || currentFaculty.id;
        setTargetOverloadedId(sourceId);
        setSelectedAssigneeId(preselectedPeer.id);
      }
    } else {
      // Generic button clicked
      if (isCurrentFacultyOverloaded) {
        setRequestType('OVERLOAD_RELIEF');
        setTargetOverloadedId(currentFaculty.id);
        const firstUnderloaded = faculty.find(
          (f) =>
            f.id !== currentFaculty.id &&
            calculateWorkloadStatus(f.currentWorkloadHours, f.maxWorkloadHours) !== 'Overloaded'
        );
        setSelectedAssigneeId(firstUnderloaded?.id || '');
      } else {
        setRequestType('PEER_REBALANCE_OFFER');
        setTargetOverloadedId(overloadedFaculties[0]?.id || currentFaculty.id);
        setSelectedAssigneeId(currentFaculty.id);
      }
    }
  }, [isOpen, preselectedPeer?.id, currentFaculty?.id]);

  const selectedOverloadedFaculty = faculty.find((f) => f.id === targetOverloadedId) || currentFaculty;

  // Sync available tasks when targetOverloadedId changes
  useEffect(() => {
    if (!isOpen) return;
    const facTasks = tasks.filter((t) => t.assignedFacultyId === selectedOverloadedFaculty?.id);
    if (facTasks.length > 0) {
      setSelectedTaskId(facTasks[0].id);
    } else {
      setSelectedTaskId('');
    }
  }, [isOpen, targetOverloadedId, tasks]);

  const availableTasks = tasks.filter((t) => t.assignedFacultyId === selectedOverloadedFaculty?.id);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const selectedAssignee = faculty.find((f) => f.id === selectedAssigneeId);

  // Available faculty list for reassignments (excluding the source overloaded faculty)
  const potentialAssignees = faculty.filter((f) => f.id !== selectedOverloadedFaculty?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFaculty) return;

    setSubmitting(true);
    try {
      await createRebalanceRequest({
        requestType,
        requesterFacultyId: currentFaculty.id,
        requesterFacultyName: currentFaculty.name,
        requesterDesignation: currentFaculty.designation,
        targetOverloadedFacultyId: selectedOverloadedFaculty.id,
        targetOverloadedFacultyName: selectedOverloadedFaculty.name,
        suggestedAssigneeFacultyId: selectedAssigneeId || undefined,
        suggestedAssigneeFacultyName: selectedAssignee ? selectedAssignee.name : undefined,
        taskId: selectedTask?.id,
        taskTitle: selectedTask?.title,
        taskHours: selectedTask?.weeklyHours,
        reason:
          reason.trim() ||
          (requestType === 'OVERLOAD_RELIEF'
            ? `Schedule rebalance request for ${selectedTask?.title || 'workload'} to ${
                selectedAssignee ? selectedAssignee.name : 'an available colleague'
              }.`
            : `Voluntary capacity offer to relieve ${selectedOverloadedFaculty.name}'s workload.`),
      });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !currentFaculty) return null;

  const isClickedPeerUnderloaded =
    preselectedPeer &&
    calculateWorkloadStatus(preselectedPeer.currentWorkloadHours, preselectedPeer.maxWorkloadHours) !==
      'Overloaded';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Schedule Rebalancing Request to HOD"
      subtitle="Direct institutional channel to request workload adjustments or offer available capacity"
      maxWidth="lg"
    >
      {successMsg ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#1E293B]">Request Submitted to HOD</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Your schedule rebalancing request has been sent to the Head of Department. You will receive notification once reviewed.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Request Mode Selection */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setRequestType('OVERLOAD_RELIEF');
                setTargetOverloadedId(
                  isCurrentFacultyOverloaded
                    ? currentFaculty.id
                    : overloadedFaculties[0]?.id || currentFaculty.id
                );
                if (isClickedPeerUnderloaded && preselectedPeer) {
                  setSelectedAssigneeId(preselectedPeer.id);
                } else {
                  setSelectedAssigneeId('');
                }
              }}
              className={`p-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                requestType === 'OVERLOAD_RELIEF'
                  ? 'bg-white text-[#1E293B] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Shift Course Section / Request Relief</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRequestType('PEER_REBALANCE_OFFER');
                setTargetOverloadedId(
                  preselectedPeer &&
                    calculateWorkloadStatus(preselectedPeer.currentWorkloadHours, preselectedPeer.maxWorkloadHours) ===
                      'Overloaded'
                    ? preselectedPeer.id
                    : overloadedFaculties[0]?.id || currentFaculty.id
                );
                setSelectedAssigneeId(currentFaculty.id);
              }}
              className={`p-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                requestType === 'PEER_REBALANCE_OFFER'
                  ? 'bg-white text-[#1E293B] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Offer Capacity / Assist Peer</span>
            </button>
          </div>

          {/* Dynamic Context Banner */}
          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1E293B]">
                {requestType === 'OVERLOAD_RELIEF'
                  ? selectedAssignee
                    ? `Reassigning section from ${selectedOverloadedFaculty.name} → ${selectedAssignee.name} (${calculateAvailableHours(selectedAssignee.currentWorkloadHours, selectedAssignee.maxWorkloadHours)}h free)`
                    : `Requesting Relief for ${selectedOverloadedFaculty.name} (${selectedOverloadedFaculty.currentWorkloadHours}/${selectedOverloadedFaculty.maxWorkloadHours} hrs)`
                  : `Volunteering to relieve overloaded peer: ${selectedOverloadedFaculty.name}`}
              </p>
              <p className="text-3xs text-[#64748B] mt-0.5">
                {requestType === 'OVERLOAD_RELIEF'
                  ? 'Select the course/task to shift and the available colleague to receive the load.'
                  : `Offer your available capacity (${calculateAvailableHours(
                      currentFaculty.currentWorkloadHours,
                      currentFaculty.maxWorkloadHours
                    )} hrs free) to take over a section from ${selectedOverloadedFaculty.name}.`}
              </p>
            </div>
          </div>

          {/* Overloaded / Source Faculty Selection */}
          <div>
            <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
              {requestType === 'OVERLOAD_RELIEF'
                ? 'Source Faculty Member (Current Task Holder)'
                : 'Select Overloaded Colleague to Assist'}
            </label>
            <select
              value={targetOverloadedId}
              onChange={(e) => setTargetOverloadedId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg font-medium text-[#1E293B] focus:ring-2 focus:ring-[#0F766E]"
            >
              {faculty.map((f) => {
                const st = calculateWorkloadStatus(f.currentWorkloadHours, f.maxWorkloadHours);
                const excess = calculateExcessHours(f.currentWorkloadHours, f.maxWorkloadHours);
                return (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.designation}) — {f.currentWorkloadHours}/{f.maxWorkloadHours} hrs
                    {st === 'Overloaded' ? ` (Overloaded +${excess}h)` : ` [${st}]`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Task / Course Selection */}
          <div>
            <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
              Task / Course Section to Reassign
            </label>
            {availableTasks.length === 0 ? (
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-2xs">
                No active tasks found assigned to {selectedOverloadedFaculty.name}.
              </p>
            ) : (
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg font-medium text-[#1E293B] focus:ring-2 focus:ring-[#0F766E]"
              >
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.type}) — {t.weeklyHours} hrs/wk
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Target Recipient Selection */}
          <div>
            <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
              Target Recipient (Colleague Taking over Section)
            </label>
            <select
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg font-medium text-[#1E293B] focus:ring-2 focus:ring-[#0F766E]"
            >
              <option value="">-- Allow HOD / Optimization Engine to Pick --</option>
              {potentialAssignees.map((f) => {
                const avail = calculateAvailableHours(f.currentWorkloadHours, f.maxWorkloadHours);
                const st = calculateWorkloadStatus(f.currentWorkloadHours, f.maxWorkloadHours);
                return (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.designation}) — {f.currentWorkloadHours}/{f.maxWorkloadHours} hrs [{st} • {avail}h
                    free]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Impact Rationale Input */}
          <div>
            <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
              Rationale / Request Notes for HOD
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this schedule rebalance is requested (e.g., skill alignment, committee overlaps, research commitments)..."
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg font-medium text-[#1E293B] focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>

          {/* Submit Action Controls */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="teal"
              disabled={submitting || availableTasks.length === 0}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              {submitting ? 'Submitting...' : 'Send Request to HOD'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

