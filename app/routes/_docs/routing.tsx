import { InteractiveRoutes } from "~/components/scroll-experience";

export let handle = { forceDark: true };

export default function () {
  return (
    <div className="pt-8">
      <InteractiveRoutes />
    </div>
  );
}
