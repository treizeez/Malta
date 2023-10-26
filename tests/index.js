import { State } from "../lib/src/State.ts";
import { Render } from "../lib/src/index.ts";

const Todo = ({ todo, todos, setTodos }) => {
  const [test, setTest] = State(false);

  return {
    tag: "div",
    content: [
      {
        tag: "h2",
        textNode: todo.name + todo.id,
      },
      {
        tag: "button",
        textNode: test() ? "close" : "open",
        onclick: () => setTest(!test()),
      },
      {
        tag: "button",
        textNode: "delete",
        onClick: () => setTodos(todos().filter((t) => t.id !== todo.id)),
      },
    ],
  };
};

const AddTodo = ({ todos, setTodos }) => ({
  tag: "button",
  textNode: "Add todo",
  onclick: () =>
    setTodos([
      ...todos(),
      {
        id: todos().length,
        name: "test",
      },
    ]),
});

const Todos = ({ todos, setTodos }) => {
  return {
    tag: "div",
    content:
      todos().length > 0
        ? todos().map((todo) => Todo.bind(null, { todo, todos, setTodos }))
        : {
            tag: "h1",
            textNode: "no todos",
          },
  };
};

const App = () => {
  const [todos, setTodos] = State([]);

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
        textNode: `Clicked: ${test()} times`,
        onClick: setTest.bind(null, test() + 1),
      },
      AddTodo.bind(null, state),
      Todos.bind(null, state),
    ],
  };
};

Render(App);
