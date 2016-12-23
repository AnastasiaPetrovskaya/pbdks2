$(document).ready(function() {

    $('.buy').click(function(e) {

        $('#div_buy_info').css('display', 'block');
        console.log($(this).data('id'));
        $('#provider_stock').text(window.stock_id);
        $('#product').text($(this).data('vendor'));
        $('#price').text($(this).data('price'));
        
    });


    $('#add_invoice_btn').click(function(e) {

        var data = {};

        data.recipient_stock_uid = $('#recipient_stock_id').val();
        data.amount = $('#amount').val();


        data.provider_stock_uid = $('#provider_stock').text();
        data.vendor = $('#product').text();
        data.price = $('#price').text();

        console.log('data1', data);

        $.ajax({
            type: 'POST',
            url: '/invoices/add',
            data: data
        }).done(function() {
            window.location.reload();
        }).fail(function() {
            console.log('err');
        });



        
    });

});

