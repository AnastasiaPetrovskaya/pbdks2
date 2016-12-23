var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    Timestamp = require('../lib/utils').Timestamp,
    Invoice = require('./invoice.js');

var productsListSchema = new mongoose.Schema({
    vendor: Number,
    name: String,
    price: Number,
    amount: Number,
    description: String
});

var stocksListSchema = new mongoose.Schema({
    id: Number,
    products: [productsListSchema],
    name: String,
    address: String
});

var productsListSchema = new mongoose.Schema({
    vendor: Number,
    name: String,
    price: Number,
    description: String
});

var providerSchema = mongoose.Schema({
  name: {type: String, required: true, min: 1},
  phone: {type: String, required: true },
  inn: {type: Number, required: true },
  stocks: [stocksListSchema],
  invoices: [{ type : ObjectId, ref: 'Invoice' }],
  created: {type: Number, default: Timestamp.now},
  updated: {type: Number, default: Timestamp.now}
});



//----Statics-------
//----Model-------
var Bank = mongoose.model('Provider', providerSchema, 'Providers');


module.exports = Bank;
