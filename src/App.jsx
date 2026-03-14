import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://ypaaagtdsonrfitiutlc.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYWFhZ3Rkc29ucmZpdGl1dGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTcxOTYsImV4cCI6MjA4ODk5MzE5Nn0.rcwe5mPT7uDFYAyvDRIptdkrPMFlMNwojOdnju6W7mQ'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const HOUSEHOLD_ID = 'diogo-sara-2025'
const PLAYERS = ['Diogo', 'Sara']
const SESSION_SIZE = 15
const ONBOARDING_SIZE = 50
const TARGET_MIN = 6
const TARGET_MAX = 8

const CATEGORY_COLORS = {
  Ensopado:    { accent: '#f59e0b', bg: '#2a1f00' },
  Sopa:        { accent: '#22c55e', bg: '#0a2010' },
  Peixe:       { accent: '#38bdf8', bg: '#0c2233' },
  Carne:       { accent: '#f87171', bg: '#2a1010' },
  Vegetariano: { accent: '#a78bfa', bg: '#1a1030' },
  Massa:       { accent: '#fb923c', bg: '#2a1500' },
}
const DEFAULT_COLORS = { accent: '#e8dcc8', bg: '#1a1a1a' }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase()
}

function categoryColors(tipo) {
  return CATEGORY_COLORS[tipo] || DEFAULT_COLORS
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight: '100dvh',
    background: '#080808',
    color: '#e8dcc8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    width: '100%',
    maxWidth: '420px',
    padding: '24px 20px',
    minHeight: '100dvh',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    textAlign: 'center',
  },
  btn: (variant = 'primary') => ({
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    width: '100%',
    background: variant === 'primary' ? '#e8dcc8' : '#1e1e1e',
    color: variant === 'primary' ? '#080808' : '#e8dcc8',
    transition: 'opacity 0.15s',
  }),
  btnSmall: (variant = 'primary') => ({
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    background: variant === 'primary' ? '#e8dcc8' : '#1e1e1e',
    color: variant === 'primary' ? '#080808' : '#e8dcc8',
  }),
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1.5px solid #333',
    background: '#111',
    color: '#e8dcc8',
    fontSize: '18px',
    width: '100%',
    textAlign: 'center',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    outline: 'none',
  },
  card: (tipo) => {
    const c = categoryColors(tipo)
    return {
      width: '100%',
      maxWidth: '380px',
      background: c.bg,
      borderRadius: '20px',
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      border: `1.5px solid ${c.accent}22`,
      userSelect: 'none',
      touchAction: 'none',
    }
  },
  badge: (tipo) => {
    const c = categoryColors(tipo)
    return {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: c.accent + '22',
      color: c.accent,
      alignSelf: 'flex-start',
    }
  },
  progressBar: (pct) => ({
    width: '100%',
    maxWidth: '380px',
    height: '4px',
    background: '#222',
    borderRadius: '2px',
    overflow: 'hidden',
  }),
  progressFill: (pct) => ({
    height: '100%',
    width: `${pct * 100}%`,
    background: '#e8dcc8',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  }),
  row: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '380px',
  },
  code: {
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '6px',
    color: '#e8dcc8',
    background: '#111',
    padding: '16px 24px',
    borderRadius: '12px',
    border: '1.5px solid #333',
    textAlign: 'center',
    width: '100%',
  },
  divider: {
    width: '100%',
    maxWidth: '380px',
    height: '1px',
    background: '#222',
    margin: '4px 0',
  },
  matchCard: (tipo) => {
    const c = categoryColors(tipo)
    return {
      width: '100%',
      background: c.bg,
      borderRadius: '14px',
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      border: `1px solid ${c.accent}33`,
    }
  },
  ingredientItem: {
    padding: '8px 14px',
    borderRadius: '8px',
    background: '#111',
    fontSize: '14px',
    color: '#e8dcc8',
  },
  ingredientsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    width: '100%',
  },
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={S.center}>
      <div style={{ fontSize: '40px' }}>🍳</div>
      <div style={S.title}>Receitas da Quinzena</div>
      <div style={{ ...S.subtitle, marginTop: '8px' }}>A carregar…</div>
    </div>
  )
}

