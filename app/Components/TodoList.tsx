'use client';

import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp, Edit3, X } from 'lucide-react';
import { Todo, Subtask, Priority, Frequency } from '../types';

interface TodoListProps {
  todos: Todo[];
  activeTab: Frequency;
  setActiveTab: (tab: Frequency) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (c: string) => void;
  addTodo: (title: string, priority: Priority, category: string, dueDate: string, subtasks: Subtask[]) => Promise<void>;
  toggleTodo: (id: string, status: boolean) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodo: (updatedTodo: Todo) => Promise<void>;
  progressPct: number;
}

export function TodoList({
  todos, activeTab, setActiveTab, searchQuery, setSearchQuery,
  selectedCategoryFilter, setSelectedCategoryFilter, addTodo, toggleTodo, deleteTodo, updateTodo, progressPct
}: TodoListProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>('Pribadi');
  const [dueDate, setDueDate] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtaskTitle.trim(), is_completed: false }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTodo(title.trim(), priority, category, dueDate, subtasks);
    setTitle(''); setDueDate(''); setSubtasks([]);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo || !editingTodo.title.trim()) return;
    await updateTodo(editingTodo);
    setEditingTodo(null);
  };

  const filteredTodos = todos.filter(t => 
    (selectedCategoryFilter === 'All' || t.category === selectedCategoryFilter) && 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
          <span style={{ color: '#78716c' }}>Progress Tugas</span>
          <span>{progressPct}% Selesai</span>
        </div>
        <div style={{ width: '100%', backgroundColor: '#e9e2d0', height: '8px', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#44403c', height: '100%', width: `${progressPct}%`, transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {(['daily', 'weekly', 'monthly'] as Frequency[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: activeTab === tab ? '#292524' : '#f4efe6', color: activeTab === tab ? '#f5f5f4' : '#78716c' }}>
            {tab === 'daily' ? 'Harian' : tab === 'weekly' ? 'Mingguan' : 'Bulanan'}
          </button>
        ))}
      </div>

      <input type="text" placeholder="Cari tugas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e6decb', backgroundColor: '#f4efe6', marginBottom: '16px', outline: 'none', fontSize: '13px' }} />

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tambah tugas baru..." style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2d9c4', background: '#fcfaf7', fontSize: '12px' }}>
            <option value="Pribadi">Pribadi</option>
            <option value="Pekerjaan">Pekerjaan</option>
            <option value="Side Hustle">Side Hustle</option>
          </select>
          <select value={priority} onChange={e => setPriority(e.target.value as Priority)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2d9c4', background: '#fcfaf7', fontSize: '12px' }}>
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
          </select>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ padding: '8px', borderRadius: '12px', border: '1px solid #e2d9c4', background: '#fcfaf7', fontSize: '11px' }} />
        </div>

        <div style={{ borderTop: '1px solid #e6decb', paddingTop: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#78716c', display: 'block', marginBottom: '6px' }}>Sub-tugas Detail</label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <input type="text" value={newSubtaskTitle} onChange={e => setNewSubtaskTitle(e.target.value)} placeholder="Tambah langkah kecil..." style={{ flex: 1, backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '10px', padding: '8px', fontSize: '12px', outline: 'none' }} />
            <button type="button" onClick={handleAddSubtask} style={{ backgroundColor: '#e9e2d0', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Tambah</button>
          </div>
          {subtasks.map((s: Subtask) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', background: '#fcfaf7', padding: '4px 8px', borderRadius: '8px', marginBottom: '4px' }}>
              <span>- {s.title}</span>
              <button type="button" onClick={() => handleRemoveSubtask(s.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>

        <button type="submit" style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Simpan Tugas</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTodos.map((todo: Todo) => {
          const isExpanded = expandedTodoId === todo.id;
          return (
            <div key={todo.id} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e6decb', backgroundColor: '#f4efe6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div onClick={() => toggleTodo(todo.id, todo.is_completed)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                  {todo.is_completed ? <CheckCircle2 color="#78716c" size={20} /> : <Circle color="#a8a29e" size={20} />}
                  <span style={{ fontSize: '14px', fontWeight: 600, textDecoration: todo.is_completed ? 'line-through' : 'none' }}>{todo.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => setEditingTodo({ ...todo })} style={{ background: 'none', border: 'none', color: '#78716c', cursor: 'pointer' }}><Edit3 size={16} /></button>
                  {todo.subtasks && todo.subtasks.length > 0 && (
                    <button onClick={() => setExpandedTodoId(isExpanded ? null : todo.id)} style={{ background: 'none', border: 'none', color: '#78716c', cursor: 'pointer' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                  <button onClick={() => deleteTodo(todo.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>

              {isExpanded && todo.subtasks && todo.subtasks.length > 0 && (
                <div style={{ marginTop: '10px', paddingLeft: '30px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {todo.subtasks.map((sub: Subtask) => (
                    <div key={sub.id} style={{ fontSize: '12px', color: '#57534e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '4px', height: '4px', backgroundColor: '#78716c', borderRadius: '50%' }}></span>
                      {sub.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingTodo && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <form onSubmit={handleSaveEdit} style={{ backgroundColor: '#fcfaf7', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>Edit Tugas & Sub-tugas</h3>
              <button type="button" onClick={() => setEditingTodo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <input type="text" value={editingTodo.title} onChange={e => setEditingTodo({ ...editingTodo, title: e.target.value })} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #e2d9c4', background: '#fff' }} />
            
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#78716c' }}>Kelola Sub-tugas:</label>
              {editingTodo.subtasks.map((s: Subtask, idx: number) => (
                <div key={s.id} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input type="text" value={s.title} onChange={e => {
                    const updatedSub = [...editingTodo.subtasks];
                    updatedSub[idx].title = e.target.value;
                    setEditingTodo({ ...editingTodo, subtasks: updatedSub });
                  }} style={{ flex: 1, padding: '6px', fontSize: '12px', border: '1px solid #e2d9c4', borderRadius: '6px' }} />
                  <button type="button" onClick={() => {
                    const updatedSub = editingTodo.subtasks.filter(sub => sub.id !== s.id);
                    setEditingTodo({ ...editingTodo, subtasks: updatedSub });
                  }} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            <button type="submit" style={{ backgroundColor: '#292524', color: '#f5f5f4', padding: '10px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Simpan Perubahan</button>
          </form>
        </div>
      )}
    </div>
  );
}