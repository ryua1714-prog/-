"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Application, ApplicationStatus, SeekerProfile, SponsorProject } from "@/types";
import { CURRENT_SEEKER_ID, mockApplications, mockProjects, mockSeekers } from "@/lib/mock-data";
import { newId } from "@/lib/utils";

const STORAGE_KEY = "sponsor-match:v1";

interface StoreData {
  projects: SponsorProject[];
  seekers: SeekerProfile[];
  applications: Application[];
}

interface StoreValue extends StoreData {
  hydrated: boolean;
  currentSeeker: SeekerProfile;
  getProject: (id: string) => SponsorProject | undefined;
  upsertProject: (project: SponsorProject) => void;
  deleteProject: (id: string) => void;
  toggleProjectStatus: (id: string) => void;
  addApplication: (input: Omit<Application, "id" | "status" | "createdAt">) => Application;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  updateSeeker: (profile: SeekerProfile) => void;
  resetAll: () => void;
}

const initialData = (): StoreData => ({
  projects: structuredClone(mockProjects),
  seekers: structuredClone(mockSeekers),
  applications: structuredClone(mockApplications),
});

const StoreContext = createContext<StoreValue | null>(null);

function readStorage(): StoreData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoreData;
    if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.seekers) || !Array.isArray(parsed.applications)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(data: StoreData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // プライベートモード等で保存できない場合はメモリ上のみで動作
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(initialData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStorage();
    if (stored) setData(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(data);
  }, [data, hydrated]);

  const getProject = useCallback((id: string) => data.projects.find((p) => p.id === id), [data.projects]);

  const upsertProject = useCallback((project: SponsorProject) => {
    setData((d) => {
      const exists = d.projects.some((p) => p.id === project.id);
      return {
        ...d,
        projects: exists ? d.projects.map((p) => (p.id === project.id ? project : p)) : [project, ...d.projects],
      };
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
  }, []);

  const toggleProjectStatus = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === id ? { ...p, status: p.status === "open" ? "closed" : "open" } : p,
      ),
    }));
  }, []);

  const addApplication = useCallback((input: Omit<Application, "id" | "status" | "createdAt">) => {
    const app: Application = {
      ...input,
      id: newId("a"),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setData((d) => ({ ...d, applications: [app, ...d.applications] }));
    return app;
  }, []);

  const updateApplicationStatus = useCallback((id: string, status: ApplicationStatus) => {
    setData((d) => ({
      ...d,
      applications: d.applications.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
  }, []);

  const updateSeeker = useCallback((profile: SeekerProfile) => {
    setData((d) => ({ ...d, seekers: d.seekers.map((s) => (s.id === profile.id ? profile : s)) }));
  }, []);

  const resetAll = useCallback(() => {
    setData(initialData());
  }, []);

  const currentSeeker = useMemo(
    () => data.seekers.find((s) => s.id === CURRENT_SEEKER_ID) ?? data.seekers[0],
    [data.seekers],
  );

  const value: StoreValue = {
    ...data,
    hydrated,
    currentSeeker,
    getProject,
    upsertProject,
    deleteProject,
    toggleProjectStatus,
    addApplication,
    updateApplicationStatus,
    updateSeeker,
    resetAll,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
