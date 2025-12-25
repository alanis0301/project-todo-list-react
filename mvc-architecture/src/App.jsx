import { useEffect, useState } from 'react';
import './App.css';
import TodoView from './view/TodoView';
import * as controller from './controller/todoController';
import { supabase } from './config/supabaseClient.js';

function App() {
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        controller.loadTodos(setTodos);

        // Inscreve nas mudanças em tempo real
        const subscription = supabase
            .channel('public:todos')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'todos',
                },
                () => {
                    // Recarrega todos quando há mudanças
                    controller.loadTodos(setTodos);
                }
            )
            .subscribe();

        // Cleanup
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <TodoView
            todos={todos}
            title={title}
            onTitleChange={setTitle}
            onAdd={() => controller.createTodo(title, setTodos, setTitle)}
            onDelete={id => controller.removeTodo(id, setTodos)}
        />
    );
}

export default App;
