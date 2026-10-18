"use client";

import { useState } from "react";
import { findGoal } from "@/lib/ods";
import { focusRing } from "../ui/styles";
import { questionsFrom } from "./api";
import { Swatch, TableToggle } from "./controls";
import { formatInteger, formatShare, plural, share } from "./format";
import { useMetrics } from "./hooks";
import { Panel } from "./Panel";
import type { QuestionMetrics, QuestionOption } from "./types";

// Options 1-4 run from the lowest to the highest score; any other value means "não sei".
function tone(value: number) {
  const step = value >= 1 && value <= 4 ? String(value) : "none";

  return { fill: `var(--mx-ord-${step})`, ink: `var(--mx-ord-${step}-ink)` };
}

const legend = [
  { value: 1, label: "Opção 1 (menor pontuação)" },
  { value: 2, label: "Opção 2" },
  { value: 3, label: "Opção 3" },
  { value: 4, label: "Opção 4 (maior pontuação)" },
  { value: 5, label: "Opção 5 (não sabe ou não se aplica)" },
];

export function QuestionsPanel({
  query,
  filteredByOds,
  selected,
  onSelect,
  className,
}: {
  query: string;
  className?: string;
  filteredByOds: boolean;
  selected: number | null;
  onSelect: (question: number) => void;
}) {
  const [showTable, setShowTable] = useState(false);
  const state = useMetrics("questions", query, questionsFrom);

  return (
    <Panel
      id="metrics-questions"
      className={className}
      title="Respostas por pergunta"
      description="Distribuição das respostas dos quizzes do período. Escolha uma pergunta para ver as opções."
      actions={<TableToggle showTable={showTable} onToggle={() => setShowTable(!showTable)} />}
      state={state}
      height={filteredByOds ? 320 : 800}
      isEmpty={(questions) => questions.every((question) => question.answers === 0)}
      emptyMessage="Sem respostas no período."
    >
      {(questions) =>
        showTable ? (
          <QuestionTable questions={questions} />
        ) : (
          <QuestionBoard
            questions={questions}
            selected={
              questions.find((question) => question.number === selected) ?? questions[0]
            }
            onSelect={onSelect}
          />
        )
      }
    </Panel>
  );
}

