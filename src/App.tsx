import { useMemo, useState } from 'react';
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
      todos: [],
      events: [],
      goals: [],
      quotes: [],
      addTodo: (todo) => set((s) => ({ todos: [...s.todos, todo] })),
      updateTodo: (id, patch) => set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      delTodo: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
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
  const pct = todos.length ? Math.round((done.length / todos.length) * 100) : 0;

  return <div className="card space-y-2">...</div>;
}

function CalendarModule() {
  const { events, addEvent, delEvent } = useStore();
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const list = events.filter((e) => e.date === date);
  const [title, setTitle] = useState('');

  return <div className="card space-y-2">...</div>;
}

function GoalModule() { return <div className="card">Goal module</div>; }
function QuoteModule() { return <div className="card">Quote module</div>; }
function AiModule() { return <div className="card">AI module</div>; }
