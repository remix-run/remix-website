import clsx from "clsx";
import {
  href,
  Link,
  NavLink as RRNavLink,
  type NavLinkProps,
} from "react-router";
import { JamLink } from "./utils";
import { DetailsMenu } from "~/ui/details-menu";
import iconsHref from "~/icons.svg";

export function Navbar({ className }: { className?: string }) {
  return (
    <nav
      className={clsx(
        "fixed left-0 right-0 top-0 flex items-center justify-between p-4 md:p-9",
        className,
      )}
      style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 75%)`,
      }}
    >
      <Link to={href("/jam/2025")} className="flex items-center md:block">
        <JamLogo className="h-[48px] fill-white md:h-auto md:w-[200px]" />
      </Link>

      <div className="hidden items-center justify-center gap-2 rounded-full bg-black/40 p-2 backdrop-blur-lg lg:flex">
        <NavLink to={href("/jam/2025/lineup")}>Schedule & Lineup</NavLink>
        <NavLink className="text-white" to={href("/jam/2025/coc")}>
          Code of Conduct
        </NavLink>
        <NavLink className="text-white" to={href("/jam/2025/faq")}>
          FAQ
        </NavLink>
      </div>

      <JamLink className="hidden lg:flex" to={href("/jam/2025/ticket")}>
        <TicketLogo className="size-6 fill-current md:size-8" />
        <span>Ticket</span>
      </JamLink>

      {/* Mobile hamburger menu */}
      <div className="lg:hidden">
        <MobileMenu />
      </div>
    </nav>
  );
}

function MobileMenu() {
  return (
    <DetailsMenu className="relative cursor-pointer">
      <summary className="_no-triangle grid size-12 place-items-center rounded-full bg-white text-black backdrop-blur-lg transition-colors duration-300 hover:bg-blue-brand hover:text-white [[open]>&]:bg-blue-brand [[open]>&]:text-white">
        <svg className="size-6">
          <use href={`${iconsHref}#menu`} />
        </svg>
      </summary>
      <div className="absolute right-0 z-20 min-w-fit lg:left-0">
        <div className="top-1 p-1">
          <nav className="flex flex-col gap-2 overflow-hidden rounded-[2rem] bg-black/40 px-2 py-2.5 backdrop-blur-lg">
            <MobileNavLink to={href("/jam/2025/lineup")}>
              Schedule & Lineup
            </MobileNavLink>
            <MobileNavLink to={href("/jam/2025/coc")}>
              Code of Conduct
            </MobileNavLink>
            <MobileNavLink to={href("/jam/2025/faq")}>FAQ</MobileNavLink>
            <MobileNavLink to={href("/jam/2025/ticket")}>Ticket</MobileNavLink>
          </nav>
        </div>
      </div>
    </DetailsMenu>
  );
}

function MobileNavLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <RRNavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "block min-w-max rounded-full border-2 px-4 py-2 text-lg font-bold outline-none transition-colors duration-300",
          isActive
            ? "border-white text-white"
            : "border-transparent text-white/70 hover:border-white hover:text-white focus-visible:border-white focus-visible:text-white",
        )
      }
    >
      {children}
    </RRNavLink>
  );
}

