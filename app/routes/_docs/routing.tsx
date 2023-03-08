import { InteractiveRoutes } from "~/ui/homepage-scroll-experience";

export let handle = { forceDark: true };

export default function Routing() {
  return (
    <div className="pt-8">
      <InteractiveRoutes />
    </div>
  );
}
