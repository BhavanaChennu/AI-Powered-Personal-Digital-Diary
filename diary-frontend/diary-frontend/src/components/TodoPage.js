import React, { useEffect, useState } from "react";
import { getTodos, createTodo, toggleTodo, deleteTodo } from "../api/diaryApi";
import BackToHome from "./BackToHome";

function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    getTodos()
      .then((res) => { setTodos(res.data); setError(null); })
      .catch((err) => {
        console.error("Load todos failed:", err.response ? err.response.data : err.message);
        setError("Could not load your to-do list.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    createTodo(text.trim())
      .then(() => { setText(""); load(); })
      .catch((err) => {
        console.error("Add todo failed:", err.response ? err.response.data : err.message);
        setError("Could not add that task.");
      });
  };

  const handleToggle = (id) => {
    toggleTodo(id).then(load).catch((err) => {
      console.error("Toggle todo failed:", err.response ? err.response.data : err.message);
      setError("Could not update that task.");
    });
  };

  const handleDelete = (id) => {
    deleteTodo(id).then(load).catch((err) => {
      console.error("Delete todo failed:", err.response ? err.response.data : err.message);
      setError("Could not delete that task.");
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <BackToHome />
      <div className="list-header"><h1>To-Do List</h1></div>

      <form onSubmit={handleAdd} className="search-bar">
        <input type="text" placeholder="Add a task..." value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error} <button type="button" className="link-button" onClick={() => setError(null)}>dismiss</button></p>}
      {!error && todos.length === 0 && <p>Nothing on your list yet.</p>}

      <ul className="todo-list">
        {todos.map((t) => (
          <li key={t.id} className="todo-item fade-in">
            <label className="todo-check">
              <input type="checkbox" checked={t.completed} onChange={() => handleToggle(t.id)} />
              <span className={t.completed ? "todo-text done" : "todo-text"}>{t.text}</span>
            </label>
            <button onClick={() => handleDelete(t.id)} className="todo-delete">✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoPage;
