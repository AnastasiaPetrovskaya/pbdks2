var mongoose = require('mongoose'),
ObjectId = require('mongodb').ObjectID;

var Provider = require('../models/provider.js');


var get = {
    '/': function(req, res, next) {

        Provider.find().skip(0).exec()
            .then(function(providers) {
                res.render('providers/index', { providers: providers });
            }).catch(function(err) {
                console.log('err', err);
                res.error('Error');
            });
    },


    '/:id': function(req, res, next) {
        Provider.findOne({"stocks.id": req.params.id}, {'stocks.$': 1}).exec()
            .then(function(provider) {
                console.log('res', provider);
                //res.render('providers/atm_info', {atm: bank.atms[0]});
            }).catch(function(err) {
                console.log('err', err);
                res.error(err);
            });
    },


    '/:id/stocks': function(req, res, next) {
        var options = {};

        if (req.params.id) {
            options._id = ObjectId(req.params.id);
        }
        //console.log('req.params.id', req.params.id);

        Provider.findOne(options).exec()
            .then(function(provider) {
                var stocks = provider.stocks;
                stocks.forEach(function(st) {
                    st.amounts_sum = 0;
                    st.products.forEach(function(pr){
                        st.amounts_sum += pr.amount;
                    });
                });
                console.log('stocks', stocks);
                res.render('stocks/_table', {stocks:stocks });
            }).catch(function(err) {
                console.log('err', err);
                res.error(err);
            });
    },

    '/:id': function(req, res, next) {
        Provider.findById(req.params.id).exec()
            .then(function(provider) {
                res.render('providers/show', {provider: provider});
            }).catch(function(err) {
                res.error(err);
            });
    }
};

var post = {
    '/:id/add_stock': function(req, res, next) {
        console.log(':id/add_stock', req.body);
        Provider.findById(req.params.id).exec()
            .then(function(provider) {
                provider.stocks.push(req.body);
                return provider.save();
            }).then(function(res) {
                //console.log('res', res);
                res.succes();
            }).catch(function(err) {
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
        console.log('put /:id');
        console.log(req.body);
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
