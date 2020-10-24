const { requireToken } = require("../../utils/token");

module.exports = requireToken(async () => {
  return { message: "valid" };
});
