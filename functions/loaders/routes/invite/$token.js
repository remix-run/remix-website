const { requireToken } = require("../../utils/token");

module.exports = async ({ params }) => {
  return requireToken(params.token);
};
