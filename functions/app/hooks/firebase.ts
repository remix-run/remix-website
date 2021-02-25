import { useEffect, useState } from "react";
import { firebase } from "../utils/firebase.client";

export function useDoc(path: string, initialData: any = null) {
  let db = firebase.firestore();
  let [state, setState] = useState({
    status: "loading",
    data: initialData,
  });
  useEffect(() => {
    return db.doc(path).onSnapshot((doc) => {
      setState({
        status: "subscribed",
        data: doc.data(),
      });
    });
  }, [path]);
  return state;
}
