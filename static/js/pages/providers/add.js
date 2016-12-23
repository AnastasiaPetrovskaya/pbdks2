$(document).ready(function() {

    $("#btn_add_provider").click(function(e) {

        var res = $.ajax({
            type: 'POST',
            url: '/providers/add',
            data: $('#add_provider_form').serialize(),
            dataType: 'json',
            async: false
        }).responseText;
        res = JSON.parse(res);

        if (res.success) {
            window.location.href = '/providers';
        } else {
            console.log(res);
            //#TODO страницу с ошибкой
            window.location.href = '/error';
        }
    });
});
