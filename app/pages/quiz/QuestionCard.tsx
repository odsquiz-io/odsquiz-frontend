import { surface } from "@/components/styles";
import { goalColors, goalFor } from "./goals";
import type { QuizQuestion } from "./types";

export function QuestionCard({
  onSelect,
  question,
  selectedOptionID,
  total,
}: {
  onSelect: (answerOptionId: string) => void;
  question: QuizQuestion;
  selectedOptionID?: string;
  total: number;
}) {
  const goal = goalFor(question.ods_number);

  return (
    <li
      id={`pergunta-${question.number}`}
      className={`grid scroll-mt-8 grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-4 gap-y-5 p-5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-6 sm:p-8 ${surface}`}
      style={goalColors(goal)}
    >
      <span
        aria-hidden="true"
        className="font-display text-5xl font-extrabold leading-none tabular-nums [font-stretch:75%] sm:row-span-2 sm:self-start sm:text-7xl"
      >
        {String(question.number).padStart(2, "0")}
      </span>

      <p className="w-fit rounded-[3px] bg-[var(--ods)] px-2.5 py-1 text-sm font-bold leading-snug text-[var(--ods-text)]">
        ODS {goal.number} <span aria-hidden="true">·</span> {goal.name}
      </p>

      <fieldset className="col-span-2 sm:col-span-1 sm:col-start-2">
        <legend className="text-xl font-bold leading-snug sm:text-2xl">
          <span className="sr-only">
            Pergunta {question.number} de {total}:{" "}
          </span>
          {question.text}
        </legend>

        <div className="mt-6 grid gap-2.5">
          {question.options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-start gap-3.5 rounded-md border-2 border-[var(--color-header-border)] bg-[var(--color-app-background)] px-4 py-3.5 leading-snug transition-colors hover:border-[var(--ods)] has-checked:border-[var(--ods)] has-checked:bg-[var(--ods)] has-checked:text-[var(--ods-text)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[var(--color-focus-ring)]"
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={selectedOptionID === option.id}
                onChange={() => onSelect(option.id)}
                className="mt-0.5 size-5 shrink-0 cursor-pointer scroll-mb-40 appearance-none rounded-full border-2 border-current transition-[border-width] checked:border-[6px] focus-visible:outline-none"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </li>
  );
}
