import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Table } from '../../components/common/Table';
import { WorkloadProgressBar } from '../../components/common/WorkloadProgressBar';
import { FacultyFormModal } from '../../components/faculty/FacultyFormModal';
import { Faculty } from '../../types/faculty';
import { calculateWorkloadStatus } from '../../utils/workloadCalculator';
import { Plus, Edit2, Trash2, GraduationCap, Building2 } from 'lucide-react';

export const FacultyPage: React.FC = () => {
  const { faculty, addFaculty, updateFaculty, deleteFaculty } = useData();
  const [search, setSearch] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | undefined>(undefined);

  // Filtered list
  const filteredFaculty = faculty.filter((f) => {
    const computedStatus = f.status;

    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesDesignation =
      filterDesignation === 'ALL' || f.designation === filterDesignation;

    const matchesStatus = filterStatus === 'ALL' || computedStatus === filterStatus;

    return matchesSearch && matchesDesignation && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingFaculty(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fac: Faculty) => {
    setEditingFaculty(fac);
    setIsModalOpen(true);
  };

  const handleSave = async (facData: Omit<Faculty, 'id' | 'status'>) => {
    if (editingFaculty) {
      await updateFaculty(editingFaculty.id, facData);
    } else {
      await addFaculty(facData);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this faculty record?')) {
      await deleteFaculty(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Directory & Quota Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Department roster, academic designations, skill profiles, and workload capacities
          </p>
        </div>

        <Button variant="teal" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add Faculty Member
        </Button>
      </div>

      {/* Designation Capacity Rules Summary Banner */}
      <div className="p-4 bg-[#172554] text-white rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0F766E] rounded-lg text-white shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-100">Professor</p>
            <p className="text-slate-300">Max Capacity: <strong>10 Hours/Week</strong></p>
            <p className="text-2xs text-slate-400">High focus on research & leadership</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-700/80 pt-2 md:pt-0 md:pl-4">
          <div className="p-2 bg-[#1E3A8A] rounded-lg text-white shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-100">Associate Professor</p>
            <p className="text-slate-300">Max Capacity: <strong>16 Hours/Week</strong></p>
            <p className="text-2xs text-slate-400">Balanced teaching & administration</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-700/80 pt-2 md:pt-0 md:pl-4">
          <div className="p-2 bg-slate-700 rounded-lg text-white shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-100">Assistant Professor</p>
            <p className="text-slate-300">Max Capacity: <strong>20 Hours/Week</strong></p>
            <p className="text-2xs text-slate-400">Primary teaching & lab load</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card bodyClassName="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-1/2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by faculty name, email, or skill..." />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter Designation */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Designation:</span>
              <select
                value={filterDesignation}
                onChange={(e) => setFilterDesignation(e.target.value)}
                className="py-1.5 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800"
              >
                <option value="ALL">All Designations</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1.5 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800"
              >
                <option value="ALL">All Statuses</option>
                <option value="Overloaded">Overloaded</option>
                <option value="Balanced">Balanced</option>
                <option value="Underloaded">Underloaded</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Faculty Table (Desktop) & Cards (Mobile) */}
      <Card title={`Faculty Members (${filteredFaculty.length})`}>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table<Faculty>
            data={filteredFaculty}
            keyExtractor={(item) => item.id}
            columns={[
              {
                header: 'Faculty Member',
                accessor: (item) => (
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-2xs text-slate-500">{item.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Designation & Office',
                accessor: (item) => (
                  <div>
                    <p className="font-semibold text-slate-800 text-xs">{item.designation}</p>
                    <p className="text-2xs text-slate-500">{item.office || 'Main Building'}</p>
                  </div>
                ),
              },
              {
                header: 'Workload Capacity Gauge',
                className: 'w-64',
                accessor: (item) => {
                  const computedStatus = item.status;
                  return (
                    <div className="space-y-1">
                      <WorkloadProgressBar
                        currentHours={item.currentWorkloadHours}
                        maxHours={item.maxWorkloadHours}
                        status={computedStatus}
                        size="md"
                      />
                    </div>
                  );
                },
              },
              {
                header: 'Status',
                accessor: (item) => (
                  <Badge status={item.status} />
                ),
              },
              {
                header: 'Specializations & Skills',
                accessor: (item) => (
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {item.skills.slice(0, 3).map((sk) => (
                      <span
                        key={sk}
                        className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-2xs rounded border border-slate-200 font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                    {item.skills.length > 3 && (
                      <span className="text-2xs text-slate-400 font-mono">+{item.skills.length - 3}</span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Actions',
                accessor: (item) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                      title="Edit Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Mobile Stacked Cards View */}
        <div className="block md:hidden space-y-3">
          {filteredFaculty.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No institutional records found matching filters.</p>
          ) : (
            filteredFaculty.map((item) => {
              const status = item.status;
              const utilPercent = Math.round((item.currentWorkloadHours / item.maxWorkloadHours) * 100);

              return (
                <div
                  key={item.id}
                  className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-[#1E293B] text-sm leading-tight">{item.name}</h3>
                        <p className="text-xs text-[#64748B] mt-0.5">{item.designation} · {item.department}</p>
                      </div>
                    </div>
                    <Badge status={status} />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Workload Quota</span>
                      <span className="font-mono font-bold text-slate-900">
                        {item.currentWorkloadHours} / {item.maxWorkloadHours} hrs ({utilPercent}%)
                      </span>
                    </div>
                    <WorkloadProgressBar
                      currentHours={item.currentWorkloadHours}
                      maxHours={item.maxWorkloadHours}
                      status={status}
                      size="sm"
                      showSubtext={false}
                    />
                  </div>

                  {item.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.skills.map((sk) => (
                        <span key={sk} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-2xs font-medium text-slate-700 rounded-md">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <FacultyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingFaculty}
      />
    </div>
  );
};
