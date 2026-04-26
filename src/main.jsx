import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import './styles.css'
import { Plane, Train, Wallet, Bell, ListChecks, Receipt, Hotel, Coins, LogOut } from 'lucide-react'

const PARTICIPANTS_FALLBACK = [
  { id: 'vanessa', name: 'Vanessa', color: '#38bdf8' },
  { id: 'camila', name: 'Camila', color: '#facc15' },
  { id: 'danielle', name: 'Danielle', color: '#22c55e' },
]

function formatMoney(value, currency = 'BRL') {
  const locale = currency === 'BRL' ? 'pt-BR' : 'pt-BR'
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(value || 0))
}

function daysUntil(date) {
  const target = new Date(date)
  const now = new Date()
  return Math.max(0, Math.ceil((target - now) / 86400000))
}

function useSupabaseData(session) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [participants, setParticipants] = useState([])
  const [goals, setGoals] = useState([])
  const [savings, setSavings] = useState([])
  const [expenses, setExpenses] = useState([])
  const [shares, setShares] = useState([])
  const [alerts, setAlerts] = useState([])
  const [checklist, setChecklist] = useState([])
  const [tickets, setTickets] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [currencies, setCurrencies] = useState([])

  async function load() {
    if (!isSupabaseConfigured || !session) {
      setParticipants(PARTICIPANTS_FALLBACK)
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const queries = await Promise.all([
        supabase.from('participants').select('*').order('name'),
        supabase.from('savings_goals').select('*'),
        supabase.from('savings_entries').select('*').order('entry_date', { ascending: false }),
        supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
        supabase.from('expense_shares').select('*'),
        supabase.from('alerts').select('*').order('target_date'),
        supabase.from('checklist_items').select('*').order('due_date'),
        supabase.from('tickets').select('*').order('departure_at'),
        supabase.from('accommodations').select('*').order('checkin_date'),
        supabase.from('currency_targets').select('*').order('currency'),
      ])
      const err = queries.find(q => q.error)?.error
      if (err) throw err
      setParticipants(queries[0].data || [])
      setGoals(queries[1].data || [])
      setSavings(queries[2].data || [])
      setExpenses(queries[3].data || [])
      setShares(queries[4].data || [])
      setAlerts(queries[5].data || [])
      setChecklist(queries[6].data || [])
      setTickets(queries[7].data || [])
      setAccommodations(queries[8].data || [])
      setCurrencies(queries[9].data || [])
    } catch (e) {
      setError(e.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [session?.user?.id])

  return { loading, error, participants, goals, savings, expenses, shares, alerts, checklist, tickets, accommodations, currencies, reload: load }
}

function Login({ onSession }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMessage('')
    try {
      const fn = mode === 'login' ? supabase.auth.signInWithPassword : supabase.auth.signUp
      const { data, error } = await fn({ email, password })
      if (error) throw error
      setMessage(mode === 'login' ? 'Login realizado.' : 'Cadastro criado. Confirme o e-mail se o Supabase pedir.')
      if (data.session) onSession(data.session)
    } catch (err) { setMessage(err.message) }
    finally { setBusy(false) }
  }

  if (!isSupabaseConfigured) {
    return <div className="login"><div className="card"><h2>Configuração pendente</h2><p>O app React já está pronto, mas precisa das variáveis do Supabase na Vercel.</p><div className="notice"><b>Variáveis:</b><br/>VITE_SUPABASE_URL<br/>VITE_SUPABASE_ANON_KEY</div></div></div>
  }

  return <div className="login"><div className="card"><h2>Entrar na viagem ✈️</h2><p className="muted">Login individual para Vanessa, Camila e Danielle.</p><form onSubmit={submit}><label className="field">E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label className="field">Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><button className="btn" disabled={busy}>{busy ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar cadastro'}</button><button type="button" className="btn secondary" style={{marginLeft:8}} onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Criar conta':'Já tenho conta'}</button></form>{message && <div className="notice">{message}</div>}</div></div>
}

