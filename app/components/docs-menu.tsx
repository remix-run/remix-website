import { NavLink, useParams } from "@remix-run/react";
import cx from "clsx";

import type { MenuNode } from "~/utils/docs/get-menu.server";

interface MenuProps {
  nodes: MenuNode[];
  className?: string;
}

const Menu: React.VFC<MenuProps> = ({ nodes, className }) => {
  return (
    <nav className={cx("md-nav", className)}>
      <MenuList level={1} nodes={nodes} />
    </nav>
  );
};

interface MenuListProps {
  nodes: MenuNode[];
  level?: number;
}

const MenuList: React.VFC<MenuListProps> = ({ nodes, level = 1 }) => {
  let { lang, version } = useParams();
  let linkPrefix = `/docs/${lang}/${version}`;
  let itemClassName = ({ isActive }: { isActive?: boolean } = {}) =>
    cx(
      "md-nav-item py-1 block text-sm lg:text-sm",
      `md-nav-item--level-${level}`,
      {
        "md-nav-item--active": isActive,
        "md-nav-heading": level === 1,
      }
    );

  return (
    <ul
      className={cx("md-nav-list text-[color:var(--hue-0750)] mb-3", {
        "ml-3 md:ml-4 lg:ml-3 2xl:ml-4": level === 3,
        "ml-6 md:ml-8 lg:ml-6 2xl:ml-8": level === 4,
      })}
      data-level={level}
    >
      {nodes
        .sort((a, b) => a.title.localeCompare(b.title))
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
        .map((node, index) => {
          let dirItemClassName = ({ isActive }: { isActive?: boolean } = {}) =>
            cx(itemClassName({ isActive: level !== 1 && isActive }), {
              "pt-0": level === 1 && index === 0,
            });

          return (
            <li key={node.slug} data-dir="" data-level={level}>
              {node.disabled ? (
                <span className={dirItemClassName() + " opacity-25"}>
                  {node.title} 🚧
                </span>
              ) : node.hasContent ? (
                <NavLink
                  prefetch="intent"
                  end
                  to={`${linkPrefix}${node.slug}`}
                  className={dirItemClassName}
                >
                  {node.title}
                </NavLink>
              ) : (
                <span className={dirItemClassName()}>{node.title}</span>
              )}
              {node.children.length > 0 && (
                <MenuList level={level + 1} nodes={node.children} />
              )}
            </li>
          );
        })}
    </ul>
  );
};

export { Menu };
