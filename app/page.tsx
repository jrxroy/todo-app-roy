"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Todo {
  id: number;
  task: string;
  is_completed: boolean;
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching todos:", error);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { error } = await supabase
      .from("todos")
      .insert([{ task: newTask, is_completed: false }]);

    if (error) {
      console.error("Error adding todo:", error);
    } else {
      setNewTask("");
      fetchTodos();
    }
  };

  const toggleComplete = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("todos")
      .update({ is_completed: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
    } else {
      fetchTodos();
    }
  };

  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
    } else {
      fetchTodos();
    }
  };

  return (
    <div className={`${darkMode ? "dark bg-[#0a0a0a] text-[#ededed]" : "bg-white text-zinc-900"} min-h-screen transition-colors duration-200`}>
      <main className="max-w-xl mx-auto p-6 md:p-8">
        {/* Header & Tombol Dark Mode */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">To Do List Roy</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3.5 py-2 text-xs font-medium border border-zinc-400 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={addTodo} className="flex gap-2.5 mb-8">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Tambahkan tugas baru..."
            className="flex-1 px-5 py-3 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-6 py-3 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 shadow-sm"
            disabled={loading || !newTask.trim()}
          >
            {loading ? "..." : "Tambahkan"}
          </button>
        </form>

        {/* Daftar Tugas */}
        {loading ? (
          <p className="text-center text-sm text-zinc-500 py-10">Memuat data...</p>
        ) : (
          <div className="space-y-3">
            {todos.length === 0 ? (
              <p className="text-center text-sm text-zinc-500 py-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                Belum ada tugas. Tambahkan satu di atas! 🎉
              </p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={todo.is_completed}
                      onChange={() => toggleComplete(todo.id, todo.is_completed)}
                      className="w-5 h-5 rounded-md border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0 accent-blue-600"
                    />
                    <span className={`text-sm break-words flex-1 ${todo.is_completed ? "line-through text-zinc-500 dark:text-zinc-600" : ""}`}>
                      {todo.task}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-400 px-3 py-1.5 rounded-md hover:bg-red-950/20 transition-colors flex-shrink-0"
                  >
                    Hapus
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}