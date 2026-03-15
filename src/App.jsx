import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRegisterSW } from 'virtual:pwa-register/react'

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://ypaaagtdsonrfitiutlc.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYWFhZ3Rkc29ucmZpdGl1dGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTcxOTYsImV4cCI6MjA4ODk5MzE5Nn0.rcwe5mPT7uDFYAyvDRIptdkrPMFlMNwojOdnju6W7mQ'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const HOUSEHOLD_ID    = 'diogo-sara-2025'
const PLAYERS         = ['Diogo', 'Sara']
const SESSION_SIZE    = 15
const ONBOARDING_SIZE = 50
const TARGET_MIN      = 6
const TARGET_MAX      = 8

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#0d0b09',
  surface:   '#151210',
  raised:    '#1e1a15',
  border:    '#2b2420',
  mid:       '#3d3328',
  terra:     '#d4724a',       // terracotta — Alentejo clay, primary CTA
  terraGlow: 'rgba(212,114,74,0.18)',
  terraDim:  'rgba(212,114,74,0.10)',
  azul:      '#4a9dc8',       // azulejo blue — Atlantic Ocean
  azulGlow:  'rgba(74,157,200,0.15)',
  like:      '#4fc87a',
  likeGlow:  'rgba(79,200,122,0.22)',
  nope:      '#e05555',
  nopeGlow:  'rgba(224,85,85,0.22)',
  text:      '#f0e6d4',
  muted:     '#9a8572',
  dim:       '#56483c',
  serif: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
  sans:  '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono:  '"SF Mono", "Fira Code", "Fira Mono", monospace',
}

const CATS = {
  Ensopado:    { accent: '#f0a050', bg: '#1e1407', border: '#382410', emoji: '🥘' },
  Sopa:        { accent: '#64c064', bg: '#0b1b0b', border: '#152a15', emoji: '🍲' },
  Peixe:       { accent: '#52b8f0', bg: '#081926', border: '#0e2638', emoji: '🐟' },
  Carne:       { accent: '#e87070', bg: '#1e0d0d', border: '#301818', emoji: '🥩' },
  Vegetariano: { accent: '#a888e8', bg: '#130e26', border: '#1e1538', emoji: '🥗' },
  Massa:       { accent: '#f0b040', bg: '#1e1407', border: '#382810', emoji: '🍝' },
}
const DEF_CAT = { accent: '#c8b49a', bg: '#181410', border: '#2b2420', emoji: '🍴' }
const getcat = t => CATS[t] || DEF_CAT

function generateCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase()
}

