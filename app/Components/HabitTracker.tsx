'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Trash2 } from 'lucide-react';
import { Habit } from '../types';

interface HabitTrackerProps {
  habits: Habit[];
  addHabit: (title: string) => Promise<void>;
  toggleHabitDay: (habitId: string, dayIndex: number) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
}

export function HabitTracker({ habits, addHabit, toggleHabitDay, deleteHabit }: HabitTrackerProps) {
  const [habitTitle, setHabitTitle] = useState('');
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    await addHabit(habitTitle.trim());
    setHabitTitle('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          value={habitTitle}
          onChange={e => setHabitTitle(e.target.value)}
          placeholder="Tambah habit rutin (cth: Membaca 15 menit)..."
          style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none' }}
        />
        <button type="submit" style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
          Tambah Habit Baru
        </button>
      </form>

      <div style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#292524', margin: '0 0 16px 0' }}>Kalender Habit Mingguan</h2>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2d9c4', color: '#78716c', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 4px', fontWeight: 600 }}>Habit</th>
              {days.map((day, idx) => (
                <th key={idx} style={{ padding: '8px 2px', textAlign: 'center', fontWeight: 600 }}>{day}</th>
              ))}
              <th style={{ padding: '8px 2px', textAlign: 'center', fontWeight: 600 }}>Aksi</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '13px' }}>
            {habits.map((habit) => (
              <tr key={habit.id} style={{ borderBottom: '1px solid #e9e2d0' }}>
                <td style={{ padding: '12px 4px', fontWeight: 600, color: '#292524' }}>{habit.title}</td>
                {(habit.completed_week || [false, false, false, false, false, false, false]).map((status, dayIdx) => (
                  <td key={dayIdx} style={{ padding: '12px 2px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleHabitDay(habit.id, dayIdx)}
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: status ? '#166534' : '#e9e2d0',
                        color: status ? '#ffffff' : '#a8a29e',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {status ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </td>
                ))}
                <td style={{ padding: '12px 2px', textAlign: 'center' }}>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {habits.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#78716c', fontSize: '12px' }}>
                  Belum ada habit mingguan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}