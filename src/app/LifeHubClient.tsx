"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { AppShell } from "@/src/widgets/AppShell";
import { Onboarding } from "@/src/features/onboarding/Onboarding";
import { EmergencyFlow } from "@/src/features/emergency/EmergencyFlow";
import { RelapseFlow } from "@/src/features/relapse/RelapseFlow";
import { useLifeHubStore } from "@/src/store/use-lifehub-store";
import { registerServiceWorker, showDailyReminder } from "@/src/services/pwa";
import { localDateKey } from "@/src/utils/local-date";

const pages = {
  home: lazy(() => import("@/src/pages/DashboardPage")),
  today: lazy(() => import("@/src/pages/TodayPage")),
  program: lazy(() => import("@/src/pages/ProgramPage")),
  progress: lazy(() => import("@/src/pages/ProgressPage")),
  journals: lazy(() => import("@/src/pages/JournalsPage")),
  health: lazy(() => import("@/src/pages/HealthPage")),
  statistics: lazy(() => import("@/src/pages/StatisticsPage")),
  achievements: lazy(() => import("@/src/pages/AchievementsPage")),
  library: lazy(() => import("@/src/pages/LibraryPage")),
  games: lazy(() => import("@/src/pages/GamesPage")),
  help: lazy(() => import("@/src/pages/HelpPage")),
  settings: lazy(() => import("@/src/pages/SettingsPage")),
};

export type AppSection = keyof typeof pages;
const validSections = new Set(Object.keys(pages));

function sectionFromHash(): AppSection {
  const value = window.location.hash.replace(/^#\/?/, "").trim();
  return validSections.has(value) ? value as AppSection : "home";
}

export default function LifeHubClient({ initialSection = "home" }: { initialSection?: string }) {
  const hydrate = useLifeHubStore((state) => state.hydrate);
  const hydrated = useLifeHubStore((state) => state.hydrated);
  const profile = useLifeHubStore((state) => state.profile);
  const theme = useLifeHubStore((state) => state.theme);
  const reducedMotion = useLifeHubStore((state) => state.reducedMotion);
  const notifications = useLifeHubStore((state) => state.notifications);
  const activeDay = useLifeHubStore((state) => state.activeDay);
  const [section, setSection] = useState<AppSection>(() => {
    if (initialSection !== "home" && validSections.has(initialSection)) return initialSection as AppSection;
    return sectionFromHash();
  });
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [relapseOpen, setRelapseOpen] = useState(false);

  useEffect(() => { void hydrate(); void registerServiceWorker(); }, [hydrate]);
  useEffect(() => {
    if (!hydrated || !profile || !notifications) return;
    const key = `lifehub-reminder-${localDateKey()}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "shown");
    void showDailyReminder(activeDay);
  }, [activeDay, hydrated, notifications, profile]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [theme, reducedMotion]);
  useEffect(() => {
    const onHashChange = () => {
      setSection(sectionFromHash());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (next: AppSection) => {
    setSection(next);
    window.location.hash = next;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };
  const CurrentPage = useMemo(() => pages[section], [section]);

  if (!hydrated) return <div className="app-loading" role="status"><span className="loading-orbit" />Загружаем ваш путь…</div>;
  if (!profile) return <Onboarding />;

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <AppShell section={section} onNavigate={navigate} onEmergency={() => setEmergencyOpen(true)} onRelapse={() => setRelapseOpen(true)}>
        <Suspense fallback={<div className="page-skeleton"><div /><div /><div /></div>}>
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .22 }}>
              <CurrentPage onNavigate={navigate} onEmergency={() => setEmergencyOpen(true)} onRelapse={() => setRelapseOpen(true)} />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </AppShell>
      <EmergencyFlow open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
      <RelapseFlow open={relapseOpen} onClose={() => setRelapseOpen(false)} />
    </MotionConfig>
  );
}
