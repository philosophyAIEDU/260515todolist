import { useMemo, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

type Priority = 'high' | 'medium' | 'low';
type Todo = { id: string; text: string; due?: string; priority: Priority; doneAt?: string };
type Event = { id: string; title: string; date: string; time?: string; memo?: string; category: '업무'|'개인'|'건강'|'기타' };
type Goal = { id: string; title: string; desc: string; due?: string; image?: string; done: boolean };
type Quote = { id: string; text: string; author?: string; favorite: boolean; color?: string };
type Chat = { role: 'user'|'assistant'; text: string };

type Store = {
  todos: Todo[]; events: Event[]; goals: Goal[]; quotes: Quote[];
  addTodo: (t: Todo)=>void; updateTodo:(id:string,p:Partial<Todo>)=>void; delTodo:(id:string)=>void; setTodos:(t:Todo[])=>void;
  addEvent:(e:Event)=>void; updateEvent:(id:string,p:Partial<Event>)=>void; delEvent:(id:string)=>void;
  addGoal:(g:Goal)=>void; updateGoal:(id:string,p:Partial<Goal>)=>void; delGoal:(id:string)=>void;
  addQuote:(q:Quote)=>void; updateQuote:(id:string,p:Partial<Quote>)=>void; delQuote:(id:string)=>void;
}
const useStore = create<Store>()(persist((set)=>( {
  todos:[], events:[], goals:[], quotes:[],
  addTodo:(t)=>set(s=>({todos:[...s.todos,t]})), updateTodo:(id,p)=>set(s=>({todos:s.todos.map(t=>t.id===id?{...t,...p}:t)})), delTodo:(id)=>set(s=>({todos:s.todos.filter(t=>t.id!==id)})), setTodos:(todos)=>set({todos}),
  addEvent:(e)=>set(s=>({events:[...s.events,e]})), updateEvent:(id,p)=>set(s=>({events:s.events.map(e=>e.id===id?{...e,...p}:e)})), delEvent:(id)=>set(s=>({events:s.events.filter(e=>e.id!==id)})),
  addGoal:(g)=>set(s=>({goals:[...s.goals,g]})), updateGoal:(id,p)=>set(s=>({goals:s.goals.map(g=>g.id===id?{...g,...p}:g)})), delGoal:(id)=>set(s=>({goals:s.goals.filter(g=>g.id!==id)})),
  addQuote:(q)=>set(s=>({quotes:[...s.quotes,q]})), updateQuote:(id,p)=>set(s=>({quotes:s.quotes.map(q=>q.id===id?{...q,...p}:q)})), delQuote:(id)=>set(s=>({quotes:s.quotes.filter(q=>q.id!==id)}))
}),{name:'prod-dashboard'}));

const id = ()=> crypto.randomUUID();

export default function App(){
  const [tab,setTab]=useState<'todo'|'calendar'|'goal'|'quote'|'ai'>('todo');
  const quotes = useStore(s=>s.quotes);
  const todayQuote = useMemo(()=>{ if(!quotes.length) return '오늘의 문구를 등록해보세요'; const seed = new Date().toISOString().slice(0,10).split('-').join(''); const idx = Number(seed)%quotes.length; return quotes[idx].text;},[quotes]);
  return <div className="p-4 space-y-4 max-w-7xl mx-auto">
    <div className="card"><h1 className="text-2xl font-bold">개인 생산성 대시보드</h1><p className="text-indigo-300">오늘의 문구: {todayQuote}</p></div>
    <div className="flex gap-2 flex-wrap">{['todo','calendar','goal','quote','ai'].map(t=><button key={t} className="btn" onClick={()=>setTab(t as any)}>{t}</button>)}</div>
    {tab==='todo'&&<TodoModule/>}{tab==='calendar'&&<CalendarModule/>}{tab==='goal'&&<GoalModule/>}{tab==='quote'&&<QuoteModule/>}{tab==='ai'&&<AiModule/>}
  </div>
}

function TodoModule(){const {todos,addTodo,updateTodo,delTodo}=useStore(); const [showDone,setShowDone]=useState(false); const [text,setText]=useState(''); const [due,setDue]=useState(''); const [priority,setP]=useState<Priority>('medium');
  const done=todos.filter(t=>t.doneAt); const open=todos.filter(t=>!t.doneAt); const pct=todos.length?Math.round((done.length/todos.length)*100):0;
  return <div className="card space-y-2"><div className='w-full bg-slate-800 rounded h-2'><div className='bg-emerald-500 h-2 rounded' style={{width:`${pct}%`}}/></div>
  <div className='text-sm'>{done.length}/{todos.length}</div>
  <div className='flex gap-2'><input className='input' value={text} onChange={e=>setText(e.target.value)} placeholder='할 일'/><input className='input' type='datetime-local' value={due} onChange={e=>setDue(e.target.value)}/><select className='input' value={priority} onChange={e=>setP(e.target.value as Priority)}><option value='high'>높음</option><option value='medium'>보통</option><option value='low'>낮음</option></select><button className='btn' onClick={()=>{if(!text.trim())return; addTodo({id:id(),text,due:due||undefined,priority}); setText('');setDue('')}}>추가</button></div>
  <button className='btn' onClick={()=>setShowDone(!showDone)}>{showDone?'미완료':'완료'} 보기</button>
  {(showDone?done:open).map(t=><div key={t.id} className='p-2 rounded bg-slate-800 flex justify-between'><div><input type='checkbox' checked={!!t.doneAt} onChange={e=>updateTodo(t.id,{doneAt:e.target.checked?new Date().toISOString():undefined})}/> {t.text} <span className='text-xs text-slate-400'>{t.due} {t.doneAt&&`완료:${format(new Date(t.doneAt),'HH:mm')}`}</span></div><div className='flex gap-2'><button onClick={()=>{const n=prompt('수정',t.text); if(n) updateTodo(t.id,{text:n})}}>수정</button><button onClick={()=>delTodo(t.id)}>삭제</button></div></div>)}
  </div>
}

function CalendarModule(){const {events,addEvent,delEvent}=useStore(); const [year,setYear]=useState(new Date().getFullYear()); const [date,setDate]=useState(format(new Date(),'yyyy-MM-dd')); const list=events.filter(e=>e.date===date);
 return <div className='card space-y-2'><div className='flex gap-2'><button className='btn' onClick={()=>setYear(y=>y-1)}>이전</button><span>{year}</span><button className='btn' onClick={()=>setYear(y=>y+1)}>다음</button></div><div className='grid grid-cols-4 gap-2'>{Array.from({length:12},(_,i)=><div key={i} className='bg-slate-800 p-2 rounded text-xs'>{i+1}월</div>)}</div><input type='date' className='input' value={date} onChange={e=>setDate(e.target.value)}/><div className='flex gap-2'><input id='ev' className='input' placeholder='일정 제목'/><button className='btn' onClick={()=>{const el=document.getElementById('ev') as HTMLInputElement; if(el.value) {addEvent({id:id(),title:el.value,date,category:'기타'}); el.value='';}}}>일정 추가</button></div><div>{list.map(e=><div key={e.id} className='bg-slate-800 p-2 rounded flex justify-between'>{e.title}<button onClick={()=>delEvent(e.id)}>삭제</button></div>)}</div></div>
}

function GoalModule(){const {goals,addGoal,updateGoal,delGoal}=useStore(); const done=goals.filter(g=>g.done).length;
 const onFile=(f:File,cb:(v:string)=>void)=>{if(f.size>1024*1024) alert('이미지가 크면 저장공간을 많이 사용합니다'); const r=new FileReader(); r.onload=()=>cb(r.result as string); r.readAsDataURL(f)};
 return <div className='card space-y-2'><div>{done}/{goals.length}</div><div className='grid md:grid-cols-2 gap-2'>{goals.map(g=><div key={g.id} className='bg-slate-800 p-2 rounded'><h3>{g.title}</h3><p>{g.desc}</p>{g.image&&<img src={g.image} className='h-24 object-cover'/>}<div className='flex gap-2'><button onClick={()=>updateGoal(g.id,{done:!g.done})}>{g.done?'달성됨':'진행중'}</button><button onClick={()=>delGoal(g.id)}>삭제</button></div></div>)}</div><button className='btn' onClick={()=>{const title=prompt('제목'); if(!title) return; const desc=prompt('설명')||''; addGoal({id:id(),title,desc,done:false})}}>목표 추가</button><input type='file' onChange={(e)=>{const f=e.target.files?.[0]; if(!f||!goals[goals.length - 1]) return; onFile(f,(img)=>updateGoal(goals[goals.length - 1]!.id,{image:img}))}}/></div>
}

function QuoteModule(){const {quotes,addQuote,updateQuote,delQuote}=useStore(); const sorted=[...quotes].sort((a,b)=>Number(b.favorite)-Number(a.favorite));
 return <div className='card space-y-2'><button className='btn' onClick={()=>{const text=prompt('문구'); if(text) addQuote({id:id(),text,favorite:false})}}>문구 추가</button><div className='grid md:grid-cols-3 gap-2'>{sorted.map(q=><div key={q.id} className='p-2 rounded bg-slate-800'><div>{q.text}</div><div className='flex gap-2'><button onClick={()=>updateQuote(q.id,{favorite:!q.favorite})}>{q.favorite?'★':'☆'}</button><button onClick={()=>delQuote(q.id)}>삭제</button></div></div>)}</div></div>
}

function AiModule(){ const [messages,setMessages]=useState<Chat[]>([]); const [input,setInput]=useState('');
 const send=async()=>{const user={role:'user' as const,text:input}; setMessages(m=>[...m,user,{role:'assistant',text:''}]); setInput('');
  const res=await fetch('http://localhost:11434/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'gemma4:e4b',prompt:user.text,stream:true})});
  const reader=res.body?.getReader(); if(!reader) return; const dec=new TextDecoder(); let acc=''; while(true){const {done,value}=await reader.read(); if(done) break; const chunk=dec.decode(value,{stream:true}); chunk.trim().split('\n').forEach(line=>{try{const j=JSON.parse(line); if(j.response) acc+=j.response;}catch{}}); setMessages(m=>[...m.slice(0,-1),{role:'assistant',text:acc}]);}
 };
 return <div className='card space-y-2'><div className='h-80 overflow-auto space-y-2'>{messages.map((m,i)=><div key={i} className={`p-2 rounded ${m.role==='user'?'bg-indigo-700':'bg-slate-800'}`}>{m.text}</div>)}</div><div className='flex gap-2'><input className='input' value={input} onChange={e=>setInput(e.target.value)} /><button className='btn' onClick={send}>전송</button></div></div>
}
