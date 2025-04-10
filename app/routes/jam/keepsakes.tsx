import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

const KEEPSAKES = [
  {
    id: "photo-1",
    src: "/conf-images/2025/keepsakes/photo-1.avif",
    alt: "A modern interior space featuring tiered wooden stadium-style seating with grey cushions arranged in ascending steps. The seating area is flanked by black metal railings and has an industrial-style exposed ceiling with visible ductwork and lighting. A large potted plant with broad green leaves sits in the foreground. The space has a minimalist design with concrete flooring and transitions into what appears to be a bar or counter area visible in the background. The overall aesthetic combines warm wood tones with industrial elements and natural accents.",
    hasBorder: true,
  },
  {
    id: "photo-2",
    src: "/conf-images/2025/keepsakes/photo-2.avif",
    alt: "A street view in downtown Toronto featuring the historic Gooderham Building, a distinctive red-brick flatiron building with a green copper turret, set against modern glass skyscrapers and condos. The intersection shows traffic lights, parked cars, and pedestrians under a bright blue sky. The architectural contrast highlights Toronto's blend of historic and contemporary buildings.",
    hasBorder: true,
  },
  {
    id: "poster",
    src: "/conf-images/2025/keepsakes/poster.avif",
    alt: "Remix Jam event poster featuring a stylized aerial view of Toronto's CN Tower and downtown skyline in vibrant blues, pinks, and yellows. The Remix Jam logo with three circular icons appears at the top, and 'TORONTO' is prominently displayed at the bottom along with the date 'OCT 10 2025'. The artwork has a modern, digital aesthetic with the CN Tower's observation deck as the central focal point surrounded by abstract skyscrapers.",
    hasBorder: true,
  },
  {
    id: "pick",
    src: "/conf-images/2025/keepsakes/remix-pick.avif",
    alt: "Guitar pick with Remix logo and 'Remix Jam Toronto '25'",
    hasBorder: false,
  },
  {
    id: "ticket",
    src: "/conf-images/2025/keepsakes/ticket.avif",
    alt: "Fake Remix Jam 2025 Event Ticket",
    hasBorder: false,
  },
  {
    id: "boarding-pass",
    src: "/conf-images/2025/keepsakes/boarding-pass.avif",
    alt: "Fake Remix Jam 2025 Boarding Pass",
    hasBorder: false,
  },
  {
    id: "sticker",
    src: "/conf-images/2025/keepsakes/remix-logo-sticker.svg",
    alt: "Remix Logo Sticker",
    hasBorder: false,
  },
] as const;

type KeepsakeId = (typeof KEEPSAKES)[number]["id"];

export function Keepsakes() {
  const [order, setOrder] = useState<Record<KeepsakeId, number>>(() =>
    KEEPSAKES.reduce(
      (acc, keepsake, index) => {
        acc[keepsake.id] = index + 1;
        return acc;
      },
      {} as Record<KeepsakeId, number>,
    ),
  );

  const moveToFront = (id: KeepsakeId) => {
    setOrder((current) => {
      const newOrder = { ...current };
      // Find the current max z-index
      const currentIndex = current[id];

      // Decrease all items that were above the moved item
      for (let key in newOrder) {
        if (newOrder[key as KeepsakeId] > currentIndex) {
          newOrder[key as KeepsakeId]--;
        }
      }

      // Move the dragged item to the top
      newOrder[id] = KEEPSAKES.length;

      return newOrder;
    });
  };

  return (
    <div className="isolate">
      {KEEPSAKES.map((keepsake) => (
        <Keepsake
          key={keepsake.id}
          className={keepsake.id}
          order={order[keepsake.id]}
          onDragStart={() => moveToFront(keepsake.id)}
          hasBorder={keepsake.hasBorder}
        >
          <img src={keepsake.src} alt={keepsake.alt} draggable={false} />
        </Keepsake>
      ))}
    </div>
  );
}

type KeepsakeProps = {
  className: string;
  children: React.ReactNode;
  onDragStart: () => void;
  order?: number;
  hasBorder?: boolean;
};

function Keepsake({
  className,
  children,
  onDragStart,
  order,
  hasBorder,
}: KeepsakeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useDrag(elementRef, onDragStart);

  return (
    <div
      className="keepsake-container relative"
      style={{ zIndex: order }}
      ref={containerRef}
    >
      <div
        ref={elementRef}
        className={clsx("keepsake cursor-grab select-none", className)}
      >
        <div className="rotate">
          <div
            className={clsx("h-full w-full", {
              "rounded border-[6px] border-white md:border-[16px]": hasBorder,
            })}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// TODO: Move this into a callback ref once we upgrade to React 19
function useDrag(ref: React.RefObject<HTMLElement>, onDragStart?: () => void) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let translate = { x: 0, y: 0 };

    const getEventPos = (e: MouseEvent | TouchEvent) => {
      const pos = "touches" in e ? e.touches[0] : e;
      return { x: pos.clientX, y: pos.clientY };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      element.style.cursor = "grabbing";
      onDragStart?.();
      const pos = getEventPos(e);
      startPos = {
        x: pos.x - translate.x,
        y: pos.y - translate.y,
      };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // Prevent scrolling on touch devices

      const pos = getEventPos(e);
      translate = {
        x: pos.x - startPos.x,
        y: pos.y - startPos.y,
      };

      element.style.transform = `translate(${translate.x}px, ${translate.y}px)`;
    };

    const handleEnd = () => {
      isDragging = false;
      element.style.cursor = "grab";
    };

    // Mouse events
    element.addEventListener("mousedown", handleStart);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);

    // Touch events
    element.addEventListener("touchstart", handleStart, { passive: false });
    document.addEventListener("touchmove", handleMove, { passive: false });
    element.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);

    return () => {
      element.removeEventListener("mousedown", handleStart);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);

      element.removeEventListener("touchstart", handleStart);
      document.removeEventListener("touchmove", handleMove);
      element.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tell me when this starts breaking
  }, [ref]);
}
