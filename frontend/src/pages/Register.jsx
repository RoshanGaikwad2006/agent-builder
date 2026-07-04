import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/authApi';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.register({ name, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running on port 8080.');
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Try a different email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── LEFT HERO PANEL ── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(145deg, #0a0f1e 0%, #0f2415 50%, #0a1628 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 56px',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
      }} className="hidden lg:flex">

        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'-100px', right:'-80px', width:'420px', height:'420px', borderRadius:'50%', background:'radial-gradient(circle, rgba(34,197,94,0.16) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-60px', width:'340px', height:'340px', borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'45%', right:'15%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', position:'relative', zIndex:1, marginBottom:'auto' }}>
          <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 28px rgba(34,197,94,0.5)' }}>
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span style={{ color:'white', fontWeight:'800', fontSize:'21px', letterSpacing:'-0.5px' }}>AgentForge</span>
        </div>

        {/* Hero — vertically centred */}
        <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', paddingTop:'32px', paddingBottom:'32px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(34,197,94,0.11)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:'100px', padding:'7px 16px', width:'fit-content', marginBottom:'28px' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', animation:'blink 2s ease-in-out infinite', flexShrink:0 }} />
            <span style={{ fontSize:'11px', color:'#86efac', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', whiteSpace:'nowrap' }}>Enterprise Platform Active</span>
          </div>

          <h1 style={{ fontSize:'48px', fontWeight:'800', color:'white', lineHeight:'1.06', letterSpacing:'-1.8px', margin:0, marginBottom:'22px' }}>
            Start Building<br />
            <span style={{ backgroundImage:'linear-gradient(90deg,#4ade80 0%,#22d3ee 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Intelligent</span><br />
            Agents Today
          </h1>

          <p style={{ color:'#94a3b8', fontSize:'15px', lineHeight:'1.8', maxWidth:'380px', margin:0, marginBottom:'40px' }}>
            Create your free workspace and deploy AI agents that know your business inside out. No ML expertise required.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[
              ['⚡', 'Set up in under 5 minutes'],
              ['📄', 'Upload any PDF as knowledge base'],
              ['🤖', 'Custom system prompts per agent'],
              ['🌐', 'Shareable public chat links'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', padding:'11px 16px' }}>
                <span style={{ fontSize:'17px', lineHeight:1, flexShrink:0 }}>{icon}</span>
                <span style={{ color:'#cbd5e1', fontSize:'13.5px', fontWeight:'500' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Creator card */}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px', padding:'16px 20px' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#22c55e,#0ea5e9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'21px', fontWeight:'800', color:'white', boxShadow:'0 0 16px rgba(34,197,94,0.35)' }}>A</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'white', fontWeight:'700', fontSize:'14px', margin:0, lineHeight:1.4 }}>Platform Administrator</p>
              <p style={{ color:'#64748b', fontSize:'12px', margin:0, marginTop:'3px', lineHeight:1.4 }}>Core System Orchestrator</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e', animation:'blink 2s ease-in-out infinite' }} />
              <span style={{ fontSize:'11px', color:'#4ade80', fontWeight:'600' }}>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ width:'100%', maxWidth:'500px', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', background:'#f8fafc' }} className="lg:w-auto">
        <div style={{ width:'100%', maxWidth:'380px' }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'36px' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span style={{ fontWeight:'800', fontSize:'18px', color:'#0f172a' }}>AgentForge</span>
          </div>

          <div style={{ marginBottom:'32px' }}>
            <h2 style={{ fontSize:'28px', fontWeight:'800', color:'#0f172a', margin:0, letterSpacing:'-0.5px' }}>Create account</h2>
            <p style={{ color:'#64748b', fontSize:'14px', marginTop:'6px', marginBottom:0 }}>Start your free workspace today</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'12px 16px', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
              <svg style={{ width:'16px', height:'16px', color:'#ef4444', flexShrink:0, marginTop:'1px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ fontSize:'13px', color:'#dc2626', lineHeight:'1.5' }}>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'12px', padding:'12px 16px', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'center' }}>
              <svg style={{ width:'16px', height:'16px', color:'#16a34a', flexShrink:0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ fontSize:'13px', color:'#15803d', fontWeight:'600' }}>Account created! Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            {/* Name */}
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#475569', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'8px' }}>Full Name</label>
              <input
                type="text" required
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width:'100%', padding:'13px 16px', borderRadius:'12px', border:'1.5px solid #e2e8f0', background:'white', fontSize:'14px', color:'#1e293b', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor='#22c55e'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#475569', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'8px' }}>Email Address</label>
              <input
                type="email" required
                placeholder="admin@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width:'100%', padding:'13px 16px', borderRadius:'12px', border:'1.5px solid #e2e8f0', background:'white', fontSize:'14px', color:'#1e293b', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor='#22c55e'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#475569', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'8px' }}>Password</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} required minLength={6}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width:'100%', padding:'13px 44px 13px 16px', borderRadius:'12px', border:'1.5px solid #e2e8f0', background:'white', fontSize:'14px', color:'#1e293b', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor='#22c55e'}
                  onBlur={e => e.target.style.borderColor='#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {showPwd ? (
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || success}
              style={{
                width:'100%', padding:'14px',
                background: (loading || success) ? '#bbf7d0' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                color:'white', fontWeight:'700', fontSize:'14px',
                borderRadius:'12px', border:'none',
                cursor: (loading || success) ? 'not-allowed' : 'pointer',
                boxShadow: (loading || success) ? 'none' : '0 4px 18px rgba(34,197,94,0.38)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                transition:'all 0.2s',
              }}>
              {loading ? (
                <>
                  <svg style={{ width:'16px', height:'16px', animation:'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity:0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path style={{ opacity:0.8 }} fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </>
              ) : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:'13px', color:'#64748b', marginTop:'24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#16a34a', fontWeight:'700', textDecoration:'none' }}>
              Sign in
            </Link>
          </p>

          <div style={{ marginTop:'36px', paddingTop:'24px', borderTop:'1px solid #e2e8f0', textAlign:'center' }}>
            <p style={{ fontSize:'12px', color:'#94a3b8', margin:0 }}>
              AgentForge Enterprise Platform Portal
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
};

export default Register;
