module.exports = async function ({ context: { req } }) {
  return { csrfToken: req.csrfToken() };
};
