var mongoose = require('mongoose'),
ObjectId = require('mongodb').ObjectID;

var Invoice = require('../models/invoice.js');
var Provider = require('../models/provider.js');


var get = {
    '/': function(req, res, next) {

        Invoice.find().skip(0).exec()
            .then(function(invoices) {
                res.render('invoices/index', { invoices: invoices });
            }).catch(function(err) {
                console.log('err', err);
                res.error('Error');
            });
    },

};

var post = {

    '/add': function(req, res, next) {
        console.log('req_add', req.body);
        var sender_id;
        var recipient_id;
        var ctx = {};

        
        Provider.findOne({"stocks._id": req.body.provider_stock_uid}, {'stocks.$': 1}).exec()
            .then(function(sender) {
                sender_id = sender._id;
                var stock = sender.stocks[0];
                ctx.sender_stock = stock;
                stock.products.forEach(function(pr) {
                    console.log(pr._id);
                    if (pr.vendor == req.body.vendor) {
                        pr.amount -= req.body.amount;
                        console.log('new amount', pr.amount);
                    }
                });
                //обновили количество (убавили);
                return Provider.update( {"stocks._id": req.body.provider_stock_uid}, 
                    {$set : {'stocks.$': stock}}).exec();

            }).then(function(r) {


                //добавляем получателю
                 return Provider.findOne({"stocks._id": req.body.recipient_stock_uid}, {'stocks.$': 1}).exec();
            }).then(function(recipient) {
                recipient_id= recipient._id;
                var stock = recipient.stocks[0];
                ctx.recipient_stock = stock;
                console.log('recipient', recipient);

                stock.products.forEach(function(pr) {
                    console.log(pr._id);
                    if (pr.vendor == req.body.vendor) {
                        pr.amount = +pr.amount + +req.body.amount;
                        console.log('new amount', pr.amount);
                    }
                });

                //обновили количество (убавили);
                return Provider.update( {"stocks._id": req.body.recipient_stock_uid}, 
                    {$set : {'stocks.$': stock}}).exec();

            }).then(function(res) {

                return Provider.findById(sender_id).exec();
            }).then(function(r) {
                ctx.s = r;
                return Provider.findById(recipient_id).exec();
            }).then(function(r) {
                ctx.r = r;
                console.log('ctx', ctx);

                var invoice = new Invoice({
                    provider: {
                        uid: ctx.s._id,
                        name: ctx.s.name,
                        stock: {
                            uid: ctx.sender_stock._id,
                            name: ctx.sender_stock.name
                        }
                    },
                    recipient: {
                        uid: ctx.r._id,
                        name: ctx.r.name,
                        stock: {
                            uid: ctx.recipient_stock._id,
                            name: ctx.recipient_stock.name
                        }
                    },
                    product_vendor: req.body.vendor,
                    amount: req.body.amount,
                    price: req.body.price,
                    sum: req.body.price * req.body.price
                });

                return invoice.save();
            }).then(function(invoice) {
                console.log('res', invoice);
                res.success({'id': invoice.id});
            }).catch(function(err) {
                console.log('err', err);
                res.error(err);
            });

    },
};

module.exports = {
    resource: 'Invoices',
    methods: {
        get: get,
        post: post
    }
};
