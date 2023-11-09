import { State, Fragment } from "../malta";
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

const Todos = ({ todos, setTodos, filter }) => {
  return {
    tag: "div",
    content:
      todos.length > 0
        ? todos
            .filter((todo) => (filter ? todo.id % 2 === 0 : todo))
            .map((todo) =>
              Fragment(todo.key, Todo.bind(null, { todo, todos, setTodos }))
            )
        : {
            tag: "h1",
            textNode: "no todos",
          },
  };
};

const Dialog = () => {
  const [state, setState] = State("Im dialog");

  return {
    tag: "div",
    textNode: state,
    onclick: () => setState("Im dialog too"),
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
  const [showDialog, setShowDialog] = State(false);
  const [showDialog1, setShowDialog1] = State(false);
  const [filter, setFilter] = State(false);

  const state = {
    todos,
    filter,
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
      {
        tag: "button",
        textNode: showDialog ? "close" : "open",
        onClick: () => setShowDialog(!showDialog),
      },
      {
        tag: "button",
        textNode: "filter",
        onclick: () => setFilter(!filter),
      },

      showDialog && Dialog.bind(null),
      showDialog && Dialog.bind(null),
      {
        tag: "button",
        textNode: showDialog1 ? "close" : "open",
        onClick: () => setShowDialog1(!showDialog1),
      },

      showDialog1 && Dialog.bind(null),
      AddTodo.bind(null, state),
      Todos.bind(null, state),
    ],
  };
};

Render(App);
