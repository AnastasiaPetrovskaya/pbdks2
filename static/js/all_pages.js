$('.phone').mask('+7 (999) 999-99-99');
$('.date-picker').mask('00.00.0000');
$('.money').mask('000 000 000 000 000,00', { reverse: true });
$('.switch').get().forEach(function(checkbox) {
    new Switchery(checkbox, {
        color: '#1DB198',
        size: 'small'
    });

});

$('.title-link').click(function() {
    var $this = $(this), $body = $this.parent().parent().find('.panel-body');
    
    if ($body.hasClass('hide')) {
        $body.removeClass('hide');
    } else {
        $body.addClass('hide');
    }
});

toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: true,
    progressBar: false,
    positionClass: 'toast-top-right',
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "0",
    extendedTimeOut: "0",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
};


var getCurrencyIcon = function(currency) {
    switch (currency) {
        case 'RUB': return '<i class="fa fa-rub"></i>';
        case 'USD': return '<i class="fa fa-usd"></i>';
        case 'EUR': return '<i class="fa fa-eur"></i>';
        default: return currency;
    }
};

/**
 * Запрос таблицы
 * @param {String} selector - селектор таблицы
 * @param {String} url - откуда запрашивать таблицу
 * @param {JSON} params - параметры запроса в виде json
 * @param {Function} [callback] - callback
 */
var getTable = function(selector, url, params, callback) {
    $(selector).html('<p class="m-t-sm text-center"><i class="fa fa-spinner fa-spin fa-2x"></i></p>');

    $.get(url, params).done(function(res) {
        $(selector).html(res);
        if (callback)
            callback.call(res);
    }).fail(function(res) {
        console.error(res);
    });

};

/**
 * Открыть окно с ошибкой
 * @param err - текст ошибки
 */
var bootboxError = function(err) {
    bootbox.alert({
        className: 'alert',
        title: 'Ошибка',
        message: err,
        buttons: {ok: {className: 'btn-danger'}}
    });
};

var jsTreeConfig = function(id, terminals) {

    var term = (terminals) ? '?include_terminals=true' : '';
    var path = (id) ? '/partners/' + id + '/tree' : '/partners/tree';

    return {
        core: {
            data: {
                url: function(node) {
                    return node.id === '#' ? path + term : '/partners/' + node.id + '/tree' + term;
                }
            }
        },
        types: {
            node: {icon: 'fa fa-folder icon-state-info icon-md'},
            game: {icon: 'fa fa-building icon-state-default icon-md'},
            blocked: {icon: 'fa fa-lock icon-state-danger icon-md'},
            terminal_online: {icon: 'fa fa-television icon-state-success icon-md'},
            terminal_offline: {icon: 'fa fa-television icon-state-default icon-md'},
            blocked_terminal: {icon: 'fa fa-lock icon-state-danger icon-md'}
        },
        plugins: ['types']
    }
};


var BetTrade = {};

