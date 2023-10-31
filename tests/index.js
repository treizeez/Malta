import { State } from "../malta";
import { Render } from "../malta-dom";

const nestedNestedNested = () => {
  const [state, setState] = State(1);
  return {
    tag: "h3",
    textNode: `Very very very very very nested clicker${state}`,
    onclick: () => setState(state + 1),
  };
};

const Todo = ({ todo, todos, setTodos }) => {
  const [test, setTest] = State(false);

  return {
    tag: "div",
    content: [
      {
        tag: "h2",
        textNode: todo.name + todo.id,
      },
      nestedNestedNested.bind(null),
      {
        tag: "button",
        textNode: test ? "close" : "open",
        onclick: () => setTest(!test),
      },
      {
        tag: "button",
        textNode: "delete",
        onClick: () => setTodos(todos.filter((t) => t.id !== todo.id)),
      },
    ],
  };
};

const AddTodo = ({ todos, setTodos }) => ({
  tag: "button",
  textNode: "Add todo",
  onclick: () =>
    setTodos([
      ...todos,
      {
        id: todos.length,
        name: "test",
        key: window.crypto.randomUUID(),
      },
    ]),
});

const Todos = ({ todos, setTodos }) => {
  return {
    tag: "div",
    content:
      todos.length > 0
        ? todos.map((todo) => ({
            key: todo.key,
            component: Todo.bind(null, { todo, todos, setTodos }),
          }))
        : {
            tag: "h1",
            textNode: "no todos",
          },
  };
};

const App = () => {
  const [todos, setTodos] = State([
    {
      name: "test",
      id: 0,
      key: window.crypto.randomUUID(),
    },
    {
      name: "test",
      id: 1,
      key: window.crypto.randomUUID(),
    },
  ]);

  const [test, setTest] = State(1);

  const state = {
    todos,
    setTodos,
  };

  return {
    tag: "div",
    content: [
      {
        tag: "h1",
        textNode: `Clicked: ${test} times`,
        onClick: () => setTest((prev) => prev + 1),
      },
      AddTodo.bind(null, state),
      Todos.bind(null, state),
    ],
  };
};

Render(App);
