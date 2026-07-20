'use client';

import { useEffect, useRef, useState } from 'react';

const links = [
  { id: 'understand', label: 'How Kairo sees' },
  { id: 'learn', label: 'Guided lesson' },
  { id: 'travel', label: 'Creative tools' }
] as const;

export function HeaderNavigation() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const intersections = useRef(new Map<string, IntersectionObserverEntry>());

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const sections = links
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => intersections.current.set(entry.target.id, entry));

        const active = links
          .map(({ id }) => intersections.current.get(id))
          .filter((entry): entry is IntersectionObserverEntry => Boolean(entry?.isIntersecting))
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top
          )
          .at(-1);

        setActiveId(active?.target.id ?? null);
      },
      { rootMargin: '-68px 0px -78% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Landing page">
      {links.map(({ id, label }) => {
        const active = activeId === id;

        return (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active ? 'location' : undefined}
            data-active={active}
            onClick={() => setActiveId(id)}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