function Dashboard({ data }) {
  const totalSaved = data.savings.reduce((s, e) => s + Number(e.amount_brl || 0), 0)
  const target = data.goals.reduce((s, g) => s + Number(g.target_total_brl || 0), 0) || 30660
  const tripDays = daysUntil('2027-10-08T20:00:00')
  const nextAlerts = data.alerts.slice(0, 4)
  return <section className="grid"><div className="card wide"><h2>Dashboard da viagem</h2><p className="muted">Guia + controle + preparação para alertas. Agora o banco está vivo.</p><div className="navCards"><div className="mini"><b>Faltam</b><div className="big">{tripDays}</div><span>dias</span></div><div className="mini"><b>Meta grupo</b><div className="money">{formatMoney(target)}</div></div><div className="mini"><b>Guardado</b><div className="money">{formatMoney(totalSaved)}</div></div><div className="mini"><b>Pendente</b><div className="money">{formatMoney(Math.max(target-totalSaved,0))}</div></div></div></div><div className="card third"><h2>Próximos alertas</h2>{nextAlerts.map(a=><p key={a.id}><span className="status warn">{a.alert_type}</span><br/>{a.title}</p>)}{!nextAlerts.length && <p className="muted">Sem alertas cadastrados.</p>}</div><div className="card third"><h2>Participantes</h2>{data.participants.map(p=><p key={p.id}><span className="pill" style={{background:p.color+'22', color:'#172033'}}>{p.name}</span></p>)}</div><div className="card third"><h2>Rota</h2><p>Milão → Tirano → St. Moritz → Basel → Amsterdam → Bruxelas → Londres → Liverpool</p></div></section>
}

