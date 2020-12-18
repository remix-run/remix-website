const { json } = require("@remix-run/loader");
const { getRemixVersionReleaseNotes } = require("../../../../utils/github");

module.exports = ({ params }) => {
  return getRemixVersionReleaseNotes(params.version);
};
