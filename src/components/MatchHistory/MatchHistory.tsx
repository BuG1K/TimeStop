/* eslint-disable react/no-array-index-key */

"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  Pagination,
  Stack,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Team {
  name: string;
  player?: string;
}

interface Goal {
  team: Team;
  period: number;
  time: string;
}

interface Match {
  id: string;
  teams: {
    team1: Team;
    team2: Team;
  };
  status: {
    score: { [team: string]: number };
    periodNow: number;
    time: string | number;
  };
  date?: {
    day: string;
    month: string;
    time: string;
  };
  goals?: Goal[];
}

interface ApiResponse {
  matches: Match[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const MatchHistory: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/match?page=${pageNum}&limit=10`);
      console.log(1)
      const data: ApiResponse = await res.json();
      setMatches(data.matches);
      setTotalPages(data.totalPages);
    } catch (e) {
      setMatches([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches(page);
  }, [page]);

  return (
    <Box sx={{ maxWidth: 700, margin: "0 auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ color: "#fff" }}>
        История матчей
      </Typography>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress color="secondary" />
        </Box>
      )}
      {!loading && matches.length === 0 && (
        <Typography color="text.secondary" align="center">
          Нет матчей
        </Typography>
      )}
      <List>
        {matches.map((match) => (
          <ListItem key={match.id} sx={{ p: 0, mb: 2 }}>
            <Card
              sx={{
                width: "100%",
                background: "#1e1e1e",
                boxShadow: 1,
                borderRadius: 2,
                border: "1px solid #333",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  <Typography sx={{ fontSize: 16, fontWeight: 500, color: "#fff" }}>
                    {Object.entries(match.status.score)
                      .map(([team, score]) => `${team}: ${score}`)
                      .join(" | ")}
                  </Typography>
                </Stack>
                <Typography color="white" sx={{ fontSize: 14 }}>
                  {match.date
                    ? `Дата: ${match.date.day}.${match.date.month} ${match.date.time}`
                    : ""}
                </Typography>
                {match.goals && match.goals.length > 0 && (
                  <Accordion
                    sx={{
                      bgcolor: "#232323",
                      borderRadius: 1,
                      boxShadow: "none",
                      border: "1px solid #333",
                      mt: 1,
                      color: "#fff",
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}>
                      <Typography color="secondary" fontWeight={500} fontSize={15}>
                        Показать голы
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {match.goals.map((goal, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                            pl: 1,
                          }}
                        >
                          <Typography sx={{ minWidth: 120, color: "#fff" }}>
                            {goal.team.name}
                          </Typography>
                          <Typography sx={{ mx: 1, color: "#aaa" }}>
                            Период:
                            {" "}
                            {goal.period}
                          </Typography>
                          <Typography sx={{ mx: 1, color: "#aaa" }}>
                            Время:
                            {" "}
                            {goal.time}
                          </Typography>
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="secondary"
          style={{ backgroundColor: "#fff" }}

        />
      </Box>
    </Box>
  );
};

export default MatchHistory;
