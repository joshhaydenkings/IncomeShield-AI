import { useEffect, useMemo, useState } from "react";
import { getPlans } from "../services/api";
import {
  languageOptions,
  shiftOptions,
  workerTypeOptions,
} from "../services/mockData";
import type { WorkerProfile, Plan } from "../types";

type OnboardingProps = {
  onContinue: (worker: WorkerProfile) => void;
};

function Onboarding({ onContinue }: OnboardingProps) {
  const [form, setForm] = useState<WorkerProfile>({
    name: "",
    city: "",
    zone: "",
    shift: "6 PM - 11 PM",
    workerType: "Food Delivery",
    language: "en",
    plan: "Core",
  });

  const [plans, setPlans] = useState<
    {
      name: Plan;
      premium: number;
      protection: number;
      badge: string;
    }[]
  >([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        const res = await getPlans();
        setPlans(res.plans);
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, []);

  const premiumPreview = useMemo(() => {
    const selectedPlan = plans.find((plan) => plan.name === form.plan);
    if (!selectedPlan) return 0;

    const normalizedCity = form.city.trim().toLowerCase();

    const cityRisk =
      normalizedCity === "mumbai"
        ? 10
        : normalizedCity === "chennai"
          ? 8
          : normalizedCity === "bengaluru"
            ? 6
            : 5;

    const workerRisk =
      form.workerType === "Grocery / Quick Commerce"
        ? 6
        : form.workerType === "Food Delivery"
          ? 4
          : 3;

    return selectedPlan.premium + cityRisk + workerRisk;
  }, [form, plans]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(form);
  };

  if (loadingPlans) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07111f]">
        <div className="rounded-3xl bg-[#0f1e33] px-8 py-6 text-slate-200 shadow-sm ring-1 ring-white/10">
          Loading onboarding...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300">
            IncomeShield AI
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
            Set up your protection
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-400">
            Add your work details, choose a plan, and continue.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8"
          >
            <h2 className="text-2xl font-semibold text-white">Profile</h2>
            <p className="mt-2 text-slate-400">
              Enter the details used for your work setup.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ravi Kumar"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-white/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Enter your city"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-white/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Zone
                </label>
                <input
                  type="text"
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  placeholder="North Chennai"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-white/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Shift
                </label>
                <select
                  value={form.shift}
                  onChange={(e) => setForm({ ...form, shift: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/20"
                >
                  {shiftOptions.map((shift) => (
                    <option key={shift} value={shift} className="bg-[#0f1e33] text-white">
                      {shift}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Work type
                </label>
                <select
                  value={form.workerType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      workerType: e.target.value as WorkerProfile["workerType"],
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/20"
                >
                  {workerTypeOptions.map((type) => (
                    <option key={type} value={type} className="bg-[#0f1e33] text-white">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Language
                </label>
                <select
                  value={form.language}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      language: e.target.value as WorkerProfile["language"],
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/20"
                >
                  {languageOptions.map((lang) => (
                    <option
                      key={lang.value}
                      value={lang.value}
                      className="bg-[#0f1e33] text-white"
                    >
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hidden">
              <div className="hidden mt-4 grid gap-4 md:grid-cols-3">
                {plans.map((plan) => (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => setForm({ ...form, plan: plan.name as Plan })}
                    className={`rounded-3xl border p-5 text-left transition ${
                      form.plan === plan.name
                        ? "border-white/20 bg-white text-[#07111f]"
                        : "border-white/10 bg-white/5 text-white hover:border-white/20"
                    }`}
                  >
                    <div className="text-xl font-semibold">{plan.name}</div>
                    <div
                      className={`mt-1 text-sm ${
                        form.plan === plan.name ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {plan.badge}
                    </div>
                    <div className="mt-5 text-3xl font-bold">₹{plan.premium}</div>
                    <div
                      className={`text-sm ${
                        form.plan === plan.name ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      per week
                    </div>
                    <div
                      className={`mt-4 rounded-2xl p-3 ${
                        form.plan === plan.name ? "bg-slate-200/70" : "bg-white/5 ring-1 ring-white/10"
                      }`}
                    >
                      <div
                        className={`text-sm ${
                          form.plan === plan.name ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        Coverage
                      </div>
                      <div className="mt-1 text-xl font-semibold">₹{plan.protection}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden">
              <div className="text-sm font-medium text-slate-300">Estimated weekly premium</div>
              <div className="mt-2 text-4xl font-bold text-white">
                ₹{premiumPreview}/week
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Based on city, work type, and plan.
              </p>
            </div>

            <button
              type="submit"
              className="mt-8 w-full rounded-2xl bg-white px-5 py-4 text-lg font-semibold text-[#07111f] transition hover:bg-slate-200"
            >
              Continue
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10">
              <h3 className="text-xl font-semibold text-white">
                What you get
              </h3>
              <div className="mt-4 space-y-3 text-slate-400">
                <p>• Live work condition updates</p>
                <p>• Plan-based protection</p>
                <p>• Clear payout status</p>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#10213a] to-[#0b1730] p-6 text-white shadow-sm ring-1 ring-white/10">
              <div className="text-sm uppercase tracking-wide text-slate-400">
                Coverage
              </div>
              <h3 className="mt-3 text-2xl font-semibold">Protection that stays active</h3>
              <p className="mt-3 text-slate-300">
                Your plan stays connected to live work conditions and payout status.
              </p>
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10">
              <h3 className="text-xl font-semibold text-white">Before you continue</h3>
              <div className="mt-4 space-y-3 text-slate-400">
                <p>• Use the city and zone you usually work in</p>
                <p>• Choose the language you want in the app</p>
                <p>• Pick the plan that fits your work pattern</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
