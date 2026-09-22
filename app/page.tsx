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

  const toggleComplete = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from("todos").update({ is_completed: !currentStatus }).eq("id", id);
    if (error) console.error("Error updating todo:", error);
    else fetchTodos();
  };

  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) console.error("Error deleting todo:", error);
    else fetchTodos();
  };

  return (
    <div className={darkMode ? "dark bg-[#0a0a0a] text-[#ededed] min-h-screen" : "bg-white text-zinc-900 min-h-screen"}>
      <main className="max-w-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">To Do List Roy</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 text-xs border border-zinc-400 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <form onSubmit={addTodo} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Tambah tugas baru..."
            className="flex-1 border p-2 rounded dark:bg-zinc-900 dark:border-zinc-700"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Tambah
          </button>
        </form>

        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex justify-between items-center p-3 border rounded dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.is_completed}
                  onChange={() => toggleComplete(todo.id, todo.is_completed)}
                  className="cursor-pointer"
                />
                <span className={todo.is_completed ? "line-through text-zinc-400" : ""}>
                  {todo.task}
                </span>
              </div>
              <button onClick={() => deleteTodo(todo.id)} className="text-red-500 text-sm">
                Hapus
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}