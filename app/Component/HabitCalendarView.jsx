'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function HabitCalendarView({ habits, addHabit, habitTitle, setHabitTitle, toggleHabitDay, deleteHabit }) {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="space-y-6">
      <form onSubmit={addHabit} className="bg-[#f4efe6] border border-[#e6decb] p-5 rounded-2xl flex flex-col gap-3">
        <input
          type="text"
          value={habitTitle}
          onChange={e => setHabitTitle(e.target.value)}
          placeholder="Tambah habit rutin (cth: Membaca 15 menit)..."
          className="bg-[#fcfaf7] border border-[#e2d9c4] rounded-xl p-3 text-sm outline-none"
        />
        <button type="submit" className="w-full bg-[#292524] text-[#f5f5f4] p-3 rounded-xl font-bold text-sm cursor-pointer">
          Tambah Habit Baru
        </button>
      </form>

      <div className="bg-[#f4efe6] border border-[#e6decb] p-5 rounded-2xl overflow-x-auto">
        <h2 className="text-sm font-bold text-[#292524] mb-4">Kalender Habit Mingguan</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e2d9c4] text-[#78716c] text-xs uppercase">
              <th className="py-2 px-2 font-semibold">Habit</th>
              {days.map((day, idx) => (
                <th key={idx} className="py-2 px-1 text-center font-semibold">{day}</th>
              ))}
              <th className="py-2 px-1 text-center font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e9e2d0] text-sm">
            {habits.map((habit) => (
              <tr key={habit.id} className="hover:bg-[#f2ecdf]">
                <td className="py-3 px-2 font-semibold text-[#292524]">{habit.title}</td>
                {(habit.completed_week || [false, false, false, false, false, false, false]).map((status, dayIdx) => (
                  <td key={dayIdx} className="py-3 px-1 text-center">
                    <button
                      onClick={() => toggleHabitDay(habit.id, dayIdx)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        status 
                          ? 'bg-[#166534] text-white' 
                          : 'bg-[#e9e2d0] text-[#a8a29e] hover:bg-[#dcd4c0]'
                      }`}
                    >
                      {status ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </td>
                ))}
                <td className="py-3 px-1 text-center">
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="bg-transparent border-none text-[#a8a29e] hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {habits.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-[#78716c] text-xs">
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