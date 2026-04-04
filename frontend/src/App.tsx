import { useEffect, useMemo, useState } from "react";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Alerts from "./pages/Alerts";
import Claims from "./pages/Claims";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import Policy from "./pages/Policy";
import AppShell from "./layouts/AppShell";
import { login, signup, getMe, updateProfile } from "./api/auth";
import { apiFetch } from "./api/client";
import { clearToken, getToken, setToken } from "./utils/auth";
import type { Language, Plan, WorkerProfile } from "./types";
import type { ScenarioKey } from "./services/mockData";
import { getSimpleMode, setSimpleMode } from "./utils/simpleMode";

type Page =
  | "login"
  | "signup"
  | "onboarding"
  | "dashboard"
  | "plans"
  | "alerts"
  | "claims"
  | "admin"
  | "settings"
  | "policy";

type InnerPage = "dashboard" | "plans" | "alerts" | "claims" | "admin";

function mapUserToWorker(user: {
  name: string;
  city: string;
  zone: string;
  shift: string;
  workerType: string;
  language: string;
  plan: string;
}): WorkerProfile {
  return {
    name: user.name,
    city: user.city,
    zone: user.zone,
    shift: user.shift,
    workerType: user.workerType,
    language: user.language as Language,
    plan: user.plan as Plan,
  };
}