// ─── Inject global CSS (runs once at module load) ─────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('rq-css')) {
  const el = document.createElement('style')
  el.id = 'rq-css'
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      height: 100%; background: #0d0b09;
      overscroll-behavior: none;
      -webkit-tap-highlight-color: transparent;
    }
    ::-webkit-scrollbar { display: none; }
    input, button, select, textarea { font-family: inherit; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(14px) scale(0.965); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes popIn {
      0%   { transform: scale(0.68); opacity: 0; }
      65%  { transform: scale(1.08); }
      100% { transform: scale(1);    opacity: 1; }
    }
    @keyframes dotWave {
      0%, 100% { transform: translateY(0);    opacity: 0.4; }
      42%       { transform: translateY(-8px); opacity: 1;   }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes tileBreath {
      0%, 100% { opacity: 0.055; }
      50%       { opacity: 0.095; }
    }

    .anim-fadeUp { animation: fadeUp  0.44s cubic-bezier(0.22, 1, 0.36, 1) both; }
    .anim-fadeIn { animation: fadeIn  0.3s ease both; }
    .anim-cardIn { animation: cardIn  0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }
    .anim-popIn  { animation: popIn   0.52s cubic-bezier(0.22, 1, 0.36, 1) both; }

    .tap { transition: transform .12s ease, opacity .12s ease; }
    .tap:active { transform: scale(0.95) !important; opacity: .78 !important; }

    input:focus {
      border-color: #d4724a !important;
      box-shadow: 0 0 0 3.5px rgba(212,114,74,0.16) !important;
      outline: none;
    }
  `
  document.head.appendChild(el)
}

// ─── Tiny shared primitives ───────────────────────────────────────────────────
function Divider({ style }) {
  return <div style={{ height: 1, background: C.border, width: '100%', ...style }} />
}

function ErrorBubble({ msg }) {
  if (!msg) return null
  return (
    <div className="anim-fadeIn" style={{
      padding: '10px 14px', borderRadius: 10,
      background: C.nopeGlow, color: C.nope,
      fontFamily: C.sans, fontSize: 13, textAlign: 'center',
    }}>{msg}</div>
  )
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh', background: C.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 28, fontFamily: C.sans,
    }}>
      {/* Azulejo-inspired logo mark */}
      <div className="anim-popIn" style={{
        width: 80, height: 80, borderRadius: 22,
        background: C.raised, border: `1.5px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 38,
        boxShadow: `0 0 64px ${C.terraGlow}, 0 12px 40px rgba(0,0,0,0.5)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Tile pattern — subtle azulejo geometric grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(45deg,  ${C.terra}28 25%, transparent 25%),
            linear-gradient(-45deg, ${C.terra}28 25%, transparent 25%),
            linear-gradient(45deg,  transparent 75%, ${C.terra}28 75%),
            linear-gradient(-45deg, transparent 75%, ${C.terra}28 75%)
          `,
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
          animation: 'tileBreath 3.5s ease-in-out infinite',
        }} />
        <span style={{ position: 'relative', zIndex: 1 }}>🍳</span>
      </div>

      <div className="anim-fadeUp" style={{ textAlign: 'center', animationDelay: '0.1s' }}>
        <div style={{
          fontFamily: C.serif, fontWeight: 600,
          fontSize: 26, letterSpacing: -0.4,
          color: C.text, lineHeight: 1.1,
        }}>
          Receitas da Quinzena
        </div>
        <div style={{
          fontFamily: C.sans, fontSize: 11, color: C.dim,
          marginTop: 10, letterSpacing: 3.5,
          textTransform: 'uppercase', fontWeight: 500,
        }}>
          A carregar
        </div>
      </div>

      {/* Wave loading dots */}
      <div className="anim-fadeIn" style={{ display: 'flex', gap: 7, animationDelay: '0.2s' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: C.terra,
            animation: `dotWave 1.4s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── SetupScreen ──────────────────────────────────────────────────────────────
function SetupScreen({ onReady }) {
  const [step, setStep]             = useState('player')
  const [player, setPlayer]         = useState(null)
  const [isDiscovery, setIsDiscovery] = useState(false)
  const [code, setCode]             = useState('')
  const [sessionCode, setSessionCode] = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const wrap = {
    minHeight: '100dvh', background: C.bg, color: C.text, fontFamily: C.sans,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '32px 20px',
  }
  const inner = {
    width: '100%', maxWidth: 400,
    display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch',
  }

  function PrimaryBtn({ children, onClick, disabled }) {
    return (
      <button className="tap" onClick={onClick} disabled={disabled} style={{
        padding: '16px', borderRadius: 14, border: 'none',
        background: C.terra, color: '#fff',
        fontFamily: C.sans, fontSize: 15, fontWeight: 600, letterSpacing: 0.1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: disabled ? 'none' : `0 4px 24px ${C.terraGlow}`,
      }}>{children}</button>
    )
  }
  function GhostBtn({ children, onClick }) {
    return (
      <button className="tap" onClick={onClick} style={{
        padding: '10px', borderRadius: 10, border: 'none',
        background: 'none', color: C.muted,
        fontFamily: C.sans, fontSize: 14, cursor: 'pointer',
      }}>{children}</button>
    )
  }

  // ── Business logic (all unchanged) ─────────────────────────────────────────
  async function handleCreate() {
    setLoading(true); setError('')
    try {
      const newCode = generateCode()
      const size = isDiscovery ? ONBOARDING_SIZE : SESSION_SIZE
      const { data: neverData } = await supabase.from('never_again').select('recipe_id').eq('household_id', HOUSEHOLD_ID)
      const excluded = (neverData || []).map(r => r.recipe_id)
      let query = supabase.from('recipes').select('id')
      if (excluded.length > 0) query = query.not('id', 'in', `(${excluded.join(',')})`)
      const { data: recipePool } = await query
      const shuffled = (recipePool || []).sort(() => Math.random() - 0.5).slice(0, size)
      const recipeIds = shuffled.map(r => r.id)
      const { data: session, error: err } = await supabase.from('sessions').insert({
        id: newCode, household_id: HOUSEHOLD_ID, recipe_ids: recipeIds,
        completed_by: [], fortnightly: !isDiscovery,
      }).select().single()
      if (err) throw err
      setSessionCode(newCode); setStep('create')
      window._pendingSession = { session, player, size }
    } catch { setError('Erro ao criar sessão. Tenta outra vez.') }
    setLoading(false)
  }

  async function handleJoin() {
    if (code.length !== 5) { setError('O código tem 5 caracteres.'); return }
    setLoading(true); setError('')
    try {
      const { data: session, error: err } = await supabase.from('sessions').select('*').eq('id', code.toUpperCase()).single()
      if (err || !session) throw new Error('not found')
      const { data: recipes, error: rerr } = await supabase.from('recipes').select('*').in('id', session.recipe_ids)
      if (rerr) throw rerr
      const ordered = session.recipe_ids.map(id => recipes.find(r => r.id === id)).filter(Boolean)
      onReady({ player, session, recipes: ordered })
    } catch { setError('Sessão não encontrada. Verifica o código.') }
    setLoading(false)
  }

  async function handleStartFromCreate() {
    const { session, player: p } = window._pendingSession
    const { data: recipes, error: rerr } = await supabase.from('recipes').select('*').in('id', session.recipe_ids)
    if (rerr) { setError('Erro ao carregar receitas.'); return }
    const ordered = session.recipe_ids.map(id => recipes.find(r => r.id === id)).filter(Boolean)
    onReady({ player: p, session, recipes: ordered })
  }

  // ── step: player ────────────────────────────────────────────────────────────
  if (step === 'player') {
    return (
      <div style={wrap}>
        <div style={inner}>
          <div className="anim-fadeUp" style={{ textAlign: 'center', marginBottom: 20 }}>
            {/* Mini logo */}
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: C.raised, border: `1.5px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, margin: '0 auto 18px',
              boxShadow: `0 0 48px ${C.terraGlow}`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `
                  linear-gradient(45deg,  ${C.terra}22 25%, transparent 25%),
                  linear-gradient(-45deg, ${C.terra}22 25%, transparent 25%),
                  linear-gradient(45deg,  transparent 75%, ${C.terra}22 75%),
                  linear-gradient(-45deg, transparent 75%, ${C.terra}22 75%)
                `,
                backgroundSize: '12px 12px',
                backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>🍳</span>
            </div>
            <div style={{
              fontFamily: C.serif, fontWeight: 600,
              fontSize: 26, letterSpacing: -0.3,
              lineHeight: 1.1, color: C.text,
            }}>
              Receitas da Quinzena
            </div>
            <div style={{ fontFamily: C.sans, color: C.muted, fontSize: 14, marginTop: 8 }}>
              Quem está a usar?
            </div>
          </div>

          <div className="anim-fadeUp" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
            animationDelay: '0.07s',
          }}>
            {PLAYERS.map((p, i) => {
              const color = i === 0 ? C.terra : C.azul
              const glow  = i === 0 ? C.terraGlow : C.azulGlow
              return (
                <button key={p} className="tap" style={{
                  padding: '26px 16px', borderRadius: 20,
                  border: `1.5px solid ${color}48`,
                  background: glow, cursor: 'pointer', color: C.text,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                  fontFamily: C.sans,
                }} onClick={() => { setPlayer(p); setStep('action') }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: '50%', background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: C.serif, fontWeight: 700, fontSize: 26, color: '#fff',
                    boxShadow: `0 6px 24px ${glow}`, letterSpacing: -0.5,
                  }}>{p[0]}</div>
                  <div style={{
                    fontFamily: C.serif, fontWeight: 600,
                    fontSize: 20, letterSpacing: -0.2, color: C.text,
                  }}>{p}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── step: action ────────────────────────────────────────────────────────────
  if (step === 'action') {
    const pColor = player === PLAYERS[0] ? C.terra : C.azul
    const pGlow  = player === PLAYERS[0] ? C.terraGlow : C.azulGlow
    return (
      <div style={wrap}>
        <div style={inner}>
          <div className="anim-fadeUp" style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%', background: pColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: C.serif, fontWeight: 700, fontSize: 22, color: '#fff',
              margin: '0 auto 16px',
              boxShadow: `0 4px 24px ${pGlow}`,
            }}>{player[0]}</div>
            <div style={{
              fontFamily: C.serif, fontWeight: 600,
              fontSize: 26, letterSpacing: -0.5, color: C.text,
            }}>Olá, {player}!</div>
            <div style={{ fontFamily: C.sans, color: C.muted, fontSize: 14, marginTop: 7 }}>
              O que queres fazer?
            </div>
          </div>

          {[
            {
              icon: '🔗', label: 'Entrar numa sessão',
              sub: 'Usa o código do teu parceiro',
              color: C.terra, glow: C.terraGlow,
              onClick: () => setStep('joinForm'),
            },
            {
              icon: '✨', label: 'Criar nova sessão',
              sub: 'Escolhe receitas para os próximos 15 dias',
              color: null, glow: null,
              onClick: () => setStep('createOptions'),
            },
          ].map((opt, i) => (
            <button key={opt.label} className={`tap anim-fadeUp`} style={{
              padding: '18px', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
              border: `1.5px solid ${opt.color ? opt.color + '40' : C.border}`,
              background: opt.glow || C.raised,
              color: C.text, fontFamily: C.sans,
              display: 'flex', alignItems: 'center', gap: 14,
              animationDelay: `${0.07 + i * 0.07}s`,
            }} onClick={opt.onClick}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: opt.color ? opt.color + '22' : C.mid,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>{opt.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{opt.label}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>{opt.sub}</div>
              </div>
            </button>
          ))}

          <GhostBtn onClick={() => setStep('player')}>← Mudar de utilizador</GhostBtn>
        </div>
      </div>
    )
  }

  // ── step: joinForm ──────────────────────────────────────────────────────────
  if (step === 'joinForm') {
    const borderColor = error ? C.nope : code.length === 5 ? C.like : C.mid
    return (
      <div style={wrap}>
        <div style={inner}>
          <div className="anim-fadeUp" style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 46, marginBottom: 16 }}>🔗</div>
            <div style={{
              fontFamily: C.serif, fontWeight: 600,
              fontSize: 26, letterSpacing: -0.5, color: C.text,
            }}>Entrar na sessão</div>
            <div style={{ fontFamily: C.sans, color: C.muted, fontSize: 14, marginTop: 7 }}>
              Pede o código ao teu parceiro
            </div>
          </div>

          <div className="anim-fadeUp" style={{ animationDelay: '0.07s' }}>
            <input
              style={{
                padding: '22px 16px', borderRadius: 14,
                border: `2px solid ${borderColor}`,
                background: C.raised, color: C.text,
                fontSize: 34, fontWeight: 700,
                textAlign: 'center', letterSpacing: 12, textTransform: 'uppercase',
                width: '100%', transition: 'border-color 0.2s',
                fontFamily: C.mono,
              }}
              placeholder="XXXXX"
              maxLength={5}
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
              autoCapitalize="characters"
              autoCorrect="off"
              autoFocus
            />
          </div>

          <div className="anim-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: 12, animationDelay: '0.12s' }}>
            <ErrorBubble msg={error} />
            <PrimaryBtn onClick={handleJoin} disabled={loading || code.length !== 5}>
              {loading ? 'A entrar…' : 'Entrar →'}
            </PrimaryBtn>
            <GhostBtn onClick={() => { setStep('action'); setError('') }}>← Voltar</GhostBtn>
          </div>
        </div>
      </div>
    )
  }

  // ── step: createOptions ─────────────────────────────────────────────────────
  if (step === 'createOptions') {
    const modes = [
      {
        key: 'fortnightly', emoji: '📅',
        label: 'Sessão da Quinzena',
        desc: `${SESSION_SIZE} receitas para os próximos 15 dias`,
        active: !isDiscovery,
        onSelect: () => setIsDiscovery(false),
      },
      {
        key: 'discovery', emoji: '🔍',
        label: 'Sessão de Descoberta',
        desc: `${ONBOARDING_SIZE} receitas para explorar o catálogo`,
        active: isDiscovery,
        onSelect: () => setIsDiscovery(true),
      },
    ]
    return (
      <div style={wrap}>
        <div style={inner}>
          <div className="anim-fadeUp" style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 46, marginBottom: 16 }}>✨</div>
            <div style={{
              fontFamily: C.serif, fontWeight: 600,
              fontSize: 26, letterSpacing: -0.5, color: C.text,
            }}>Nova sessão</div>
            <div style={{ fontFamily: C.sans, color: C.muted, fontSize: 14, marginTop: 7 }}>
              Escolhe o tipo de sessão
            </div>
          </div>

          {modes.map((m, i) => (
            <button key={m.key} className={`tap anim-fadeUp`} style={{
              padding: '18px', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
              border: `1.5px solid ${m.active ? C.terra + '60' : C.border}`,
              background: m.active ? C.terraGlow : C.raised,
              color: C.text, fontFamily: C.sans,
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'border-color 0.2s, background 0.2s',
              animationDelay: `${0.07 + i * 0.07}s`,
            }} onClick={m.onSelect}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, fontSize: 22, flexShrink: 0,
                background: m.active ? C.terra + '30' : C.mid,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}>{m.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{m.label}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>{m.desc}</div>
              </div>
              {/* Radio dot */}
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${m.active ? C.terra : C.mid}`,
                background: m.active ? C.terra : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s',
              }}>
                {m.active && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
              </div>
            </button>
          ))}

          <div className="anim-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: 12, animationDelay: '0.22s' }}>
            <ErrorBubble msg={error} />
            <PrimaryBtn onClick={handleCreate} disabled={loading}>
              {loading ? 'A criar…' : 'Criar sessão →'}
            </PrimaryBtn>
            <GhostBtn onClick={() => { setStep('action'); setError('') }}>← Voltar</GhostBtn>
          </div>
        </div>
      </div>
    )
  }

  // ── step: create — share code ────────────────────────────────────────────────
  if (step === 'create') {
    const canShare = typeof navigator.share === 'function'
    const shareCode = async () => {
      try { await navigator.share({ title: 'Receitas da Quinzena', text: `Código da sessão: ${sessionCode}` }) } catch {}
    }
    return (
      <div style={wrap}>
        <div style={inner}>
          <div className="anim-popIn" style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <div style={{
              fontFamily: C.serif, fontWeight: 600,
              fontSize: 28, letterSpacing: -0.5, color: C.text,
            }}>Sessão criada!</div>
            <div style={{ fontFamily: C.sans, color: C.muted, fontSize: 14, marginTop: 8 }}>
              Partilha este código com o teu parceiro
            </div>
          </div>

          {/* Premium code block */}
          <div className="anim-fadeUp" style={{
            padding: '28px 24px 22px', borderRadius: 18,
            background: C.raised, border: `1.5px solid ${C.mid}`,
            textAlign: 'center', animationDelay: '0.12s',
          }}>
            <div style={{
              fontFamily: C.sans, fontSize: 10, color: C.dim,
              letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600, marginBottom: 16,
            }}>Código da sessão</div>
            {/* Decorative azulejo dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: C.terra, opacity: 0.45,
                }} />
              ))}
            </div>
            <div style={{
              fontFamily: C.mono, fontWeight: 800,
              fontSize: 44, letterSpacing: 14, color: C.text, lineHeight: 1,
              userSelect: 'all',
            }}>{sessionCode}</div>
            <div style={{
              fontFamily: C.sans, color: C.dim, fontSize: 12,
              marginTop: 18, lineHeight: 1.5,
            }}>O teu parceiro pode entrar agora ou mais tarde</div>
          </div>

          <div className="anim-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: 10, animationDelay: '0.2s' }}>
            {canShare && (
              <button className="tap" style={{
                padding: '14px', borderRadius: 14,
                border: `1.5px solid ${C.mid}`,
                background: C.raised, color: C.muted,
                fontFamily: C.sans, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }} onClick={shareCode}>
                <span>📤</span><span>Partilhar código</span>
              </button>
            )}
            <PrimaryBtn onClick={handleStartFromCreate}>Começar a votar →</PrimaryBtn>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ─── SwipeScreen ──────────────────────────────────────────────────────────────
function SwipeScreen({ player, session, recipes, onDone }) {
  const [index, setIndex]         = useState(0)
  const [likeCount, setLikeCount] = useState(0)
  const [animating, setAnimating] = useState(null)  // 'left' | 'right'
  const [dragX, setDragX]         = useState(0)
  const [dragging, setDragging]   = useState(false)
  const [showHint, setShowHint]   = useState(true)
  const touchStart = useRef(null)
  const recipe = recipes[index]

  // ── Vote logic (unchanged) ──────────────────────────────────────────────────
  async function submitVote(recipeId, liked) {
    await supabase.from('votes').upsert({
      recipe_id: recipeId, session_id: session.id, player, liked,
    }, { onConflict: 'recipe_id,session_id,player' })
  }

  async function handleVote(liked) {
    if (animating) return
    setShowHint(false)
    setAnimating(liked ? 'right' : 'left')
    if (liked) setLikeCount(c => c + 1)
    submitVote(recipe.id, liked)
    setTimeout(async () => {
      setAnimating(null)
      if (index + 1 >= recipes.length) {
        const { data: freshSession } = await supabase
          .from('sessions').select('completed_by').eq('id', session.id).single()
        const current = freshSession?.completed_by || []
        if (!current.includes(player)) {
          await supabase.from('sessions').update({ completed_by: [...current, player] }).eq('id', session.id)
        }
        onDone({ likeCount: likeCount + (liked ? 1 : 0) })
      } else {
        setIndex(i => i + 1)
      }
    }, 280)
  }

  async function handleNeverAgain() {
    if (animating) return
    supabase.from('never_again').upsert({ household_id: HOUSEHOLD_ID, recipe_id: recipe.id }, { onConflict: 'household_id,recipe_id' })
    handleVote(false)
  }

  // ── Touch handlers (unchanged logic) ───────────────────────────────────────
  function onTouchStart(e) {
    if (animating) return
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchMove(e) {
    if (!touchStart.current || animating) return
    const dx = e.touches[0].clientX - touchStart.current.x
    setDragX(dx)
    setDragging(true)
  }
  function onTouchEnd(e) {
    if (!touchStart.current) return
    const rawDx = e.changedTouches[0].clientX - touchStart.current.x
    const rawDy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    setDragging(false)
    setDragX(0)
    if (Math.abs(rawDx) > 55 && Math.abs(rawDx) > Math.abs(rawDy)) {
      handleVote(rawDx > 0)
    }
  }

  if (!recipe) return null

  const c        = getcat(recipe.tipo)
  const pColor   = player === PLAYERS[0] ? C.terra : C.azul
  const pGlow    = player === PLAYERS[0] ? C.terraGlow : C.azulGlow
  const rotation = dragging ? dragX * 0.04 : 0
  const likeOp   = dragging && dragX >  30 ? Math.min((dragX  - 30) / 55, 1) : 0
  const nopeOp   = dragging && dragX < -30 ? Math.min((-dragX - 30) / 55, 1) : 0

  const cardTransform = animating === 'right'
    ? 'translateX(135%) rotate(18deg)'
    : animating === 'left'
    ? 'translateX(-135%) rotate(-18deg)'
    : dragging
    ? `translateX(${dragX}px) rotate(${rotation}deg)`
    : 'translateX(0) rotate(0deg)'

  const cardTransition = animating
    ? 'transform 0.28s ease-in'
    : dragging ? 'none' : 'transform 0.3s cubic-bezier(0.22,1,0.36,1)'

  return (
    <div style={{
      minHeight: '100dvh', background: C.bg, color: C.text, fontFamily: C.sans,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '14px 18px 20px',
    }}>

      {/* Header */}
      <div style={{
        width: '100%', maxWidth: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 8, marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: pColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: C.serif, fontWeight: 700, fontSize: 14, color: '#fff',
            boxShadow: `0 2px 10px ${pGlow}`,
          }}>{player[0]}</div>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.muted }}>{player}</span>
        </div>
        <div style={{
          fontFamily: C.mono, fontSize: 12, color: C.dim,
          background: C.raised, border: `1px solid ${C.border}`,
          padding: '4px 10px', borderRadius: 20,
        }}>
          {index + 1} / {recipes.length}
        </div>
      </div>

      {/* Segmented story-style progress pills */}
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', gap: 4, marginBottom: 16 }}>
        {recipes.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 3,
            background: i < index ? C.terra : C.border,
            overflow: 'hidden', position: 'relative',
          }}>
            {/* Active pill gets a shimmer fill */}
            {i === index && (
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(90deg, ${C.terra} 0%, ${C.terra}80 100%)`,
                borderRadius: 3,
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{ flex: 1, width: '100%', maxWidth: 400, display: 'flex', alignItems: 'stretch' }}>
        <div
          key={index}
          className="anim-cardIn"
          style={{
            width: '100%',
            background: c.bg,
            borderRadius: 24,
            border: `1.5px solid ${c.border}`,
            userSelect: 'none', touchAction: 'none',
            transform: cardTransform,
            transition: cardTransition,
            position: 'relative', overflow: 'hidden',
            minHeight: 260,
            boxShadow: dragging
              ? `0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px ${c.border}`
              : `0 8px 40px rgba(0,0,0,0.4)`,
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Category colour stripe */}
          <div style={{
            height: 5,
            background: `linear-gradient(90deg, ${c.accent}, ${c.accent}70)`,
          }} />

          {/* GOSTO stamp */}
          <div style={{
            position: 'absolute', top: 22, left: 18,
            padding: '5px 14px', borderRadius: 10,
            background: C.like, color: '#fff',
            fontFamily: C.sans, fontWeight: 700, fontSize: 15, letterSpacing: 2,
            opacity: likeOp, transform: 'rotate(-14deg)',
            pointerEvents: 'none',
            border: `2px solid ${C.like}`,
            transformOrigin: 'left top',
          }}>❤ SIM</div>

          {/* PASSO stamp */}
          <div style={{
            position: 'absolute', top: 22, right: 18,
            padding: '5px 14px', borderRadius: 10,
            background: C.nope, color: '#fff',
            fontFamily: C.sans, fontWeight: 700, fontSize: 15, letterSpacing: 2,
            opacity: nopeOp, transform: 'rotate(14deg)',
            pointerEvents: 'none',
            border: `2px solid ${C.nope}`,
            transformOrigin: 'right top',
          }}>✕ NÃO</div>

          <div style={{ padding: '22px 22px 28px' }}>
            {/* Category badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              background: c.accent + '22', color: c.accent,
              fontFamily: C.sans, fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
              marginBottom: 16,
            }}>
              <span>{c.emoji}</span><span>{recipe.tipo}</span>
            </div>

            {/* Recipe name — Cormorant Garamond for warmth and elegance */}
            <div style={{
              fontFamily: C.serif, fontWeight: 600,
              fontSize: 30, lineHeight: 1.12,
              color: C.text, letterSpacing: -0.5, marginBottom: 12,
            }}>
              {recipe.name}
            </div>

            {/* Description */}
            {recipe.description && (
              <div style={{
                fontFamily: C.sans, fontSize: 14, color: C.muted, lineHeight: 1.6,
                marginBottom: 18,
              }}>
                {recipe.description}
              </div>
            )}

            {/* Metadata */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 4 }}>
              {recipe.complexity && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: C.sans, fontSize: 10, color: C.dim,
                    fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.6,
                  }}>Dificuldade</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: i <= Math.min(Number(recipe.complexity) || 1, 5) ? c.accent : C.border,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              {recipe.serves && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: C.sans, fontSize: 13, color: C.dim,
                }}>
                  <span>👤</span><span>{recipe.serves}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Swipe hint — fades after first vote */}
      <div style={{
        fontFamily: C.sans, fontSize: 10, color: C.dim, letterSpacing: 2,
        textAlign: 'center', marginTop: 14, marginBottom: 8,
        textTransform: 'uppercase', fontWeight: 500,
        opacity: showHint ? 1 : 0, transition: 'opacity 0.5s',
      }}>
        ← desliza para votar →
      </div>

      {/* Action buttons */}
      <div style={{
        width: '100%', maxWidth: 400,
        display: 'flex', gap: 0,
        alignItems: 'center', justifyContent: 'space-between',
        marginTop: 4,
      }}>
        {/* Nope */}
        <button className="tap" onClick={() => handleVote(false)} style={{
          width: 62, height: 62, borderRadius: '50%',
          background: C.nopeGlow, color: C.nope, fontSize: 22, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${C.nope}44`,
          boxShadow: `0 4px 18px rgba(224,85,85,0.14)`,
        }}>✕</button>

        {/* Never again */}
        <button className="tap" onClick={handleNeverAgain} style={{
          flex: 1, padding: '10px 8px', border: 'none',
          background: 'none', color: C.dim,
          fontFamily: C.sans, fontSize: 12, fontWeight: 500,
          cursor: 'pointer', letterSpacing: 0.3, textAlign: 'center',
        }}>🚫 Nunca mais</button>

        {/* Like */}
        <button className="tap" onClick={() => handleVote(true)} style={{
          width: 62, height: 62, borderRadius: '50%',
          background: C.likeGlow, color: C.like, fontSize: 22, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${C.like}44`,
          boxShadow: `0 4px 18px rgba(79,200,122,0.14)`,
        }}>♥</button>
      </div>
    </div>
  )
}

