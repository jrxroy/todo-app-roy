'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckSquare, Flame, BookOpen, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Todo, Habit, WorkspaceItem, JournalItem, Frequency, Priority, Subtask } from './types';
import { TodoList } from './components/TodoList';
import { HabitTracker } from './components/HabitTracker';
import { WorkspaceJournal } from './components/WorkspaceJournal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Home() {
  const [mainTab, setMainTab] = useState<'todo' | 'habit' | 'workspace' | 'journal'>('todo');

  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<Frequency>('daily');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [habits, setHabits] = useState<Habit[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [journals, setJournals] = useState<JournalItem[]>([]);

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

  const addTodo = async (title: string, priority: Priority, category: string, dueDate: string, subtasks: Subtask[]) => {
    await supabase.from('todos').insert([{ title, frequency: activeTab, priority, category, due_date: dueDate || null, subtasks, is_completed: false }]);
    fetchTodos();
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

  const addHabit = async (title: string) => {
    await supabase.from('habits').insert([{ title, category: 'Pribadi', frequency_type: 'weekly', completed_week: [false, false, false, false, false, false, false] }]);
    fetchHabits();
  };

  const toggleHabitDay = async (habitId: string, dayIndex: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const currentWeek = [...(habit.completed_week || [false, false, false, false, false, false, false])];
    currentWeek[dayIndex] = !currentWeek[dayIndex];
    if (currentWeek[dayIndex]) confetti({ particleCount: 50, spread: 40 });
    await supabase.from('habits').update({ completed_week: currentWeek }).eq('id', habitId);
    fetchHabits();
  };

  const deleteHabit = async (id: string) => {
    await supabase.from('habits').delete().eq('id', id);
    fetchHabits();
  };

  const addWorkspace = async (title: string, description: string, link: string) => {
    await supabase.from('workspaces').insert([{ title, description, link, category: 'Side Hustle' }]);
    fetchWorkspaces();
  };

  const addJournal = async (date: string, content: string) => {
    await supabase.from('journals').insert([{ date, content }]);
    fetchJournals();
  };

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
        <TodoList 
          todos={todos}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategoryFilter={selectedCategoryFilter}
          setSelectedCategoryFilter={setSelectedCategoryFilter}
          addTodo={addTodo}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
          progressPct={progressPct}
        />
      )}

      {mainTab === 'habit' && (
        <HabitTracker 
          habits={habits}
          addHabit={addHabit}
          toggleHabitDay={toggleHabitDay}
          deleteHabit={deleteHabit}
        />
      )}

      {(mainTab === 'workspace' || mainTab === 'journal') && (
        <WorkspaceJournal 
          mainTab={mainTab}
          workspaces={workspaces}
          journals={journals}
          addWorkspace={addWorkspace}
          addJournal={addJournal}
          todayStr={todayStr}
        />
      )}
    </main>
  );
}