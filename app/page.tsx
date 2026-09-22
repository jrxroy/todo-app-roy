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
  category: 'Pekerjaan' | 'Side Hustle' | 'Pribadi';
  is_completed: boolean;
  due_date: string;
  subtasks: Subtask[];
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State Form Tambah
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<'Pekerjaan' | 'Side Hustle' | 'Pribadi'>('Pribadi');
  const [dueDate, setDueDate] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);

  // State Form Edit
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editCategory, setEditCategory] = useState<'Pekerjaan' | 'Side Hustle' | 'Pribadi'>('Pribadi');
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

    const { error } = await supabase.from('todos').insert([
      {
        title,
        frequency: activeTab,
        priority,
        category,
        due_date: dueDate || null,
        subtasks,
        user_id: '00000000-0000-0000-0000-000000000000',
      },
    ]);

    if (!error) {
      setTitle('');
      setDueDate('');
      setSubtasks([]);
      fetchTodos();
    }
    setLoading(false);
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
    const today = new Date().toISOString().split('T')[0];
    if (dateStr < today) {
      return { label: 'Overdue', className: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' };
    } else if (dateStr === today) {
      return { label: 'Hari Ini', className: 'bg-stone-800 text-stone-100 border-stone-700 font-bold' };
    }
    return null;
  };

  const filteredTodos = todos.filter((todo) => {
    const matchesCategory = selectedCategoryFilter === 'All' || todo.category === selectedCategoryFilter;
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const completedCount = todos.filter((t) => t.is_completed).length;
  const progressPercentage = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#fcfaf7] text-stone-800 p-4 sm:p-8 max-w-xl mx-auto font-sans selection:bg-stone-300 selection:text-stone-900">
      {/* Header Earth Tone */}
      <header className="mb-8 flex justify-between items-center bg-[#f4efe6] p-5 rounded-2xl border border-[#e6decb] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-[#e9e2d0] rounded-lg text-stone-700 border border-[#dccfb8]">
              <Compass size={16} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              To do List Roy
            </h1>
          </div>
          <p className="text-xs text-stone-500 font-medium tracking-wide">Pekerjaan, Side Hustle & Fokus Pribadi</p>
        </div>
      </header>

      {/* Dashboard Statistik Progres */}
      <div className="bg-[#f4efe6] border border-[#e6decb] p-4 rounded-2xl mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-2.5 text-xs font-semibold">
          <span className="text-stone-500">Pencapaian Periode Ini</span>
          <span className="text-stone-700 font-bold">{completedCount} dari {todos.length} selesai ({progressPercentage}%)</span>
        </div>
        <div className="w-full bg-[#e9e2d0] h-2 rounded-full overflow-hidden border border-[#dccfb8] p-0.5">
          <div 
            className="bg-stone-700 h-full rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Navigasi Tab */}
      <div className="grid grid-cols-3 gap-2 bg-[#f4efe6] p-1.5 rounded-2xl mb-6 border border-[#e6decb] shadow-sm">
        {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-xs font-bold rounded-xl capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-900 hover:bg-[#e9e2d0]/50'
            }`}
          >
            {tab === 'daily' ? 'Harian' : tab === 'weekly' ? 'Mingguan' : 'Bulanan'}
          </button>
        ))}
      </div>

      {/* Form Input Tugas Baru */}
      <form onSubmit={addTodo} className="bg-[#f4efe6] border border-[#e6decb] p-4 sm:p-5 rounded-2xl mb-6 flex flex-col gap-3.5 shadow-sm">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Tambah rencana ${activeTab} baru...`}
          className="bg-[#fcfaf7] border border-[#e2d9c4] rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 transition-all"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block mb-1">Kategori:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-[#fcfaf7] border border-[#e2d9c4] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-stone-500 transition-all"
            >
              <option value="Pribadi">Pribadi</option>
              <option value="Pekerjaan">Pekerjaan (Kantor)</option>
              <option value="Side Hustle">Side Hustle (Penghasilan Tambahan)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block mb-1">Deadline:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#fcfaf7] border border-[#e2d9c4] rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-500 transition-all"
            />
          </div>
        </div>

        {/* Prioritas */}
        <div className="flex items-center justify-between pt-1 px-1">
          <span className="text-xs text-stone-500 font-medium">Prioritas:</span>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all border ${
                  priority === p
                    ? 'bg-stone-800 border-stone-800 text-stone-100'
                    : 'border-[#e2d9c4] text-stone-500 bg-[#fcfaf7] hover:border-stone-400 hover:text-stone-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-tugas Input */}
        <div className="border-t border-[#e6decb] pt-3.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block mb-1.5">Sub-tugas (Langkah Kecil):</label>
          <div className="flex gap-2 mb-2.5">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Tambah checklist kecil..."
              className="flex-1 bg-[#fcfaf7] border border-[#e2d9c4] rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500"
            />
            <button type="button" onClick={addSubtask} className="bg-[#e9e2d0] hover:bg-[#ded5c0] text-stone-700 border border-[#dccfb8] text-xs px-4 py-2 rounded-xl font-semibold transition-all">
              Tambah
            </button>
          </div>
          {subtasks.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {subtasks.map((s) => (
                <div key={s.id} className="flex justify-between items-center text-xs bg-[#fcfaf7] px-3 py-1.5 rounded-xl border border-[#e2d9c4] text-stone-700">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
                    {s.title}
                  </span>
                  <button type="button" onClick={() => removeSubtask(s.id)} className="text-stone-400 hover:text-stone-900 transition-colors font-bold px-1">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-800 hover:bg-stone-900 text-stone-100 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs tracking-wide uppercase mt-1 shadow-sm"
        >
          <Plus size={16} /> Simpan Tugas Baru
        </button>
      </form>

      {/* Bar Pencarian & Filter Kategori */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tugas..."
            className="w-full bg-[#f4efe6] border border-[#e6decb] rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 shadow-sm"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Pribadi', 'Pekerjaan', 'Side Hustle'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`text-[11px] font-medium px-3 py-2 rounded-xl whitespace-nowrap transition-all border ${
                selectedCategoryFilter === cat
                  ? 'bg-stone-800 border-stone-800 text-stone-100 font-bold shadow-sm'
                  : 'bg-[#f4efe6] border-[#e6decb] text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar To-Do */}
      <div className="space-y-3.5">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-16 text-stone-400 text-xs font-medium tracking-wide bg-[#f4efe6] rounded-2xl border border-[#e6decb] shadow-sm">
            Tidak ada tugas yang ditemukan.
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isEditing = editingTodoId === todo.id;
            const deadlineStatus = !todo.is_completed ? getDeadlineStatus(todo.due_date) : null;

            return (
              <div
                key={todo.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-sm ${
                  todo.is_completed
                    ? 'bg-[#f7f5ef]/60 border-[#e6decb] text-stone-400 line-through'
                    : 'bg-[#f4efe6] border-[#e6decb] text-stone-800 hover:border-[#d9cca8]'
                }`}
              >
                {/* JIKA DALAM MODE EDIT */}
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Edit Tugas</span>
                      <button onClick={cancelEditing} className="text-stone-400 hover:text-stone-900"><X size={16} /></button>
                    </div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-[#fcfaf7] border border-[#dccfb8] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        className="bg-[#fcfaf7] border border-[#dccfb8] rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
                      >
                        <option value="Pribadi">Pribadi</option>
                        <option value="Pekerjaan">Pekerjaan (Kantor)</option>
                        <option value="Side Hustle">Side Hustle (Penghasilan Tambahan)</option>
                      </select>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="bg-[#fcfaf7] border border-[#dccfb8] rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-stone-500">Prioritas:</span>
                      <div className="flex gap-1.5">
                        {(['low', 'medium', 'high'] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setEditPriority(p)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase border ${
                              editPriority === p ? 'bg-stone-800 border-stone-800 text-stone-100' : 'border-[#dccfb8] text-stone-600 bg-[#fcfaf7]'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[#e6decb] pt-2">
                      <label className="text-[10px] text-stone-500 block mb-1">Sub-tugas:</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={editNewSubtaskTitle}
                          onChange={(e) => setEditNewSubtaskTitle(e.target.value)}
                          placeholder="Tambah sub-tugas..."
                          className="flex-1 bg-[#fcfaf7] border border-[#dccfb8] rounded-xl px-3 py-1.5 text-xs text-stone-900"
                        />
                        <button type="button" onClick={addEditSubtask} className="bg-[#e9e2d0] text-xs px-3 py-1.5 rounded-xl font-medium text-stone-700">Tambah</button>
                      </div>
                      {editSubtasks.map((s) => (
                        <div key={s.id} className="flex justify-between items-center text-xs bg-[#fcfaf7] px-2.5 py-1 rounded-lg mb-1 border border-[#dccfb8] text-stone-700">
                          <span>- {s.title}</span>
                          <button type="button" onClick={() => removeEditSubtask(s.id)} className="text-stone-400 hover:text-stone-900">×</button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveEditedTodo(todo.id)}
                        className="flex-1 bg-stone-800 hover:bg-stone-900 text-stone-100 py-2 rounded-xl text-xs font-bold"
                      >
                        Simpan Perubahan
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-[#e9e2d0] hover:bg-[#ded5c0] text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  /* JIKA TAMPILAN NORMAL */
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1 cursor-pointer pt-0.5" onClick={() => toggleTodo(todo.id, todo.is_completed)}>
                      {todo.is_completed ? (
                        <CheckCircle2 className="text-stone-500 shrink-0 mt-0.5" size={20} />
                      ) : (
                        <Circle className="text-stone-400 shrink-0 mt-0.5 hover:text-stone-600 transition-colors" size={20} />
                      )}
                      <div>
                        <h3 className={`text-sm font-semibold tracking-wide ${todo.is_completed ? 'text-stone-400' : 'text-stone-900'}`}>
                          {todo.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          <span className="text-[10px] bg-[#eef5ef] text-stone-700 border border-[#d8e3d8] px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                            <Tag size={10} className="text-stone-500" /> {todo.category}
                          </span>
                          {todo.due_date && (
                            <span className="text-[10px] bg-[#fdfaf5] text-stone-700 border border-[#e6decb] px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                              <Calendar size={10} className="text-stone-500" /> {todo.due_date}
                            </span>
                          )}
                          {deadlineStatus && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 border ${deadlineStatus.className}`}>
                              <AlertCircle size={10} /> {deadlineStatus.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-widest border border-[#e2d9c4] bg-[#fcfaf7] text-stone-700">
                        {todo.priority}
                      </span>
                      <button onClick={() => startEditing(todo)} className="text-stone-400 hover:text-stone-900 transition-colors p-1" title="Edit Tugas">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => deleteTodo(todo.id)} className="text-stone-400 hover:text-stone-900 transition-colors p-1" title="Hapus Tugas">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-tugas (Tampilan Normal) */}
                {!isEditing && todo.subtasks && todo.subtasks.length > 0 && (
                  <div className="mt-3.5 pt-3.5 border-t border-[#e6decb]/60 space-y-1.5 pl-8">
                    {todo.subtasks.map((sub) => (
                      <div key={sub.id} className="text-xs text-stone-600 flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div>
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