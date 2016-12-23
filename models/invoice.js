var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    Timestamp = require('../lib/utils').Timestamp;

var invoiceSchema = mongoose.Schema({
    provider: {
        uid: {type: ObjectId, required: true, min: 1},
        name: {type: String, required: true, min: 1},
        stock: {
            uid: {type: ObjectId, required: true, min: 1},
            name: {type: String, required: true, min: 1},
        }
    },
    recipient: {
        uid: {type: ObjectId, required: true, min: 1},
        name: {type: String, required: true, min: 1},
        stock: {
            uid: {type: ObjectId, required: true, min: 1},
            name: {type: String, required: true, min: 1},
        }
    },
    product_vendor: {type: Number, required: true },
    amount: {type: Number, required: true },
    sum: {type: Number, required: true },
    price: {type: Number, required: true },
    created: {type: Number, default: Timestamp.now},
    updated: {type: Number, default: Timestamp.now}
});

//----Statics-------
//----Model-------
var Invoice = mongoose.model('Invoice', invoiceSchema, 'Invoices');

module.exports = Invoice;
