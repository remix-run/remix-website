const { redirect } = require("@remix-run/loader");
const types = new Set(["indie", "team"]);

module.exports = ({ url }) => {
  let type = url.searchParams.get("type");
  let qty = parseInt(url.searchParams.get("qty")) || 1;
  if (!types.has(type)) {
    return redirect("/buy");
  } else {
    return { type, qty };
  }
};
