'use client';

import { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, Calendar, Flame, BookOpen, Lightbulb, CheckCircle2 } from 'lucide-react';

interface HabitWorkspaceProps {
  habits: any[];
  addHabit: (e: React.FormEvent) => void;
  habitTitle: string;
  setHabitTitle: (val: string) => void;
  toggleHabitToday: (habit: any) => void;
  deleteHabit: (id: string) => void;
  todayStr: string;
}

export function HabitView({ habits, addHabit, habitTitle, setHabitTitle, toggleHabitToday, deleteHabit, todayStr }: HabitWorkspaceProps) {
  return (
    <div className="space-y-4">
      <form onSubmit={addHabit} className="bg-[#f4efe6] border border-[#e6decb] p-5 rounded-2xl flex flex-col gap-3">
        <input 
          type="text" 
          value={habitTitle} 
          onChange={e => setHabitTitle(e.target.value)} 
          placeholder="Nama Habit Rutin..." 
          className="bg-[#fcfaf7] border border-[#e2d9c4] rounded-xl p-3 text-sm outline-none" 
        />
        <button type="submit" className="w-full bg-[#292524] text-[#f5f5f4] p-3 rounded-xl font-bold text-sm cursor-pointer">
          Tambah Habit
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {habits.map(habit => {
          const done = (habit.completed_dates || []).includes(todayStr);
          return (
            <div key={habit.id} className="p-4 rounded-2xl border border-[#e6decb] bg-[#f4efe6] flex justify-between items-center">
              <div onClick={() => toggleHabitToday(habit)} className="flex items-center gap-3 cursor-pointer">
                {done ? <CheckCircle2 color="#166534" size={22} /> : <Square color="#a8a29e" size={22} />}
                <span className={`font-bold text-sm ${done ? 'line-through text-emerald-800' : 'text-[#292524]'}`}>{habit.title}</span>
              </div>
              <button onClick={() => deleteHabit(habit.id)} className="bg-transparent border-none text-[#a8a29e] cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}