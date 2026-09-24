'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Trash2, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Habit } from '../types';

interface HabitTrackerProps {
  habits: Habit[];
  addHabit: (title: string) => Promise<void>;
  toggleHabitWeekDay: (habitId: string, dayIndex: number) => Promise<void>;
  toggleHabitDate: (habitId: string, dateStr: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  todayStr: string;
}

export function HabitTracker({ habits, addHabit, toggleHabitWeekDay, toggleHabitDate, deleteHabit, todayStr }: HabitTrackerProps) {
  const [habitTitle, setHabitTitle] = useState('');
  const [activeCalendarHabitId, setActiveCalendarHabitId] = useState<string | null>(null);
  const now = new Date();
  const [modalYear, setModalYear] = useState<number>(now.getFullYear());
  const [modalMonth, setModalMonth] = useState<number>(now.getMonth());
  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    await addHabit(habitTitle.trim());
    setHabitTitle('');
  };

  const getMonthCalendarDays = (year: number, month: number, completedDates: string[]) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) days.push({ empty: true });
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ empty: false, day, dateStr, isChecked: completedDates.includes(dateStr), isToday: dateStr === todayStr });
    }
    return days;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          value={habitTitle}
          onChange={e => setHabitTitle(e.target.value)}
          placeholder="Tambah habit rutin (cth: Olahraga, Membaca)..."
          style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none' }}
        />
        <button type="submit" style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
          Tambah Habit Baru
        </button>
      </form>

      <div style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#292524', margin: '0 0 16px 0' }}>Tracker Habit Mingguan & Kalender</h2>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2d9c4', color: '#78716c', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 4px', fontWeight: 600 }}>Habit</th>
              {daysOfWeek.map((day, idx) => (
                <th key={idx} style={{ padding: '8px 2px', textAlign: 'center', fontWeight: 600 }}>{day}</th>
              ))}
              <th style={{ padding: '8px 2px', textAlign: 'center', fontWeight: 600 }}>Aksi</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '13px' }}>
            {habits.map((habit: Habit) => {
              const weekStatuses = habit.completed_week || [false, false, false, false, false, false, false];
              return (
                <tr key={habit.id} style={{ borderBottom: '1px solid #e9e2d0' }}>
                  <td style={{ padding: '12px 4px' }}>
                    <div style={{ fontWeight: 600, color: '#292524', marginBottom: '4px' }}>{habit.title}</div>
                    <button onClick={() => { setActiveCalendarHabitId(habit.id); setModalYear(now.getFullYear()); setModalMonth(now.getMonth()); }} style={{ background: 'none', border: 'none', color: '#166534', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}>
                      <Calendar size={12} /> Kalender Detail
                    </button>
                  </td>
                  {weekStatuses.map((status: boolean, dayIdx: number) => (
                    <td key={dayIdx} style={{ padding: '12px 2px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleHabitWeekDay(habit.id, dayIdx)}
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
                    <button onClick={() => deleteHabit(habit.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeCalendarHabitId && (() => {
        const h = habits.find((item: Habit) => item.id === activeCalendarHabitId);
        if (!h) return null;
        const days = getMonthCalendarDays(modalYear, modalMonth, h.completed_dates || []);
        return (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
            <div style={{ backgroundColor: '#fcfaf7', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>Kalender: {h.title}</h3>
                <button onClick={() => setActiveCalendarHabitId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0' }}>
                <button onClick={() => {
                  if (modalMonth === 0) { setModalMonth(11); setModalYear(modalYear - 1); } else { setModalMonth(modalMonth - 1); }
                }} style={{ background: 'none', border: '1px solid #dccfb8', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{new Date(modalYear, modalMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => {
                  if (modalMonth === 11) { setModalMonth(0); setModalYear(modalYear + 1); } else { setModalMonth(modalMonth + 1); }
                }} style={{ background: 'none', border: '1px solid #dccfb8', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer' }}><ChevronRight size={16} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {days.map((item: any, idx: number) => item.empty ? <div key={idx} /> : (
                  <button key={item.dateStr} onClick={() => toggleHabitDate(h.id, item.dateStr!)} style={{ aspectRatio: '1', borderRadius: '8px', border: '1px solid', backgroundColor: item.isChecked ? '#166534' : '#f4efe6', borderColor: item.isChecked ? '#166534' : '#e2d9c4', color: item.isChecked ? '#fff' : '#292524', cursor: 'pointer', fontWeight: item.isToday ? 'bold' : 'normal', fontSize: '12px' }}>
                    {item.day}
                  </button>
                ))}
              </div>
              <button onClick={() => setActiveCalendarHabitId(null)} style={{ backgroundColor: '#292524', color: '#f5f5f4', padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Tutup</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}