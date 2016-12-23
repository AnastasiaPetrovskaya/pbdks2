var mongoose = require('mongoose'),
ObjectId = require('mongodb').ObjectID;

var Provider = require('../models/provider.js');


var get = {
    '/': function(req, res, next) {

        Provider.aggregate([{"$unwind" : "$stocks"}, {"$project" : {_id:0, stocks:"$stocks"}}]).exec()
            .then(function(stocks) {
                console.log('stocks', stocks);
                //res.success();
                //
                stocks.forEach(function(st) {
                    console.log(st);
                    st.stocks.amounts_sum = 0;
                    st.stocks.products.forEach(function(pr){
                        st.stocks.amounts_sum += pr.amount;
                    });
                });
                res.render('stocks/index', { stocks: stocks });
            }).catch(function(err) {
                console.log('err', err);
                res.error('Error');
            });
    },


  /*  '/:id/stocks/:stock_id': function(req, res, next) {
        Provider.findOne({"stocks.number": req.params.stock_id}, {'stocks.$': 1}).exec()
            .then(function(provider) {
                console.log('res', provider);
                //res.render('providers/atm_info', {atm: bank.atms[0]});
            }).catch(function(err) {
                console.log('err', err);
                res.error(err);
            });
    },*/


    '/:id/products': function(req, res, next) {
        var options = {};

        if (req.params.id) {
            options._id = ObjectId(req.params.id);
        }
        //console.log('req.params.id', req.params.id);

        Provider.findOne({"stocks._id": req.params.id}, {'stocks.$': 1}).exec()
            .then(function(provider) {

                //console.log('provider', provider.stocks[0].products);
                res.render('stocks/_product_table', {products: provider.stocks[0].products });
            }).catch(function(err) {
                console.log('err', err);
                res.error(err);
            });
    },

    '/:id': function(req, res, next) {
        //console.log(' stcoks get/id ', req.params.id);
        Provider.findOne({"stocks._id": req.params.id}).exec()
            .then(function(provider) {
                //console.log('provider', provider);
                res.render('stocks/show', {stock: provider.stocks[0], provider: provider});
            }).catch(function(err) {
                res.error(err);
            });
    }
};

var post = {
    '/:id/add_product': function(req, res, next) {
        //console.log(':id/add_product');
        Provider.findOne({"stocks._id": req.params.id}, {'stocks.$': 1}).exec()
            .then(function(provider) {
                var stock = provider.stocks[0];
                stock.products.push(req.body);
                //return provider.save();


                return Provider.update( {"stocks._id": req.params.id}, 
                    {$set : {'stocks.$': stock}}).exec();

            }).then(function(r) {
                //console.log('res', r);
                res.succes();
            }).catch(function(err) {
                console.log('res', err);
                res.error(err);
            });
    },

    '/add': function(req, res, next) {
        //console.log('req', req.body);
        var provider = new Provider(req.body);

        provider.save()
            .then(function(provider) {
                //console.log('bank', bank);
                res.success({'id': provider.id});
            }).catch(function(err) {
                console.log('err', err);
                res.error(err);
            });
    },

    '/:id/update': function(req, res, next) {
     //   res.send('partner /id' + req.params.id);
    }
};

var put = {
    '/:id': function(req, res, next) {
        //console.log('put /:id');
        //console.log(req.body);
        /*var update = {};
        update['atms.$.' + req.body.name]= req.body.value;
        Provider.update(
            {
                '_id': req.params.id,
                'atms.id': req.body.pk
            },
            {
                '$set': update
            },
            function(err, num_affected) {
                if (err) {
                    console.log('err', err);
                    res.error(err);
                } else {
                    res.success();
                }
            }
        );*/
    }

};


module.exports = {
    resource: 'Providers',
    methods: {
        get: get,
        post: post,
        put: put
    }
};
