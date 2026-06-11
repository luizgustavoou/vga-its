import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StudentState {
  studentId: string | null;
  studentName: string | null;
  studentEmail: string | null;
  assessmentId: string | null;
  currentSessionId: string | null;
  setStudent: (id: string, name: string, email: string) => void;
  setAssessmentId: (id: string) => void;
  setCurrentSessionId: (id: string | null) => void;
  logout: () => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      studentId: null,
      studentName: null,
      studentEmail: null,
      assessmentId: null,
      currentSessionId: null,
      setStudent: (id, name, email) =>
        set({ studentId: id, studentName: name, studentEmail: email }),
      setAssessmentId: (id) => set({ assessmentId: id }),
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      logout: () =>
        set({
          studentId: null,
          studentName: null,
          studentEmail: null,
          assessmentId: null,
          currentSessionId: null,
        }),
    }),
    {
      name: 'vga-its-student',
    },
  ),
);
