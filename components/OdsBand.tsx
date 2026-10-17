import { odsGoals } from "@/lib/ods";

export function OdsBand({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex ${className}`}>
      {odsGoals.map((goal) => (
        <span
          key={goal.number}
          className="flex-1"
          style={{ backgroundColor: goal.color }}
        />
      ))}
    </div>
  );
}
