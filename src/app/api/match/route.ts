import { NextResponse } from "next/server";
import { getMongoCollection } from "@/utils/mongo";

// GET /api/match?page=1&limit=20
export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const collection = await getMongoCollection("finished_matches");

  const total = await collection.countDocuments();
  const matches = await collection
    .find({})
    .sort({ "date.day": -1, "date.month": -1, "date.time": -1 }) // последние сверху
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  return NextResponse.json({
    matches,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};
