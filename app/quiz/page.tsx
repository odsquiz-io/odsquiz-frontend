import type { Metadata } from "next";
import Quiz from "../pages/Quiz";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizPage() {
  return <Quiz />;
}
