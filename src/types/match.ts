type MatchStatus = "live" | "finished" | "upcoming";

interface Team {
  name: string;
  player: string;
}

interface Score {
  [team: string]: number
}

interface Status {
  score: Score
  periods: {
    [period: number]: Score;
  }
  periodNow: number;
  time: number;
  row: string;
}

interface Goal {
  team: Team
  period: number
  time: string
}

interface MatchDate {
  time: string;
  day: string;
  month: string;
}

interface Match {
  id: string;
  html: string;
  date: MatchDate;
  teams: {
    team1: Team;
    team2: Team;
  }
  goals: Goal[]
  status: Status;
  matchStatus: MatchStatus;
}

export type {
  Match, MatchStatus, Score, MatchDate,
};
