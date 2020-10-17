import React from "react";
import { Link } from "react-router-dom";

export default function Logout() {
  return (
    <div>
      <h1>You're logged out!</h1>
      <p>
        <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
