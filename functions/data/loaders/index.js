const { db } = require("../../utils/db");

module.exports = async function () {
  let snapshot = await db.collection("todos").get();

  let todos = [];
  snapshot.forEach((doc) => {
    todos.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return todos;
};
