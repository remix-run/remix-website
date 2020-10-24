import React from "react";
import { useRouteData } from "@remix-run/react";
import { Link, useLocation } from "react-router-dom";

export default function Invite() {
  let data = useRouteData();
  let location = useLocation();
  if (data.message === "invalid token") {
    return <Invalid />;
  }
  return (
    <div>
      <h1>You've been invited to join a Remix Team License</h1>
      <div>
        <Link to={`/login?from=${location.pathname}/accept`}>
          Login To Accept
        </Link>
      </div>
    </div>
  );
}

function Invalid() {
  return (
    <div>
      <h1>Invalid token</h1>
      <p>Go ask whover gave you this token to try again.</p>
    </div>
  );
}
