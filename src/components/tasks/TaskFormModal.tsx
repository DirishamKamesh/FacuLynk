import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Priority, Task, TaskType } from '../../types/task';
import { useData } from '../../context/DataContext';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => Promise<void>;
  initialData?: Task;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { faculty } = useData();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('Lecture');
  const [courseCode, setCourseCode] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(3);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [deadline, setDeadline] = useState('2026-09-15');
  const [skillsStr, setSkillsStr] = useState('');
  const [assignedFacultyId, setAssignedFacultyId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setType(initialData.type);
      setCourseCode(initialData.courseCode || '');
      setWeeklyHours(initialData.weeklyHours);
      setPriority(initialData.priority);
      setDeadline(initialData.deadline);
      setSkillsStr(initialData.requiredSkills.join(', '));
      setAssignedFacultyId(initialData.assignedFacultyId || '');
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setType('Lecture');
      setCourseCode('CS 3113-001');
      setWeeklyHours(3);
      setPriority('Medium');
      setDeadline('2026-09-15');
      setSkillsStr('Software Engineering, Programming Languages');
      setAssignedFacultyId('');
      setDescription('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    try {
      const requiredSkills = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const selectedFaculty = faculty.find((f) => f.id === assignedFacultyId);

      await onSave({
        title,
        type,
        courseCode,
        weeklyHours: Number(weeklyHours),
        priority,
        deadline,
        requiredSkills,
        status: assignedFacultyId ? 'Assigned' : 'Unassigned',
        assignedFacultyId: assignedFacultyId || undefined,
        assignedFacultyName: selectedFaculty ? selectedFaculty.name : undefined,
        semester: 'Fall 2026',
        description,
      });
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Academic Task' : 'Create New Academic Task'}
      subtitle="Define course lectures, lab sections, or departmental admin commitments"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block font-semibold text-slate-800 text-xs mb-1">Task Title / Course Name</label>
          <input
            type="text"
            required
            placeholder="e.g. CS 4013 Database Systems Lab"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-800 text-xs mb-1">Category / Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              <option value="Lecture">Lecture</option>
              <option value="Lab">Lab Supervision</option>
              <option value="Admin">Department Admin</option>
              <option value="Research">Research Supervision</option>
              <option value="Mentorship">Mentorship</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-800 text-xs mb-1">Weekly Workload (hrs/wk)</label>
            <input
              type="number"
              min={1}
              max={12}
              required
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-800 text-xs mb-1">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-800 text-xs mb-1">Course Code (Optional)</label>
            <input
              type="text"
              placeholder="e.g. CS 1313-001"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-800 text-xs mb-1">Target Completion Date</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-800 text-xs mb-1">Required Faculty Skills (comma separated)</label>
          <input
            type="text"
            placeholder="Database Systems, SQL Architecture"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-800 text-xs mb-1">Assign to Faculty Member (Optional)</label>
          <select
            value={assignedFacultyId}
            onChange={(e) => setAssignedFacultyId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          >
            <option value="">-- Unassigned (Keep in Backlog) --</option>
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.designation} - {f.currentWorkloadHours}/{f.maxWorkloadHours} hrs - {f.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-800 text-xs mb-1">Description / Syllabus Scope</label>
          <textarea
            rows={2}
            placeholder="Course syllabus description or committee duties..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="teal" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Task' : 'Create Academic Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
