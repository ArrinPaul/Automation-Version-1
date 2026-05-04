import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '@/services/apiClient';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({ email: z.string().email('Invalid email'), password: z.string().min(6, 'Min 6 chars') });
const setupSchema = z.object({ email: z.string().email('Invalid email'), password: z.string().min(6, 'Min 6 chars'), name: z.string().min(2, 'Min 2 chars'), setupKey: z.string().min(1, 'Required') });
const registerSchema = z.object({ email: z.string().email('Invalid email'), password: z.string().min(6, 'Min 6 chars'), name: z.string().min(2, 'Min 2 chars'), category: z.enum(['SB_FACULTY', 'SB_OB', 'SOCIETY']), position: z.string().min(1, 'Position required'), societyId: z.string().optional() });
type LoginFormValues = z.infer<typeof loginSchema>;
type SetupFormValues = z.infer<typeof setupSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const s = {
  page: { minHeight:'100vh', background:'linear-gradient(135deg,#0d1117 0%,#0a0f1e 50%,#0d1b2a 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', position:'relative' as const, overflow:'hidden' },
  grid: { position:'absolute' as const, inset:0, backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)', backgroundSize:'24px 24px', pointerEvents:'none' as const },
  glow: { position:'absolute' as const, top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'700px', height:'700px', background:'radial-gradient(circle,rgba(0,98,155,0.2) 0%,transparent 65%)', pointerEvents:'none' as const },
  card: { backgroundColor:'#111827', border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 32px 80px rgba(0,0,0,0.8)' },
  accent: { height:'3px', background:'linear-gradient(90deg,transparent 0%,#00629B 35%,#38bdf8 65%,transparent 100%)' },
  body: { padding:'2.25rem', display:'flex', flexDirection:'column' as const, gap:'2rem' },
  brand: { display:'flex', alignItems:'center', gap:'12px' },
  logo: { width:'40px', height:'40px', backgroundColor:'#00629B', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  logoText: { fontFamily:'Syncopate,sans-serif', color:'white', fontSize:'14px', fontWeight:700 },
  brandName: { fontFamily:'Syncopate,sans-serif', color:'#fff', fontSize:'12px', textTransform:'uppercase' as const, letterSpacing:'0.12em', lineHeight:1, margin:0 },
  brandSub: { fontFamily:'"JetBrains Mono",monospace', color:'rgba(255,255,255,0.35)', fontSize:'9px', textTransform:'uppercase' as const, letterSpacing:'0.25em', marginTop:'4px', marginBottom:0 },
  h1: { fontFamily:'Syncopate,sans-serif', color:'#fff', fontSize:'22px', textTransform:'uppercase' as const, letterSpacing:'-0.01em', lineHeight:1.1, margin:0 },
  sub: { fontFamily:'"JetBrains Mono",monospace', color:'rgba(255,255,255,0.4)', fontSize:'11px', letterSpacing:'0.1em', marginTop:'8px', marginBottom:0 },
  form: { display:'flex', flexDirection:'column' as const, gap:'16px' },
  label: { fontFamily:'"JetBrains Mono",monospace', fontSize:'10px', textTransform:'uppercase' as const, letterSpacing:'0.2em', color:'rgba(255,255,255,0.55)' },
  input: (err:boolean) => ({ width:'100%', padding:'12px 16px', backgroundColor:'#1a2035', border:`1px solid ${err ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.15)'}`, color:'#ffffff', fontFamily:'"JetBrains Mono",monospace', fontSize:'13px', outline:'none', boxSizing:'border-box' as const }),
  btn: (loading:boolean) => ({ width:'100%', height:'48px', marginTop:'8px', background:loading?'#004d7a':'linear-gradient(135deg,#00629B 0%,#0080c8 100%)', color:'#fff', fontFamily:'"JetBrains Mono",monospace', fontSize:'11px', textTransform:'uppercase' as const, letterSpacing:'0.3em', border:'none', cursor:loading?'not-allowed' as const:'pointer' as const, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:loading?0.75:1, boxShadow:loading?'none':'0 4px 24px rgba(0,98,155,0.45)' }),
  backBtn: { width:'100%', height:'40px', backgroundColor:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.45)', fontFamily:'"JetBrains Mono",monospace', fontSize:'10px', textTransform:'uppercase' as const, letterSpacing:'0.2em', cursor:'pointer' as const },
  footer: { padding:'12px 36px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' },
  footerText: { fontFamily:'"JetBrains Mono",monospace', fontSize:'9px', color:'rgba(255,255,255,0.2)', textTransform:'uppercase' as const, letterSpacing:'0.2em' },
  eyeBtn: { position:'absolute' as const, right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer' as const, color:'rgba(255,255,255,0.4)', padding:'2px', display:'flex', alignItems:'center' },
  errText: { fontFamily:'"JetBrains Mono",monospace', fontSize:'10px', color:'#f87171' },
};

const Field: React.FC<{ label:string; id:string; type?:string; placeholder?:string; error?:string; registration:object }> = ({ label, id, type='text', placeholder, error, registration }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
      <label htmlFor={id} style={s.label}>{label}</label>
      <div style={{ position:'relative' }}>
        <input id={id} type={isPassword && show ? 'text' : type} placeholder={placeholder}
          autoComplete={isPassword ? 'current-password' : 'email'}
          {...registration}
          style={{ ...s.input(!!error), paddingRight: isPassword ? '44px' : '16px' }}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = error ? 'rgba(239,68,68,0.9)' : '#00629B'; (e.target as HTMLInputElement).style.backgroundColor = '#1f2840'; }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.15)'; (e.target as HTMLInputElement).style.backgroundColor = '#1a2035'; }}
        />
        {isPassword && <button type="button" onClick={() => setShow(v => !v)} style={s.eyeBtn}>{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button>}
      </div>
      {error && <p style={s.errText}>{error}</p>}
    </div>
  );
};

/** Races `promise` against a timeout that rejects after `ms` milliseconds. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Connection timed out. Please try again.')), ms)
  );
  return Promise.race([promise, timeout]);
}

const Login: React.FC = () => {
  const [mode, setMode] = useState<'login'|'setup'|'register'>('login');
  const [submitting, setSubmitting] = useState(false);
  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const setupForm = useForm<SetupFormValues>({ resolver: zodResolver(setupSchema) });
  const registerForm = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    apiClient.get('/auth/check-initialized', { signal: ctrl.signal })
      .then(({ data }) => { if (data.initialized === false) setMode('setup'); })
      .catch(() => {}).finally(() => clearTimeout(t));
    return () => { ctrl.abort(); clearTimeout(t); };
  }, []);

  const onLogin = async (data: LoginFormValues) => {
    setSubmitting(true);
    try {
      const { data: res } = await withTimeout(apiClient.post('/auth/login', data), 15000);
      if (!res?.session?.access_token) { toast.error('Invalid session response.'); return; }
      const { error } = await withTimeout(
        supabase.auth.setSession({ access_token: res.session.access_token, refresh_token: res.session.refresh_token }),
        15000
      );
      if (error) { toast.error(error.message); return; }
      toast.success('Access granted.');
    } catch (err) {
      if (err instanceof Error && err.message === 'Connection timed out. Please try again.') {
        toast.error('Connection timed out. Please try again.');
      } else if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message ?? err.message;
        if (err.response?.status === 404 && String(msg).includes('profile not found')) { setMode('setup'); toast.info('No account found. Initialize the system first.'); return; }
        toast.error(String(msg));
      } else { toast.error('Cannot connect to server. Make sure it is running on port 5000.'); }
    } finally { setSubmitting(false); }
  };

  const onSetup = async (data: SetupFormValues) => {
    setSubmitting(true);
    try {
      const { data: res } = await withTimeout(apiClient.post('/auth/setup', data), 15000);
      if (!res?.session?.access_token) { toast.error('Setup failed: no session returned.'); return; }
      const { error } = await withTimeout(
        supabase.auth.setSession({ access_token: res.session.access_token, refresh_token: res.session.refresh_token }),
        15000
      );
      if (error) { toast.error(error.message); return; }
      toast.success('System initialized. Welcome.');
    } catch (err) {
      if (err instanceof Error && err.message === 'Connection timed out. Please try again.') {
        toast.error('Connection timed out. Please try again.');
      } else if (axios.isAxiosError(err)) {
        const status = err.response?.status; const msg = err.response?.data?.message ?? err.message;
        if (status === 401) { toast.error('Invalid setup key.'); return; }
        if (status === 403) { setMode('login'); toast.info('Already initialized. Please log in.'); return; }
        toast.error(String(msg));
      } else { toast.error('Setup failed. Please try again.'); }
    } finally { setSubmitting(false); }
  };

  const onRegister = async (data: RegisterFormValues) => {
    setSubmitting(true);
    try {
      const { data: res } = await withTimeout(apiClient.post('/auth/register-public', data), 15000);
      if (!res?.user?.id) { toast.error('Registration failed.'); return; }
      toast.success('Account created! You can now log in.');
      setMode('login');
      loginForm.reset();
    } catch (err) {
      if (err instanceof Error && err.message === 'Connection timed out. Please try again.') {
        toast.error('Connection timed out. Please try again.');
      } else if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message ?? err.message;
        toast.error(String(msg));
      } else { toast.error('Registration failed. Please try again.'); }
    } finally { setSubmitting(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.grid}/>
      <div style={s.glow}/>
      <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} style={{ position:'relative', width:'100%', maxWidth:'440px' }}>
        <div style={s.card}>
          <div style={s.accent}/>
          <div style={s.body}>
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={s.brand}>
                <div style={s.logo}><span style={s.logoText}>I</span></div>
                <div>
                  <p style={s.brandName}>IEEE Finance Pro</p>
                  <p style={s.brandSub}>Christ University Student Branch</p>
                </div>
              </div>
              <div>
                <h1 style={s.h1}>{mode === 'login' ? 'Access Terminal' : mode === 'setup' ? 'System Initialize' : 'Create Account'}</h1>
                <p style={s.sub}>{mode === 'login' ? 'Sign in to your account' : mode === 'setup' ? 'Create the first admin account' : 'Register for access'}</p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form key="login" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }} transition={{ duration:0.18 }} onSubmit={loginForm.handleSubmit(onLogin)} style={s.form}>
                  <Field label="Email Address" id="email" type="email" placeholder="admin@ieee.org" error={loginForm.formState.errors.email?.message} registration={loginForm.register('email')}/>
                  <Field label="Password" id="password" type="password" placeholder="password" error={loginForm.formState.errors.password?.message} registration={loginForm.register('password')}/>
                  <button type="submit" disabled={submitting} style={s.btn(submitting)}>
                    {submitting ? <><Loader2 size={15} className="animate-spin"/>Connecting...</> : 'Establish Connection'}
                  </button>
                  <button type="button" onClick={() => setMode('register')} style={s.backBtn}>Create New Account</button>
                </motion.form>
              ) : (
                <motion.form key="setup" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} transition={{ duration:0.18 }} onSubmit={setupForm.handleSubmit(onSetup)} style={s.form}>
                  <Field label="Full Name" id="setup-name" placeholder="Admin Name" error={setupForm.formState.errors.name?.message} registration={setupForm.register('name')}/>
                  <Field label="Email Address" id="setup-email" type="email" placeholder="admin@ieee.org" error={setupForm.formState.errors.email?.message} registration={setupForm.register('email')}/>
                  <Field label="Password" id="setup-password" type="password" placeholder="Min. 6 characters" error={setupForm.formState.errors.password?.message} registration={setupForm.register('password')}/>
                  <Field label="Setup Key" id="setup-key" type="password" placeholder="setup-key" error={setupForm.formState.errors.setupKey?.message} registration={setupForm.register('setupKey')}/>
                  <button type="submit" disabled={submitting} style={s.btn(submitting)}>
                    {submitting ? <><Loader2 size={15} className="animate-spin"/>Initializing...</> : 'Initialize System'}
                  </button>
                  <button type="button" onClick={() => setMode('login')} style={s.backBtn}>Back to Login</button>
                </motion.form>
              ) : (
                <motion.form key="register" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} transition={{ duration:0.18 }} onSubmit={registerForm.handleSubmit(onRegister)} style={s.form}>
                  <Field label="Full Name" id="register-name" placeholder="Your Name" error={registerForm.formState.errors.name?.message} registration={registerForm.register('name')}/>
                  <Field label="Email Address" id="register-email" type="email" placeholder="user@ieee.org" error={registerForm.formState.errors.email?.message} registration={registerForm.register('email')}/>
                  <Field label="Password" id="register-password" type="password" placeholder="Min. 6 characters" error={registerForm.formState.errors.password?.message} registration={registerForm.register('password')}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    <label style={s.label}>Category</label>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
                      {(['SB_FACULTY', 'SB_OB', 'SOCIETY'] as const).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => registerForm.setValue('category', cat)}
                          style={{
                            padding:'12px 8px', backgroundColor:registerForm.watch('category') === cat ? '#00629B' : '#1a2035',
                            border:`1px solid ${registerForm.watch('category') === cat ? '#00629B' : 'rgba(255,255,255,0.15)'}`,
                            color:'#fff', fontFamily:'"JetBrains Mono",monospace', fontSize:'10px', textTransform:'uppercase',
                            letterSpacing:'0.15em', cursor:'pointer', transition:'all 0.2s'
                          }}
                        >
                          {cat === 'SB_FACULTY' ? 'SB Faculty' : cat === 'SB_OB' ? 'SB OB' : 'Society'}
                        </button>
                      ))}
                    </div>
                    {registerForm.formState.errors.category && <p style={s.errText}>{registerForm.formState.errors.category.message}</p>}
                  </div>
                  <Field label="Position" id="register-position" placeholder="e.g. Faculty Advisor, President, Treasurer" error={registerForm.formState.errors.position?.message} registration={registerForm.register('position')}/>
                  <button type="submit" disabled={submitting} style={s.btn(submitting)}>
                    {submitting ? <><Loader2 size={15} className="animate-spin"/>Registering...</> : 'Create Account'}
                  </button>
                  <button type="button" onClick={() => setMode('login')} style={s.backBtn}>Back to Login</button>
                </motion.form>
              )}
          </div>
          <div style={s.footer}>
            <span style={s.footerText}>V3.0.0</span>
            <span style={s.footerText}>IEEE SB {new Date().getFullYear()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
