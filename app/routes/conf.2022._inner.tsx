import { Outlet } from "react-router";

export default function InnerLayout() {
  return (
    <div className="my-8 md:my-12 xl:my-14">
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
}
