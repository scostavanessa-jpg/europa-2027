import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import './styles.css'

function money(v, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(v || 0))
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
      let result
      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({ email, password })
      } else {
        result = await supabase.auth.signUp({ email, password })
      }
      if (result.error) throw result.error
      if (result.data?.session) onSession(result.data.session)
      setMsg(mode === 'login' ? 'Login realizado.' : 'Conta criada. Se pedir confirmação, veja seu e-mail antes de entrar.')
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
    <form onSubmit={submit}>
      <label className="field">E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label className="field">Senha<input type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <button className="btn" disabled={busy}>{busy ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
      <button className="btn secondary" type="button" style={{marginLeft:8}} onClick={()=>setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Criar conta' : 'Já tenho conta'}</button>
    </form>
    {msg && <div className="notice">{msg}</div>}
  </div></div>
}

function useData(session) {
  const [data, setData] = useState({ loading: true, participants: [], goals: [], savings: [], expenses: [], shares: [], alerts: [], checklist: [], currencies: [], error: '' })
  async function load() {
    if (!session) return setData(d => ({ ...d, loading: false }))
    setData(d => ({ ...d, loading: true, error: '' }))
    const tables = ['participants','savings_goals','savings_entries','expenses','expense_shares','alerts','checklist_items','currency_targets']
    const res = await Promise.all(tables.map(t => supabase.from(t).select('*')))
    const err = res.find(r => r.error)?.error
    if (err) return setData(d => ({ ...d, loading: false, error: err.message }))
    setData({ loading:false, error:'', participants:res[0].data||[], goals:res[1].data||[], savings:res[2].data||[], expenses:res[3].data||[], shares:res[4].data||[], alerts:res[5].data||[], checklist:res[6].data||[], currencies:res[7].data||[] })
  }
  useEffect(()=>{ load() }, [session?.user?.id])
  return { ...data, reload: load }
}

function Dashboard({ data }) {
  const saved = data.savings.reduce((s,e)=>s+Number(e.amount_brl||0),0)
  const target = data.goals.reduce((s,g)=>s+Number(g.target_total_brl||0),0) || 30660
  return <section className="grid"><div className="card wide"><h2>Dashboard</h2><div className="navCards"><div className="mini"><b>Faltam</b><div className="big">{daysUntil('2027-10-08T20:00')}</div><span>dias</span></div><div className="mini"><b>Meta grupo</b><div className="money">{money(target)}</div></div><div className="mini"><b>Guardado</b><div className="money">{money(saved)}</div></div><div className="mini"><b>Pendente</b><div className="money">{money(Math.max(target-saved,0))}</div></div></div></div><div className="card third"><h2>Participantes</h2>{data.participants.map(p=><p key={p.id}><span className="pill">{p.name}</span></p>)}</div><div className="card third"><h2>Próximos alertas</h2>{data.alerts.slice(0,5).map(a=><p key={a.id}><b>{a.title}</b><br/><span className="muted">{a.alert_type}</span></p>)}</div></section>
}

function Savings({ data, reload }) {
  const [participantId, setParticipantId] = useState('')
  const [amount, setAmount] = useState('600')
  async function add(e) {
    e.preventDefault()
    if (!participantId) return alert('Escolha uma pessoa')
    const { error } = await supabase.from('savings_entries').insert({ participant_id: participantId, amount_brl: Number(amount) })
    if (error) alert(error.message); else reload()
  }
  return <section className="grid"><div className="card half"><h2>Cofrinho</h2><form onSubmit={add}><label className="field">Pessoa<select value={participantId} onChange={e=>setParticipantId(e.target.value)}><option value="">Selecione</option>{data.participants.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="field">Valor<input type="number" value={amount} onChange={e=>setAmount(e.target.value)} /></label><button className="btn">Adicionar</button></form></div><div className="card half"><h2>Histórico</h2>{data.savings.map(s=>{const p=data.participants.find(x=>x.id===s.participant_id);return <p key={s.id}>{p?.name}: {money(s.amount_brl)}</p>})}</div></section>
}

function Split({ data, reload }) {
  const [description,setDescription]=useState('')
  const [total,setTotal]=useState('')
  const [currency,setCurrency]=useState('EUR')
  const [paidBy,setPaidBy]=useState('')
  const [selected,setSelected]=useState([])
  async function add(e){e.preventDefault(); if(!description||!total||!paidBy||!selected.length) return alert('Preencha tudo'); const {data:exp,error}=await supabase.from('expenses').insert({description,total_amount:Number(total),currency,paid_by:paidBy,split_type:'equal'}).select().single(); if(error)return alert(error.message); const share=Number(total)/selected.length; const {error:e2}=await supabase.from('expense_shares').insert(selected.map(id=>({expense_id:exp.id,participant_id:id,share_amount:share}))); if(e2) alert(e2.message); else {setDescription('');setTotal('');setSelected([]);reload()}}
  const balances=useMemo(()=>{const m={};data.participants.forEach(p=>m[p.id]={name:p.name,paid:0,used:0});data.expenses.forEach(e=>{if(m[e.paid_by])m[e.paid_by].paid+=Number(e.total_amount||0)});data.shares.forEach(s=>{if(m[s.participant_id])m[s.participant_id].used+=Number(s.share_amount||0)});return Object.values(m).map(x=>({...x,balance:x.paid-x.used}))},[data])
  return <section className="grid"><div className="card wide"><h2>Racha da viagem</h2><form className="expenseForm" onSubmit={add}><input placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)}/><input placeholder="Valor" type="number" value={total} onChange={e=>setTotal(e.target.value)}/><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>EUR</option><option>CHF</option><option>GBP</option><option>BRL</option></select><select value={paidBy} onChange={e=>setPaidBy(e.target.value)}><option value="">Quem pagou?</option>{data.participants.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><div className="splitBox">{data.participants.map(p=><label className="checkbox" key={p.id}><input type="checkbox" checked={selected.includes(p.id)} onChange={e=>setSelected(e.target.checked?[...selected,p.id]:selected.filter(id=>id!==p.id))}/>{p.name}</label>)}</div><button className="btn">Adicionar</button></form></div><div className="card third"><h2>Saldos</h2>{balances.map(b=><p key={b.name}>{b.name}: <b>{b.balance.toFixed(2)}</b></p>)}</div><div className="card"><h2>Despesas</h2>{data.expenses.map(e=><p key={e.id}>{e.description}: {money(e.total_amount,e.currency)}</p>)}</div></section>
}

function SimpleList({ title, items, render }) { return <section className="grid"><div className="card"><h2>{title}</h2>{items.map(render)}</div></section> }

function App(){
  const [session,setSession]=useState(null)
  const [tab,setTab]=useState('dashboard')
  useEffect(()=>{ if(!supabase)return; supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>sub.subscription.unsubscribe() },[])
  const data=useData(session)
  const tabs=[['dashboard','Dashboard'],['savings','Cofrinho'],['split','Racha'],['alerts','Alertas'],['checklist','Checklist'],['currencies','Moedas']]
  if(!session)return <div className="app"><div className="hero"><div className="wrap"><div className="brand"><h1>Europa até Liverpool 2027</h1><p>Fase 2: login, cofrinho, racha e alertas internos.</p></div></div></div><Login onSession={setSession}/></div>
  return <div className="app"><header className="hero"><div className="wrap"><div className="topbar"><div className="brand"><h1>Europa até Liverpool 2027</h1><p>App colaborativo da viagem.</p></div><button className="btn secondary" onClick={()=>supabase.auth.signOut()}>Sair</button></div><div className="tabs">{tabs.map(([id,label])=><button key={id} className={'tab '+(tab===id?'active':'')} onClick={()=>setTab(id)}>{label}</button>)}</div></div></header><main className="main wrap">{data.loading&&<div className="loading">Carregando...</div>}{data.error&&<div className="error">{data.error}</div>}{!data.loading&&tab==='dashboard'&&<Dashboard data={data}/>} {!data.loading&&tab==='savings'&&<Savings data={data} reload={data.reload}/>} {!data.loading&&tab==='split'&&<Split data={data} reload={data.reload}/>} {!data.loading&&tab==='alerts'&&<SimpleList title="Alertas" items={data.alerts} render={a=><p key={a.id}><b>{a.title}</b><br/><span className="muted">{a.message}</span></p>}/>} {!data.loading&&tab==='checklist'&&<SimpleList title="Checklist" items={data.checklist} render={i=><p key={i.id}>{i.completed?'✅':'⬜'} {i.title}</p>}/>} {!data.loading&&tab==='currencies'&&<SimpleList title="Moedas" items={data.currencies} render={c=><p key={c.id}><b>{c.currency}</b> · comprar pouco abaixo de R$ {c.buy_some_below_brl}</p>}/>}</main><p className="footer">Vanessa, Camila e Danielle · Europa 2027</p></div>
}

createRoot(document.getElementById('root')).render(<App />)
