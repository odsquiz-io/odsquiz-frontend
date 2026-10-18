export type Overview = {
  users: {
    total: number;
    active: number;
    suspended: number;
    admins: number;
    new: number;
  };
  quizzes: {
    submissions: number;
    participants: number;
    average_points: number;
  };
  initiatives: {
    total: number;
    active: number;
    suspended: number;
    new: number;
    people_served: number;
  };
};

export type SeriesMetric = "signups" | "submissions" | "initiatives";

export type SeriesInterval = "day" | "week" | "month";

export type SeriesPoint = { date: string; value: number };

export type TimeSeries = {
  metric: SeriesMetric;
  interval: SeriesInterval;
  points: SeriesPoint[];
};

export type GoalMetrics = {
  ods_number: number;
  average_points: number;
  top_count: number;
  initiatives: number;
  people_served: number;
};

export type QuestionOption = { value: number; label: string; count: number };

export type QuestionMetrics = {
  number: number;
  text: string;
  ods_number: number;
  answers: number;
  options: QuestionOption[];
};

export type PlaceMetrics = {
  state: string;
  city: string;
  users: number;
  submissions: number;
  initiatives: number;
};

export type InitiativeTypeMetrics = {
  type: string;
  initiatives: number;
  people_served: number;
};
