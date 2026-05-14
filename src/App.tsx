import { FormEvent, useMemo, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

type Priority = 'high' | 'medium' | 'low';
type Category = '업무' | '개인' | '건강' | '기타';

type Todo = { id: string; text: string; due?: string; priority: Priority; doneAt?: string };
type EventItem = { id: string; title: string; date: string; time?: string; memo?: string; category: Category };
type Goal = { id: string; title: string; desc: string; due?: string; image?: string; done: boolean };
type Quote = { id: string; text: string; author?: string; favorite: boolean };
type Chat = { role: 'user' | 'assistant'; text: string };

type Store = {
  todos: Todo[];
  events: EventItem[];
  goals: Goal[];
  quotes: Quote[];
  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, patch: Partial<Todo>) => void;
  delTodo: (id: string) => void;
  addEvent: (event: EventItem) => void;
  updateEvent: (id: string, patch: Partial<EventItem>) => void;
  delEvent: (id: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  delGoal: (id: string) => void;
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  delQuote: (id: string) => void;
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      todos: [], events: [], goals: [], quotes: [],
      addTodo: (todo) => set((s) => ({ todos: [...s.todos, todo] })),
      updateTodo: (id, patch) => set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      delTodo: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
      updateEvent: (id, patch) => set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      delEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
      updateGoal: (id, patch) => set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      delGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      addQuote: (quote) => set((s) => ({ quotes: [...s.quotes, quote] })),
      updateQuote: (id, patch) => set((s) => ({ quotes: s.quotes.map((q) => (q.id === id ? { ...q, ...patch } : q)) })),
      delQuote: (id) => set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) }))
    }),
    { name: 'prod-dashboard' }
  )
);

const uid = (): string => crypto.randomUUID();

export default function App() {
  const [tab, setTab] = useState<'todo' | 'calendar' | 'goal' | 'quote' | 'ai'>('todo');
  const quotes = useStore((s) => s.quotes);
  const dailyText = useMemo(() => {
    if (!quotes.length) return '오늘의 문구를 등록해보세요';
    const seed = Number(new Date().toISOString().slice(0, 10).split('-').join(''));
    return quotes[seed % quotes.length].text;
  }, [quotes]);

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold">개인 생산성 대시보드</h1>
        <p className="text-indigo-300">오늘의 문구: {dailyText}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['todo', 'calendar', 'goal', 'quote', 'ai'].map((t) => (
          <button key={t} className="btn" onClick={() => setTab(t as typeof tab)}>{t}</button>
        ))}
      </div>
      {tab === 'todo' && <TodoModule />}
      {tab === 'calendar' && <CalendarModule />}
      {tab === 'goal' && <GoalModule />}
      {tab === 'quote' && <QuoteModule />}
      {tab === 'ai' && <AiModule />}
    </div>
  );
}

function TodoModule() {
  const { todos, addTodo, updateTodo, delTodo } = useStore();
  const [showDone, setShowDone] = useState(false);
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const done = todos.filter((t) => t.doneAt);
  const open = todos.filter((t) => !t.doneAt);

  return <div className="card space-y-2">
    <div className="flex gap-2">
      <input className="input" placeholder="할 일" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn" onClick={() => { if (!text.trim()) return; addTodo({ id: uid(), text, due: due || undefined, priority }); setText(''); }}>추가</button>
    </div>
    <div className="flex gap-2">
      <input className="input" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
      <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}><option value="high">높음</option><option value="medium">보통</option><option value="low">낮음</option></select>
      <button className="btn" onClick={() => setShowDone(!showDone)}>{showDone ? '미완료' : '완료'} 보기</button>
    </div>
    {(showDone ? done : open).map((t) => <div key={t.id} className="bg-slate-800 rounded p-2 flex justify-between">
      <label><input type="checkbox" checked={!!t.doneAt} onChange={(e) => updateTodo(t.id, { doneAt: e.target.checked ? new Date().toISOString() : undefined })} /> {t.text}</label>
      <div className="flex gap-2"><button onClick={() => delTodo(t.id)}>삭제</button></div>
    </div>)}
  </div>;
}

function CalendarModule() {
  const { events, addEvent, delEvent } = useStore();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [title, setTitle] = useState('');
  const list = events.filter((e) => e.date === date);
  return <div className="card space-y-2">
    <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
    <div className="flex gap-2"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="일정" /><button className="btn" onClick={() => { if (!title) return; addEvent({ id: uid(), title, date, category: '기타' }); setTitle(''); }}>추가</button></div>
    {list.map((e) => <div key={e.id} className="bg-slate-800 rounded p-2 flex justify-between"><span>{e.title}</span><button onClick={() => delEvent(e.id)}>삭제</button></div>)}
  </div>;
}

function GoalModule() {
  const { goals, addGoal, updateGoal, delGoal } = useStore();
  return <div className="card space-y-2"><button className="btn" onClick={() => { const title = prompt('목표 제목'); if (!title) return; addGoal({ id: uid(), title, desc: '', done: false }); }}>목표 추가</button>{goals.map((g) => <div key={g.id} className="bg-slate-800 rounded p-2 flex justify-between"><span>{g.title}</span><div className="flex gap-2"><button onClick={() => updateGoal(g.id, { done: !g.done })}>{g.done ? '달성' : '진행'}</button><button onClick={() => delGoal(g.id)}>삭제</button></div></div>)}</div>;
}

function QuoteModule() {
  const { quotes, addQuote, updateQuote, delQuote } = useStore();
  return <div className="card space-y-2"><button className="btn" onClick={() => { const text = prompt('문구'); if (!text) return; addQuote({ id: uid(), text, favorite: false }); }}>문구 추가</button>{quotes.map((q) => <div key={q.id} className="bg-slate-800 rounded p-2 flex justify-between"><span>{q.text}</span><div className="flex gap-2"><button onClick={() => updateQuote(q.id, { favorite: !q.favorite })}>{q.favorite ? '★' : '☆'}</button><button onClick={() => delQuote(q.id)}>삭제</button></div></div>)}</div>;
}

function AiModule() {
  const [messages, setMessages] = useState<Chat[]>([]);
  const [input, setInput] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }, { role: 'assistant', text: 'Ollama 연동은 로컬 환경에서 사용하세요.' }]);
  };
  return <div className="card space-y-2"><div className="max-h-72 overflow-auto space-y-2">{messages.map((m, i) => <div key={i} className={`p-2 rounded ${m.role === 'user' ? 'bg-indigo-700' : 'bg-slate-800'}`}>{m.text}</div>)}</div><form className="flex gap-2" onSubmit={submit}><input className="input" value={input} onChange={(e) => setInput(e.target.value)} /><button className="btn" type="submit">전송</button></form></div>;
}
