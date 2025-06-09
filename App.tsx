import React, { useState, useEffect, useCallback } from 'react';
import { Todo, FilterType, TodoUpdatePayload } from './types';
import Header from './components/Header';
import AddTodoForm from './components/AddTodoForm';
import TodoList from './components/TodoList';
import Footer from './components/Footer';

const LOCAL_STORAGE_KEY = 'react-todo-list-app-todos-v2'; // Updated key for new structure

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isMounted, setIsMounted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Request notification permission
  useEffect(() => {
    if (!isMounted) return; // Wait for mount

    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      } else {
        setNotificationPermission(Notification.permission);
      }
    }
  }, [isMounted]);

  // Notification checker interval
  useEffect(() => {
    if (!isMounted || notificationPermission !== 'granted') return;

    const checkNotifications = () => {
      const now = new Date();
      todos.forEach(todo => {
        if (todo.dueDate && todo.dueTime && !todo.completed && !todo.notified) {
          const dueDateTime = new Date(`${todo.dueDate}T${todo.dueTime}`);
          if (now >= dueDateTime) {
            new Notification('Todo Reminder!', {
              body: todo.text,
              icon: '/favicon.ico', // Optional: replace with your app icon
            });
            // Mark as notified
            setTodos(prevTodos =>
              prevTodos.map(t =>
                t.id === todo.id ? { ...t, notified: true } : t
              )
            );
          }
        }
      });
    };

    const intervalId = setInterval(checkNotifications, 60 * 1000); // Check every minute
    checkNotifications(); // Initial check

    return () => clearInterval(intervalId);
  }, [todos, notificationPermission, isMounted]);


  // Load from localStorage
   useEffect(() => {
    setIsMounted(true);
    try {
      const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error("Failed to load todos from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);


  // Save to localStorage
  useEffect(() => {
    if (isMounted) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isMounted]);


  const addTodo = useCallback((text: string, dueDate?: string, dueTime?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
      dueDate,
      dueTime,
      notified: false, // Ensure new todos are not marked as notified
    };
    setTodos(prevTodos => [newTodo, ...prevTodos]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []);

  const editTodo = useCallback((id: string, updates: TodoUpdatePayload) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
  }, []);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  if (!isMounted) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-gray-900 dark:text-gray-100 flex flex-col items-center py-6 sm:py-8 px-4">
      <div className="w-full max-w-xl lg:max-w-2xl">
        <Header />
        <main className="mt-4 sm:mt-6">
          <AddTodoForm onAdd={addTodo} />
          
          {notificationPermission === 'default' && (
            <div className="my-4 p-3 bg-yellow-100 dark:bg-yellow-700/50 border border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200 rounded-md text-sm">
              Notifications are pending. Please allow them in your browser if you want reminders.
            </div>
          )}
          {notificationPermission === 'denied' && (
            <div className="my-4 p-3 bg-red-100 dark:bg-red-700/50 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 rounded-md text-sm">
              Notifications are disabled. You can enable them in your browser settings if you want reminders.
            </div>
          )}

          <div className="bg-white dark:bg-gray-800/90 p-3 sm:p-5 rounded-xl shadow-xl backdrop-blur-sm min-h-[100px]">
            {todos.length > 0 ? (
                 <TodoList
                    todos={filteredTodos}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={editTodo}
                />
            ) : (
                 <div className="text-center py-10 sm:py-12 text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <p className="text-lg sm:text-xl font-semibold">Your todo list is empty!</p>
                    <p className="text-sm sm:text-base mt-1">Add some tasks to get started.</p>
                </div>
            )}
          </div>
           
           <Footer
              activeCount={activeCount}
              completedCount={completedCount}
              currentFilter={filter}
              onSetFilter={setFilter}
              onClearCompleted={clearCompleted}
              totalTodos={todos.length}
            />
        </main>
      </div>
    </div>
  );
};

export default App;
