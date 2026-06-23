import { Suspense, type ComponentType } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

type LazyLoadProps = {
  message?: string;
};

export default function LazyLoad(
  Component: ComponentType,
  props?: LazyLoadProps,
) {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            {props?.message ?? "Loading..."}
          </Typography>
        </Box>
      }
    >
      <Component />
    </Suspense>
  );
}
