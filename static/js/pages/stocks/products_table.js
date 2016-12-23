$(document).ready(function() {

    var options = {
        stock_id: window.stock_id ? window.stock_id : null
    };

    getTable('/stocks/' + stock_id + '/products', options, '#products', function() {

        /*$('.atm_info').click(function() {
            window.atm_id = $(this)[0].dataset.id;
            var url = '/banks/' + bank_id + '/atm/' + $(this)[0].dataset.id;
            $('#div_atm_info').css('display', 'block');

            getTable(url, options, '#atm_info', function() {

                //обработчик editable
                $('.edit_atm').editable({
                    url: '/banks/' + bank_id,
                    pk: atm_id,
                    ajaxOptions: {type: "PUT"},
                    success: function() {
                        console.log('success');
                        //window.location.reload();
                        //#TODO перезагрузить таблицу с банкоматами
                    },
                    error: function(err) {
                        console.log(err);
                    },
                    validate: function(val) {
                        if($.trim(val) == "")
                            return "Введите значение"
                    }
                });
            });
        });*/
    });

});
