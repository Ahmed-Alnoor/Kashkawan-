import type { SVGProps } from "react";

/**
 * Line icons drawn to match the logo's engraved linework: 1.6px strokes,
 * round caps, no fills. Decorative by default — every icon is aria-hidden and
 * the surrounding control carries the accessible name.
 */

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...props,
});

export const IconArrow = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const IconClose = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconMenu = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconBag = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 8h12l-1 11.2a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8L6 8Z" />
    <path d="M9.2 8V6.4a2.8 2.8 0 0 1 5.6 0V8" />
  </svg>
);

export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconMinus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);

export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const IconPhone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6.6 4h3l1.4 3.6-2 1.4a11.5 11.5 0 0 0 6 6l1.4-2L20 14.4v3a2.6 2.6 0 0 1-2.9 2.6A16.4 16.4 0 0 1 4 6.9 2.6 2.6 0 0 1 6.6 4Z" />
  </svg>
);

export const IconWhatsApp = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4.2 19.8 5.5 16A7.8 7.8 0 1 1 8.4 18.7l-4.2 1.1Z" />
    <path d="M9.3 9.1c.3 1.3.9 2.4 1.9 3.3.9.9 2 1.5 3.2 1.8l1-1.2 1.9.9-.3 1.3c-1.9.5-4.1-.4-5.8-2.1-1.7-1.7-2.6-3.9-2.1-5.8l1.3-.3.9 1.9-1 1.2Z" />
  </svg>
);

export const IconPin = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const IconClock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconGlobe = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" />
  </svg>
);

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconWheat = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 21V9" />
    <path d="M12 9c0-2 1-3.4 2.6-4.2C15.4 6.4 15 8.2 12 9Zm0 0c0-2-1-3.4-2.6-4.2C8.6 6.4 9 8.2 12 9Z" />
    <path d="M12 13.5c0-2 1-3.4 2.6-4.2.8 1.6.4 3.4-2.6 4.2Zm0 0c0-2-1-3.4-2.6-4.2-.8 1.6-.4 3.4 2.6 4.2Z" />
    <path d="M12 18c0-2 1-3.4 2.6-4.2.8 1.6.4 3.4-2.6 4.2Zm0 0c0-2-1-3.4-2.6-4.2-.8 1.6-.4 3.4 2.6 4.2Z" />
  </svg>
);

export const IconFilter = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const IconInfo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const IconInstagram = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M16.8 7.2h.01" />
  </svg>
);

export const IconFacebook = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M14.5 8.5h2V5.6h-2.2c-2 0-3.3 1.3-3.3 3.4v1.8H9v2.9h2v6.3h2.9v-6.3h2.2l.4-2.9h-2.6V9.4c0-.6.2-.9.6-.9Z" />
  </svg>
);

export const IconTikTok = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M14.4 3.5c.3 2 1.5 3.4 3.6 3.7v2.6a6.3 6.3 0 0 1-3.6-1.2v5.7a5 5 0 1 1-5-5c.3 0 .6 0 .8.1v2.7a2.4 2.4 0 1 0 1.6 2.2V3.5h2.6Z" />
  </svg>
);

export const IconSnapchat = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3.6c2.3 0 3.8 1.7 3.8 4v2.2c.6.3 1.2.1 1.6-.1.5-.2 1 .5.5.9-.4.4-1.1.7-1.6.9.3 1.3 1.7 2.7 3 3 .4.1.4.6 0 .8-.7.3-1.6.4-2 .6-.2.2-.1.7-.5.9-.4.2-1.2-.1-2-.1-1 0-1.6.9-2.8.9s-1.8-.9-2.8-.9c-.8 0-1.6.3-2 .1-.4-.2-.3-.7-.5-.9-.4-.2-1.3-.3-2-.6-.4-.2-.4-.7 0-.8 1.3-.3 2.7-1.7 3-3-.5-.2-1.2-.5-1.6-.9-.5-.4 0-1.1.5-.9.4.2 1 .4 1.6.1V7.6c0-2.3 1.5-4 3.8-4Z" />
  </svg>
);
