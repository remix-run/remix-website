async function getUserWithToken(token) {
  let res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return res.json();
}

export { getUserWithToken };
