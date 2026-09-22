"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase.from("todos").select("*").order("id", { ascending: false });
    if (error) console.error("Error fetching todos:", error);
    else if (data) setTodos(data);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { error } = await supabase.from("todos").insert([{ task: newTask, is_completed: false }]);
    if (error) {
      console.error("Error adding todo:", error);
    } else {
      setNewTask("");
      fetchTodos();
    }
  };

  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) console.error("Error deleting todo:", error);
    else fetchTodos();
  };

  return (
    <div className={darkMode ? "dark bg-[#0a0a0a] text-[#ededed] min-h-screen" : "bg-white text-zinc-900 min-h-screen"}>
      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">To Do List Roy</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1.5 text-xs font-medium border border-zinc-500 rounded-md transition hover:opacity-80"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Tambah tugas baru..."
            className="flex-1 px-3 py-2 text-sm border border-zinc-400 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-600"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition"
          >
            Simpan
          </button>
        </form>

        <div className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex justify-between items-center p-3 border border-zinc-300 dark:border-zinc-800 rounded-md bg-zinc-50 dark:bg-zinc-900/50"
            >
              <span className={`text-sm ${todo.is_completed ? "line-through text-zinc-400" : ""}`}>
                {todo.task}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-xs text-red-500 hover:text-red-400 px-2 py-1"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}