import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import './styles.css'

const ADMIN_EMAIL = 'scosta.vanessa@gmail.com'

function money(v, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(v || 0))
}

function pct(saved, target) {
  const value = target > 0 ? (Number(saved || 0) / Number(target || 0)) * 100 : 0
  return Math.min(100, Math.max(0, value))
}

function daysUntil(date) {
  return Math.max(0, Math.ceil((new Date(date) - new Date()) / 86400000))
}

function Login({ onSession }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const payload = { email, password }
      const result = mode === 'login'
        ? await supabase.auth.signInWithPassword(payload)
        : await supabase.auth.signUp(payload)
      if (result.error) throw result.error
      if (result.data?.session) onSession(result.data.session)
      setMsg(mode === 'login' ? 'Login realizado.' : 'Conta criada. Se pedir confirmação, veja seu e-mail antes de tentar entrar.')
    } catch (err) {
      setMsg(err.message || 'Erro ao processar login.')
    } finally {
      setBusy(false)
    }
  }

  if (!isSupabaseConfigured) {
    return <div className="login"><div className="card"><h2>Configuração pendente</h2><p>Faltam as variáveis do Supabase na Vercel.</p></div></div>
  }

  return <div className="login"><div className="card"><h2>Entrar na viagem ✈️</h2><p className="muted">Login individual para Vanessa, Camila e Danielle.</p>
    <div className="notice"><b>Atenção:</b> ao criar conta, use uma senha com pelo menos 6 caracteres. Se o cadastro pedir confirmação, abra o e-mail recebido antes de tentar entrar.</div>
    <div className="notice"><b>iPhone/Safari:</b> abrir pelo link principal <b>https://europa-2027.vercel.app</b>. Evitar abrir por prévia dentro do WhatsApp/Instagram.</div>
    <form onSubmit={submit}>
      <label className="field">E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label className="field">Senha<input type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} required /><small className="muted">Mínimo de 6 caracteres. Guarde a senha em local seguro.</small></label>
      <button className="btn" disabled={busy}>{busy ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
      <button className="btn secondary" type="button" style={{marginLeft:8}} onClick={()=>setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Criar conta' : 'Já tenho conta'}</button>
    </form>
    {msg && <div className="notice">{msg}</div>}
  </div></div>
}

function ClaimParticipant({ session, data, reload }) {
  const [busy, setBusy] = useState(false)
  const available = data.participants.filter(p => !p.profile_id || p.profile_id === session.user.id)

  async function claim(participant) {
    setBusy(true)
    const { error } = await supabase
      .from('participants')
      .update({ profile_id: session.user.id, email: session.user.email })
      .eq('id', participant.id)
    setBusy(false)
    if (error) return alert(error.message)
    await reload()
  }

  return <main className="main wrap"><section className="grid"><div className="card"><h2>Vincular sua conta</h2><p className="muted">Escolha quem é você na viagem. Cada conta fica vinculada a uma participante.</p><div className="navCards">{available.map(p=><div className="mini" key={p.id}><h3>{p.name}</h3><p className="muted">Cofrinho individual e histórico próprio.</p><button className="btn" disabled={busy} onClick={()=>claim(p)}>Sou eu</button></div>)}</div>{available.length === 0 && <div className="error">Todas as participantes já estão vinculadas. Peça para a administradora revisar no Supabase.</div>}</div></section></main>
}

function useData(session) {
  const [data, setData] = useState({ loading: true, profile: null, participants: [], goals: [], savings: [], expenses: [], shares: [], alerts: [], checklist: [], currencies: [], error: '' })

  async function ensureProfile() {
    if (!session?.user) return null
    const email = session.user.email || ''
    const role = email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'traveler'
    await supabase.from('profiles').upsert({
      id: session.user.id,
      email,
      full_name: email.split('@')[0] || 'Participante',
      nickname: email.split('@')[0] || 'Participante',
      role
    }, { onConflict: 'id' })
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
    return profile
  }

  async function load() {
    if (!session) return setData(d => ({ ...d, loading: false }))
    setData(d => ({ ...d, loading: true, error: '' }))
    try {
      const profile = await ensureProfile()
      const tables = ['participants','savings_goals','savings_entries','expenses','expense_shares','alerts','checklist_items','currency_targets']
      const res = await Promise.all(tables.map(t => supabase.from(t).select('*')))
      const err = res.find(r => r.error)?.error
      if (err) throw err
      setData({
        loading:false,
        error:'',
        profile,
        participants:res[0].data || [],
        goals:res[1].data || [],
        savings:res[2].data || [],
        expenses:res[3].data || [],
        shares:res[4].data || [],
        alerts:res[5].data || [],
        checklist:res[6].data || [],
        currencies:res[7].data || []
      })
    } catch (e) {
      setData(d => ({ ...d, loading:false, error:e.message || 'Erro ao carregar dados' }))
    }
  }

  useEffect(()=>{ load() }, [session?.user?.id])
  return { ...data, reload: load }
}

function getParticipantStats(data, participant) {
  const goal = data.goals.find(g => g.participant_id === participant.id)
  const target = Number(goal?.target_total_brl || 10220)
  const monthly = Number(goal?.monthly_target_brl || 600)
  const saved = data.savings.filter(s => s.participant_id === participant.id).reduce((sum, s) => sum + Number(s.amount_brl || 0), 0)
  const pending = Math.max(target - saved, 0)
  const progress = pct(saved, target)
  return { goal, target, monthly, saved, pending, progress }
}

function ProgressBar({ value }) {
  return <div style={{height:10, background:'#e5e7eb', borderRadius:999, overflow:'hidden'}}><div style={{height:'100%', width:`${value}%`, background:'#0f766e'}} /></div>
}

function Dashboard({ data, visibleParticipants, isAdmin }) {
  const stats = visibleParticipants.map(p => ({ participant:p, ...getParticipantStats(data, p) }))
  const groupTarget = stats.reduce((s, x) => s + x.target, 0)
  const groupSaved = stats.reduce((s, x) => s + x.saved, 0)
  const groupPending = Math.max(groupTarget - groupSaved, 0)
  return <section className="grid"><div className="card wide"><h2>Dashboard</h2><p className="muted">{isAdmin ? 'Visão administradora: grupo + cofrinhos individuais.' : 'Sua visão individual: seu cofrinho e dados compartilhados.'}</p><div className="navCards"><div className="mini"><b>Faltam</b><div className="big">{daysUntil('2027-10-08T20:00')}</div><span>dias</span></div><div className="mini"><b>Meta exibida</b><div className="money">{money(groupTarget)}</div></div><div className="mini"><b>Guardado</b><div className="money">{money(groupSaved)}</div></div><div className="mini"><b>Pendente</b><div className="money">{money(groupPending)}</div></div></div></div>{stats.map(x=><div className="card third" key={x.participant.id}><h2>{x.participant.name}</h2><p className="muted">Meta mensal: {money(x.monthly)}</p><p><b>Meta:</b> {money(x.target)}<br/><b>Guardado:</b> {money(x.saved)}<br/><b>Pendente:</b> {money(x.pending)}</p><ProgressBar value={x.progress}/><p className="muted">{x.progress.toFixed(1)}% concluído</p></div>)}<div className="card third"><h2>Próximos alertas</h2>{data.alerts.slice(0,5).map(a=><p key={a.id}><b>{a.title}</b><br/><span className="muted">{a.alert_type}</span></p>)}</div></section>
}

function Savings({ data, reload, visibleParticipants, isAdmin, myParticipant }) {
  const defaultParticipant = isAdmin ? '' : myParticipant?.id || ''
  const [participantId, setParticipantId] = useState(defaultParticipant)
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0,10))
  const [amount, setAmount] = useState('600')
  const [notes, setNotes] = useState('')
  const [editing, setEditing] = useState(null)
  const [editDraft, setEditDraft] = useState({ participant_id:'', entry_date:'', amount_brl:'', notes:'' })

  useEffect(()=>{ if (!isAdmin && myParticipant?.id) setParticipantId(myParticipant.id) }, [isAdmin, myParticipant?.id])

  const visibleIds = visibleParticipants.map(p => p.id)
  const visibleSavings = data.savings.filter(s => visibleIds.includes(s.participant_id)).sort((a,b)=>String(b.entry_date).localeCompare(String(a.entry_date)))

  async function add(e) {
    e.preventDefault()
    const pid = isAdmin ? participantId : myParticipant?.id
    if (!pid) return alert('Escolha uma pessoa')
    const { error } = await supabase.from('savings_entries').insert({ participant_id: pid, entry_date: entryDate, amount_brl: Number(amount), notes })
    if (error) return alert(error.message)
    setAmount('600'); setNotes(''); await reload()
  }

  function startEdit(s) { setEditing(s.id); setEditDraft({ participant_id:s.participant_id, entry_date:s.entry_date || '', amount_brl:s.amount_brl, notes:s.notes || '' }) }
  async function saveEdit(id) {
    const pid = isAdmin ? editDraft.participant_id : myParticipant?.id
    const { error } = await supabase.from('savings_entries').update({ participant_id: pid, entry_date: editDraft.entry_date, amount_brl: Number(editDraft.amount_brl), notes: editDraft.notes }).eq('id', id)
    if (error) return alert(error.message)
    setEditing(null); await reload()
  }
  async function remove(id) { if (!confirm('Excluir este lançamento do cofrinho?')) return; const { error } = await supabase.from('savings_entries').delete().eq('id', id); if (error) alert(error.message); else reload() }

  return <section className="grid"><div className="card wide"><h2>Cofrinho individual</h2><p className="muted">Cofrinho é individual. O racha fica separado.</p><div className="navCards">{visibleParticipants.map(p=>{const s=getParticipantStats(data,p);return <div className="mini" key={p.id}><h3>{p.name}</h3><p><b>Meta:</b> {money(s.target)}<br/><b>Guardado:</b> {money(s.saved)}<br/><b>Pendente:</b> {money(s.pending)}</p><ProgressBar value={s.progress}/><p className="muted">{s.progress.toFixed(1)}%</p></div>})}</div></div><div className="card half"><h2>Novo lançamento</h2><form onSubmit={add}>{isAdmin && <label className="field">Pessoa<select value={participantId} onChange={e=>setParticipantId(e.target.value)}><option value="">Selecione</option>{visibleParticipants.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>} {!isAdmin && <div className="notice">Lançamento para: <b>{myParticipant?.name}</b></div>}<label className="field">Data<input type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} /></label><label className="field">Valor<input type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} /></label><label className="field">Observação<input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ex: Maio/2026" /></label><button className="btn">Adicionar</button></form></div><div className="card half"><h2>Histórico por participante</h2>{visibleSavings.map(s=>{const p=data.participants.find(x=>x.id===s.participant_id);return <div className="mini" key={s.id} style={{marginBottom:8}}>{editing===s.id ? <><label className="field">Pessoa<select value={editDraft.participant_id} disabled={!isAdmin} onChange={e=>setEditDraft({...editDraft, participant_id:e.target.value})}>{visibleParticipants.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="field">Data<input type="date" value={editDraft.entry_date} onChange={e=>setEditDraft({...editDraft, entry_date:e.target.value})} /></label><label className="field">Valor<input type="number" step="0.01" value={editDraft.amount_brl} onChange={e=>setEditDraft({...editDraft, amount_brl:e.target.value})} /></label><label className="field">Observação<input value={editDraft.notes} onChange={e=>setEditDraft({...editDraft, notes:e.target.value})} /></label><button type="button" className="btn" onClick={()=>saveEdit(s.id)}>Salvar</button><button type="button" className="btn secondary" onClick={()=>setEditing(null)}>Cancelar</button></> : <><b>{p?.name}</b> · {s.entry_date}<br/>{money(s.amount_brl)}<br/><span className="muted">{s.notes || 'Sem observação'}</span><div className="row" style={{marginTop:8}}><button type="button" className="btn secondary" onClick={()=>startEdit(s)}>Editar</button><button type="button" className="btn danger" onClick={()=>remove(s.id)}>Excluir</button></div></>}</div>})}{visibleSavings.length === 0 && <p className="muted">Nenhum lançamento ainda.</p>}</div></section>
}

