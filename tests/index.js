import { State, Fragment } from "../malta";
import { Render } from "../malta-dom";

const nestedNestedNested = () => {
  const [state, setState] = State(1);
  return {
    tag: "h3",
    body: `Very very very very very nested clicker${state}`,
    onclick: () => setState(state + 1),
  };
};

const Todo = ({ todo, todos, setTodos }) => {
  const [test, setTest] = State(false);

  return {
    tag: "div",
    body: [
      {
        tag: "h2",
        body: todo.name + todo.id,
      },
      nestedNestedNested.bind(null),
      {
        tag: "button",
        body: test ? "close" : "open",
        onclick: () => setTest(!test),
      },
      {
        tag: "button",
        body: "delete",
        onClick: () => setTodos(todos.filter((t) => t.id !== todo.id)),
      },
    ],
  };
};

const AddTodo = ({ todos, setTodos }) => ({
  tag: "button",
  body: "Add todo",
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
    body:
      todos.length > 0
        ? todos
            .filter((todo) => (filter ? todo.id % 2 === 0 : todo))
            .map((todo) =>
              Fragment(todo.key, Todo.bind(null, { todo, todos, setTodos }))
            )
        : "no todos",
  };
};

const Dialog = () => {
  const [state, setState] = State("Im dialog");

  return {
    tag: "div",
    body: state,
    onclick: () => setState("Im dialog too"),
  };
};

const Test = () => [
  {
    tag: "h1",
    textNode: "test",
  },
  {
    tag: "h2",
    textNode: "test",
  },
];

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
    body: [
      {
        tag: "h1",
        body: `Clicked: ${test} times`,
        onClick: () => setTest((prev) => prev + 1),
      },
      {
        tag: "button",
        body: showDialog ? "close" : "open",
        onClick: () => setShowDialog(!showDialog),
      },
      {
        tag: "button",
        body: "filter",
        onclick: () => setFilter(!filter),
      },

      showDialog && Dialog.bind(null),
      showDialog && Dialog.bind(null),
      {
        tag: "button",
        body: showDialog1 ? "close" : "open",
        onClick: () => setShowDialog1(!showDialog1),
      },

      showDialog1 && "test",
      AddTodo.bind(null, state),
      Todos.bind(null, state),
      showDialog1 && Dialog.bind(null),
    ],
  };
};

/*const App = () => {
  const [state, setState] = State(1);

  return {
    tag: "h1",
    body: [state, "test"],
    onclick: () => setState(state + 1),
  };
};*/

Render(App);
