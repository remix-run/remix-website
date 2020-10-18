module.exports = async ({ context: { res } }) => {
  console.log("Clear cookie __session");
  res.clearCookie("__session");
  return { ok: true };
};
