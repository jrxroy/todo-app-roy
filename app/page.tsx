'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, CheckCircle2, Circle, Trash2, Calendar, Tag, Compass, Search, AlertCircle, Edit3, X, CheckSquare, Flame, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
}

interface Todo {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  category: string;
  is_completed: boolean;
  due_date: string;
  subtasks: Subtask[];
}

interface Habit {
  id: string;
  title: string;
  category: string;
  frequency_type: 'daily' | 'weekly' | 'monthly';
  completed_dates: string[];
}

export default function Home() {
  const [mainTab, setMainTab] = useState<'todo' | 'habit'>('todo');

  // Todo States
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<string>('Pribadi');
  const [dueDate, setDueDate] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editCategory, setEditCategory] = useState<string>('Pribadi');
  const [editDueDate, setEditDueDate] = useState('');
  const [editSubtasks, setEditSubtasks] = useState<Subtask[]>([]);
  const [editNewSubtaskTitle, setEditNewSubtaskTitle] = useState('');

  // Habit States
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState('Pribadi');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // State untuk Modal Kalender Bulanan Detail (Menyimpan habitId yang sedang dibuka modalnya)
  const [activeCalendarHabitId, setActiveCalendarHabitId] = useState<string | null>(null);
  // State navigasi bulan pada modal (default bulan & tahun saat ini)
  const [modalYear, setModalYear] = useState<number>(new Date().getFullYear());
  const [modalMonth, setModalMonth] = useState<number>(new Date().getMonth()); // 0 - 11

  // Helper mendapatkan tanggal lokal format YYYY-MM-DD yang akurat
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();

  useEffect(() => {
    if (mainTab === 'todo') {
      fetchTodos();
    } else {
      fetchHabits();
    }
  }, [activeTab, mainTab]);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('frequency', activeTab)
      .order('created_at', { ascending: false });

    if (!error && data) setTodos(data);
  };

  const fetchHabits = async () => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setHabits(data);
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtaskTitle, is_completed: false }]);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('todos').insert([
        {
          title: title.trim(),
          frequency: activeTab,
          priority,
          category,
          due_date: dueDate || null,
          subtasks,
        },
      ]);

      if (error) {
        alert('Gagal menyimpan: ' + error.message);
      } else {
        setTitle('');
        setDueDate('');
        setSubtasks([]);
        fetchTodos();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('habits').insert([
        {
          title: habitTitle.trim(),
          category: habitCategory,
          frequency_type: habitFrequency,
          completed_dates: [],
        },
      ]);

      if (error) {
        alert('Gagal menyimpan habit: ' + error.message);
      } else {
        setHabitTitle('');
        fetchHabits();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    if (!currentStatus) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#78350f', '#b45309', '#d97706', '#a8a29e'] });
    }
    const { error } = await supabase.from('todos').update({ is_completed: !currentStatus }).eq('id', id);
    if (!error) fetchTodos();
  };

  const toggleHabitToday = async (habit: Habit) => {
    const currentDates = habit.completed_dates || [];
    const isCompletedToday = currentDates.includes(todayStr);

    let updatedDates: string[];
    if (isCompletedToday) {
      updatedDates = currentDates.filter((d) => d !== todayStr);
    } else {
      updatedDates = [...currentDates, todayStr];
      confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 }, colors: ['#166534', '#22c55e', '#84cc16'] });
    }

    const { error } = await supabase
      .from('habits')
      .update({ completed_dates: updatedDates })
      .eq('id', habit.id);

    if (!error) fetchHabits();
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) fetchTodos();
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (!error) fetchHabits();
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
    setEditDueDate(todo.due_date || '');
    setEditSubtasks(todo.subtasks || []);
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditTitle('');
    setEditSubtasks([]);
    setEditNewSubtaskTitle('');
  };

  const addEditSubtask = () => {
    if (!editNewSubtaskTitle.trim()) return;
    setEditSubtasks([...editSubtasks, { id: Date.now().toString(), title: editNewSubtaskTitle, is_completed: false }]);
    setEditNewSubtaskTitle('');
  };

  const removeEditSubtask = (id: string) => {
    setEditSubtasks(editSubtasks.filter((s) => s.id !== id));
  };

  const saveEditedTodo = async (id: string) => {
    if (!editTitle.trim()) return;
    const { error } = await supabase
      .from('todos')
      .update({
        title: editTitle,
        priority: editPriority,
        category: editCategory,
        due_date: editDueDate || null,
        subtasks: editSubtasks,
      })
      .eq('id', id);

    if (!error) {
      cancelEditing();
      fetchTodos();
    }
  };

  const getDeadlineStatus = (dateStr: string) => {
    if (!dateStr) return null;
    if (dateStr < todayStr) {
      return { label: 'Overdue', bg: '#fee2e2', text: '#991b1b', border: '#f87171' };
    } else if (dateStr === todayStr) {
      return { label: 'Hari Ini', bg: '#292524', text: '#f5f5f4', border: '#44403c' };
    }
    return null;
  };

  const filteredTodos = todos.filter((todo) => {
    const matchesCategory = selectedCategoryFilter === 'All' || todo.category === selectedCategoryFilter;
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? !todo.is_completed :
      statusFilter === 'completed' ? todo.is_completed : true;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const completedCount = todos.filter((t) => t.is_completed).length;
  const progressPercentage = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const totalHabitsCount = habits.length;
  const completedHabitsTodayCount = habits.filter((h) => h.completed_dates?.includes(todayStr)).length;
  const habitDailyPercentage = totalHabitsCount > 0 ? Math.round((completedHabitsTodayCount / totalHabitsCount) * 100) : 0;

  // Helper untuk statistik bulan berjalan (Current Month Stats)
  const getCurrentMonthStats = (completedDates: string[]) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Total hari dalam bulan ini
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Hari yang sudah terlewat atau sampai hari ini di bulan ini
    const todayDateNum = now.getDate();

    let countThisMonth = 0;
    completedDates.forEach((dStr) => {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1;
        if (y === year && m === month) {
          countThisMonth++;
        }
      }
    });

    const percentage = Math.round((countThisMonth / todayDateNum) * 100);
    return { countThisMonth, totalElapsed: todayDateNum, totalDaysInMonth, percentage };
  };

  // Helper untuk membangun data grid kalender bulanan penuh pada modal
  const getMonthCalendarDays = (year: number, month: number, completedDates: string[]) => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // Hari pertama bulan (0: Minggu, 1: Senin, dst)
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding kosong untuk hari sebelum tanggal 1
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ empty: true });
    }

    for (let day = 1; day <= totalDays; day++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      const isChecked = completedDates.includes(dateStr);
      const isToday = dateStr === todayStr;

      days.push({ empty: false, day, dateStr, isChecked, isToday });
    }

    return days;
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fcfaf7', color: '#292524', padding: '24px 16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4efe6', padding: '20px', borderRadius: '16px', border: '1px solid #e6decb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ padding: '6px', backgroundColor: '#e9e2d0', borderRadius: '8px', color: '#44403c', border: '1px solid #dccfb8', display: 'flex' }}>
              <Compass size={16} />
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '-0.025em', margin: 0 }}>
              To do List & Habbit Tracker Roy
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#78716c', fontWeight: 500, margin: 0 }}>Pekerjaan, Side Hustle & Fokus Pribadi</p>
        </div>
      </header>

      {/* Main Navigasi Tab */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setMainTab('todo')}
          style={{
            padding: '12px',
            fontSize: '13px',
            fontWeight: 'bold',
            borderRadius: '14px',
            border: '1px solid',
            cursor: 'pointer',
            backgroundColor: mainTab === 'todo' ? '#292524' : '#f4efe6',
            borderColor: mainTab === 'todo' ? '#292524' : '#e6decb',
            color: mainTab === 'todo' ? '#f5f5f4' : '#78716c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <CheckSquare size={16} /> To-Do List
        </button>
        <button
          onClick={() => setMainTab('habit')}
          style={{
            padding: '12px',
            fontSize: '13px',
            fontWeight: 'bold',
            borderRadius: '14px',
            border: '1px solid',
            cursor: 'pointer',
            backgroundColor: mainTab === 'habit' ? '#292524' : '#f4efe6',
            borderColor: mainTab === 'habit' ? '#292524' : '#e6decb',
            color: mainTab === 'habit' ? '#f5f5f4' : '#78716c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Flame size={16} /> Habit Tracker
        </button>
      </div>

      {/* KONTEN UTAMA: TO-DO LIST */}
      {mainTab === 'todo' && (
        <>
          <div style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '16px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px', fontWeight: 600 }}>
              <span style={{ color: '#78716c' }}>Pencapaian Periode Ini</span>
              <span style={{ color: '#44403c', fontWeight: 'bold' }}>{completedCount} dari {todos.length} selesai ({progressPercentage}%)</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e9e2d0', height: '8px', borderRadius: '9999px', overflow: 'hidden', border: '1px solid #dccfb8', padding: '1px' }}>
              <div style={{ backgroundColor: '#44403c', height: '100%', borderRadius: '9999px', width: `${progressPercentage}%`, transition: 'width 0.5s' }}></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', backgroundColor: '#f4efe6', padding: '6px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #e6decb' }}>
            {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  backgroundColor: activeTab === tab ? '#292524' : 'transparent',
                  color: activeTab === tab ? '#f5f5f4' : '#78716c',
                }}
              >
                {tab === 'daily' ? 'Harian' : tab === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>

          <form onSubmit={addTodo} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Tambah rencana ${activeTab} baru...`}
              style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#292524', outline: 'none' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600, color: '#78716c', display: 'block', marginBottom: '4px' }}>Kategori:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '10px', fontSize: '12px', color: '#292524', outline: 'none' }}
                >
                  <option value="Pribadi">Pribadi</option>
                  <option value="Pekerjaan">Pekerjaan</option>
                  <option value="Side Hustle">Side Hustle</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600, color: '#78716c', display: 'block', marginBottom: '4px' }}>Deadline:</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '9px 12px', fontSize: '12px', color: '#292524', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#78716c', fontWeight: 500 }}>Prioritas:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={{
                      fontSize: '10px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      border: '1px solid',
                      backgroundColor: priority === p ? '#292524' : '#fcfaf7',
                      borderColor: priority === p ? '#292524' : '#e2d9c4',
                      color: priority === p ? '#f5f5f4' : '#78716c'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e6decb', paddingTop: '12px' }}>
              <label style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600, color: '#78716c', display: 'block', marginBottom: '6px' }}>Sub-tugas:</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Tambah checklist kecil..."
                  style={{ flex: 1, backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', color: '#292524', outline: 'none' }}
                />
                <button type="button" onClick={addSubtask} style={{ backgroundColor: '#e9e2d0', border: '1px solid #dccfb8', color: '#44403c', fontSize: '12px', padding: '10px 16px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Tambah
                </button>
              </div>
              {subtasks.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', backgroundColor: '#fcfaf7', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2d9c4', marginBottom: '4px' }}>
                  <span>- {s.title}</span>
                  <button type="button" onClick={() => removeSubtask(s.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>×</button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase' }}
            >
              <Plus size={16} /> Simpan Tugas Baru
            </button>
          </form>

          {/* Filter Status & Pencarian */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', backgroundColor: '#f4efe6', padding: '4px', borderRadius: '12px', border: '1px solid #e6decb' }}>
              <button
                onClick={() => setStatusFilter('active')}
                style={{ padding: '8px', fontSize: '11px', fontWeight: statusFilter === 'active' ? 'bold' : 500, borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: statusFilter === 'active' ? '#292524' : 'transparent', color: statusFilter === 'active' ? '#f5f5f4' : '#78716c' }}
              >
                Belum Selesai
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                style={{ padding: '8px', fontSize: '11px', fontWeight: statusFilter === 'completed' ? 'bold' : 500, borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: statusFilter === 'completed' ? '#292524' : 'transparent', color: statusFilter === 'completed' ? '#f5f5f4' : '#78716c' }}
              >
                Sudah Selesai
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                style={{ padding: '8px', fontSize: '11px', fontWeight: statusFilter === 'all' ? 'bold' : 500, borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: statusFilter === 'all' ? '#292524' : 'transparent', color: statusFilter === 'all' ? '#f5f5f4' : '#78716c' }}
              >
                Semua
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#a8a29e' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tugas..."
                style={{ width: '100%', backgroundColor: '#f4efe6', border: '1px solid #e6decb', borderRadius: '12px', padding: '10px 14px 10px 38px', fontSize: '12px', color: '#292524', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {['All', 'Pribadi', 'Pekerjaan', 'Side Hustle'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  style={{
                    fontSize: '11px',
                    fontWeight: selectedCategoryFilter === cat ? 'bold' : 500,
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    backgroundColor: selectedCategoryFilter === cat ? '#292524' : '#f4efe6',
                    borderColor: selectedCategoryFilter === cat ? '#292524' : '#e6decb',
                    color: selectedCategoryFilter === cat ? '#f5f5f4' : '#57534e'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredTodos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a8a29e', fontSize: '12px', backgroundColor: '#f4efe6', borderRadius: '16px', border: '1px solid #e6decb' }}>
                Tidak ada tugas ditemukan.
              </div>
            ) : (
              filteredTodos.map((todo) => {
                const isEditing = editingTodoId === todo.id;
                const deadlineStatus = !todo.is_completed ? getDeadlineStatus(todo.due_date) : null;

                return (
                  <div key={todo.id} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e6decb', backgroundColor: todo.is_completed ? 'rgba(247, 245, 239, 0.6)' : '#f4efe6' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Edit Tugas</span>
                          <button onClick={cancelEditing} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #dccfb8', fontSize: '12px' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={{ padding: '8px', borderRadius: '8px', fontSize: '12px' }}>
                            <option value="Pribadi">Pribadi</option>
                            <option value="Pekerjaan">Pekerjaan</option>
                            <option value="Side Hustle">Side Hustle</option>
                          </select>
                          <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} style={{ padding: '7px 10px', borderRadius: '8px', fontSize: '12px' }} />
                        </div>
                        <button onClick={() => saveEditedTodo(todo.id)} style={{ backgroundColor: '#292524', color: '#f5f5f4', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Simpan</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, cursor: 'pointer' }} onClick={() => toggleTodo(todo.id, todo.is_completed)}>
                            {todo.is_completed ? <CheckCircle2 style={{ color: '#78716c', marginTop: '2px' }} size={20} /> : <Circle style={{ color: '#a8a29e', marginTop: '2px' }} size={20} />}
                            <div>
                              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, textDecoration: todo.is_completed ? 'line-through' : 'none', color: todo.is_completed ? '#a8a29e' : '#292524' }}>{todo.title}</h3>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                <span style={{ fontSize: '10px', backgroundColor: '#eef5ef', color: '#3f6212', padding: '3px 8px', borderRadius: '6px' }}><Tag size={10} /> {todo.category}</span>
                                {todo.due_date && <span style={{ fontSize: '10px', backgroundColor: '#fdfaf5', color: '#78716c', padding: '3px 8px', borderRadius: '6px' }}><Calendar size={10} /> {todo.due_date}</span>}
                                {deadlineStatus && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', backgroundColor: deadlineStatus.bg, color: deadlineStatus.text, fontWeight: 'bold' }}><AlertCircle size={10} /> {deadlineStatus.label}</span>}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => startEditing(todo)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><Edit3 size={15} /></button>
                            <button onClick={() => deleteTodo(todo.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          </div>
                        </div>

                        {todo.subtasks && todo.subtasks.length > 0 && (
                          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(230, 222, 203, 0.6)', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '30px' }}>
                            {todo.subtasks.map((sub) => (
                              <div key={sub.id} style={{ fontSize: '12px', color: '#78716c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#a8a29e' }}></div>
                                <span>{sub.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* KONTEN UTAMA: HABIT TRACKER */}
      {mainTab === 'habit' && (
        <>
          <div style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '16px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px', fontWeight: 600 }}>
              <span style={{ color: '#78716c' }}>Skor Kedisiplinan Hari Ini</span>
              <span style={{ color: '#44403c', fontWeight: 'bold' }}>{completedHabitsTodayCount} dari {totalHabitsCount} habit ({habitDailyPercentage}%)</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e9e2d0', height: '8px', borderRadius: '9999px', overflow: 'hidden', border: '1px solid #dccfb8', padding: '1px' }}>
              <div style={{ backgroundColor: '#166534', height: '100%', borderRadius: '9999px', width: `${habitDailyPercentage}%`, transition: 'width 0.5s' }}></div>
            </div>
          </div>

          <form onSubmit={addHabit} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#44403c' }}>Tambah Habit Rutin</h2>
            <input
              type="text"
              value={habitTitle}
              onChange={(e) => setHabitTitle(e.target.value)}
              placeholder="Contoh: Latihan Piano, Olahraga, Membaca..."
              style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none' }}
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600, color: '#78716c', display: 'block', marginBottom: '4px' }}>Kategori:</label>
                <select
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '10px', padding: '10px', fontSize: '12px', outline: 'none' }}
                >
                  <option value="Pribadi">Pribadi</option>
                  <option value="Pekerjaan">Pekerjaan</option>
                  <option value="Side Hustle">Side Hustle</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600, color: '#78716c', display: 'block', marginBottom: '4px' }}>Frekuensi:</label>
                <select
                  value={habitFrequency}
                  onChange={(e) => setHabitFrequency(e.target.value as any)}
                  style={{ width: '100%', backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '10px', padding: '10px', fontSize: '12px', outline: 'none' }}
                >
                  <option value="daily">Setiap Hari</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', marginTop: '4px' }}
            >
              <Plus size={16} /> Simpan Habit Baru
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#78716c', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={14} /> Daftar Habit & Evaluasi Bulanan
            </div>
            {habits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a8a29e', fontSize: '12px', backgroundColor: '#f4efe6', borderRadius: '16px', border: '1px solid #e6decb' }}>
                Belum ada habit rutin.
              </div>
            ) : (
              habits.map((habit) => {
                const currentDates = habit.completed_dates || [];
                const isDoneToday = currentDates.includes(todayStr);
                const monthStats = getCurrentMonthStats(currentDates);

                // Helper untuk membuat array 7 hari ke belakang (mini grid utama)
                const getLast7Days = () => {
                  const days = [];
                  for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    
                    const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'narrow' });
                    const dayNumber = d.getDate();
                    days.push({ dateStr, dayLabel, dayNumber });
                  }
                  return days;
                };

                const pastDays = getLast7Days();

                const toggleHabitDate = async (targetDateStr: string) => {
                  const isCheckedOnTarget = currentDates.includes(targetDateStr);
                  let updatedDates: string[];
                  
                  if (isCheckedOnTarget) {
                    updatedDates = currentDates.filter((d) => d !== targetDateStr);
                  } else {
                    updatedDates = [...currentDates, targetDateStr];
                    if (targetDateStr === todayStr) {
                      confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 }, colors: ['#166534', '#22c55e', '#84cc16'] });
                    }
                  }

                  const { error } = await supabase
                    .from('habits')
                    .update({ completed_dates: updatedDates })
                    .eq('id', habit.id);

                  if (!error) fetchHabits();
                };

                return (
                  <div key={habit.id} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e6decb', backgroundColor: '#f4efe6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
                        onClick={() => toggleHabitToday(habit)}
                      >
                        {isDoneToday ? (
                          <CheckCircle2 style={{ color: '#166534', flexShrink: 0 }} size={22} />
                        ) : (
                          <Circle style={{ color: '#a8a29e', flexShrink: 0 }} size={22} />
                        )}
                        <div>
                          <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: isDoneToday ? '#166534' : '#292524', textDecoration: isDoneToday ? 'line-through' : 'none' }}>
                            {habit.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '10px', color: '#78716c' }}>
                            <span>Kategori: {habit.category}</span>
                            <span>•</span>
                            <span style={{ textTransform: 'capitalize' }}>Tipe: {habit.frequency_type}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteHabit(habit.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }} title="Hapus Habit">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* STATISTIK BULAN INI & TOMBOL BUKA KALENDER DETAIL */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', padding: '8px 12px', borderRadius: '10px', fontSize: '11px' }}>
                      <span style={{ color: '#78716c', fontWeight: 500 }}>
                        Bulan ini: <strong style={{ color: '#166534' }}>{monthStats.countThisMonth}</strong> dari {monthStats.totalElapsed} hari ({monthStats.percentage}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCalendarHabitId(habit.id);
                          setModalYear(new Date().getFullYear());
                          setModalMonth(new Date().getMonth());
                        }}
                        style={{ background: 'none', border: 'none', color: '#166534', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                      >
                        <Calendar size={13} /> Lihat Kalender Bulan Ini
                      </button>
                    </div>

                    {/* MINI GRID 7 HARI TERAKHIR */}
                    <div style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', padding: '10px 12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#78716c', fontWeight: 600 }}>
                        <span>Riwayat 7 Hari Terakhir (Klik untuk ubah)</span>
                        <span>Total sukses: {currentDates.length}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                        {pastDays.map((item) => {
                          const isChecked = currentDates.includes(item.dateStr);
                          const isToday = item.dateStr === todayStr;

                          return (
                            <button
                              key={item.dateStr}
                              type="button"
                              onClick={() => toggleHabitDate(item.dateStr)}
                              title={`Ubah status tanggal ${item.dateStr}`}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '6px 2px',
                                borderRadius: '8px',
                                border: '1px solid',
                                cursor: 'pointer',
                                backgroundColor: isChecked ? '#166534' : '#f4efe6',
                                borderColor: isChecked ? '#166534' : isToday ? '#b45309' : '#e2d9c4',
                                color: isChecked ? '#ffffff' : '#57534e',
                                fontSize: '10px',
                                fontWeight: isToday ? 'bold' : 'normal'
                              }}
                            >
                              <span style={{ opacity: 0.8 }}>{item.dayLabel}</span>
                              <span style={{ fontSize: '11px', marginTop: '2px' }}>{item.dayNumber}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* MODAL KALENDER BULANAN FULL */}
          {activeCalendarHabitId && (() => {
            const currentHabit = habits.find((h) => h.id === activeCalendarHabitId);
            if (!currentHabit) return null;

            const monthNames = [
              'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];

            const calendarDays = getMonthCalendarDays(modalYear, modalMonth, currentHabit.completed_dates || []);

            const prevMonth = () => {
              if (modalMonth === 0) {
                setModalMonth(11);
                setModalYear(modalYear - 1);
              } else {
                setModalMonth(modalMonth - 1);
              }
            };

            const nextMonth = () => {
              if (modalMonth === 11) {
                setModalMonth(0);
                setModalYear(modalYear + 1);
              } else {
                setModalMonth(modalMonth + 1);
              }
            };

            const toggleHabitDateModal = async (targetDateStr: string) => {
              const currentDates = currentHabit.completed_dates || [];
              const isCheckedOnTarget = currentDates.includes(targetDateStr);
              let updatedDates: string[];
              
              if (isCheckedOnTarget) {
                updatedDates = currentDates.filter((d) => d !== targetDateStr);
              } else {
                updatedDates = [...currentDates, targetDateStr];
                if (targetDateStr === todayStr) {
                  confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 }, colors: ['#166534', '#22c55e', '#84cc16'] });
                }
              }

              const { error } = await supabase
                .from('habits')
                .update({ completed_dates: updatedDates })
                .eq('id', currentHabit.id);

              if (!error) fetchHabits();
            };

            return (
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
                <div style={{ backgroundColor: '#fcfaf7', border: '1px solid #e6decb', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                  
                  {/* Header Modal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#292524' }}>{currentHabit.title}</h3>
                      <span style={{ fontSize: '11px', color: '#78716c' }}>Kalender Detail Evaluasi Bulanan</span>
                    </div>
                    <button onClick={() => setActiveCalendarHabitId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716c' }}>
                      <X size={20} />
                    </button>
                  </div>

                  {/* Navigasi Bulan / Tahun */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4efe6', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2d9c4' }}>
                    <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57534e', display: 'flex', alignItems: 'center' }}>
                      <ChevronLeft size={18} />
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#44403c' }}>
                      {monthNames[modalMonth]} {modalYear}
                    </span>
                    <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57534e', display: 'flex', alignItems: 'center' }}>
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* Header Nama Hari */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', color: '#78716c' }}>
                    <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                  </div>

                  {/* Grid Tanggal Sebulan Penuh */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {calendarDays.map((item, idx) => {
                      if (item.empty) {
                        return <div key={`empty-${idx}`} />;
                      }

                      return (
                        <button
                          key={item.dateStr}
                          type="button"
                          onClick={() => toggleHabitDateModal(item.dateStr!)}
                          title={`Klik untuk ubah tanggal ${item.dateStr}`}
                          style={{
                            aspectRatio: '1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            border: '1px solid',
                            cursor: 'pointer',
                            backgroundColor: item.isChecked ? '#166534' : '#f4efe6',
                            borderColor: item.isChecked ? '#166534' : item.isToday ? '#b45309' : '#e2d9c4',
                            color: item.isChecked ? '#ffffff' : '#292524',
                            fontSize: '12px',
                            fontWeight: item.isToday ? 'bold' : 'normal'
                          }}
                        >
                          {item.day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tombol Tutup */}
                  <button
                    onClick={() => setActiveCalendarHabitId(null)}
                    style={{ backgroundColor: '#292524', color: '#f5f5f4', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '4px' }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </main>
  );
}