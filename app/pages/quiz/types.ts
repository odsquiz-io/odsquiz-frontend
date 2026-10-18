export type QuizAnswerOption = {
  id: string;
  question_id: string;
  option_value: number;
  label: string;
  score: number;
};

export type QuizQuestion = {
  id: string;
  number: number;
  text: string;
  ods_number: number;
  options: QuizAnswerOption[];
};

export type OdsScore = {
  ods_number: number;
  points: number;
};

export type QuizResult = {
  submission_id: string;
  user_id: string;
  total_points: number;
  ods_scores: OdsScore[];
};

export type QuizSubmission = {
  id: string;
  total_points: number;
  completed_at: string;
  ods_scores: OdsScore[];
};

export type QuizStatus = "idle" | "loading" | "submitting" | "success" | "error";
