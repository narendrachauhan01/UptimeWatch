const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
    serverName: { type: String },
    serverUrl: { type: String },
    type: { type: String, enum: ['down', 'recovered'], required: true },
    message: { type: String },
    sentTo: [{ name: String, phone: String }],
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