/* при удалении добвлении возможны race-conditions */
var CeleryTasks = BetTrade.celery_tasks = {
    storage_key: 'celery_tasks',
    tasks: [],
    check_interval: null,
    check_interval_time: 2000, // миллисекунды

    /**
     * Добавление информации о таске в localStorage. Таск обязательно должен иметь task_id для
     * проверки результатов.
     *
     * @param {Object} data [description]
     */
    add_task: function(data) {
        this.get_tasks();

        if (Object.prototype.toString.call(data) !== '[object Object]' || !data.task_id)
            return;

        this.tasks.push(data);
        localStorage.setItem(this.storage_key, JSON.stringify(this.tasks));
        this.restart_cheks();
    },

    /**
     * Добавление нескольких тасков в localStorage
     *
     * @param {Array} data
     */
    add_tasks: function(data) {
        var self = this;

        data.forEarch(function(task) {
            self.add_task(task);
        });
    },

    get_tasks: function() {
        var tasks = localStorage.getItem(this.storage_key);

        if (!tasks) {
            this.tasks = [];
            return [];
        }

        this.tasks = JSON.parse(tasks);
        return this.tasks;
    },

    /**
     * Запрос таска по id
     *
     * @param  {String} task_id id таска
     * @return {Object} информация о таске
     */
    get_task: function(task_id) {
        this.get_tasks();

        for (var i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].task_id === task_id) {
                return this.tasks[i];
            }
        }
    },


    /**
     * Удаление таска из списка по id. Если таск с данным id найден, он удаляется из
     * массива task, и обновленный массив сохраняется в localStorage, после чего перезапускается
     * проверка тасков.
     *
     * @param  {String} task_id id таска
     */
    remove_task: function(task_id) {
        var index = null;

        for (var i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].task_id === task_id) {
                index = i;
            }
        }

        if (index > -1) {
            this.tasks.splice(index, 1);
            /* сохраним измененный массив в locaStorage и перезапустим проверку тасков */
            localStorage.setItem(this.storage_key, JSON.stringify(this.tasks));
            this.restart_cheks();
        }
    },

    /**
     * Перезпуск проверки результатов выполнения celery тасков. Необходимо, если в список тасков
     * добавлены новые таски.
     *
     * @return {[type]} [description]
     */
    restart_cheks: function() {
        if (this.check_interval)
            clearInterval(this.check_interval);

        this.check_results();
    },

    check_results: function() {
        var self = this;
        this.get_tasks();

        if (this.tasks.length === 0)
            return;

        this.check_interval = setInterval(function() {
            $.ajax({
                url: '/tasks/check-results',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({tasks: self.tasks})
            })
            .done(function(data) {
                /* Если таск еще выполняется, пропустим обработку */
                if (data.status === 'PENDING')
                    return;

                self.process_result(data);
                self.remove_task(data.task_id);
            });
        }, self.check_interval_time);
    },

    process_result: function(data) {
        var self = this,
            toast = null,
            task = this.get_task(data.task_id || data.error.task_id)

        if (data.status == 'SUCCESS') {
            var success_calls = data.result.success_count,
                overall_calls = data.result.output.length,
                link = data.result.link;

            toast = toastr[
                success_calls == overall_calls ? "success" : "warning"]
            (task.title + ': ' + success_calls + ' из ' + overall_calls + ' успешно</br><u>Подробнее</u>');

            toast.click(function() {
                bootbox.dialog({
                    title: "Результаты выполнения задачи: " + task.title,
                    message: self.render(data.result.output),
                    buttons: {
                        close: {
                            label: "Закрыть",
                            className: "btn-primary"
                        }
                    }
                });
            });
        } else {
            toastr['error']('Не удалось выполнить операцию: ' + (task) ? task.title : data.error);
        }
    },

    render: function(full_output) {
        if (Object.prototype.toString.call(full_output) == '[object Object]')
            full_output = [full_output];

        var html = '<table class="table">' +
            '<thead>' +
                '<tr>' +
                    '<th>ID</th>' +
                    '<th>Вывод</th>' +
                    '<th>Код возврата</th>' +
                '</tr>' +
            '</thead>' +
            '<tbody>';

        full_output.forEach(function(output) {
            html += '<tr>';
            html += '<th>' + output.id + '</th>';
            html += '<th>';

            if (output.format === 'link')
                html += '<a target="_blank" href="'+ celery_static+'/' +
                        output.output.replace('/tmp/', '') + '">Скачать</a>';
            else if (output.format == 'image')
                html += '<a target="_blank" href="'+ celery_static+'/' + output.output.replace('/tmp/', '') +
                    '"><img style="max-width:100%" src="'+ celery_static+'/' +
                    output.output.replace('/tmp/', '') + '"></a>';
            else
                html += output.output;

            html += '</th>';
            html += '<th>' + output.exit_code + '</th>';
            html += '</tr>';
        });

        html += '</tbody></tabel>';

        return html
    }
};


$(document).ready(function() {
    /* Проверка тасков */
    CeleryTasks.check_results();





    /* Управление сессиями */

    $(document).on('click', '#open_session', function(e) {

        $('#main-wrapper').html('<p class="m-t-sm text-center"><i class="fa fa-spinner fa-spin fa-2x"></i></p>');

        $.ajax('/cashiers_sessions', {
            method: 'POST'
        })
        .done(function(data) {
            if (data.success) {
                window.location.reload();
            } else {
                bootboxError('Не удалось открыть сессию или сессия уже открыта');
                $('#main-wrapper').html('<p class="text-center text-muted">Для начала работы откройте сессию</p>');
            }
        })
        .fail(function(data) {
            bootboxError('Не удалось открыть сессию');
        });
    });

    $(document).on('click', '#close_session', function(e) {

        $('#main-wrapper').html('<p class="m-t-sm text-center"><i class="fa fa-spinner fa-spin fa-2x"></i></p>');

        $.ajax('/cashiers_sessions', {
            method: 'DELETE'
        })
        .done(function(data) {
            if (data.success) {

                bootbox.alert({
                    className: 'success',
                    message: '' +
                    '<p><b>Количество переводов:</b> ' + data.count + '</p>' +
                    '<p><b>Пополнения:</b> ' + parseFloat(data.in / 100).toFixed(2) + '</p>' +
                    '<p><b>Снятия:</b> ' + parseFloat(data.out / 100).toFixed(2) + '</p>' +
                    '<p><b>Разница:</b> ' + parseFloat(data.diff / 100).toFixed(2) + '</p>',
                    buttons: { ok: { className: 'btn-success' }},
                    callback: function() { window.location.reload(); }
                });

            } else {
                bootboxError('Не удалось закрыть сессию или сессия еще не открыта');
            }
        })
        .fail(function(data) {
            bootboxError('Не удалось закрыть сессию');
        });
    });

    /* ---------------------------------------------------- */


    /* Отключениея клавиши Enter для того чтобы не сабмитились формы */
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

});


