import cookies from "browser-cookies";

export function fetch(url, options) {
  let headers = {
    ...options.headers,
    "csrf-token": cookies.get("XSRF-TOKEN"),
  };

  return window.fetch(url, { ...options, headers });
}
