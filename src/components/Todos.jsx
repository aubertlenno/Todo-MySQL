import axios from "axios";
import React, { useEffect, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import Todo from "./Todo";

const Todos = () => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [text, setText] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [editTodo, setEditTodo] = useState(null);
  const [filter, setFilter] = useState("all"); // State for filter selection

  useEffect(() => {
    axios
      .get("http://localhost:8000/todos/")
      .then((response) => {
        setTodoList(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the todos!", error);
      });
  }, []);

  // add emoji
  const addEmoji = (e) => {
    const sym = e.unified.split("_");
    const codeArray = [];
    sym.forEach((el) => codeArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codeArray);
    setText(text + emoji);
  };

  // add or edit todos
  const addTodo = (e) => {
    e.preventDefault();
    const todo = {
      text,
      completed: false,
      time: new Date().toISOString(),
    };

    if (!editTodo) {
      axios
        .post("http://localhost:8000/todos/", todo)
        .then((response) => {
          setTodoList([...todoList, response.data]);
          setText("");
          setShowEmoji(false);
        })
        .catch((error) => {
          console.error("There was an error adding the todo!", error);
        });
    } else {
      axios
        .put(`http://localhost:8000/todos/${editTodo.id}/update_text/`, null, {
          params: { text: todo.text },
        })
        .then((response) => {
          setTodoList(
            todoList.map((t) => (t.id === editTodo.id ? response.data : t))
          );
          setEditTodo(null);
          setText("");
          setShowEmoji(false);
        })
        .catch((error) => {
          console.error("There was an error updating the todo!", error);
        });
    }
  };

  // Function to filter todos based on the filter selection
  const filterTodos = () => {
    switch (filter) {
      case "ongoing":
        return todoList.filter((todo) => !todo.completed);
      case "completed":
        return todoList.filter((todo) => todo.completed);
      default:
        return todoList;
    }
  };

  return (
    <div className="pt-3rem w-[90%] sm:w-[70%] md:w-[60%] lg:w-[40%] mx-auto">
      <h1 className="text-2 font-medium text-center capitalize text-[#40513b]">
        ToDo List
      </h1>

      {/* Filter buttons */}
      <div className="flex justify-center gap-4 pt-2">
        <button
          className={`px-4 py-2 rounded-md text-sm focus:outline-none ${
            filter === "all"
              ? "bg-yellow-200 text-black"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm focus:outline-none ${
            filter === "ongoing"
              ? "bg-yellow-200 text-black"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setFilter("ongoing")}
        >
          Ongoing
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm focus:outline-none ${
            filter === "completed"
              ? "bg-yellow-200 text-black"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>

      {/* todo input  */}
      <div>
        <form onSubmit={addTodo} className="flex items-start gap-2 pt-2rem">
          <div className="w-full flex items-end p-2 bg-todo rounded relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="write your text"
              className="w-full bg-transparent outline-none resize-none text-sm"
              cols="30"
              rows="1"
            ></textarea>

            <span
              onClick={() => setShowEmoji(!showEmoji)}
              className="cursor-pointer hover:text-slate-300"
            >
              <BsEmojiSmile />
            </span>

            {showEmoji && (
              <div className="absolute top-[100%] right-2">
                <Picker
                  data={data}
                  emojiSize={20}
                  emojiButtonSize={28}
                  onEmojiSelect={addEmoji}
                  maxFrequentRows={0}
                />
              </div>
            )}
          </div>

          <button
            className="flex items-center capitalize gap-2 bg-yellow-200 text-black py-1.5
          px-3 rounded-sm hover:bg-yellow-100"
          >
            <AiOutlinePlus />
            {editTodo ? "update" : "add"}
          </button>
        </form>

        {/* print the todo lists  */}
        <div className="pt-2rem">
          {/* Pass filtered todos to Todo component */}
          <Todo
            todoList={filterTodos()}
            setTodoList={setTodoList}
            setEditTodo={setEditTodo}
          />
        </div>
      </div>
    </div>
  );
};

export default Todos;