function App() {
  const [token, setTokenState] = useState<string | null>(null);
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [page, setPage] = useState<Page>("login");
  const [scenario, setScenario] = useState<ScenarioKey>("flood");
  const [isHydrating, setIsHydrating] = useState(true);
  const [error, setError] = useState("");
  const [storedSimpleMode, setStoredSimpleMode] = useState(false);

  useEffect(() => {
    setStoredSimpleMode(getSimpleMode());

    const hydrate = async () => {
      try {
        setError("");
        const savedToken = getToken();

        if (!savedToken) {
          setPage("login");
          return;
        }

        const me = await getMe(savedToken);
        setTokenState(savedToken);
        setWorker(mapUserToWorker(me.user));
        setPage(me.user.profileCompleted ? "dashboard" : "onboarding");
      } catch (err) {
        clearToken();
        setTokenState(null);
        setWorker(null);
        setPage("login");
        console.error("Hydration failed:", err);
      } finally {
        setIsHydrating(false);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!token) return;

    const loadScenario = async () => {
      try {
        const scenarioRes = await apiFetch<{
          currentScenario?: ScenarioKey;
          scenario?: ScenarioKey;
        }>("/scenarios");

        const currentScenario =
          scenarioRes.currentScenario || scenarioRes.scenario || "flood";
        setScenario(currentScenario);
      } catch (err) {
        console.error("Scenario load failed:", err);
        setScenario("flood");
      }
    };

    loadScenario();
  }, [token]);

  const isEnglish = worker?.language === "en";
  const simpleMode = useMemo(() => {
    return isEnglish ? storedSimpleMode : false;
  }, [isEnglish, storedSimpleMode]);

  const handleSignup = async (name: string, email: string, password: string) => {
    const res = await signup({ name, email, password });
    setToken(res.token);
    setTokenState(res.token);
    setWorker(mapUserToWorker(res.user));
    setPage("onboarding");
  };

  const handleLogin = async (email: string, password: string) => {
    const res = await login({ email, password });
    setToken(res.token);
    setTokenState(res.token);
    setWorker(mapUserToWorker(res.user));
    setPage(res.user.profileCompleted ? "dashboard" : "onboarding");
  };

  const handleContinue = async (newWorker: WorkerProfile) => {
    if (!token) throw new Error("Missing auth token");

    const res = await updateProfile(token, {
      city: newWorker.city,
      zone: newWorker.zone,
      shift: newWorker.shift,
      workerType: newWorker.workerType,
      language: newWorker.language,
      plan: newWorker.plan,
    });

    const savedWorker = mapUserToWorker(res.user);
    setWorker(savedWorker);
    setPage("dashboard");

    if (savedWorker.language !== "en") {
      setStoredSimpleMode(false);
      setSimpleMode(false);
    }
  };

  const handleSaveSettings = async (updatedWorker: WorkerProfile) => {
    if (!token) throw new Error("Missing auth token");

    try {
      setError("");
      const res = await updateProfile(token, {
        city: updatedWorker.city,
        zone: updatedWorker.zone,
        shift: updatedWorker.shift,
        workerType: updatedWorker.workerType,
        language: updatedWorker.language,
        plan: updatedWorker.plan,
      });

      const savedWorker = mapUserToWorker(res.user);
      setWorker(savedWorker);

      if (savedWorker.language !== "en") {
        setStoredSimpleMode(false);
        setSimpleMode(false);
      }

      setPage("dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save profile settings.");
    }
  };

  const handleUpdatePlan = async (plan: Plan) => {
    if (!worker) return;

    try {
      setError("");
      const res = await apiFetch<{
        worker?: {
          name: string;
          city: string;
          zone: string;
          shift: string;
          workerType: string;
          language: string;
          plan: string;
        };
      }>("/worker/plan", {
        method: "PUT",
        body: JSON.stringify({ plan }),
      });

      if (res.worker) {
        setWorker(mapUserToWorker(res.worker));
      } else {
        setWorker({ ...worker, plan });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update worker plan.");
    }
  };

  const handleScenarioChange = async (nextScenario: ScenarioKey) => {
    try {
      setError("");
      const res = await apiFetch<{
        currentScenario?: ScenarioKey;
        scenario?: ScenarioKey;
      }>("/scenarios/current", {
        method: "PUT",
        body: JSON.stringify({ scenario: nextScenario }),
      });

      setScenario(res.currentScenario || res.scenario || nextScenario);
    } catch (err) {
      console.error(err);
      setError("Failed to update scenario.");
    }
  };

  const handleReset = async () => {
    clearToken();
    setTokenState(null);
    setWorker(null);
    setScenario("flood");
    setPage("login");
  };

  const handleToggleSimpleMode = () => {
    if (!isEnglish) return;
    const next = !storedSimpleMode;
    setStoredSimpleMode(next);
    setSimpleMode(next);
  };

  if (isHydrating) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07111f]">
        <div className="rounded-3xl bg-[#0f1e33] px-8 py-6 text-slate-200 shadow-sm ring-1 ring-white/10">
          Connecting...
        </div>
      </div>
    );
  }

  if (page === "login") {
    return <Login onLogin={handleLogin} onGoToSignup={() => setPage("signup")} />;
  }

  if (page === "signup") {
    return <Signup onSignup={handleSignup} onGoToLogin={() => setPage("login")} />;
  }

  if (!worker || page === "onboarding") {
    return (
      <div>
        {error ? (
          <div className="mx-auto mt-4 max-w-6xl rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
            {error}
          </div>
        ) : null}
        <Onboarding onContinue={handleContinue} />
      </div>
    );
  }

  const shellPage: InnerPage =
    page === "admin" || page === "settings" || page === "policy"
      ? "dashboard"
      : (page as InnerPage);

  return (
    <AppShell
      worker={worker}
      page={shellPage}
      onNavigate={(nextPage) => setPage(nextPage)}
      simpleMode={simpleMode}
      canUseSimpleMode={isEnglish}
      onToggleSimpleMode={handleToggleSimpleMode}
      onSignOut={handleReset}
      onOpenSettings={() => setPage("settings")}
      onOpenPolicy={() => setPage("policy")}
    >
      {error ? (
        <div className="mx-auto mb-4 max-w-6xl rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
          {error}
        </div>
      ) : null}

      {page === "dashboard" && (
        <Dashboard
          worker={worker}
          scenario={scenario}
          onScenarioChange={handleScenarioChange}
          onGoToPlans={() => setPage("plans")}
          onGoToAdmin={() => setPage("admin")}
          simpleMode={simpleMode}
        />
      )}

      {page === "plans" && (
        <Plans
          worker={worker}
          onUpdatePlan={handleUpdatePlan}
          simpleMode={simpleMode}
        />
      )}

      {page === "alerts" && (
        <Alerts
          worker={worker}
          scenario={scenario}
          onScenarioChange={handleScenarioChange}
          onGoToClaims={() => setPage("claims")}
          simpleMode={simpleMode}
        />
      )}

      {page === "claims" && (
        <Claims worker={worker} scenario={scenario} simpleMode={simpleMode} />
      )}

      {page === "policy" && <Policy worker={worker} />}

      {page === "admin" && (
        <Admin
          worker={worker}
          scenario={scenario}
          onBackToDashboard={() => setPage("dashboard")}
          simpleMode={simpleMode}
        />
      )}

      {page === "settings" && (
        <Settings
          worker={worker}
          onSave={handleSaveSettings}
          onBack={() => setPage("dashboard")}
        />
      )}
    </AppShell>
  );
}

export default App;