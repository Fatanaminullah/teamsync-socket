import express from "express";

const app = express();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});

// Important: Export the app for Vercel
export default app;