function Savings({ data, reload }) {
  const [participantId, setParticipantId] = useState('')
  const [amount, setAmount] = useState('600')
  const [notes, setNotes] = useState('')

  async function addEntry(e) {
    e.preventDefault()
    if (!participantId) return alert('Escolha uma pessoa')
    const { error } = await supabase.from('savings_entries').insert({ participant_id: participantId, amount_brl: Number(amount), notes })
    if (error) return alert(error.message)
    setNotes(''); setAmount('600'); await reload()
  }

  const rows = data.participants.map(p => {
    const goal = data.goals.find(g => g.participant_id === p.id)
    const saved = data.savings.filter(e => e.participant_id === p.id).reduce((s,e)=>s+Number(e.amount_brl||0),0)
    return { p, goal, saved, pending: Math.max(Number(goal?.target_total_brl || 10220)-saved,0) }
  })

  return <section className="grid"><div className="card half"><h2>Cofrinho individual</h2><form onSubmit={addEntry}><label className="field">Pessoa<select value={participantId} onChange={e=>setParticipantId(e.target.value)}><option value="">Selecione</option>{data.participants.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="field">Valor guardado<input value={amount} onChange={e=>setAmount(e.target.value)} type="number" step="0.01" /></label><label className="field">Observação<input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ex: Maio/2026" /></label><button className="btn">Adicionar depósito</button></form></div><div className="card half"><h2>Resumo</h2><table className="table"><thead><tr><th>Pessoa</th><th>Guardado</th><th>Pendente</th></tr></thead><tbody>{rows.map(r=><tr key={r.p.id}><td>{r.p.name}</td><td>{formatMoney(r.saved)}</td><td>{formatMoney(r.pending)}</td></tr>)}</tbody></table></div><div className="card"><h2>Histórico</h2><table className="table"><thead><tr><th>Data</th><th>Pessoa</th><th>Valor</th><th>Obs.</th></tr></thead><tbody>{data.savings.map(e=>{const p=data.participants.find(p=>p.id===e.participant_id);return <tr key={e.id}><td>{e.entry_date}</td><td>{p?.name}</td><td>{formatMoney(e.amount_brl)}</td><td>{e.notes}</td></tr>})}</tbody></table></div></section>
}

function Splitwise({ data, reload }) {
  const [description, setDescription] = useState('')
  const [total, setTotal] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [paidBy, setPaidBy] = useState('')
  const [selected, setSelected] = useState([])

  async function addExpense(e) {
    e.preventDefault()
    if (!description || !total || !paidBy || selected.length === 0) return alert('Preencha despesa, valor, pagador e participantes')
    const { data: expense, error } = await supabase.from('expenses').insert({ description, total_amount: Number(total), currency, paid_by: paidBy, split_type: 'equal' }).select().single()
    if (error) return alert(error.message)
    const share = Number(total) / selected.length
    const inserts = selected.map(id => ({ expense_id: expense.id, participant_id: id, share_amount: share }))
    const { error: shareError } = await supabase.from('expense_shares').insert(inserts)
    if (shareError) return alert(shareError.message)
    setDescription(''); setTotal(''); setSelected([]); await reload()
  }

  const balances = useMemo(() => {
    const map = {}
    data.participants.forEach(p => map[p.id] = { name: p.name, paid: 0, consumed: 0, balance: 0 })
    data.expenses.forEach(e => { if (map[e.paid_by]) map[e.paid_by].paid += Number(e.total_amount||0) })
    data.shares.forEach(s => { if (map[s.participant_id]) map[s.participant_id].consumed += Number(s.share_amount||0) })
    Object.values(map).forEach(v => v.balance = v.paid - v.consumed)
    return Object.values(map)
  }, [data])

  return <section className="grid"><div className="card wide"><h2>Racha da viagem</h2><form className="expenseForm" onSubmit={addExpense}><input placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)} /><input placeholder="Valor" type="number" step="0.01" value={total} onChange={e=>setTotal(e.target.value)} /><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>EUR</option><option>CHF</option><option>GBP</option><option>BRL</option></select><select value={paidBy} onChange={e=>setPaidBy(e.target.value)}><option value="">Quem pagou?</option>{data.participants.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><div className="splitBox">{data.participants.map(p=><label className="checkbox" key={p.id}><input type="checkbox" checked={selected.includes(p.id)} onChange={e=>setSelected(e.target.checked ? [...selected,p.id] : selected.filter(id=>id!==p.id))}/>{p.name}</label>)}</div><button className="btn">Adicionar e dividir igual</button></form></div><div className="card third"><h2>Saldos</h2>{balances.map(b=><p key={b.name}><b>{b.name}</b><br/>Pagou: {b.paid.toFixed(2)} | Consumiu: {b.consumed.toFixed(2)}<br/><span className={b.balance>=0?'status ok':'status bad'}>{b.balance>=0?'Recebe':'Deve'} {Math.abs(b.balance).toFixed(2)}</span></p>)}</div><div className="card"><h2>Despesas</h2><table className="table"><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Quem pagou</th></tr></thead><tbody>{data.expenses.map(e=>{const p=data.participants.find(p=>p.id===e.paid_by);return <tr key={e.id}><td>{e.expense_date}</td><td>{e.description}</td><td>{formatMoney(e.total_amount,e.currency)}</td><td>{p?.name}</td></tr>})}</tbody></table></div></section>
}

function Alerts({ data }) { return <section className="grid"><div className="card"><h2>Alertas internos</h2><table className="table"><thead><tr><th>Tipo</th><th>Alerta</th><th>Data</th><th>Status</th></tr></thead><tbody>{data.alerts.map(a=><tr key={a.id}><td>{a.alert_type}</td><td>{a.title}<br/><span className="muted">{a.message}</span></td><td>{a.target_date ? new Date(a.target_date).toLocaleDateString('pt-BR') : '-'}</td><td><span className="status warn">{a.status}</span></td></tr>)}</tbody></table><div className="notice">Fase 3: esses alertas viram WhatsApp, e-mail ou push. Agora eles ficam controlados no app.</div></div></section> }

function Checklist({ data, reload }) {
  async function toggle(item) { const { error } = await supabase.from('checklist_items').update({ completed: !item.completed, completed_at: !item.completed ? new Date().toISOString() : null }).eq('id', item.id); if(error) alert(error.message); else reload() }
  return <section className="grid"><div className="card"><h2>Checklist</h2>{data.checklist.map(i=><label className="checkbox" key={i.id}><input type="checkbox" checked={i.completed} onChange={()=>toggle(i)}/><span><b>{i.title}</b><br/><span className="muted">{i.category} · prazo {i.due_date || '-'}</span></span></label>)}</div></section>
}

