import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { calculateWorkloadStatus } from '../../utils/workloadCalculator';
import { ArrowRight, CheckCircle2, XCircle, Check, GitPullRequest, Scale } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const {
    recommendations,
    applyRecommendation,
    rejectRecommendation,
    rebalanceRequests,
    approveRebalanceRequest,
    declineRebalanceRequest,
  } = useData();

  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'FACULTY'>('FACULTY');

  const pendingRecs = recommendations.filter((r) => r.status === 'Pending');
  const historyRecs = recommendations.filter((r) => r.status !== 'Pending');

  const pendingFacultyRequests = rebalanceRequests.filter((r) => r.status === 'PENDING');
  const historyFacultyRequests = rebalanceRequests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Schedule Rebalancing & Optimization Proposals</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Review faculty-initiated schedule adjustment requests and AI system workload optimization proposals
          </p>
        </div>
      </div>

      {/* Tabs for System AI Proposals vs Faculty Requests */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('FACULTY')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'FACULTY'
              ? 'bg-[#172554] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Faculty Rebalance Requests</span>
          {pendingFacultyRequests.length > 0 && (
            <span className="px-2 py-0.5 bg-rose-500 text-white text-3xs font-extrabold rounded-full">
              {pendingFacultyRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'SYSTEM'
              ? 'bg-[#172554] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>AI System Proposals</span>
          {pendingRecs.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-500 text-white text-3xs font-extrabold rounded-full">
              {pendingRecs.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: FACULTY REBALANCE REQUESTS */}
      {activeTab === 'FACULTY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
              <Scale className="w-4 h-4 text-[#0F766E]" />
              <span>Faculty Schedule Rebalancing Channel ({pendingFacultyRequests.length} Pending)</span>
            </div>
          </div>

          {pendingFacultyRequests.length === 0 ? (
            <Card bodyClassName="p-8 text-center text-[#64748B] text-sm">
              <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto mb-2" />
              <p className="font-semibold text-[#1E293B]">No Pending Faculty Requests</p>
              <p className="text-xs text-[#64748B] mt-1">
                All schedule rebalancing requests submitted by faculty members have been addressed.
              </p>
            </Card>
          ) : (
            pendingFacultyRequests.map((req) => (
              <Card key={req.id} bodyClassName="p-5">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                    <div>
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
                        <span className="text-2xs font-mono text-slate-500">Request ID #{req.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#1E293B] mt-1">
                        Request by {req.requesterFacultyName} ({req.requesterDesignation})
                      </h3>
                    </div>
                    <Badge variant="amber">Pending HOD Review</Badge>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-2xs font-bold text-slate-400 uppercase block">Overloaded Faculty</span>
                        <strong className="text-slate-900 font-semibold">{req.targetOverloadedFacultyName}</strong>
                      </div>
                      <div>
                        <span className="text-2xs font-bold text-slate-400 uppercase block">Target Recipient</span>
                        <strong className="text-teal-800 font-semibold">
                          {req.suggestedAssigneeFacultyName || 'HOD / System Selection'}
                        </strong>
                      </div>
                    </div>

                    {req.taskTitle && (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-mono">
                        <span className="text-slate-600">Task/Course to Shift: <strong>{req.taskTitle}</strong></span>
                        <span className="text-slate-900 font-bold">{req.taskHours} hrs/wk</span>
                      </div>
                    )}

                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 mt-2">
                      <strong className="text-slate-900 block text-2xs uppercase mb-0.5">Faculty Rationale:</strong>
                      "{req.reason}"
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => declineRebalanceRequest(req.id, 'Declined due to schedule constraints.')}
                      icon={<XCircle className="w-4 h-4 text-slate-400" />}
                      className="w-full sm:w-auto justify-center"
                    >
                      Decline Request
                    </Button>
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => approveRebalanceRequest(req.id, 'Approved and executed schedule rebalance.')}
                      icon={<Check className="w-4 h-4" />}
                      className="w-full sm:w-auto justify-center"
                    >
                      Approve & Reassign Section
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}

          {/* History of Faculty Requests */}
          {historyFacultyRequests.length > 0 && (
            <Card title="Faculty Request History">
              <div className="space-y-3">
                {historyFacultyRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {req.requesterFacultyName} • {req.taskTitle || 'Schedule Rebalance'}
                      </p>
                      <p className="text-2xs text-slate-500">{req.reason}</p>
                    </div>
                    <Badge variant={req.status === 'APPROVED' ? 'emerald' : 'slate'}>
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: SYSTEM AI PROPOSALS */}
      {activeTab === 'SYSTEM' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
            <GitPullRequest className="w-4 h-4 text-[#172554]" />
            <span>Active Optimization Proposals ({pendingRecs.length})</span>
          </div>

          {pendingRecs.length === 0 ? (
            <Card bodyClassName="p-8 text-center text-[#64748B] text-sm">
              <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto mb-2" />
              <p className="font-semibold text-[#1E293B]">No Pending Rebalancing Required</p>
              <p className="text-xs text-[#64748B] mt-1">All active faculty workloads are balanced within statutory designation limits.</p>
            </Card>
          ) : (
            pendingRecs.map((rec) => (
              <Card key={rec.id} bodyClassName="p-5">
                <div className="space-y-4">
                  {/* Proposal Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                    <div>
                      <span className="text-2xs font-bold text-[#172554] uppercase tracking-wider">
                        Optimization proposal #{rec.id}
                      </span>
                      <h3 className="text-base font-bold text-[#1E293B] mt-0.5">
                        Reassign "{rec.taskTitle}" ({rec.taskHours} hrs)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-100 text-[#172554] border border-slate-200 rounded-lg text-xs font-bold">
                        {rec.matchScore}% Qualification Match
                      </span>
                      <Badge variant="amber">Pending Approval</Badge>
                    </div>
                  </div>

                  {/* Before vs After Metric Box */}
                  {(() => {
                    const sourceCurrentStatus = calculateWorkloadStatus(rec.currentOverloadedHours, rec.overloadedMaxLimit);
                    const sourceAfterStatus = calculateWorkloadStatus(rec.projectedOverloadedHours, rec.overloadedMaxLimit);
                    const targetCurrentStatus = calculateWorkloadStatus(rec.currentTargetHours, rec.targetMaxLimit);
                    const targetAfterStatus = calculateWorkloadStatus(rec.projectedTargetHours, rec.targetMaxLimit);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Source Faculty (Overloaded) */}
                        <div className="p-4 bg-red-50/70 border border-red-200 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#B91C1C]">Current Overloaded Faculty</span>
                            <Badge status={sourceCurrentStatus} />
                          </div>
                          <p className="text-sm font-bold text-[#1E293B]">{rec.overloadedFacultyName}</p>
                          <div className="flex items-center justify-between text-xs font-mono pt-1">
                            <span className="text-slate-500">Before: <strong className="text-[#B91C1C]">{rec.currentOverloadedHours}/{rec.overloadedMaxLimit} hrs</strong></span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-800">
                              After: <strong className={sourceAfterStatus === 'Overloaded' ? 'text-[#B91C1C]' : 'text-[#15803D]'}>
                                {rec.projectedOverloadedHours}/{rec.overloadedMaxLimit} hrs ({sourceAfterStatus})
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Target Faculty (Substitute) */}
                        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#15803D]">Target Available Faculty</span>
                            <Badge status={targetCurrentStatus} />
                          </div>
                          <p className="text-sm font-bold text-[#1E293B]">{rec.targetFacultyName}</p>
                          <div className="flex items-center justify-between text-xs font-mono pt-1">
                            <span className="text-slate-500">Before: <strong className="text-slate-700">{rec.currentTargetHours}/{rec.targetMaxLimit} hrs</strong></span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-800">
                              After: <strong className={targetAfterStatus === 'Overloaded' ? 'text-[#B91C1C]' : 'text-[#15803D]'}>
                                {rec.projectedTargetHours}/{rec.targetMaxLimit} hrs ({targetAfterStatus})
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Rationale Explanation */}
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B]">
                    <strong className="text-[#172554] block mb-0.5">Analytical Rationale:</strong>
                    {rec.reason}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectRecommendation(rec.id)}
                      icon={<XCircle className="w-4 h-4 text-slate-400" />}
                      className="w-full sm:w-auto justify-center"
                    >
                      Reject Proposal
                    </Button>
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => applyRecommendation(rec.id)}
                      icon={<Check className="w-4 h-4" />}
                      className="w-full sm:w-auto justify-center"
                    >
                      Approve & Reassign Workload
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}

          {/* Applied / History Section */}
          {historyRecs.length > 0 && (
            <Card title="Optimization History & Decision Log">
              <div className="space-y-3">
                {historyRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#1E293B]">
                        Shifted "{rec.taskTitle}" from {rec.overloadedFacultyName} to {rec.targetFacultyName}
                      </p>
                      <p className="text-2xs text-[#64748B]">{rec.reason}</p>
                    </div>
                    <Badge variant={rec.status === 'Applied' ? 'emerald' : 'slate'}>
                      {rec.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
