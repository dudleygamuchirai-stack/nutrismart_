const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 1. HELMET - sets HTTP security headers automatically
app.use(helmet());

// 2. CORS - only accept requests from Vercel frontend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. RATE LIMITING - general: 100 req/15min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' }
});

app.use('/api/', apiLimiter);

// 4. STRICT AUTH LIMITER - 10 login attempts per 15min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please wait.' }
});

app.use('/api/v1/auth/', authLimiter);

// 5. HEALTH CHECK ENDPOINT - for uptime monitoring
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});