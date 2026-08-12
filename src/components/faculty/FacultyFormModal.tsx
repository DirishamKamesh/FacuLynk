import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Designation, Faculty } from '../../types/faculty';
import { getMaxHoursByDesignation } from '../../utils/workloadCalculator';

interface FacultyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (faculty: Omit<Faculty, 'id' | 'status'>) => Promise<void>;
  initialData?: Faculty;
}

export const FacultyFormModal: React.FC<FacultyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState<Designation>('Assistant Professor');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [skillsStr, setSkillsStr] = useState('');
  const [currentWorkloadHours, setCurrentWorkloadHours] = useState(12);
  const [office, setOffice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setDesignation(initialData.designation);
      setDepartment(initialData.department);
      setSkillsStr(initialData.skills.join(', '));
      setCurrentWorkloadHours(initialData.currentWorkloadHours);
      setOffice(initialData.office || '');
    } else {
      setName('');
      setEmail('');
      setDesignation('Assistant Professor');
      setDepartment('Computer Science & Engineering');
      setSkillsStr('Database Systems, Algorithms, Software Engineering');
      setCurrentWorkloadHours(12);
      setOffice('Engineering Hall 101');
    }
  }, [initialData, isOpen]);

  const maxWorkloadHours = getMaxHoursByDesignation(designation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      const skills = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onSave({
        name,
        email,
        designation,
        department,
        skills,
        maxWorkloadHours,
        currentWorkloadHours: Number(currentWorkloadHours),
        office,
        avatarUrl:
          initialData?.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });
      onClose();
    } catch (err) {
      console.error('Error saving faculty member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Faculty Record' : 'Add New Faculty Member'}
      subtitle="Register institutional faculty profile and workload parameters"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block font-semibold text-slate-800 text-xs mb-1">Full Name & Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Dr. Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-800 text-xs mb-1">Institutional Email</label>
            <input
              type="email"
              required
              placeholder="jsmith@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-800 text-xs mb-1">Academic Designation</label>
            <select
              value={designation}
              onChange={(e) => setDesignation(e.target.value as Designation)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              <option value="Professor">Professor (10 Max Hours)</option>
              <option value="Associate Professor">Associate Professor (16 Max Hours)</option>
              <option value="Assistant Professor">Assistant Professor (20 Max Hours)</option>
            </select>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
          <p className="font-semibold text-slate-800">Designation Capacity Policy:</p>
          <p className="text-slate-600">
            Selected Designation <strong>{designation}</strong> sets maximum teaching/admin limit to{' '}
            <strong className="text-slate-900">{maxWorkloadHours} hrs/wk</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-800 text-xs mb-1">Initial Workload (hrs/wk)</label>
            <input
              type="number"
              min={0}
              max={35}
              value={currentWorkloadHours}
              onChange={(e) => setCurrentWorkloadHours(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-800 text-xs mb-1">Office Location</label>
            <input
              type="text"
              placeholder="Engineering Hall 304"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-800 text-xs mb-1">Skills & Specializations (comma separated)</label>
          <input
            type="text"
            placeholder="Database Systems, Machine Learning, Systems"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="teal" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Record' : 'Create Faculty Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
