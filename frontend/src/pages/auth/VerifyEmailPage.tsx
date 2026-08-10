import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { api } from "../../lib/api";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    try { await api.confirmRegistration(email, code); navigate("/login", { replace: true }); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo confirmar la cuenta"); }
    finally { setLoading(false); }
  }

  return <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4">
    <form onSubmit={submit} className="w-full rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-xl">
      <MailCheck className="text-accent" size={42} />
      <h1 className="mt-5 text-3xl font-black">Confirma tu cuenta</h1>
      <p className="mt-2 text-sm text-neutral-500">Ingresa el código que Amazon Cognito envió a tu correo o teléfono.</p>
      <label className="mt-6 block text-sm font-bold">Correo<input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" /></label>
      <label className="mt-4 block text-sm font-bold">Código<input required inputMode="numeric" value={code} onChange={e => setCode(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 tracking-[0.3em]" /></label>
      {message && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}
      <button disabled={loading} className="mt-6 w-full rounded-2xl bg-accent px-5 py-3 font-bold text-white disabled:opacity-50">{loading ? "Confirmando…" : "Confirmar cuenta"}</button>
      <button type="button" onClick={async () => { try { const r = await api.resendCode(email); setMessage(`Código reenviado${r.delivery ? `: ${r.delivery}` : ""}`); } catch (e) { setMessage(e instanceof Error ? e.message : "No se pudo reenviar"); } }} className="mt-3 w-full rounded-2xl border px-5 py-3 text-sm font-bold">Reenviar código</button>
      <Link to="/login" className="mt-5 block text-center text-sm font-bold text-accent">Volver al inicio de sesión</Link>
    </form>
  </main>;
}