function QuestionBoard({
  questions,
  selected,
  onSelect,
}: {
  questions: QuestionMetrics[];
  selected: QuestionMetrics;
  onSelect: (question: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ul
        aria-label="Legenda das opções"
        className="flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-[var(--admin-muted)]"
      >
        {legend.map((item) => (
          <li key={item.value} className="flex items-center gap-1.5">
            <Swatch color={tone(item.value).fill} />
            {item.label}
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ol className="flex flex-col">
          {questions.map((question) => {
            const isSelected = question.number === selected.number;

            return (
              <li key={question.number} className="border-b border-[var(--admin-border)] last:border-0">
                <QuestionRow
                  question={question}
                  selected={isSelected}
                  onSelect={() => onSelect(question.number)}
                />
                {isSelected ? (
                  <div className="pb-4 pl-3 lg:hidden">
                    <QuestionDetail question={question} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <aside aria-label="Detalhe da pergunta" className="hidden lg:block">
          <div className="sticky top-4 rounded-md border border-[var(--admin-border)] bg-[var(--admin-raised)] p-4">
            <QuestionDetail question={selected} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function QuestionRow({
  question,
  selected,
  onSelect,
}: {
  question: QuestionMetrics;
  selected: boolean;
  onSelect: () => void;
}) {
  const goal = findGoal(question.ods_number);
  const options = [...question.options].sort((a, b) => a.value - b.value);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 border-l-2 py-2 pr-1 pl-2.5 text-left hover:bg-[var(--admin-raised)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_4rem] ${focusRing} ${
        selected ? "border-[var(--admin-accent)] bg-[var(--admin-raised)]" : "border-transparent"
      }`}
    >
      <span className="col-span-2 flex min-w-0 items-center gap-2 lg:col-span-1">
        <span className="w-6 shrink-0 text-[0.6875rem] tabular-nums text-[var(--admin-muted)]">
          P{question.number}
        </span>
        {goal ? (
          <span
            className="inline-flex h-4 min-w-6 shrink-0 items-center justify-center rounded-[3px] px-1 text-[0.625rem] font-bold"
            style={{ backgroundColor: goal.color, color: goal.textColor }}
          >
            <span className="sr-only">ODS </span>
            {goal.number}
          </span>
        ) : null}
        <span className="truncate text-xs text-[var(--admin-text)]">{question.text}</span>
      </span>

      <span
        aria-hidden="true"
        className={`flex h-4 min-w-0 gap-[2px] overflow-hidden rounded-[4px] ${
          question.answers === 0 ? "bg-[var(--admin-border)]" : ""
        }`}
      >
        {options
          .filter((option) => option.count > 0)
          .map((option) => {
            const optionShare = share(option.count, question.answers);
            const { fill, ink } = tone(option.value);

            return (
              <span
                key={option.value}
                title={`${option.label} — ${formatInteger(option.count)} (${formatShare(option.count, question.answers)})`}
                className="flex min-w-[2px] items-center justify-center text-[0.625rem] font-semibold tabular-nums"
                style={{ flex: `${option.count} 1 0%`, backgroundColor: fill, color: ink }}
              >
                {optionShare >= 14 ? (
                  <span className="hidden sm:inline">{Math.round(optionShare)}%</span>
                ) : null}
              </span>
            );
          })}
      </span>

      <span className="text-right text-[0.6875rem] tabular-nums text-[var(--admin-muted)]">
        {formatInteger(question.answers)}
        <span className="sr-only"> respostas</span>
      </span>
    </button>
  );
}

function QuestionDetail({ question }: { question: QuestionMetrics }) {
  const goal = findGoal(question.ods_number);
  const options = [...question.options].sort((a, b) => a.value - b.value);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-[var(--admin-muted)]">
          <span>Pergunta {question.number}</span>
          {goal ? (
            <span className="flex items-center gap-1.5">
              <Swatch color={goal.color} />
              ODS {goal.number} · {goal.name}
            </span>
          ) : null}
        </p>
        <h3 className="mt-1 font-[inherit] text-sm font-medium leading-5 text-[var(--admin-text)]">
          {question.text}
        </h3>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          {plural(question.answers, "resposta", "respostas")} no período
        </p>
      </div>

      <ol className="flex flex-col gap-2.5">
        {options.map((option) => (
          <OptionBar key={option.value} option={option} total={question.answers} />
        ))}
      </ol>
    </div>
  );
}

function OptionBar({ option, total }: { option: QuestionOption; total: number }) {
  return (
    <li className="flex flex-col gap-1">
      <span className="flex items-start gap-2 text-xs text-[var(--admin-text)]">
        <Swatch color={tone(option.value).fill} className="mt-[3px]" />
        <span className="min-w-0 flex-1">{option.label}</span>
        <span className="shrink-0 tabular-nums">
          {formatInteger(option.count)}{" "}
          <span className="text-[var(--admin-muted)]">({formatShare(option.count, total)})</span>
        </span>
      </span>
      <span aria-hidden="true" className="ml-[18px] block h-1.5 rounded-full bg-[var(--admin-border)]">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${share(option.count, total)}%`,
            backgroundColor: tone(option.value).fill,
          }}
        />
      </span>
    </li>
  );
}

function QuestionTable({ questions }: { questions: QuestionMetrics[] }) {
  const values = [1, 2, 3, 4, 5];

  return (
    <div className="max-h-[48rem] overflow-auto">
      <table className="w-full min-w-[46rem] text-left text-xs">
        <caption className="sr-only">
          Respostas por pergunta e opção, com a porcentagem de cada opção
        </caption>
        <thead className="sticky top-0 bg-[var(--admin-surface)] text-[var(--admin-muted)]">
          <tr className="border-b border-[var(--admin-border)]">
            <th scope="col" className="py-1.5 pr-3 font-medium">
              Pergunta
            </th>
            <th scope="col" className="py-1.5 pr-3 font-medium">
              ODS
            </th>
            <th scope="col" className="py-1.5 pr-3 text-right font-medium">
              Respostas
            </th>
            {values.map((value) => (
              <th key={value} scope="col" className="py-1.5 pr-3 text-right font-medium">
                Opção {value}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums text-[var(--admin-text)]">
          {questions.map((question) => (
            <tr key={question.number} className="border-b border-[var(--admin-border)] last:border-0">
              <th scope="row" className="max-w-80 py-1.5 pr-3 font-normal">
                <span className="text-[var(--admin-muted)]">P{question.number}</span> {question.text}
              </th>
              <td className="py-1.5 pr-3">{question.ods_number}</td>
              <td className="py-1.5 pr-3 text-right">{formatInteger(question.answers)}</td>
              {values.map((value) => {
                const option = question.options.find((item) => item.value === value);

                return (
                  <td key={value} className="py-1.5 pr-3 text-right whitespace-nowrap">
                    {option ? (
                      <>
                        {formatInteger(option.count)}{" "}
                        <span className="text-[var(--admin-muted)]">
                          ({formatShare(option.count, question.answers)})
                        </span>
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">sem esta opção</span>
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