// Rename Logo to JamLogo for clarity
function JamLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 53.33 17" className={className}>
      <path d="M32.46 2.34c-.25-.23-.51-.46-.79-.67a8.474 8.474 0 0 0-4.4-1.65S27.05 0 27.05 0c-.2-.01-.39-.01-.57 0h-.43v.01c-1.63.11-3.18.68-4.49 1.65-.28.21-.55.43-.79.67-1.7 1.62-2.64 3.81-2.64 6.16s.93 4.52 2.62 6.13c.26.25.55.49.84.71 1.28.94 2.78 1.5 4.36 1.63s.22.02.22.02c.14 0 .29.01.45.01s.31 0 .44-.01h.22v-.02c1.58-.12 3.09-.68 4.37-1.63.3-.22.58-.46.84-.71 1.69-1.62 2.62-3.8 2.62-6.14s-.94-4.54-2.64-6.15ZM19.39 9.13h2.68c.05.92.21 1.82.48 2.69h-2.38c-.43-.83-.69-1.74-.77-2.69Zm9.97-3.92c.3.86.49 1.75.54 2.67h-2.67V5.21h2.13Zm-2.13-1.26V1.73c.47.49.88 1.03 1.24 1.61.12.19.23.4.34.61h-1.58Zm-1.26-2.14v2.13h-1.52c.11-.2.22-.4.34-.59.34-.55.74-1.07 1.18-1.54Zm0 3.4v2.67h-2.63c.06-.92.25-1.81.56-2.67h2.08Zm-3.9 2.66h-2.69c.08-.94.34-1.84.76-2.67h2.41c-.27.86-.44 1.75-.49 2.67Zm1.26 1.26h2.64v2.69h-2.1c-.31-.86-.49-1.76-.54-2.69Zm2.64 3.95v2.19c-.45-.48-.86-1.01-1.2-1.58-.12-.2-.24-.4-.35-.62h1.55Zm1.26 2.19v-2.2h1.57a9.376 9.376 0 0 1-1.57 2.2Zm0-3.45V9.13h2.67c-.06.92-.24 1.82-.55 2.69h-2.12Zm3.94-2.69h2.64c-.08.95-.34 1.86-.77 2.69h-2.36c.27-.87.43-1.77.49-2.69Zm0-1.26c-.05-.91-.21-1.8-.48-2.67h2.36c.42.82.68 1.72.76 2.67h-2.64Zm.42-4.61c.23.22.44.45.63.69H30.2c-.02-.05-.04-.1-.07-.15-.18-.39-.38-.76-.6-1.12-.23-.38-.49-.74-.76-1.09a7.338 7.338 0 0 1 2.82 1.66Zm-9.98-.01a7.088 7.088 0 0 1 2.9-1.69c-.29.36-.56.73-.8 1.13-.23.37-.43.74-.61 1.12l-.06.13h-2.07c.2-.24.41-.47.64-.69Zm-.02 10.48c-.22-.21-.41-.42-.6-.65h2.03s.03.06.04.09a11.029 11.029 0 0 0 1.37 2.24 7.203 7.203 0 0 1-2.84-1.69Zm10.02 0c-.22.21-.46.42-.72.6-.65.48-1.36.84-2.11 1.07a11.24 11.24 0 0 0 1.38-2.23c.02-.03.03-.07.05-.1h2.01c-.19.23-.39.45-.6.65ZM8.46.08C3.79.08 0 3.87 0 8.54S3.79 17 8.46 17s8.46-3.79 8.46-8.46S13.13.08 8.46.08Zm-.53 12.61H5.11v-1.6h2.35c.39 0 .48.29.48.46v1.14Zm4.07-1.9c.07.96.07 1.41.07 1.9H9.85v-.3c0-.31.01-.63-.04-1.28-.07-.95-.48-1.16-1.23-1.16H5.09V8.22h3.6c.95 0 1.43-.29 1.43-1.05 0-.67-.48-1.08-1.43-1.08h-3.6V4.4h3.99c2.15 0 3.22 1.02 3.22 2.64 0 1.21-.75 2.01-1.77 2.14.86.17 1.36.66 1.45 1.62Zm32.27-7.54c.14-.14.28-.25.43-.33a.671.671 0 0 0-.33-.08c-.84.02-1.57 1.34-1.77 2.21.3-.09.63-.19.95-.29.11-.55.37-1.14.72-1.51Zm-.29 4c.46-.04.85.15.85.15l.35-1.31s-.3-.15-.89-.11c-1.53.1-2.22 1.16-2.14 2.22.08 1.25 1.34 1.21 1.38 1.97 0 .18-.11.45-.43.46-.49.04-1.1-.43-1.1-.43l-.24 1s.61.65 1.72.58c.92-.05 1.55-.79 1.49-1.87-.09-1.37-1.63-1.5-1.66-2.08 0-.11 0-.54.67-.58Zm-.02-2.62c.39-.12.79-.25 1.15-.35 0-.3-.03-.75-.18-1.07-.15.07-.29.19-.39.29-.25.28-.47.71-.58 1.14Zm1.35-1.45c.13.33.16.72.16.99.2-.06.38-.12.55-.16-.09-.28-.29-.75-.71-.83Z" />
      <path d="M44.83 0c-4.69 0-8.5 3.81-8.5 8.5s3.81 8.5 8.5 8.5 8.5-3.81 8.5-8.5-3.8-8.5-8.5-8.5Zm1.97 13.72-6.87-1.19s.84-6.4.86-6.62c.04-.3.05-.31.36-.41 0 0 .45-.15 1.07-.34.06-.48.3-1.1.61-1.59.44-.7.98-1.09 1.53-1.11.28 0 .52.08.7.28 0 .02.03.03.04.05h.09c.42 0 .77.25 1.01.7.07.15.13.28.16.4.21-.06.34-.1.34-.1h.1v9.95Zm.21-.01V3.88c.18.18.67.65.67.65s.8.02.85.02.09.04.1.09c0 .05 1.24 8.35 1.24 8.35l-2.85.71Z" />
    </svg>
  );
}

function TicketLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M20.19 4H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.81-2-1.81-2zm-2.46 9.3l-8.86 2.36-1.66-2.88.93-.25 1.26.99 2.39-.64-2.4-4.16 1.4-.38 4.01 3.74 2.44-.65c.51-.14 1.04.17 1.18.68.13.51-.17 1.04-.69 1.19z"></path>
    </svg>
  );
}

function NavLink({ className, children, ...props }: NavLinkProps) {
  return (
    <RRNavLink
      className={({ isActive }) =>
        clsx(
          "rounded-full border-2 px-5 py-0.5 text-base font-bold outline-none transition-colors duration-300 md:border-4 md:py-3 md:text-xl",
          isActive
            ? "border-white text-white"
            : "border-transparent text-white/70 hover:border-white hover:text-white focus-visible:border-white focus-visible:text-white",
          className,
        )
      }
      {...props}
    >
      {children}
    </RRNavLink>
  );
}