// ─── ResultsScreen ────────────────────────────────────────────────────────────
function ResultsScreen({ player, session, likeCount, onMatches }) {
  const [waiting, setWaiting] = useState(true)
  const otherPlayer = PLAYERS.find(p => p !== player)

  useEffect(() => {
    let resolved = false
    function resolve() {
      if (resolved) return
      resolved = true
      setWaiting(false)
      loadAndGoToMatches()
    }

    // 1. Subscribe first so we never miss a realtime event
    const channel = supabase
      .channel(`session-${session.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${session.id}`,
      }, (payload) => {
        if ((payload.new.completed_by || []).includes(otherPlayer)) resolve()
      })
      .subscribe()

    // 2. Fresh DB check via vote count — race-condition-proof
    // (completed_by can be overwritten by a concurrent update; vote count never can)
    const totalRecipes = (session.recipe_ids || []).length
    async function checkVoteCount() {
      const { count } = await supabase.from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id).eq('player', otherPlayer)
      if (count >= totalRecipes) resolve()
    }
    checkVoteCount()

    // 3. Polling fallback every 5s via vote count
    const poll = setInterval(checkVoteCount, 5000)

    return () => { supabase.removeChannel(channel); clearInterval(poll) }
  }, [])

  async function loadAndGoToMatches() {
    const { data: votes } = await supabase.from('votes')
      .select('recipe_id, player, liked')
      .eq('session_id', session.id).eq('liked', true)
    const byRecipe = {}
    for (const v of (votes || [])) {
      if (!byRecipe[v.recipe_id]) byRecipe[v.recipe_id] = new Set()
      byRecipe[v.recipe_id].add(v.player)
    }
    const matchIds = Object.entries(byRecipe)
      .filter(([, players]) => players.size === 2)
      .map(([id]) => Number(id))
    if (matchIds.length === 0) { onMatches([]); return }
    const { data: matchRecipes } = await supabase.from('recipes').select('*').in('id', matchIds)
    onMatches(matchRecipes || [])
  }

  return (
    <div style={{
      minHeight: '100dvh', background: C.bg, color: C.text, fontFamily: C.sans,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px',
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        display: 'flex', flexDirection: 'column', gap: 24,
        alignItems: 'center', textAlign: 'center',
      }}>
        <div className="anim-popIn" style={{ fontSize: 64, lineHeight: 1 }}>🎉</div>

        <div className="anim-fadeUp" style={{ animationDelay: '0.1s' }}>
          <div style={{
            fontFamily: C.serif, fontWeight: 600,
            fontSize: 30, letterSpacing: -0.6, color: C.text,
          }}>Terminaste!</div>
          <div style={{ fontFamily: C.sans, color: C.muted, fontSize: 15, marginTop: 12 }}>
            Gostaste de{' '}
            <span style={{
              color: C.terra, fontWeight: 700,
              background: C.terraGlow, padding: '1px 8px', borderRadius: 6,
            }}>{likeCount}</span>
            {' '}{likeCount === 1 ? 'receita' : 'receitas'}
          </div>
        </div>

        <Divider style={{ maxWidth: 200 }} />

        {waiting ? (
          <div className="anim-fadeUp" style={{
            animationDelay: '0.18s',
            display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: C.raised, border: `1.5px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
            }}>
              <span style={{ animation: 'spin 3s linear infinite', display: 'block' }}>⏳</span>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 18, letterSpacing: -0.3 }}>
                À espera de {otherPlayer}…
              </div>
              <div style={{
                fontFamily: C.sans, color: C.muted, fontSize: 13,
                marginTop: 10, lineHeight: 1.6, maxWidth: 260,
              }}>
                Os matches aparecem automaticamente assim que {otherPlayer} acabar de votar.
              </div>
            </div>
            {/* Breathing dots */}
            <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: C.terra, opacity: 0.5,
                  animation: `dotWave 1.6s ease-in-out ${i * 0.22}s infinite`,
                }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="anim-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              border: `2px solid ${C.terra}`, borderTopColor: 'transparent',
              animation: 'spin 0.7s linear infinite',
            }} />
            <span style={{ fontFamily: C.sans, fontSize: 14, color: C.muted }}>
              A carregar os matches…
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MatchScreen ──────────────────────────────────────────────────────────────
function MatchScreen({ matches }) {
  const [showList, setShowList] = useState(false)
  const [checked, setChecked]   = useState(new Set())

  function buildShoppingList(recipes) {
    const counts = {}
    for (const r of recipes) {
      for (const ing of (r.ingredients || [])) {
        const key = ing.toLowerCase().split(' ').slice(0, 2).join(' ')
        counts[key] = (counts[key] || 0) + 1
      }
    }
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
  }
  const shoppingList = buildShoppingList(matches)

  function toggleCheck(ing) {
    setChecked(s => {
      const next = new Set(s)
      next.has(ing) ? next.delete(ing) : next.add(ing)
      return next
    })
  }

  const isGoodPlan    = matches.length >= TARGET_MIN
  const checkedCount  = checked.size
  const shoppingTotal = shoppingList.length

  if (matches.length === 0) {
    return (
      <div style={{
        minHeight: '100dvh', background: C.bg, color: C.text, fontFamily: C.sans,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px', gap: 24, textAlign: 'center',
      }}>
        <div className="anim-popIn" style={{ fontSize: 64 }}>😅</div>
        <div className="anim-fadeUp" style={{ animationDelay: '0.1s' }}>
          <div style={{
            fontFamily: C.serif, fontWeight: 600,
            fontSize: 26, letterSpacing: -0.5, color: C.text,
          }}>Nenhuma receita em comum</div>
          <div style={{ fontFamily: C.sans, color: C.muted, fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
            Experimenta criar uma nova sessão e votar outra vez!
          </div>
        </div>
        <button className="tap anim-fadeUp" style={{
          padding: '16px 32px', borderRadius: 14, border: 'none',
          background: C.terra, color: '#fff',
          fontFamily: C.sans, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          boxShadow: `0 4px 20px ${C.terraGlow}`,
          animationDelay: '0.18s',
        }} onClick={() => window.location.reload()}>
          Tentar outra vez
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100dvh', background: C.bg, color: C.text, fontFamily: C.sans,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 20px 48px', overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Header */}
        <div className="anim-popIn" style={{ textAlign: 'center', paddingBottom: 8 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✨</div>
          <div style={{
            fontFamily: C.serif, fontWeight: 600,
            fontSize: 32, letterSpacing: -0.7, color: C.text,
          }}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}!
          </div>
          <div style={{
            display: 'inline-block', marginTop: 14,
            padding: '6px 16px', borderRadius: 20,
            background: isGoodPlan ? C.likeGlow : C.nopeGlow,
            color: isGoodPlan ? C.like : C.nope,
            fontFamily: C.sans, fontSize: 13, fontWeight: 600,
          }}>
            {isGoodPlan
              ? `✓ Plano completo para a quinzena`
              : `Faltam ${TARGET_MIN - matches.length} receitas para o plano`}
          </div>
        </div>

        <Divider />

        {/* Match list */}
        {matches.map((r, i) => {
          const c = getcat(r.tipo)
          return (
            <div key={r.id} className="anim-fadeUp" style={{
              background: c.bg, borderRadius: 16,
              border: `1.5px solid ${c.border}`,
              overflow: 'hidden',
              animationDelay: `${i * 0.05}s`,
            }}>
              {/* Category colour stripe */}
              <div style={{
                height: 4,
                background: `linear-gradient(90deg, ${c.accent}, ${c.accent}60)`,
              }} />
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: c.accent + '25',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>{c.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: C.serif, fontWeight: 600,
                    fontSize: 17, color: C.text, letterSpacing: -0.2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{r.name}</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 9px', borderRadius: 12,
                    background: c.accent + '18', color: c.accent,
                    fontFamily: C.sans, fontSize: 11, fontWeight: 600, marginTop: 5,
                  }}>{r.tipo}</div>
                </div>
                {r.recipe_url && (
                  <a href={r.recipe_url} target="_blank" rel="noopener noreferrer" style={{
                    color: c.accent, fontFamily: C.sans, fontSize: 13, fontWeight: 700,
                    textDecoration: 'none', flexShrink: 0,
                    padding: '7px 13px', borderRadius: 9,
                    background: c.accent + '18',
                    border: `1px solid ${c.accent}30`,
                  }}>Ver →</a>
                )}
              </div>
            </div>
          )
        })}

        <Divider style={{ marginTop: 4 }} />

        {/* Shopping list toggle */}
        <button className="tap" style={{
          padding: '15px 18px', borderRadius: 14,
          border: `1.5px solid ${showList ? C.terra + '55' : C.border}`,
          background: showList ? C.terraGlow : C.raised,
          color: C.text, fontFamily: C.sans,
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          transition: 'border-color 0.2s, background 0.2s',
        }} onClick={() => setShowList(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🛒</span><span>Lista de compras</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {checkedCount > 0 && (
              <span style={{
                background: C.likeGlow, color: C.like,
                fontFamily: C.sans, fontSize: 12, fontWeight: 600,
                padding: '2px 8px', borderRadius: 10,
              }}>{checkedCount}/{shoppingTotal}</span>
            )}
            <span style={{
              color: C.muted, fontSize: 14,
              display: 'inline-block',
              transition: 'transform 0.2s',
              transform: showList ? 'rotate(180deg)' : 'rotate(0)',
            }}>▾</span>
          </div>
        </button>

        {showList && (
          <div className="anim-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              fontFamily: C.sans, fontSize: 10, color: C.dim, textAlign: 'center',
              marginBottom: 4, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 500,
            }}>Toca para marcar como comprado</div>
            {shoppingList.map(([ing, count]) => {
              const done = checked.has(ing)
              return (
                <div key={ing} onClick={() => toggleCheck(ing)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 12,
                  background: done ? 'transparent' : C.raised,
                  border: `1px solid ${done ? C.border : C.mid}`,
                  cursor: 'pointer',
                  opacity: done ? 0.38 : 1,
                  transition: 'opacity 0.22s, background 0.22s',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${done ? C.like : C.mid}`,
                    background: done ? C.like : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.18s',
                  }}>
                    {done && <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>}
                  </div>
                  <div style={{
                    flex: 1, fontFamily: C.sans, fontSize: 14, color: C.text,
                    textDecoration: done ? 'line-through' : 'none',
                  }}>
                    {count > 1 && <span style={{ color: C.muted, marginRight: 6 }}>×{count}</span>}
                    {ing}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button className="tap" style={{
          padding: '15px', borderRadius: 14,
          border: `1.5px solid ${C.border}`,
          background: C.raised, color: C.muted,
          fontFamily: C.sans, fontSize: 15, fontWeight: 600,
          cursor: 'pointer', marginTop: 4,
        }} onClick={() => window.location.reload()}>
          Nova sessão
        </button>

      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [updateReady, setUpdateReady] = useState(false)
  useRegisterSW({ onNeedRefresh() { setUpdateReady(true) } })

  const [screen, setScreen]     = useState('loading')
  const [player, setPlayer]     = useState(null)
  const [session, setSession]   = useState(null)
  const [recipes, setRecipes]   = useState([])
  const [likeCount, setLikeCount] = useState(0)
  const [matches, setMatches]   = useState([])

  useEffect(() => {
    const t = setTimeout(() => setScreen('setup'), 700)
    return () => clearTimeout(t)
  }, [])

  function handleReady({ player: p, session: s, recipes: r }) {
    setPlayer(p); setSession(s); setRecipes(r); setScreen('swipe')
  }
  function handleDone({ likeCount: lc }) {
    setLikeCount(lc); setScreen('results')
  }
  function handleMatches(m) {
    setMatches(m); setScreen('match')
  }

  return (
    <div style={{ background: C.bg, minHeight: '100dvh' }}>
      {/* PWA update toast */}
      {updateReady && (
        <div className="anim-fadeUp" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: C.raised, borderTop: `1px solid ${C.border}`,
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          fontFamily: C.sans,
        }}>
          <span style={{ color: C.muted, fontSize: 14, fontWeight: 500 }}>Nova versão disponível</span>
          <button className="tap" onClick={() => window.location.reload()} style={{
            background: C.terra, color: '#fff', border: 'none',
            borderRadius: 10, padding: '8px 18px',
            fontFamily: C.sans, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Atualizar</button>
        </div>
      )}

      {screen === 'loading'  && <LoadingScreen />}
      {screen === 'setup'    && <SetupScreen onReady={handleReady} />}
      {screen === 'swipe'    && <SwipeScreen player={player} session={session} recipes={recipes} onDone={handleDone} />}
      {screen === 'results'  && <ResultsScreen player={player} session={session} likeCount={likeCount} onMatches={handleMatches} />}
      {screen === 'match'    && <MatchScreen matches={matches} session={session} />}
    </div>
  )
}
