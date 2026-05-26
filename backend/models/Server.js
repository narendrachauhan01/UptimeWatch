const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    checkInterval: { type: Number, default: 60 },
    active: { type: Boolean, default: true },
    status: { type: String, enum: ['up', 'down', 'unknown'], default: 'unknown' },
    lastChecked: { type: Date },
    lastDownAt: { type: Date },
    lastUpAt: { type: Date },
    responseTime: { type: Number },
    httpCode: { type: Number },
    history: [{
        time: { type: Date },
        responseTime: { type: Number },
        status: { type: String },
        httpCode: { type: Number },
    }],
    sslExpiry: { type: Date },
    sslDaysLeft: { type: Number },
    domainExpiry: { type: Date },
    userId: { type: require('mongoose').Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Server', serverSchema);
