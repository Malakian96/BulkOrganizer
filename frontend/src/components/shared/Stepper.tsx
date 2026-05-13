import { Icon } from './Icon';

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function Stepper({ value, onChange, min = 0, max = 99 }: StepperProps) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - 1))}><Icon name="minus" size={14} /></button>
      <div className="num">{value}</div>
      <button onClick={() => onChange(Math.min(max, value + 1))}><Icon name="plus" size={14} /></button>
    </div>
  );
}
