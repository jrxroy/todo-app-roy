'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, CheckCircle2, Circle, Trash2, Calendar, Tag, Compass, Search, AlertCircle, Edit3, X } from 'lucide-react';
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

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<any>('Pribadi');
  const [dueDate, setDueDate] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editCategory, setEditCategory] = useState<any>('Pribadi');
  const [editDueDate, setEditDueDate] = useState('');
  const [editSubtasks, setEditSubtasks] = useState<Subtask[]>([]);
  const [editNewSubtaskTitle, setEditNewSubtaskTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [activeTab]);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('frequency', activeTab)
      .order('created_at', { ascending: false });

    if (!error && data) setTodos(data);
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
      // Membersihkan spasi pada kategori untuk menghindari error enum database
      const cleanCategory = category === 'Side Hustle' ? 'SideHustle' : category;

      const { error } = await supabase.from('todos').insert([
        {
          title: title.trim(),
          frequency: activeTab,
          priority,
          category: cleanCategory,
          due_date: dueDate || null,
          subtasks,
        },
      ]);

      if (error) {
        console.error('Error Supabase:', error.message);
        alert('Gagal menyimpan: ' + error.message);
      } else {
        setTitle('');
        setDueDate('');
        setSubtasks([]);
        fetchTodos();
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    if (!currentStatus) {
      confetti({ 
        particleCount: 80, 
        spread: 60, 
        origin: { y: 0.7 },
        colors: ['#78350f', '#b45309', '#d97706', '#a8a29e']
      });
    }

    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !currentStatus })
      .eq('id', id);

    if (!error) fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) fetchTodos();
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
    setEditCategory(todo.category === 'SideHustle' ? 'Side Hustle' : todo.category);
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

    const cleanEditCategory = editCategory === 'Side Hustle' ? 'SideHustle' : editCategory;

    const { error } = await supabase
      .from('todos')
      .update({
        title: editTitle,
        priority: editPriority,
        category: cleanEditCategory,
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
    const today = new Date().toISOString().split('T')[0];
    if (dateStr < today) {
      return { label: 'Overdue', bg: '#fee2e2', text: '#991b1b', border: '#f87171' };
    } else if (dateStr === today) {
      return { label: 'Hari Ini', bg: '#292524', text: '#f5f5f4', border: '#44403c' };
    }
    return null;
  };

  const filteredTodos = todos.filter((todo) => {
    const formattedTodoCategory = todo.category === 'SideHustle' ? 'Side Hustle' : todo.category;
    const matchesCategory = selectedCategoryFilter === 'All' || formattedTodoCategory === selectedCategoryFilter;
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const completedCount = todos.filter((t) => t.is_completed).length;
  const progressPercentage = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fcfaf7', color: '#292524', padding: '24px 16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4efe6', padding: '20px', borderRadius: '16px', border: '1px solid #e6decb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ padding: '6px', backgroundColor: '#e9e2d0', borderRadius: '8px', color: '#44403c', border: '1px solid #dccfb8', display: 'flex' }}>
              <Compass size={16} />
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '-0.025em', margin: 0 }}>
              To do List Roy
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#78716c', fontWeight: 500, margin: 0 }}>Pekerjaan, Side Hustle & Fokus Pribadi</p>
        </div>
      </header>

      {/* Statistik */}
      <div style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '16px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px', fontWeight: 600 }}>
          <span style={{ color: '#78716c' }}>Pencapaian Periode Ini</span>
          <span style={{ color: '#44403c', fontWeight: 'bold' }}>{completedCount} dari {todos.length} selesai ({progressPercentage}%)</span>
        </div>
        <div style={{ width: '100%', backgroundColor: '#e9e2d0', height: '8px', borderRadius: '9999px', overflow: 'hidden', border: '1px solid #dccfb8', padding: '1px' }}>
          <div style={{ backgroundColor: '#44403c', height: '100%', borderRadius: '9999px', width: `${progressPercentage}%`, transition: 'width 0.5s' }}></div>
        </div>
      </div>

      {/* Tab Navigasi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', backgroundColor: '#f4efe6', padding: '6px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #e6decb' }}>
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
              boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'daily' ? 'Harian' : tab === 'weekly' ? 'Mingguan' : 'Bulanan'}
          </button>
        ))}
      </div>

      {/* Form Input */}
      <form onSubmit={addTodo} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Tambah rencana ${activeTab} baru...`}
          style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#292524', outline: 'none' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: '#78716c', display: 'block', marginBottom: '4px' }}>Kategori:</label>
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
            <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: '#78716c', display: 'block', marginBottom: '4px' }}>Deadline:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ width: '100%', backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '9px 12px', fontSize: '12px', color: '#292524', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Prioritas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
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

        {/* Sub-tugas */}
        <div style={{ borderTop: '1px solid #e6decb', paddingTop: '14px' }}>
          <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: '#78716c', display: 'block', marginBottom: '6px' }}>Sub-tugas (Langkah Kecil):</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
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
          {subtasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {subtasks.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', backgroundColor: '#fcfaf7', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2d9c4', color: '#44403c' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#78716c' }}></span>
                    {s.title}
                  </span>
                  <button type="button" onClick={() => removeSubtask(s.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <Plus size={16} /> Simpan Tugas Baru
        </button>
      </form>

      {/* Filter & Pencarian */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
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

      {/* List Tugas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredTodos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#a8a29e', fontSize: '12px', fontWeight: 500, backgroundColor: '#f4efe6', borderRadius: '16px', border: '1px solid #e6decb' }}>
            Tidak ada tugas yang ditemukan.
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isEditing = editingTodoId === todo.id;
            const deadlineStatus = !todo.is_completed ? getDeadlineStatus(todo.due_date) : null;
            const displayCategory = todo.category === 'SideHustle' ? 'Side Hustle' : todo.category;

            return (
              <div
                key={todo.id}
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid #e6decb',
                  backgroundColor: todo.is_completed ? 'rgba(247, 245, 239, 0.6)' : '#f4efe6',
                  color: todo.is_completed ? '#a8a29e' : '#292524',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s'
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#292524', textTransform: 'uppercase' }}>Edit Tugas</span>
                      <button onClick={cancelEditing} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e' }}><X size={16} /></button>
                    </div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#fcfaf7', border: '1px solid #dccfb8', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', color: '#292524', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        style={{ backgroundColor: '#fcfaf7', border: '1px solid #dccfb8', borderRadius: '10px', padding: '8px', fontSize: '12px', color: '#292524', outline: 'none' }}
                      >
                        <option value="Pribadi">Pribadi</option>
                        <option value="Pekerjaan">Pekerjaan</option>
                        <option value="Side Hustle">Side Hustle</option>
                      </select>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        style={{ backgroundColor: '#fcfaf7', border: '1px solid #dccfb8', borderRadius: '10px', padding: '7px 10px', fontSize: '12px', color: '#292524', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: '#78716c' }}>Prioritas:</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['low', 'medium', 'high'] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setEditPriority(p)}
                            style={{
                              fontSize: '10px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              border: '1px solid',
                              backgroundColor: editPriority === p ? '#292524' : '#fcfaf7',
                              borderColor: editPriority === p ? '#292524' : '#dccfb8',
                              color: editPriority === p ? '#f5f5f4' : '#57534e'
                            }}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e6decb', paddingTop: '8px' }}>
                      <label style={{ fontSize: '10px', color: '#78716c', display: 'block', marginBottom: '4px' }}>Sub-tugas:</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={editNewSubtaskTitle}
                          onChange={(e) => setEditNewSubtaskTitle(e.target.value)}
                          placeholder="Tambah sub-tugas..."
                          style={{ flex: 1, backgroundColor: '#fcfaf7', border: '1px solid #dccfb8', borderRadius: '10px', padding: '6px 10px', fontSize: '12px', color: '#292524', outline: 'none' }}
                        />
                        <button type="button" onClick={addEditSubtask} style={{ backgroundColor: '#e9e2d0', border: 'none', fontSize: '11px', padding: '6px 12px', borderRadius: '10px', fontWeight: 500, color: '#44403c', cursor: 'pointer' }}>Tambah</button>
                      </div>
                      {editSubtasks.map((s) => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', backgroundColor: '#fcfaf7', padding: '6px 10px', borderRadius: '8px', marginBottom: '4px', border: '1px solid #dccfb8', color: '#44403c' }}>
                          <span>- {s.title}</span>
                          <button type="button" onClick={() => removeEditSubtask(s.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                      <button onClick={() => saveEditedTodo(todo.id)} style={{ flex: 1, backgroundColor: '#292524', color: '#f5f5f4', padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                        Simpan Perubahan
                      </button>
                      <button onClick={cancelEditing} style={{ backgroundColor: '#e9e2d0', color: '#44403c', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, cursor: 'pointer' }} onClick={() => toggleTodo(todo.id, todo.is_completed)}>
                      {todo.is_completed ? (
                        <CheckCircle2 style={{ color: '#78716c', flexShrink: 0, marginTop: '2px' }} size={20} />
                      ) : (
                        <Circle style={{ color: '#a8a29e', flexShrink: 0, marginTop: '2px' }} size={20} />
                      )}
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em', margin: 0, textDecoration: todo.is_completed ? 'line-through' : 'none', color: todo.is_completed ? '#a8a29e' : '#292524' }}>
                          {todo.title}
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                          <span style={{ fontSize: '10px', backgroundColor: '#eef5ef', color: '#3f6212', border: '1px solid #d8e3d8', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                            <Tag size={10} style={{ color: '#65a30d' }} /> {displayCategory}
                          </span>
                          {todo.due_date && (
                            <span style={{ fontSize: '10px', backgroundColor: '#fdfaf5', color: '#78716c', border: '1px solid #e6decb', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                              <Calendar size={10} style={{ color: '#a8a29e' }} /> {todo.due_date}
                            </span>
                          )}
                          {deadlineStatus && (
                            <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', border: `1px solid ${deadlineStatus.border}`, backgroundColor: deadlineStatus.bg, color: deadlineStatus.text, fontWeight: 'bold' }}>
                              <AlertCircle size={10} /> {deadlineStatus.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e2d9c4', backgroundColor: '#fcfaf7', color: '#57534e' }}>
                        {todo.priority}
                      </span>
                      <button onClick={() => startEditing(todo)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: '4px' }} title="Edit Tugas">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => deleteTodo(todo.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: '4px' }} title="Hapus Tugas">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-tugas list */}
                {!isEditing && todo.subtasks && todo.subtasks.length > 0 && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(230, 222, 203, 0.6)', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '32px' }}>
                    {todo.subtasks.map((sub) => (
                      <div key={sub.id} style={{ fontSize: '12px', color: '#78716c', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#a8a29e' }}></div>
                        <span>{sub.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}