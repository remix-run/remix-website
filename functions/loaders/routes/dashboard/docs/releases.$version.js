const { json } = require("@remix-run/loader");
const { getRemixVersionReleaseNotes } = require("../../../../utils/github");

module.exports = async ({ params }) => {
  return json(await getRemixVersionReleaseNotes(params.version), {
    headers: {
      "Cache-Control": "max-age=3600, s-maxage=0"
    }
  });
};