function SetupScreen({ onReady }) {
  const [step, setStep] = useState('player') // 'player' | 'action' | 'join' | 'create' | 'waiting'
  const [player, setPlayer] = useState(null)
  const [isDiscovery, setIsDiscovery] = useState(false)
  const [code, setCode] = useState('')
  const [sessionCode, setSessionCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const newCode = generateCode()
      const size = isDiscovery ? ONBOARDING_SIZE : SESSION_SIZE

      // Get never_again recipe ids
      const { data: neverData } = await supabase
        .from('never_again')
        .select('recipe_id')
        .eq('household_id', HOUSEHOLD_ID)
      const excluded = (neverData || []).map(r => r.recipe_id)

      // Pick random recipes
      let query = supabase
        .from('recipes')
        .select('id')
        .limit(size * 3)
      if (excluded.length > 0) {
        query = query.not('id', 'in', `(${excluded.join(',')})`)
      }
      const { data: recipePool } = await query

      const shuffled = (recipePool || []).sort(() => Math.random() - 0.5).slice(0, size)
      const recipeIds = shuffled.map(r => r.id)

      const { data: session, error: err } = await supabase
        .from('sessions')
        .insert({
          id: newCode,
          household_id: HOUSEHOLD_ID,
          recipe_ids: recipeIds,
          completed_by: [],
          fortnightly: !isDiscovery,
        })
        .select()
        .single()

      if (err) throw err
      setSessionCode(newCode)
      setStep('create')
      // Store for joining
      window._pendingSession = { session, player, size }
    } catch (e) {
      setError('Erro ao criar sessão. Tenta outra vez.')
    }
    setLoading(false)
  }

  async function handleJoin() {
    if (code.length !== 5) {
      setError('O código tem 5 caracteres.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data: session, error: err } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', code.toUpperCase())
        .single()
      if (err || !session) throw new Error('not found')

      const size = session.recipe_ids.length
      const { data: recipes, error: rerr } = await supabase
        .from('recipes')
        .select('*')
        .in('id', session.recipe_ids)
      if (rerr) throw rerr

      // Sort recipes to match recipe_ids order
      const ordered = session.recipe_ids.map(id => recipes.find(r => r.id === id)).filter(Boolean)
      onReady({ player, session, recipes: ordered })
    } catch (e) {
      setError('Sessão não encontrada. Verifica o código.')
    }
    setLoading(false)
  }

  async function handleStartFromCreate() {
    const { session, player: p, size } = window._pendingSession
    const { data: recipes, error: rerr } = await supabase
      .from('recipes')
      .select('*')
      .in('id', session.recipe_ids)
    if (rerr) { setError('Erro ao carregar receitas.'); return }
    const ordered = session.recipe_ids.map(id => recipes.find(r => r.id === id)).filter(Boolean)
    onReady({ player: p, session, recipes: ordered })
  }

  if (step === 'player') {
    return (
      <div style={S.center}>
        <div style={{ fontSize: '32px' }}>👋</div>
        <div style={S.title}>Quem és tu?</div>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '380px' }}>
          {PLAYERS.map(p => (
            <button key={p} style={{ ...S.btn('secondary'), flex: 1, fontSize: '18px', padding: '18px' }}
              onClick={() => { setPlayer(p); setStep('action') }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step === 'action') {
    return (
      <div style={S.center}>
        <div style={S.title}>Olá, {player}!</div>
        <div style={S.divider} />
        <button style={S.btn('primary')} onClick={() => setStep('joinForm')}>
          Entrar numa sessão
        </button>
        <button style={S.btn('secondary')} onClick={() => setStep('createOptions')}>
          Criar nova sessão
        </button>
        <button style={{ ...S.btnSmall('secondary'), color: '#666', background: 'none', border: 'none' }}
          onClick={() => setStep('player')}>
          ← Voltar
        </button>
      </div>
    )
  }

  if (step === 'joinForm') {
    return (
      <div style={S.center}>
        <div style={S.title}>Entrar na sessão</div>
        <div style={S.subtitle}>Pede o código ao teu parceiro</div>
        <input
          style={S.input}
          placeholder="XXXXX"
          maxLength={5}
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
          autoCapitalize="characters"
          autoCorrect="off"
        />
        {error && <div style={{ color: '#f87171', fontSize: '14px' }}>{error}</div>}
        <button style={S.btn('primary')} onClick={handleJoin} disabled={loading}>
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
        <button style={{ ...S.btnSmall('secondary'), background: 'none', border: 'none', color: '#666' }}
          onClick={() => { setStep('action'); setError('') }}>
          ← Voltar
        </button>
      </div>
    )
  }

  if (step === 'createOptions') {
    return (
      <div style={S.center}>
        <div style={S.title}>Nova sessão</div>
        <div style={{
          width: '100%',
          maxWidth: '380px',
          background: '#111',
          borderRadius: '14px',
          padding: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          border: '1px solid #333',
        }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>Sessão de Descoberta</div>
            <div style={{ color: '#666', fontSize: '13px', marginTop: '2px' }}>{ONBOARDING_SIZE} receitas</div>
          </div>
          <div
            onClick={() => setIsDiscovery(!isDiscovery)}
            style={{
              width: '48px',
              height: '28px',
              borderRadius: '14px',
              background: isDiscovery ? '#e8dcc8' : '#333',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}>
            <div style={{
              position: 'absolute',
              top: '3px',
              left: isDiscovery ? '23px' : '3px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: isDiscovery ? '#080808' : '#888',
              transition: 'left 0.2s',
            }} />
          </div>
        </div>
        <div style={S.subtitle}>
          {isDiscovery ? `${ONBOARDING_SIZE} receitas` : `${SESSION_SIZE} receitas`}
        </div>
        {error && <div style={{ color: '#f87171', fontSize: '14px' }}>{error}</div>}
        <button style={S.btn('primary')} onClick={handleCreate} disabled={loading}>
          {loading ? 'A criar…' : 'Criar sessão'}
        </button>
        <button style={{ ...S.btnSmall('secondary'), background: 'none', border: 'none', color: '#666' }}
          onClick={() => { setStep('action'); setError('') }}>
          ← Voltar
        </button>
      </div>
    )
  }

  if (step === 'create') {
    return (
      <div style={S.center}>
        <div style={S.title}>Sessão criada!</div>
        <div style={S.subtitle}>Partilha este código com o teu parceiro</div>
        <div style={S.code}>{sessionCode}</div>
        <div style={{ ...S.subtitle, fontSize: '12px' }}>
          O teu parceiro pode entrar agora ou depois
        </div>
        <button style={S.btn('primary')} onClick={handleStartFromCreate}>
          Começar a votar
        </button>
      </div>
    )
  }

  return null
}

function SwipeScreen({ player, session, recipes, onDone }) {
  const [index, setIndex] = useState(0)
  const [likeCount, setLikeCount] = useState(0)
  const [animating, setAnimating] = useState(null) // 'left' | 'right' | null
  const touchStart = useRef(null)
  const cardRef = useRef(null)

  const recipe = recipes[index]
  const progress = index / recipes.length

  async function submitVote(recipeId, liked) {
    await supabase.from('votes').upsert({
      recipe_id: recipeId,
      session_id: session.id,
      player,
      liked,
    }, { onConflict: 'recipe_id,session_id,player' })
  }

  async function handleVote(liked) {
    if (animating) return
    setAnimating(liked ? 'right' : 'left')
    if (liked) setLikeCount(c => c + 1)
    submitVote(recipe.id, liked) // fire-and-forget; don't block UI on network

    setTimeout(async () => {
      setAnimating(null)
      if (index + 1 >= recipes.length) {
        // Finish
        const current = session.completed_by || []
        if (!current.includes(player)) {
          await supabase.from('sessions')
            .update({ completed_by: [...current, player] })
            .eq('id', session.id)
        }
        onDone({ likeCount: likeCount + (liked ? 1 : 0) })
      } else {
        setIndex(i => i + 1)
      }
    }, 250)
  }

  async function handleNeverAgain() {
    if (animating) return
    await supabase.from('never_again').upsert({ household_id: HOUSEHOLD_ID, recipe_id: recipe.id }, { onConflict: 'household_id,recipe_id' })
    await handleVote(false)
  }

  // Touch swipe
  function onTouchStart(e) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onTouchEnd(e) {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      handleVote(dx > 0)
    }
  }

  const colors = categoryColors(recipe?.tipo)

  const cardTransform = animating === 'right'
    ? 'translateX(120%) rotate(15deg)'
    : animating === 'left'
    ? 'translateX(-120%) rotate(-15deg)'
    : 'translateX(0) rotate(0deg)'

  if (!recipe) return null

  return (
    <div style={{ ...S.center, gap: '14px' }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '13px', color: '#666' }}>{player}</div>
        <div style={{ fontSize: '13px', color: '#666' }}>{index + 1} / {recipes.length}</div>
      </div>

      {/* Progress */}
      <div style={S.progressBar(progress)}>
        <div style={S.progressFill(progress)} />
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        style={{
          ...S.card(recipe.tipo),
          transform: cardTransform,
          transition: animating ? 'transform 0.25s ease-in' : 'none',
          minHeight: '240px',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div style={S.badge(recipe.tipo)}>{recipe.tipo}</div>
        <div style={{ fontSize: '22px', fontWeight: '700', lineHeight: 1.2, color: '#e8dcc8' }}>
          {recipe.name}
        </div>
        {recipe.description && (
          <div style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.4 }}>
            {recipe.description}
          </div>
        )}
        <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '13px', color: '#888' }}>
          {recipe.complexity && (
            <span>{'⭐'.repeat(Math.min(Number(recipe.complexity) || 1, 5))}</span>
          )}
          {recipe.serves && <span>👤 {recipe.serves}</span>}
        </div>
      </div>

      {/* Swipe hint */}
      <div style={{ fontSize: '12px', color: '#444' }}>← desliza para votar →</div>

      {/* Buttons */}
      <div style={S.row}>
        <button
          style={{
            ...S.btn('secondary'),
            flex: 1,
            fontSize: '24px',
            padding: '14px',
            borderRadius: '14px',
          }}
          onClick={() => handleVote(false)}
        >
          👎
        </button>
        <button
          style={{
            ...S.btn('primary'),
            flex: 1,
            fontSize: '24px',
            padding: '14px',
            borderRadius: '14px',
          }}
          onClick={() => handleVote(true)}
        >
          👍
        </button>
      </div>

      {/* Never again */}
      <button
        style={{
          background: 'none',
          border: 'none',
          color: '#444',
          fontSize: '12px',
          cursor: 'pointer',
          padding: '4px 8px',
        }}
        onClick={handleNeverAgain}
      >
        🚫 Nunca mais
      </button>
    </div>
  )
}

