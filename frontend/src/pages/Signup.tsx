import { useState } from "react";

type SignupProps = {
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  onGoToLogin: () => void;
};

function Signup({ onSignup, onGoToLogin }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await onSignup(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#07111f] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
            <img
              src="/incomeshield-logo.svg"
              alt="IncomeShield AI logo"
              className="h-16 w-16 drop-shadow-[0_0_24px_rgba(34,211,238,0.22)]"
            />
            <div className="mt-3 text-2xl font-bold tracking-tight text-white">
              Income<span className="text-cyan-400">Shield</span>
              <span className="ml-2 text-sky-400">AI</span>
            </div>
        </div>

        <div className="w-full rounded-3xl bg-[#0f1e33]/95 p-8 shadow-sm ring-1 ring-white/10">
          <div className="mb-6">
          <div className="text-3xl font-bold text-white">Create account</div>
          <div className="mt-2 text-slate-400">Set up your IncomeShield access.</div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              placeholder="Josh"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              placeholder="josh@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              placeholder="Create password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-[#07111f] transition hover:bg-slate-200 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <button
          onClick={onGoToLogin}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-slate-200 transition hover:bg-white/10"
        >
          Back to sign in
        </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
