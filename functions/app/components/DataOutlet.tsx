import React from "react";
import { Outlet } from "react-router-dom";

let Context = React.createContext<any>(undefined);

export function DataOutlet({ data }) {
  return (
    <Context.Provider value={data}>
      <Outlet />
    </Context.Provider>
  );
}

export function useParentRouteData() {
  return React.useContext(Context);
}
