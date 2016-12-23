var get = {
    '/': function(req, res, next) {
        res.render('main/index', { current_page: 'main' });
    }
};


module.exports = {
    resource: '',
    methods: {
        get: get
    }
};
