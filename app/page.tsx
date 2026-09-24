'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, CheckCircle2, Circle, Trash2, CheckSquare, Flame, BookOpen, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HabitView } from './components/HabitWorkspaceComp';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Subtask { id: string; title: string; is_completed: boolean; }
interface Todo { id: string; title: string; frequency: 'daily' | 'weekly' | 'monthly'; priority: 'low' | 'medium' | 'high'; category: string; is_completed: boolean; due_date: string; subtasks: Subtask[]; }
interface Habit { id: string; title: string; category: string; frequency_type: 'daily' | 'weekly' | 'monthly'; completed_dates: string[]; }
interface WorkspaceItem { id: string; title: string; description: string; link: string; category: string; created_at: string; }
interface JournalItem { id: string; date: string; content: string; created_at: string; }

export default function Home() {
  const [mainTab, setMainTab] = useState<'todo' | 'habit' | 'workspace' | 'journal'>('todo');

  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<string>('Pribadi');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitTitle, setHabitTitle] = useState('');

  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [wsTitle, setWsTitle] = useState('');
  const [wsDesc, setWsDesc] = useState('');

  const [journals, setJournals] = useState<JournalItem[]>([]);
  const [journalDate, setJournalDate] = useState('');
  const [journalContent, setJournalContent] = useState('');

  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayStr = getLocalDateString();

  useEffect(() => {
    if (mainTab === 'todo') fetchTodos();
    else if (mainTab === 'habit') fetchHabits();
    else if (mainTab === 'workspace') fetchWorkspaces();
    else if (mainTab === 'journal') fetchJournals();
  }, [activeTab, mainTab]);

  const fetchTodos = async () => {
    const { data } = await supabase.from('todos').select('*').eq('frequency', activeTab).order('created_at', { ascending: false });
    if (data) setTodos(data);
  };
  const fetchHabits = async () => {
    const { data } = await supabase.from('habits').select('*').order('created_at', { ascending: false });
    if (data) setHabits(data);
  };
  const fetchWorkspaces = async () => {
    const { data } = await supabase.from('workspaces').select('*').order('created_at', { ascending: false });
    if (data) setWorkspaces(data);
  };
  const fetchJournals = async () => {
    const { data } = await supabase.from('journals').select('*').order('date', { ascending: false });
    if (data) setJournals(data);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await supabase.from('todos').insert([{ title: title.trim(), frequency: activeTab, priority, category, due_date: dueDate || null, subtasks }]);
    setLoading(false);
    setTitle(''); setDueDate(''); setSubtasks([]); fetchTodos();
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    if (!currentStatus) confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    await supabase.from('todos').update({ is_completed: !currentStatus }).eq('id', id);
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await supabase.from('todos').delete().eq('id', id);
    fetchTodos();
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    await supabase.from('habits').insert([{ title: habitTitle.trim(), category: 'Pribadi', frequency_type: 'daily', completed_dates: [] }]);
    setHabitTitle(''); fetchHabits();
  };

  const toggleHabitToday = async (habit: Habit) => {
    const currentDates = habit.completed_dates || [];
    const isDone = currentDates.includes(todayStr);
    const updated = isDone ? currentDates.filter(d => d !== todayStr) : [...currentDates, todayStr];
    if (!isDone) confetti({ particleCount: 60, spread: 50 });
    await supabase.from('habits').update({ completed_dates: updated }).eq('id', habit.id);
    fetchHabits();
  };

  const deleteHabit = async (id: string) => {
    await supabase.from('habits').delete().eq('id', id);
    fetchHabits();
  };

  const addWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsTitle.trim()) return;
    await supabase.from('workspaces').insert([{ title: wsTitle.trim(), description: wsDesc.trim(), link: '', category: 'Side Hustle' }]);
    setWsTitle(''); setWsDesc(''); fetchWorkspaces();
  };

  const addJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;
    await supabase.from('journals').insert([{ date: journalDate || todayStr, content: journalContent.trim() }]);
    setJournalContent(''); setJournalDate(''); fetchJournals();
  };

  const filteredTodos = todos.filter(t => (selectedCategoryFilter === 'All' || t.category === selectedCategoryFilter) && t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const progressPct = todos.length > 0 ? Math.round((todos.filter(t => t.is_completed).length / todos.length) * 100) : 0;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fcfaf7', color: '#292524', padding: '24px 16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4efe6', padding: '20px', borderRadius: '16px', border: '1px solid #e6decb' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0' }}>To do List Roy</h1>
          <p style={{ fontSize: '12px', color: '#78716c', margin: 0 }}>Pekerjaan, Side Hustle & Second Brain</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '20px' }}>
        {[
          { id: 'todo', label: 'Tugas', icon: CheckSquare },
          { id: 'habit', label: 'Habit', icon: Flame },
          { id: 'workspace', label: 'Workspace', icon: Lightbulb },
          { id: 'journal', label: 'Journal', icon: BookOpen },
        ].map(tab => {
          const Icon = tab.icon;
          const active = mainTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setMainTab(tab.id as any)} style={{ padding: '10px 4px', fontSize: '11px', fontWeight: 'bold', borderRadius: '12px', border: '1px solid', cursor: 'pointer', backgroundColor: active ? '#292524' : '#f4efe6', borderColor: active ? '#292524' : '#e6decb', color: active ? '#f5f5f4' : '#78716c', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {mainTab === 'todo' && (
        <>
          <div style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
              <span style={{ color: '#78716c' }}>Progress Tugas</span>
              <span>{progressPct}% Selesai</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e9e2d0', height: '8px', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#44403c', height: '100%', width: `${progressPct}%` }}></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {(['daily', 'weekly', 'monthly'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: activeTab === tab ? '#292524' : '#f4efe6', color: activeTab === tab ? '#f5f5f4' : '#78716c' }}>
                {tab === 'daily' ? 'Harian' : tab === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>

          <form onSubmit={addTodo} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tambah tugas baru..." style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2d9c4', background: '#fcfaf7' }}>
                <option value="Pribadi">Pribadi</option>
                <option value="Pekerjaan">Pekerjaan</option>
                <option value="Side Hustle">Side Hustle</option>
              </select>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ padding: '9px', borderRadius: '12px', border: '1px solid #e2d9c4', background: '#fcfaf7' }} />
            </div>
            <button type="submit" style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Simpan Tugas</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredTodos.map(todo => (
              <div key={todo.id} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e6decb', backgroundColor: '#f4efe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div onClick={() => toggleTodo(todo.id, todo.is_completed)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  {todo.is_completed ? <CheckCircle2 color="#78716c" size={20} /> : <Circle color="#a8a29e" size={20} />}
                  <span style={{ fontSize: '14px', fontWeight: 600, textDecoration: todo.is_completed ? 'line-through' : 'none' }}>{todo.title}</span>
                </div>
                <button onClick={() => deleteTodo(todo.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {mainTab === 'habit' && (
        <HabitView 
          habits={habits}
          addHabit={addHabit}
          habitTitle={habitTitle}
          setHabitTitle={setHabitTitle}
          toggleHabitToday={toggleHabitToday}
          deleteHabit={deleteHabit}
          todayStr={todayStr}
        />
      )}

      {mainTab === 'workspace' && (
        <>
          <form onSubmit={addWorkspace} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={wsTitle} onChange={e => setWsTitle(e.target.value)} placeholder="Judul Proyek / Ide..." style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px', outline: 'none' }} />
            <textarea value={wsDesc} onChange={e => setWsDesc(e.target.value)} placeholder="Catatan detail..." style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px', outline: 'none' }} />
            <button type="submit" style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Simpan Ide</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workspaces.map(w => (
              <div key={w.id} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '16px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold' }}>{w.title}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#57534e' }}>{w.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {mainTab === 'journal' && (
        <>
          <form onSubmit={addJournal} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="date" value={journalDate || todayStr} onChange={e => setJournalDate(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2d9c4', background: '#fcfaf7' }} />
            <textarea value={journalContent} onChange={e => setJournalContent(e.target.value)} placeholder="Tulis catatan harian..." style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px', outline: 'none' }} />
            <button type="submit" style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Simpan Jurnal</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {journals.map(j => (
              <div key={j.id} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '16px', borderRadius: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', background: '#e9e2d0', padding: '2px 6px', borderRadius: '4px' }}>{j.date}</span>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{j.content}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}