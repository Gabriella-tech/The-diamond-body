import { useState } from "react";
import { Container, Button } from "../components/UI";
import { useApp, dashboardPath } from "../store/store";
import { Link, useRouter } from "../router";
import { IconDiamond, IconEye, IconEyeOff } from "../components/Icons";
import { findNationByEmail, SHARED_NATION_PASSWORD } from "../data/nations";

// Reserved internal accounts
const ADMIN_EMAIL = "admin@diamondbody.com";
const ADMIN_PASSWORD = "DiamondAdmin2026!";
const SUPER_EMAIL = "super@diamondbody.com";
const SUPER_PASSWORD = "DiamondSuper2026!";

export function Login() {
  const { setUser, toast } = useApp();
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const lower = email.toLowerCase().trim();
    if (!lower || !password) { setErr("Please enter your email and password."); return; }

    // 1. SUPER ADMIN
    if (lower === SUPER_EMAIL) {
      if (password !== SUPER_PASSWORD) { setErr("Invalid email or password."); return; }
      setUser({ id: "u-super", name: "Super Admin", email: lower, role: "super_admin", emailVerified: true, addresses: [] });
      toast({ type: "success", message: "Welcome back, Super Admin" });
      navigate(dashboardPath("super_admin"));
      return;
    }

    // 2. ADMIN
    if (lower === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) { setErr("Invalid email or password."); return; }
      setUser({ id: "u-admin", name: "Diamond Admin", email: lower, role: "admin", emailVerified: true, addresses: [] });
      toast({ type: "success", message: "Welcome back, Admin" });
      navigate(dashboardPath("admin"));
      return;
    }

    // 3. NATION OWNER
    const nation = findNationByEmail(lower);
    if (nation) {
      if (password !== SHARED_NATION_PASSWORD) { setErr("Invalid email or password."); return; }
      if (nation.status !== "active") { setErr("This Nation account is disabled. Contact admin."); return; }
      setUser({
        id: "u-" + nation.id.toLowerCase(),
        name: nation.ownerName,
        email: nation.email,
        phone: nation.phone,
        role: "nation",
        emailVerified: true,
        addresses: [],
        nationId: nation.id,
      });
      toast({ type: "success", message: `Welcome back, ${nation.ownerName.split(" ")[0]}!` });
      navigate(dashboardPath("nation"));
      return;
    }

    // 4. CUSTOMER
    if (password.length < 4) { setErr("Invalid email or password."); return; }
    setUser({
      id: "u-" + Math.random().toString(36).slice(2, 8),
      name: lower.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      email: lower,
      role: "customer",
      emailVerified: true,
      addresses: [],
    });
    toast({ type: "success", message: "Welcome back!" });
    navigate(dashboardPath("customer"));
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your wellness journey">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email"/>
        <PasswordInput label="Password" value={password} onChange={setPassword} required autoComplete="current-password"/>
        <div className="flex justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-[#4A0E16]"/> Remember me</label>
          <Link to="/forgot" className="text-[#4A0E16] font-semibold">Forgot password?</Link>
        </div>
        {err && <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</div>}
        <Button type="submit" className="w-full">Sign In</Button>
        <p className="text-center text-sm text-gray-600">
          New here? <Link to="/register" className="text-[#4A0E16] font-semibold">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { setUser, toast } = useApp();
  const { navigate } = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    const lower = form.email.toLowerCase().trim();
    if (lower === ADMIN_EMAIL || lower === SUPER_EMAIL || findNationByEmail(lower)) {
      setErr("This email is reserved. Please use a different email.");
      return;
    }

    setUser({
      id: "u-" + Math.random().toString(36).slice(2, 8),
      name: form.name,
      email: lower,
      phone: form.phone,
      role: "customer",
      emailVerified: false,
      addresses: [],
    });
    toast({ type: "success", message: "Account created successfully." });
    navigate("/dashboard/user");
  };

  return (
    <AuthShell title="Join Diamond Body" subtitle="Start your wellness journey today">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required/>
        <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required/>
        <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required/>
        <PasswordInput label="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required autoComplete="new-password"/>
        {err && <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</div>}
        <Button type="submit" className="w-full">Create Account</Button>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-[#4A0E16] font-semibold">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function ForgotPassword() {
  const { toast } = useApp();
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast({ type: "success", message: "Reset link sent to your email" });
  };
  return (
    <AuthShell title="Forgot password?" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="text-center py-6">
          <div className="text-5xl mb-4">📧</div>
          <p className="text-gray-700">If an account exists with that email, you'll receive a reset link shortly.</p>
          <Link to="/login" className="text-[#4A0E16] font-semibold mt-4 inline-block">← Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" value="" onChange={() => {}} required/>
          <Button type="submit" className="w-full">Send Reset Link</Button>
          <p className="text-center text-sm text-gray-600">
            <Link to="/login" className="text-[#4A0E16] font-semibold">← Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[80vh] flex items-center diamond-bg">
      <Container className="max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4A0E16] text-white flex items-center justify-center mb-4">
              <IconDiamond size={26}/>
            </div>
            <h1 className="font-display text-3xl font-bold text-[#222]">{title}</h1>
            <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </Container>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}{required && " *"}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm"
      />
    </label>
  );
}

function PasswordInput({ label, value, onChange, required, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}{required && " *"}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          title={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#4A0E16] rounded-lg hover:bg-gray-50 transition touch-manipulation"
        >
          {visible ? <IconEyeOff size={18}/> : <IconEye size={18}/>}
        </button>
      </div>
    </label>
  );
}
