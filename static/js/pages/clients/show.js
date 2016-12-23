$(document).ready(function() {
    $('#btn_add_stock').click(function(e) {
        var that = this,
            options = {
                provider_id: window.provider_id ? window.provider_id : null
            };

        $.ajax({
            type: 'POST',
            url: '/providers/' + provider_id + '/add_stock',
            data: $('#add_stock_form').serialize()
        }).done(function() {
            getTable('/providers/' + provider_id + '/stocks', options, '#stocks', function() {});
        }).fail(function() {
            console.log('err');
        });
    });


    $('#btn_add_client').click(function(e) {
        var that = this,
            options = {
                bank_id: window.bank_id ? window.bank_id : null
            };

        $.ajax({
            type: 'POST',
            url: '/clients/add',
            data: $('#add_client_form').serialize() + "&bank_id=" + bank_id
        }).done(function() {
            //getTable('/banks/' + bank_id + '/atms', options, '#atms', function() {});
        }).fail(function() {
            console.log('err');
        });
    });

});
