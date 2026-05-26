const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, default: null, sparse: true },
    email: { type: String, default: null, sparse: true },
    active: { type: Boolean, default: true },
    servers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Server' }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Recipient', recipientSchema);
