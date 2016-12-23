$(document).ready(function() {
    $('#btn_add_product').click(function(e) {
        var that = this,
            options = {
                stock_id: window.stock_id ? window.stock_id : null
            };

        $.ajax({
            type: 'POST',
            url: '/stocks/' + stock_id + '/add_product',
            data: $('#add_product_form').serialize()
        }).done(function() {
            getTable('/stocks/' + stock_id + '/products', options, '#products', function() {});
        }).fail(function() {
            console.log('err');
        });
    });


});
