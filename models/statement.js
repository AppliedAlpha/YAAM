const mongoose = require("mongoose");

const StatementSchema = new mongoose.Schema({
    assortment: { 
        type: Boolean, // true: +, false: -
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    target: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
});

const Statement = mongoose.model("statement", StatementSchema);
module.exports = Statement;
