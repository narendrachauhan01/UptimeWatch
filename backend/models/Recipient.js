const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    servers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Server' }], // empty = all servers
}, { timestamps: true });

module.exports = mongoose.model('Recipient', recipientSchema);
