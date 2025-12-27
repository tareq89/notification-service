// src/controllers/health.controller.js
export function healthCheck(req, res) {
  res.json({
    status: "ok",
    uptime: process.uptime(),
  });
}
