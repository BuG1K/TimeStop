import { Redis } from "@upstash/redis";
import type { Match } from "@/types/match";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function loadMatches(): Promise<Match[]> {
  return (await redis.get("matches")) || [];
}

export async function saveMatches(matches: Match[]): Promise<void> {
  await redis.set("matches", matches);
}

export async function loadFinishedMatches(): Promise<Match[]> {
  return (await redis.get("finished_matches")) || [];
}

export async function saveFinishedMatches(matches: Match[]): Promise<void> {
  await redis.set("finished_matches", matches);
}
