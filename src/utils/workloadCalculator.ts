import { Designation, WorkloadStatus } from '../types/faculty';

export const DESIGNATION_MAX_HOURS: Record<Designation, number> = {
  'Professor': 10,
  'Associate Professor': 16,
  'Assistant Professor': 20,
};

export function getMaxHoursByDesignation(designation: Designation): number {
  return DESIGNATION_MAX_HOURS[designation] || 16;
}

export function calculateUtilization(currentHours: number, maxHours: number): number {
  if (maxHours <= 0) return 0;
  return Math.round((currentHours / maxHours) * 100);
}

export function calculateWorkloadStatus(currentHours: number, maxHours: number): WorkloadStatus {
  if (currentHours > maxHours) {
    return 'Overloaded';
  }
  if (currentHours >= 0.8 * maxHours) {
    return 'Balanced';
  }
  return 'Underloaded';
}

export function calculateAvailableHours(currentHours: number, maxHours: number): number {
  return Math.max(0, maxHours - currentHours);
}

export function calculateExcessHours(currentHours: number, maxHours: number): number {
  return Math.max(0, currentHours - maxHours);
}

export function calculateSuitabilityScore(
  facultySkills: string[],
  taskSkills: string[],
  currentHours: number,
  maxHours: number
): number {
  if (currentHours >= maxHours) return 0; // Overloaded, low preference

  // Skill match ratio (0 - 60 points)
  let skillMatchCount = 0;
  taskSkills.forEach((skill) => {
    if (facultySkills.some((fs) => fs.toLowerCase() === skill.toLowerCase())) {
      skillMatchCount++;
    }
  });
  const skillScore = taskSkills.length > 0 ? (skillMatchCount / taskSkills.length) * 60 : 60;

  // Capacity headroom (0 - 40 points)
  const remainingHours = maxHours - currentHours;
  const capacityRatio = Math.min(1, remainingHours / maxHours);
  const capacityScore = capacityRatio * 40;

  return Math.round(skillScore + capacityScore);
}

