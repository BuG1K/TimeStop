"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  List,
  ListItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
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

const LiveMatches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parse");
      const data = await res.json();
      setMatches(data);
    } catch (e) {
      // handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 3000); // 30 секунд
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ maxWidth: 700, margin: "0 auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ color: "#fff" }}>
        Live Matches
      </Typography>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress color="secondary" />
        </Box>
      )}
      {!loading && matches.length === 0 && (
        <Typography color="text.secondary" align="center">
          No matches
        </Typography>
      )}
      <List>
        {matches.map((match) => (
          <ListItem key={match.id} sx={{ p: 0, mb: 2 }}>
            <Card
              sx={{
                width: "100%",
                background: "#1e1e1e",
                borderLeft: "5px solid #ff5252",
                boxShadow: 1,
                borderRadius: 2,
                border: "1px solid #333",
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                  <Chip
                    label="LIVE"
                    color="error"
                    size="small"
                    sx={{
                      fontWeight: 500,
                      letterSpacing: 1,
                      bgcolor: "#ff5252",
                      color: "#fff",
                      px: 1.5,
                      fontSize: 13,
                    }}
                  />
                  <Typography variant="h6" sx={{ flex: 1, fontWeight: 600, color: "#fff" }}>
                    {match.teams.team1.name} vs {match.teams.team2.name}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  <Typography sx={{ fontSize: 17, fontWeight: 500, color: "#fff" }}>
                    Счёт:&nbsp;
                    {Object.entries(match.status.score)
                      .map(([team, score]) => `${team}: ${score}`)
                      .join(" | ")}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                    Период: {match.status.periodNow}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                    Время: {match.status.time}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                    {match.date
                      ? `Дата: ${match.date.day}.${match.date.month} ${match.date.time}`
                      : ""}
                  </Typography>
                </Stack>
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
                      <Typography color="error" fontWeight={500} fontSize={15}>
                        Show goals
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
                            Period: {goal.period}
                          </Typography>
                          <Typography sx={{ mx: 1, color: "#aaa" }}>
                            Time: {goal.time}
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
    </Box>
  );
};

export default LiveMatches;