function Split({ data, reload }) {
  const [description,setDescription]=useState('')
  const [total,setTotal]=useState('')
  const [currency,setCurrency]=useState('EUR')
  const [paidBy,setPaidBy]=useState('')
  const [selected,setSelected]=useState([])
  const [editing,setEditing]=useState(null)
  const [editDescription,setEditDescription]=useState('')
  const [editTotal,setEditTotal]=useState('')
  const [editCurrency,setEditCurrency]=useState('EUR')
  const [editPaidBy,setEditPaidBy]=useState('')
  async function add(e){e.preventDefault(); if(!description||!total||!paidBy||!selected.length) return alert('Preencha tudo'); const {data:exp,error}=await supabase.from('expenses').insert({description,total_amount:Number(total),currency,paid_by:paidBy,split_type:'equal'}).select().single(); if(error)return alert(error.message); const share=Number(total)/selected.length; const {error:e2}=await supabase.from('expense_shares').insert(selected.map(id=>({expense_id:exp.id,participant_id:id,share_amount:share}))); if(e2) alert(e2.message); else {setDescription('');setTotal('');setSelected([]);reload()}}
  const balances=useMemo(()=>{const m={};data.participants.forEach(p=>m[p.id]={name:p.name,paid:0,used:0});data.expenses.forEach(e=>{if(m[e.paid_by])m[e.paid_by].paid+=Number(e.total_amount||0)});data.shares.forEach(s=>{if(m[s.participant_id])m[s.participant_id].used+=Number(s.share_amount||0)});return Object.values(m).map(x=>({...x,balance:x.paid-x.used}))},[data])
  function startExpenseEdit(e){ setEditing(e.id); setEditDescription(e.description); setEditTotal(e.total_amount); setEditCurrency(e.currency); setEditPaidBy(e.paid_by) }
  async function saveExpense(id){ const { error } = await supabase.from('expenses').update({ description: editDescription, total_amount: Number(editTotal), currency: editCurrency, paid_by: editPaidBy }).eq('id', id); if(error) alert(error.message); else { setEditing(null); reload() } }
  async function deleteExpense(id){ if(!confirm('Excluir esta despesa e suas divisões?')) return; const { error } = await supabase.from('expenses').delete().eq('id', id); if(error) alert(error.message); else reload() }
  return <section className="grid"><div className="card wide"><h2>Racha da viagem</h2><p className="muted">Despesa compartilhada. Não mistura com cofrinho individual.</p><form className="expenseForm" onSubmit={add}><input placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)}/><input placeholder="Valor" type="number" value={total} onChange={e=>setTotal(e.target.value)}/><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>EUR</option><option>CHF</option><option>GBP</option><option>BRL</option></select><select value={paidBy} onChange={e=>setPaidBy(e.target.value)}><option value="">Quem pagou?</option>{data.participants.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><div className="splitBox">{data.participants.map(p=><label className="checkbox" key={p.id}><input type="checkbox" checked={selected.includes(p.id)} onChange={e=>setSelected(e.target.checked?[...selected,p.id]:selected.filter(id=>id!==p.id))}/>{p.name}</label>)}</div><button className="btn">Adicionar</button></form></div><div className="card third"><h2>Saldos</h2>{balances.map(b=><p key={b.name}>{b.name}: <b>{b.balance.toFixed(2)}</b></p>)}</div><div className="card"><h2>Despesas</h2>{data.expenses.map(e=>{const p=data.participants.find(x=>x.id===e.paid_by);return <div className="mini" key={e.id} style={{marginBottom:8}}>{editing===e.id ? <><label className="field">Descrição<input value={editDescription} onChange={ev=>setEditDescription(ev.target.value)} /></label><label className="field">Valor<input type="number" value={editTotal} onChange={ev=>setEditTotal(ev.target.value)} /></label><label className="field">Moeda<select value={editCurrency} onChange={ev=>setEditCurrency(ev.target.value)}><option>EUR</option><option>CHF</option><option>GBP</option><option>BRL</option></select></label><label className="field">Quem pagou<select value={editPaidBy} onChange={ev=>setEditPaidBy(ev.target.value)}>{data.participants.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button type="button" className="btn" onClick={()=>saveExpense(e.id)}>Salvar</button><button type="button" className="btn secondary" onClick={()=>setEditing(null)}>Cancelar</button></> : <><b>{e.description}</b>: {money(e.total_amount,e.currency)}<br/><span className="muted">Pago por: {p?.name || '-'}</span><div className="row" style={{marginTop:8}}><button type="button" className="btn secondary" onClick={()=>startExpenseEdit(e)}>Editar</button><button type="button" className="btn danger" onClick={()=>deleteExpense(e.id)}>Excluir</button></div></>}</div>})}</div></section>
}

function Checklist({ data, reload, visibleParticipants, isAdmin, myParticipant }) {
  const visibleIds = visibleParticipants.map(p=>p.id)
  const items = data.checklist.filter(i => isAdmin || !i.assigned_to || visibleIds.includes(i.assigned_to))
  async function toggle(item) { const { error } = await supabase.from('checklist_items').update({ completed: !item.completed, completed_at: !item.completed ? new Date().toISOString() : null }).eq('id', item.id); if(error) alert(error.message); else reload() }
  return <section className="grid"><div className="card"><h2>Checklist</h2>{items.map(i=><label className="checkbox" key={i.id}><input type="checkbox" checked={i.completed} onChange={()=>toggle(i)}/><span><b>{i.title}</b><br/><span className="muted">{i.category || 'geral'} · {i.due_date || 'sem prazo'}</span></span></label>)}</div></section>
}

function SimpleList({ title, items, render }) { return <section className="grid"><div className="card"><h2>{title}</h2>{items.map(render)}</div></section> }

function App(){
  const [session,setSession]=useState(null)
  const [tab,setTab]=useState('dashboard')
  useEffect(()=>{ if(!supabase)return; supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>sub.subscription.unsubscribe() },[])
  const data=useData(session)
  const isAdmin = Boolean(session?.user?.email?.toLowerCase() === ADMIN_EMAIL || data.profile?.role === 'admin')
  const myParticipant = data.participants.find(p => p.profile_id === session?.user?.id)
  const visibleParticipants = isAdmin ? data.participants : (myParticipant ? [myParticipant] : [])
  const tabs=[['dashboard','Dashboard'],['savings','Cofrinho'],['split','Racha'],['alerts','Alertas'],['checklist','Checklist'],['currencies','Moedas']]
  if(!session)return <div className="app"><div className="hero"><div className="wrap"><div className="brand"><h1>Europa até Liverpool 2027</h1><p>Login por e-mail e senha. Cofrinho individual. Racha compartilhado.</p></div></div></div><Login onSession={setSession}/></div>
  if(data.loading)return <div className="app"><div className="loading">Carregando...</div></div>
  if(data.error)return <div className="app"><div className="error">{data.error}</div></div>
  if(!isAdmin && !myParticipant)return <div className="app"><header className="hero"><div className="wrap"><div className="topbar"><div className="brand"><h1>Europa até Liverpool 2027</h1><p>Vincule sua conta a uma participante.</p></div><button className="btn secondary" onClick={()=>supabase.auth.signOut()}>Sair</button></div></div></header><ClaimParticipant session={session} data={data} reload={data.reload}/></div>
  return <div className="app"><header className="hero"><div className="wrap"><div className="topbar"><div className="brand"><h1>Europa até Liverpool 2027</h1><p>{isAdmin ? 'Modo administradora' : `Conta vinculada: ${myParticipant?.name}`}</p></div><button className="btn secondary" onClick={()=>supabase.auth.signOut()}>Sair</button></div><div className="tabs">{tabs.map(([id,label])=><button key={id} className={'tab '+(tab===id?'active':'')} onClick={()=>setTab(id)}>{label}</button>)}</div></div></header><main className="main wrap">{tab==='dashboard'&&<Dashboard data={data} visibleParticipants={visibleParticipants} isAdmin={isAdmin}/>} {tab==='savings'&&<Savings data={data} reload={data.reload} visibleParticipants={visibleParticipants} isAdmin={isAdmin} myParticipant={myParticipant}/>} {tab==='split'&&<Split data={data} reload={data.reload}/>} {tab==='alerts'&&<SimpleList title="Alertas" items={data.alerts} render={a=><p key={a.id}><b>{a.title}</b><br/><span className="muted">{a.message}</span></p>}/>} {tab==='checklist'&&<Checklist data={data} reload={data.reload} visibleParticipants={visibleParticipants} isAdmin={isAdmin} myParticipant={myParticipant}/>} {tab==='currencies'&&<SimpleList title="Moedas" items={data.currencies} render={c=><p key={c.id}><b>{c.currency}</b> · comprar pouco abaixo de R$ {c.buy_some_below_brl}</p>}/>}</main><p className="footer">Vanessa, Camila e Danielle · Europa 2027</p></div>
}

createRoot(document.getElementById('root')).render(<App />)