function Tickets({ data }) { return <section className="grid"><div className="card half"><h2>Passagens</h2><table className="table"><thead><tr><th>Trecho</th><th>Status</th><th>Custo</th></tr></thead><tbody>{data.tickets.map(t=><tr key={t.id}><td>{t.title}<br/><span className="muted">{t.origin} → {t.destination}</span></td><td><span className="status">{t.status}</span></td><td>{t.estimated_cost ? formatMoney(t.estimated_cost,t.currency) : '-'}</td></tr>)}</tbody></table><p className="muted">Cadastros de passagens entram na próxima melhoria da tela.</p></div><div className="card half"><h2>Hospedagens</h2><table className="table"><thead><tr><th>Cidade</th><th>Status</th><th>Custo</th></tr></thead><tbody>{data.accommodations.map(h=><tr key={h.id}><td>{h.city}<br/><span className="muted">{h.name}</span></td><td><span className="status">{h.status}</span></td><td>{h.estimated_cost ? formatMoney(h.estimated_cost,h.currency) : '-'}</td></tr>)}</tbody></table></div></section> }

function Currencies({ data }) { return <section className="grid"><div className="card"><h2>Moedas</h2><table className="table"><thead><tr><th>Moeda</th><th>Uso</th><th>Planejamento</th><th>Comprar pouco</th><th>Comprar forte</th></tr></thead><tbody>{data.currencies.map(c=><tr key={c.id}><td>{c.currency}</td><td>{c.usage_notes}</td><td>R$ {c.planning_rate_brl}</td><td>R$ {c.buy_some_below_brl}</td><td>R$ {c.buy_strong_below_brl}</td></tr>)}</tbody></table></div></section> }

function App() {
  const [session, setSession] = useState(null)
  const [tab, setTab] = useState('dashboard')
  useEffect(()=>{ if(!supabase) return; supabase.auth.getSession().then(({data})=>setSession(data.session)); const { data: sub } = supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>sub.subscription.unsubscribe() }, [])
  const data = useSupabaseData(session)
  const tabs = [ ['dashboard','Dashboard'], ['savings','Cofrinho'], ['split','Racha'], ['alerts','Alertas'], ['checklist','Checklist'], ['tickets','Passagens'], ['currencies','Moedas'] ]
  if (!session) return <div className="app"><div className="hero"><div className="wrap"><div className="brand"><h1>Europa até Liverpool 2027</h1><p>Fase 2: login, cofrinho, racha e alertas internos.</p></div></div></div><Login onSession={setSession}/></div>
  return <div className="app"><header className="hero"><div className="wrap"><div className="topbar"><div className="brand"><h1>Europa até Liverpool 2027</h1><p>App colaborativo da viagem: agora com banco Supabase.</p></div><button className="btn secondary" onClick={()=>supabase.auth.signOut()}><LogOut size={16}/> Sair</button></div><div className="tabs">{tabs.map(([id,label])=><button key={id} className={'tab '+(tab===id?'active':'')} onClick={()=>setTab(id)}>{label}</button>)}</div></div></header><main className="main wrap">{data.loading && <div className="loading">Carregando dados...</div>}{data.error && <div className="error">{data.error}</div>}{!data.loading && tab==='dashboard' && <Dashboard data={data}/>} {!data.loading && tab==='savings' && <Savings data={data} reload={data.reload}/>} {!data.loading && tab==='split' && <Splitwise data={data} reload={data.reload}/>} {!data.loading && tab==='alerts' && <Alerts data={data}/>} {!data.loading && tab==='checklist' && <Checklist data={data} reload={data.reload}/>} {!data.loading && tab==='tickets' && <Tickets data={data}/>} {!data.loading && tab==='currencies' && <Currencies data={data}/>}</main><p className="footer">Vanessa, Camila e Danielle · feito para uma viagem segura, divertida e única.</p></div>
}

createRoot(document.getElementById('root')).render(<App />)
