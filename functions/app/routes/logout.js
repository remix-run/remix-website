import React from "react";
import { Link } from "react-router-dom";
import * as CacheControl from "../utils/CacheControl";

export function headers() {
  return CacheControl.nostore;
}

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
