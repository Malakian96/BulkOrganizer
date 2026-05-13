interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
}

const paths: Record<string, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  minus: <><path d="M5 12h14"/></>,
  heart: <path d="M12 21s-7-4.5-9.5-9.2C.8 8 2.7 4 6.5 4 9 4 10.5 5.5 12 7.5 13.5 5.5 15 4 17.5 4 21.3 4 23.2 8 21.5 11.8 19 16.5 12 21 12 21z"/>,
  heartF: <path d="M12 21s-7-4.5-9.5-9.2C.8 8 2.7 4 6.5 4 9 4 10.5 5.5 12 7.5 13.5 5.5 15 4 17.5 4 21.3 4 23.2 8 21.5 11.8 19 16.5 12 21 12 21z" fill="currentColor" stroke="none"/>,
  x: <><path d="M6 6l12 12M18 6L6 18"/></>,
  check: <><path d="M5 12l4 4 10-10"/></>,
  layers: <><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 18l9 5 9-5"/></>,
  camera: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6l2-2h4l2 2"/><circle cx="12" cy="13" r="4"/></>,
  decks: <><path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M4 13l8 4 8-4"/></>,
  chart: <><path d="M4 20V8M10 20V4M16 20v-9M22 20H2"/></>,
  star: <path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.3l6-.8L12 3z"/>,
  sliders: <><path d="M4 6h12M19 6h2M4 12h6M13 12h8M4 18h14M21 18h-1"/><circle cx="17" cy="6" r="2"/><circle cx="11" cy="12" r="2"/><circle cx="19" cy="18" r="2"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></>,
  moon: <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>,
  arrow: <><path d="M5 12h14M13 5l7 7-7 7"/></>,
  download: <><path d="M12 4v12M6 12l6 4 6-4M4 20h16"/></>,
  upload: <><path d="M12 20V8M6 12l6-4 6 4M4 4h16"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></>,
  flag: <><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></>,
  folder: <><path d="M3 6h6l2 2h10v11H3z"/></>,
  menu: <><path d="M3 6h18M3 12h18M3 18h18"/></>,
};

export function Icon({ name, size = 16, stroke = 1.6 }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    >
      {paths[name] ?? paths.grid}
    </svg>
  );
}
