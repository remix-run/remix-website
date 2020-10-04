import React from "react";
import { useRouteData } from "@remix-run/react";
import { useNavigate } from "react-router-dom";

export function meta({ data }) {
  return {
    title: `It's alive! ${data.length} items`,
    description: "The first Remix app on firebase, talking to firestore.",
  };
}

export default function Index() {
  let [todos] = useRouteData();
  let [state, setState] = React.useState("idle"); // idle | saving | error
  let navigate = useNavigate();

  let handleNewTodo = async (event) => {
    event.preventDefault();
    let form = event.target;
    if (state !== "idle") return;
    setState("saving");
    try {
      let res = await fetch("/api/todos", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: new FormData(event.target).get("name"),
        }),
      });
      // state hack because navigations are ignored
      navigate(`/?${Date.now()}`, { replace: true });
      setState("idle");
      form.reset();
    } catch (error) {
      console.error(error);
      setState("error");
    }
  };

  return (
    <div>
      <h1>How about some data from firestore?</h1>
      <ul>
        {todos
          .slice(0)
          .sort((a, b) => a.created - b.created)
          .map((todo) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
      </ul>
      <form onSubmit={handleNewTodo}>
        <label>
          Whatever: <input name="name" />
        </label>
        <button type="submit" disabled={state !== "idle"}>
          {state === "saving" ? "Saving..." : "Save"}
        </button>
        {state === "error" && <p>Snap, there was an error.</p>}
      </form>
    </div>
  );
}
