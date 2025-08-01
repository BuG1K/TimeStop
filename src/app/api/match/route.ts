import { NextResponse } from "next/server";
import { getMongoCollection } from "@/utils/mongo";
import fs from "fs";
import path from "path";

const players = [
  "PINGWIN",
  "KLOZE",
  "EMPEROR",
  "BLACKICE",
    // "SAMURAI",
    // "Lovelas",
    // "ALADDIN",
    // "ICEMAN",
    // "COBAIN",
    // "OVI",
    // "P1RATE",
    // "Griezmann",
    // "KHAN",
    // "Machette",
    // "M1CHELIN",
    // ----------
    // "PUCK",
    // "GOALNIK",
    // "PRO100RAK",
    // "ENJOOOY",
    // "CR1STAL",
    // "FM82",
    // "BALMY2820",
    // "PETYA98",
  ];

export const GET = async () => {
  const query = {
    $or: [
      { "teams.team1.player": { $in: players } },
      { "teams.team2.player": { $in: players } },
    ],
  };

  const collection = await getMongoCollection("finished_matches");
  let matches = await collection.find(query).toArray();

  // Фильтрация по последним 30 дням
  const now = new Date();
  const thisYear = now.getFullYear();

  matches = matches.filter((m) => {
    if (!m.date || !m.date.day || !m.date.month) return false;
    // Собираем дату матча (год текущий)
    const matchDate = new Date(
      thisYear,
      Number(m.date.month) - 1,
      Number(m.date.day)
    );
    // Если дата в будущем — считаем, что это прошлый год
    if (matchDate > now) {
      matchDate.setFullYear(thisYear - 1);
    }
    const diffDays = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7 && diffDays >= 0;
  });

  // Удаляем дубли по id матча, но сохраняем матчи без id
  const unique: Record<string, any> = {};
  const noId: any[] = [];
  matches.forEach((m) => {
    if (m.id) {
      unique[m.id] = m;
    } else {
      noId.push(m);
    }
  });
  matches = [...Object.values(unique), ...noId];

  // Сохраняем результат в data.json в этой же папке
  const dirPath = path.resolve(__dirname);
  const filePath = path.join(dirPath, "data.json");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(matches, null, 2), "utf-8");
  console.log("Отфильтрованные матчи сохранены в", filePath);

  console.log("Количество матчей:", matches.length);
  return NextResponse.json(matches);
};