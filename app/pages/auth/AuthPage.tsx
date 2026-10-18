import type { ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { odsGoals } from "@/lib/ods";

const tileClassName =
  "aspect-square rounded-[3px] motion-safe:animate-[build_700ms_cubic-bezier(0.2,0.8,0.2,1)_both]";

export function AuthPage({
  children,
  intro,
  label,
  title,
}: {
  children: ReactNode;
  intro: string;
  label: string;
  title: string;
}) {
  return (
    <main className="flex-1 bg-[var(--color-app-background)] pb-24 pt-36 text-[var(--color-app-foreground)] transition-colors sm:pt-44">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-14">
        <PageHeader label={label} title={title}>
          {intro}
        </PageHeader>
        <div className="w-full max-w-md lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {children}
        </div>
        <GoalMosaic />
      </div>
    </main>
  );
}

function GoalMosaic() {
  return (
    <div
      aria-hidden="true"
      className="grid max-w-md grid-cols-6 gap-1.5 self-start font-display font-extrabold leading-none lg:col-start-1 lg:row-start-2"
    >
      {odsGoals.map((goal, index) => (
        <span
          key={goal.number}
          className={`${tileClassName} p-1.5 text-lg [font-stretch:75%] sm:p-2 sm:text-2xl`}
          style={{
            backgroundColor: goal.color,
            color: goal.textColor,
            animationDelay: `${index * 40}ms`,
          }}
        >
          {String(goal.number).padStart(2, "0")}
        </span>
      ))}
      <span
        className={`${tileClassName} grid place-items-center border-2 border-dashed border-[var(--color-app-foreground)] text-sm [font-stretch:85%] sm:text-base`}
        style={{ animationDelay: `${odsGoals.length * 40}ms` }}
      >
        Você
      </span>
    </div>
  );
}
