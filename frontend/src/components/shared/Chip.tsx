interface ChipProps {
  on?: boolean;
  onClick?: () => void;
  dot?: string;
  children: React.ReactNode;
}

export function Chip({ on, onClick, dot, children }: ChipProps) {
  return (
    <button className={'chip' + (on ? ' on' : '')} onClick={onClick}>
      {dot && <span className="dot" style={{ background: dot }} />}
      {children}
    </button>
  );
}