function ResultsScreen({ player, session, likeCount, onMatches }) {
  const [waiting, setWaiting] = useState(true)
  const [otherDone, setOtherDone] = useState(false)
  const otherPlayer = PLAYERS.find(p => p !== player)

  useEffect(() => {
    // Check if other player already done
    const completed = session.completed_by || []
    if (completed.includes(otherPlayer)) {
      setWaiting(false)
      loadAndGoToMatches()
      return
    }

    // Subscribe to session changes
    const channel = supabase
      .channel(`session-${session.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${session.id}`,
      }, (payload) => {
        const updated = payload.new
        if ((updated.completed_by || []).includes(otherPlayer)) {
          setWaiting(false)
          setOtherDone(true)
          loadAndGoToMatches()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadAndGoToMatches() {
    // Get all liked votes for this session
    const { data: votes } = await supabase
      .from('votes')
      .select('recipe_id, player, liked')
      .eq('session_id', session.id)
      .eq('liked', true)

    // Group by recipe_id
    const byRecipe = {}
    for (const v of (votes || [])) {
      if (!byRecipe[v.recipe_id]) byRecipe[v.recipe_id] = new Set()
      byRecipe[v.recipe_id].add(v.player)
    }
    const matchIds = Object.entries(byRecipe)
      .filter(([, players]) => players.size === 2)
      .map(([id]) => Number(id))

    if (matchIds.length === 0) {
      onMatches([])
      return
    }

    const { data: matchRecipes } = await supabase
      .from('recipes')
      .select('*')
      .in('id', matchIds)

    onMatches(matchRecipes || [])
  }

  return (
    <div style={S.center}>
      <div style={{ fontSize: '40px' }}>🎉</div>
      <div style={S.title}>Terminaste!</div>
      <div style={S.subtitle}>Gostaste de {likeCount} {likeCount === 1 ? 'receita' : 'receitas'}</div>
      <div style={S.divider} />
      {waiting ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <div style={S.subtitle}>À espera de {otherPlayer}…</div>
          <div style={{ ...S.subtitle, fontSize: '12px', marginTop: '8px' }}>
            Assim que {otherPlayer} acabar, os matches aparecem aqui.
          </div>
        </div>
      ) : (
        <div style={S.subtitle}>A carregar matches…</div>
      )}
    </div>
  )
}

function MatchScreen({ matches, session }) {
  const [showList, setShowList] = useState(false)

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

  if (matches.length === 0) {
    return (
      <div style={S.center}>
        <div style={{ fontSize: '40px' }}>😅</div>
        <div style={S.title}>Nenhuma receita em comum</div>
        <div style={S.subtitle}>Experimenta criar uma nova sessão e votar outra vez!</div>
        <button style={{ ...S.btn('secondary'), marginTop: '16px' }}
          onClick={() => window.location.reload()}>
          Nova sessão
        </button>
      </div>
    )
  }

  return (
    <div style={{
      ...S.center,
      justifyContent: 'flex-start',
      paddingTop: '32px',
      paddingBottom: '32px',
      overflowY: 'auto',
      minHeight: '100dvh',
    }}>
      <div style={{ fontSize: '32px' }}>✨</div>
      <div style={S.title}>{matches.length} {matches.length === 1 ? 'match' : 'matches'}!</div>
      <div style={S.subtitle}>
        {matches.length >= TARGET_MIN
          ? `Plano para a quinzena`
          : `Precisas de pelo menos ${TARGET_MIN} para um bom plano`}
      </div>

      <div style={S.divider} />

      {/* Match list */}
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {matches.map(r => {
          const c = categoryColors(r.tipo)
          return (
            <div key={r.id} style={S.matchCard(r.tipo)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>{r.name}</div>
                <div style={{ ...S.badge(r.tipo), marginTop: '6px', fontSize: '11px' }}>{r.tipo}</div>
              </div>
              {r.recipe_url && (
                <a href={r.recipe_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: c.accent, fontSize: '12px', textDecoration: 'none', flexShrink: 0 }}>
                  Ver →
                </a>
              )}
            </div>
          )
        })}
      </div>

      <div style={S.divider} />

      {/* Shopping list toggle */}
      <button style={S.btn('secondary')} onClick={() => setShowList(v => !v)}>
        {showList ? 'Esconder lista' : '🛒 Lista de compras'}
      </button>

      {showList && (
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px', textAlign: 'center' }}>
            Os ingredientes exactos estão em cada receita
          </div>
          <div style={S.ingredientsGrid}>
            {shoppingList.map(([ing, count]) => (
              <div key={ing} style={S.ingredientItem}>
                {count > 1 && <span style={{ color: '#666', marginRight: '6px' }}>×{count}</span>}
                {ing}
              </div>
            ))}
          </div>
        </div>
      )}

      <button style={{ ...S.btn('secondary'), marginTop: '16px' }}
        onClick={() => window.location.reload()}>
        Nova sessão
      </button>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('loading')
  const [player, setPlayer] = useState(null)
  const [session, setSession] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [likeCount, setLikeCount] = useState(0)
  const [matches, setMatches] = useState([])

  useEffect(() => {
    // Brief loading then go to setup
    const t = setTimeout(() => setScreen('setup'), 600)
    return () => clearTimeout(t)
  }, [])

  function handleReady({ player: p, session: s, recipes: r }) {
    setPlayer(p)
    setSession(s)
    setRecipes(r)
    setScreen('swipe')
  }

  function handleDone({ likeCount: lc }) {
    setLikeCount(lc)
    setScreen('results')
  }

  function handleMatches(m) {
    setMatches(m)
    setScreen('match')
  }

  return (
    <div style={S.app}>
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'setup' && <SetupScreen onReady={handleReady} />}
      {screen === 'swipe' && (
        <SwipeScreen
          player={player}
          session={session}
          recipes={recipes}
          onDone={handleDone}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          player={player}
          session={session}
          likeCount={likeCount}
          onMatches={handleMatches}
        />
      )}
      {screen === 'match' && (
        <MatchScreen
          matches={matches}
          session={session}
        />
      )}
    </div>
  )
}
