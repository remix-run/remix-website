const { json } = require("@remix-run/loader");
const { getRemixReleaseNotes } = require("../../../utils/github");

module.exports = () => {
  return getRemixReleaseNotes();
};
