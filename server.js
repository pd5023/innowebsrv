require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoute        = require('./src/routes/auth');
const gatewayRoute     = require('./src/routes/gateway');
const gatewayPostRoute = require('./src/routes/gatewayPost');
const adminRoute       = require('./src/routes/admin/index');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────────────────────
// In production set ALLOWED_ORIGINS=https://innoadmin.onrender.com in Render env vars
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS: ${origin} not allowed`));
  },
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'InnoWebSrv running', version: '1.0.0' }));

// ── Routes — matching original PHP paths exactly ─────────────────────────────
app.use('/includes/innophone/verification.php', authRoute);
app.use('/includes/dyncont/gateway.php',        gatewayRoute);
app.use('/includes/dyncont/gatewayPost1SR.php', gatewayPostRoute);
app.use('/admin/api', adminRoute);

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`InnoWebSrv listening on port ${PORT}`);
  console.log(`  Auth:    /includes/innophone/verification.php`);
  console.log(`  Gateway: /includes/dyncont/gateway.php`);
  console.log(`  Post SR: /includes/dyncont/gatewayPost1SR.php`);
});
