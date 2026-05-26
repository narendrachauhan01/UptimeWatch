require('dotenv').config();

const express  = require('express');
const http     = require('http');
const mongoose = require('mongoose');
const cors     = require('cors');

const wa      = require('./services/whatsapp');
const monitor = require('./services/monitor');

const app        = express();
const httpServer = http.createServer(app);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
}));
app.use(express.json());

app.use('/api/servers',      require('./routes/servers'));
app.use('/api/recipients',   require('./routes/recipients'));
app.use('/api/alerts',       require('./routes/alerts'));
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/userAuth'));
app.use('/api/notifications',require('./routes/notifications'));
app.use('/api/payment',      require('./routes/payment'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/whatsapp',     require('./routes/whatsapp'));
app.use('/api/expiry',       require('./routes/expiry'));
app.use('/api/email-config', require('./routes/emailConfig'));
app.use('/api/metrics',      require('./routes/metrics'));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('[DB] MongoDB connected');
        wa.init();
        monitor.start();
    })
    .catch(e => { console.error('[DB] Connection failed:', e.message); process.exit(1); });

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));
