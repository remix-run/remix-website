import React from "react";
import { firebase } from "../utils/firebase";

export function useDoc(path, initialData = null) {
  let db = firebase.firestore();
  let [state, setState] = React.useState({
    status: "loading",
    doc: initialData,
  });
  React.useEffect(() => {
    return db.doc(path).onSnapshot((doc) => {
      setState({
        status: "subscribed",
        data: doc.data(),
      });
    });
  }, [path]);
  return state;
}
