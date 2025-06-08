import { NextResponse } from "next/server";
import { fetchMatches, loadMatches, saveMatches } from "@/utils";
import { getMongoCollection } from "@/utils/mongo";

const GET = async () => {
  const prevMatches = await loadMatches();
  const matches = await fetchMatches();

  // 1. Найти завершённые (которых больше нет среди актуальных)
  const currentIds = matches.map((m) => m.id);
  const finished = prevMatches.filter((m) => !currentIds.includes(m.id));

  // 2. Сохраняем только завершённые матчи в MongoDB
  if (finished.length > 0) {
    const collection = await getMongoCollection("finished_matches");
    await collection.insertMany(finished);
  }

  // 3. Обновляем актуальные матчи (оставляем только те, что есть сейчас)
  const filteredMatches = matches.filter((match) => {
    const prev = prevMatches.find((m) => m.id === match.id);
    if (!prev) {
      const scores = Object.values(match.status.score);
      return scores.every((v) => v === 0);
    }
    return true;
  });

  filteredMatches.forEach((origMatch, idx) => {
    const match = { ...origMatch };
    const prev = prevMatches.find((m) => m.id === match.id);

    if (!prev) {
      match.goals = [];
      filteredMatches[idx] = match;
      return;
    }

    match.goals = prev.goals || [];
    filteredMatches[idx] = match;

    const prevScore = prev.status.score;
    const currScore = match.status.score;

    Object.keys(currScore).forEach((team) => {
      const prevVal = prevScore[team] ?? 0;
      const currVal = currScore[team] ?? 0;
      if (currVal > prevVal) {
        for (let i = 0; i < currVal - prevVal; i += 1) {
          match.goals.push({
            team: match.teams.team1.name === team ? match.teams.team1 : match.teams.team2,
            period: match.status.periodNow,
            time: match.status.time.toString(),
          });
        }
      }
    });
  });

  await saveMatches(filteredMatches);

  return NextResponse.json(filteredMatches, { status: 200 });
};

export { GET };
