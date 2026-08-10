import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { api } from "../../lib/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState(""); const [code, setCode] = useState("");
  const [password, setPassword] = useState(""); const [sent, setSent] = useState(false);
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      if (!sent) { await api.forgotPassword(email); setSent(true); setMessage("Cognito envió un código de recuperación."); }
      else { await api.resetPassword(email, code, password); navigate("/login", { replace: true }); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo completar la recuperación"); }
    finally { setLoading(false); }
  }
  return <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4"><form onSubmit={submit} className="w-full rounded-[2rem] border bg-white p-8 shadow-xl">
    <KeyRound size={42} className="text-accent"/><h1 className="mt-5 text-3xl font-black">Recuperar contraseña</h1>
    <p className="mt-2 text-sm text-neutral-500">El proceso se realiza mediante Amazon Cognito.</p>
    <label className="mt-6 block text-sm font-bold">Correo<input type="email" required disabled={sent} value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 disabled:bg-neutral-100"/></label>
    {sent && <><label className="mt-4 block text-sm font-bold">Código<input required value={code} onChange={e=>setCode(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3"/></label><label className="mt-4 block text-sm font-bold">Nueva contraseña<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3"/></label></>}
    {message && <p className="mt-4 rounded-xl bg-neutral-100 p-3 text-sm">{message}</p>}
    <button disabled={loading} className="mt-6 w-full rounded-2xl bg-accent px-5 py-3 font-bold text-white">{loading ? "Procesando…" : sent ? "Cambiar contraseña" : "Enviar código"}</button>
    <Link to="/login" className="mt-5 block text-center text-sm font-bold text-accent">Volver al inicio de sesión</Link>
  </form></main>;
}
