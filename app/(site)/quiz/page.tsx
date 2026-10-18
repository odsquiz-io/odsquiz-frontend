import type { Metadata } from "next";
import Quiz from "@/app/pages/Quiz";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizPage() {
  return <Quiz />;
}
