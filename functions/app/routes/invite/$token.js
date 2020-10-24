import React from "react";
import { useRouteData } from "@remix-run/react";
import { Link, useLocation } from "react-router-dom";

export default function Invite() {
  let data = useRouteData();
  let location = useLocation();
  console.log({ data });
  if (data.code === "invalid_token") {
    return <Invalid />;
  } else if (data.code === "token_full") {
    return <Full />;
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

function Full() {
  return (
    <div>
      <h1>You've been invited to join a Remix Team License</h1>
      <p>Unfortunately, all seats have been used on it.</p>
      <p>
        Please tell whoever gave you this link to purchase more seats at{" "}
        <a href="https://remix.run/dashboard">https://remix.run/dashboard</a>.
        Thanks!
      </p>
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
