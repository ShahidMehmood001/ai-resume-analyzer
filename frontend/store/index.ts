import { create } from "zustand";
import { Candidate, Job } from "@/types";

interface AppStore {
  selectedCandidates: string[];
  toggleSelectCandidate: (id: string) => void;
  clearSelection: () => void;

  activeJob: Job | null;
  setActiveJob: (job: Job | null) => void;

  viewMode: "table" | "card";
  setViewMode: (mode: "table" | "card") => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedCandidates: [],
  toggleSelectCandidate: (id) =>
    set((s) => ({
      selectedCandidates: s.selectedCandidates.includes(id)
        ? s.selectedCandidates.filter((x) => x !== id)
        : s.selectedCandidates.length < 3
          ? [...s.selectedCandidates, id]
          : s.selectedCandidates,
    })),
  clearSelection: () => set({ selectedCandidates: [] }),

  activeJob: null,
  setActiveJob: (job) => set({ activeJob: job }),

  viewMode: "table",
  setViewMode: (mode) => set({ viewMode: mode }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
