module.exports = async ({ context: { res } }) => {
  res.clearCookie("session");
  return { ok: true };
};
