import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { WorkloadProgressBar } from '../../components/common/WorkloadProgressBar';
import { RebalanceRequestModal } from '../../components/faculty/RebalanceRequestModal';
import { Faculty } from '../../types/faculty';
import { calculateAvailableHours, calculateExcessHours, calculateWorkloadStatus } from '../../utils/workloadCalculator';
import { Scale, AlertTriangle, Send, CheckCircle2, Clock, XCircle, Users, ArrowUpRight } from 'lucide-react';

export const MyWorkloadPage: React.FC = () => {
  const { activeFacultyId } = useAuth();
  const { faculty, tasks, rebalanceRequests } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPeer, setTargetPeer] = useState<Faculty | undefined>(undefined);

  const myProfile = faculty.find((f) => f.id === activeFacultyId) || faculty[1];
  const myTasks = tasks.filter((t) => t.assignedFacultyId === myProfile?.id);

  const myStatus = myProfile?.status || 'Balanced';
  const isOverloaded = myStatus === 'Overloaded';

  // Requests created by current faculty member
  const mySubmittedRequests = rebalanceRequests.filter(
    (r) => r.requesterFacultyId === myProfile?.id
  );

  // Department peers (excluding current logged-in faculty)
  const peerFaculty = faculty.filter((f) => f.id !== myProfile?.id);

  // Group hours by task category
  const categoryHours = myTasks.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.weeklyHours;
    return acc;
  }, {} as Record<string, number>);

  const handleOpenModal = (peer?: Faculty) => {
    setTargetPeer(peer);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">My Workload Status & Peer Rebalancing</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Statutory capacity compliance, peer workload transparency, and direct HOD schedule rebalancing requests
          </p>
        </div>

        <Button
          variant={isOverloaded ? 'danger' : 'teal'}
          onClick={() => handleOpenModal()}
          icon={<Scale className="w-4 h-4" />}
        >
          {isOverloaded ? 'Request Schedule Relief (Overloaded)' : 'Submit Rebalance Request to HOD'}
        </Button>
      </div>

      {/* Overload Notice Banner if overloaded */}
      {isOverloaded && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                Overload Threshold Exceeded (+{calculateExcessHours(myProfile.currentWorkloadHours, myProfile.maxWorkloadHours)} hrs over limit)
              </h3>
              <p className="text-xs text-rose-700 mt-0.5 font-medium">
                Your assigned workload is {myProfile.currentWorkloadHours} hours (Designation Quota Limit: {myProfile.maxWorkloadHours} hours).
                Submit a schedule rebalancing request to the Head of Department to shift a section or course to available peers.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleOpenModal()}
            className="shrink-0"
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Request Relief Now
          </Button>
        </div>
      )}

      {/* Personal Capacity Overview */}
      <Card title="Personal Capacity Gauge" subtitle={`Designation: ${myProfile?.designation}`}>
        <div className="space-y-6">
          <WorkloadProgressBar
            currentHours={myProfile?.currentWorkloadHours || 0}
            maxHours={myProfile?.maxWorkloadHours || 16}
            status={myStatus}
            size="lg"
          />

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Total Workload</span>
              <strong className="text-base text-slate-900">{myProfile?.currentWorkloadHours} hrs/wk</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Designation Limit ({myProfile?.designation})</span>
              <strong className="text-base text-slate-900">{myProfile?.maxWorkloadHours} hrs/wk</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Status Compliance</span>
              <Badge status={myStatus} />
            </div>
          </div>
        </div>
      </Card>

      {/* Department Workload & Peer Status Matrix */}
      <Card
        title="Department Peer Workload & Rebalance Matrix"
        subtitle="View faculty workload status and submit schedule balancing requests or offer capacity"
      >
        <div className="space-y-3">
          {peerFaculty.map((peer) => {
            const peerStatus = peer.status;
            const isPeerOverloaded = peerStatus === 'Overloaded';
            const excess = calculateExcessHours(peer.currentWorkloadHours, peer.maxWorkloadHours);
            const available = calculateAvailableHours(peer.currentWorkloadHours, peer.maxWorkloadHours);

            return (
              <div
                key={peer.id}
                className={`p-3.5 rounded-xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isPeerOverloaded
                    ? 'border-rose-200 bg-rose-50/30'
                    : peerStatus === 'Balanced'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                    {peer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-xs">{peer.name}</p>
                      <Badge status={peerStatus} />
                    </div>
                    <p className="text-3xs text-slate-500 font-medium mt-0.5">
                      {peer.designation} • {peer.department}
                    </p>
                    <p className="text-2xs font-mono font-semibold text-slate-700 mt-0.5">
                      {peer.currentWorkloadHours} / {peer.maxWorkloadHours} hrs
                      {isPeerOverloaded ? (
                        <span className="text-rose-700 font-bold ml-1.5">(+{excess}h Overloaded)</span>
                      ) : (
                        <span className="text-emerald-700 font-bold ml-1.5">({available}h Headroom Available)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  {isPeerOverloaded ? (
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => handleOpenModal(peer)}
                      icon={<Scale className="w-3.5 h-3.5" />}
                    >
                      Offer Capacity / Request Shift
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(peer)}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      Request Rebalance
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* My Submitted Rebalance Requests */}
      <Card
        title="My Submitted Schedule Rebalance Requests"
        subtitle="Track request status submitted to Head of Department"
      >
        {mySubmittedRequests.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            No schedule rebalancing requests submitted yet. Click "Submit Rebalance Request to HOD" to request relief or offer capacity.
          </div>
        ) : (
          <div className="space-y-3">
            {mySubmittedRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-3xs font-extrabold uppercase px-2 py-0.5 rounded border ${
                        req.requestType === 'OVERLOAD_RELIEF'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-teal-100 text-teal-800 border-teal-200'
                      }`}
                    >
                      {req.requestType === 'OVERLOAD_RELIEF' ? 'Overload Relief' : 'Capacity Offer'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{req.taskTitle || 'Schedule Adjustment'}</span>
                  </div>

                  <span
                    className={`text-2xs font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : req.status === 'DECLINED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {req.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                    {req.status === 'DECLINED' && <XCircle className="w-3 h-3 text-rose-700" />}
                    {req.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-700" />}
                    {req.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium">{req.reason}</p>

                <div className="flex items-center justify-between text-3xs font-mono text-slate-500 pt-2 border-t border-slate-200">
                  <span>
                    Overloaded Peer: <strong>{req.targetOverloadedFacultyName}</strong>
                    {req.suggestedAssigneeFacultyName && (
                      <> → Target: <strong>{req.suggestedAssigneeFacultyName}</strong></>
                    )}
                  </span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>

                {req.hodNote && (
                  <div className="p-2 bg-slate-100 rounded text-3xs text-slate-700 border border-slate-200">
                    <strong>HOD Note:</strong> {req.hodNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Category Breakdown */}
      <Card title="Workload Category Breakdown" subtitle="Distribution across course types">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Lecture', 'Lab', 'Admin', 'Research', 'Mentorship'].map((cat) => {
            const hrs = categoryHours[cat] || 0;
            return (
              <div key={cat} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">{cat}</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block font-mono">{hrs} hrs/wk</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Modal */}
      <RebalanceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedPeer={targetPeer}
      />
    </div>
  );
};

