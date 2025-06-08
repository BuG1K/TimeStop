import axios from "axios";
import * as cheerio from "cheerio";
import {
  Match, MatchStatus, Score, MatchDate,
} from "../types/match";

const getMatchId = (url: string): string => {
  const match = url.match(/id=(\d+)/);
  return match ? match[1] : url;
};

const parseScore = (scoreText: string): {
  scoreTeam1: number;
  scoreTeam2: number;
  status: MatchStatus,
} => {
  if (!scoreText || scoreText === "-") {
    return { scoreTeam1: 0, scoreTeam2: 0, status: "upcoming" };
  }

  const match = scoreText.match(/^(\d+):(\d+)/);
  const isLive = /период|мин|тайм|идет/i.test(scoreText);

  return {
    scoreTeam1: match ? Number(match[1]) : 0,
    scoreTeam2: match ? Number(match[2]) : 0,
    status: isLive ? "live" : "finished",
  };
};

const parseTeams = (text: string): { name: string, player: string }[] => {
  const parts = text.split(" - ");
  return parts.map((part) => {
    const match = part.match(/^(.+?)(?:\s*\((.+)\))?$/);
    if (match) {
      return {
        name: match[1].trim(),
        player: match[2]?.trim() || "",
      };
    }
    return { name: part.trim(), player: "" };
  });
};

const parsePeriodsArr = (scoreText: string): string[] => {
  const match = scoreText.match(/\(([^)]+)\)/);
  if (!match) return [];
  return match[1].split(",").map((s) => s.trim());
};

const parsePeriodsObject = (periodsArr: string[], team1: string, team2: string) => {
  const result: { [period: number]: Score } = {};

  periodsArr.forEach((periodScore, idx) => {
    const [score1, score2] = periodScore.split(":").map(Number);

    result[idx + 1] = {
      [team1]: score1,
      [team2]: score2,
    };
  });

  return result;
};

const getMinute = (text: string): number | null => {
  const match = text.match(/(\d+)\s?мин/);

  return match ? Number(match[1]) : null;
};

const getDate = (time: string): MatchDate => {
  const now = new Date();

  return {
    time,
    month: String(now.getMonth() + 1).padStart(2, "0"),
    day: String(now.getDate()).padStart(2, "0"),
  };
};

function getPeriodNow(scoreText: string): number {
  const match = scoreText.match(/(\d+)[-–]й\s*период/i);
  if (match) return Number(match[1]);

  const periods = scoreText.match(/\(([^)]+)\)/);
  if (periods) {
    return periods[1].split(",").length;
  }

  return 1;
}

const fetchMatches = async (): Promise<Match[]> => {
  const { SCORES_URL } = process.env;

  if (!SCORES_URL) {
    throw new Error("SCORES_URL environment variable is not set");
  }

  const html = (await axios.get(SCORES_URL)).data;
  const $ = cheerio.load(html);
  const matches: Match[] = [];

  $(".sports").each((_, el) => {
    const url = $(el).find('a[href*="/minichat/"]').attr("href");
    if (!url) return;

    const teamsText = $(el).find("a").text().trim();
    const teams = parseTeams(teamsText);

    // Время из <i>
    const time = $(el).find("i").first().text()
      .trim();

    // Строка со счётом и периодами
    const scoreText = $(el).find("span").text().trim();
    const { scoreTeam1, scoreTeam2, status } = parseScore(scoreText);

    const periodsArr = parsePeriodsArr(scoreText);
    const periodsObj = parsePeriodsObject(periodsArr, teams[0].name, teams[1].name);

    matches.push({
      id: getMatchId(url),
      html: `${teamsText} ${scoreText}`,
      date: getDate(time),
      teams: {
        team1: { name: teams[0]?.name || "", player: teams[0]?.player || "" },
        team2: { name: teams[1]?.name || "", player: teams[1]?.player || "" },
      },
      status: {
        score: {
          [teams[0].name]: scoreTeam1,
          [teams[1].name]: scoreTeam2,
        },
        periods: periodsObj,
        periodNow: getPeriodNow(scoreText),
        time: getMinute(scoreText) || 0,
        row: scoreText,
      },
      matchStatus: status,
      goals: [],
    });
  });

  return matches;
};

export default fetchMatches;
