import rateLimit from "express-rate-limit";

const isTestEnvironment = () =>
  process.env.NODE_ENV === "test" || process.env.VITEST === "true";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: isTestEnvironment,
  message: { error: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: isTestEnvironment,
  message: { error: "Muitos cadastros. Tente novamente mais tarde." },
});
