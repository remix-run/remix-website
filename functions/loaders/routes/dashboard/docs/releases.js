const { json } = require("@remix-run/loader");
const {
  getRemixReleaseNotes,
  getRemixChanges,
} = require("../../../../utils/github");

module.exports = async () => {
  let releases = await getRemixReleaseNotes();
  let changes = await getRemixChanges();
  return json(
    { releases, changes },
    {
      headers: {
        "cache-control": "max-age: 3600, s-maxage=0",
      },
    }
  );
};
