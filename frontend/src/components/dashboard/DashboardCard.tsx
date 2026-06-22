import { Card, Typography } from "@mui/material";

type DashboardStatCardProps = {
  text: string;
  value: number;
  color: string;
};

export default function DashboardStatCard({
  text,
  value,
  color,
}: DashboardStatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 320,
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        background: `linear-gradient(135deg, ${color}18, #ffffff)`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >


      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        {text}
      </Typography>

      <Typography variant="h3" sx={{ color, mt: 0.5, fontWeight: 800 }}>
        {value}
      </Typography>
    </Card>
  );
}
