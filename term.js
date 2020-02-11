$.fn.extend({
    toggleHtml: function (a, b) {
        return this.html(this.html() == b ? a : b);
    }
});

function balance(code) {
    var tokens = code;
    var braceO = 0;
    var braceC = 0;
    var quoteD = 0;
    var quoteS = 0;
    var ticks = 0;
    var bracketO = 0;
    var bracketC = 0;
    var cbracketO = 0;
    var cbracketC = 0;
    var previousToken = '';
    var token;
    var i = tokens.length;
    while ((token = tokens[--i])) {
        if (tokens[i - 1] != '\\') {
            switch (token) {
                case '(':
                    braceO++;
                    break;
                case ')':
                    braceC++;
                    break;
                case '"':
                    quoteD == 0 ? quoteD++ : quoteD--;
                    break;
                case "'":
                    quoteS == 0 ? quoteS++ : quoteS--;
                    break;
                case '`':
                    ticks == 0 ? ticks++ : ticks--;
                    break;
                case '[':
                    bracketO++;
                    break;
                case ']':
                    bracketC++;
                    break;
                case '{':
                    cbracketO++;
                    break;
                case '}':
                    cbracketC++;
                    break;
            }
        }
    }
    var error = [];
    error.push(braceO < braceC ? "Missing opening '(' ." : false);
    error.push(braceC < braceO ? "Missing closing ')'." : false);
    error.push(bracketO < bracketC ? "Missing opening '[' ." : false);
    error.push(bracketC < bracketO ? "Missing closing ']'." : false);
    error.push(cbracketO < cbracketC ? "Missing opening '{' ." : false);
    error.push(cbracketC < cbracketO ? "Missing closing '}'." : false);
    error.push(quoteD > 0 ? "Missing a '\"'." : false);
    error.push(quoteS > 0 ? 'Missing a "\'" .' : false);
    error.push(ticks > 0 ? "Missing a '`'." : false);

    return error;
}
$(document).tooltip();
$(this).onload = $('#stdin').terminal(
    function (command) {
        if (command !== '') {
            var errText = '';
            if ($('#closings')[0].checked) {
                var missing = balance(command).values();
                $('.terminal-output').text = '';
                for (let err of missing) {
                    if (err) {
                        errText +=
                            '<div class="command"><div style="width: 100%;"><span style="color: red;">' +
                            err +
                            '</span></div></div>\n';
                    }
                }
            }
            if (!errText) {
                $('#stderr').empty();
                if ($('#nl').checked) {
                    command = command + '\n';
                    console.log(command);
                }

                var wmks = window.opener.WMKS.createWMKS('container', {});
                wmks.sendInputString(command);
            } else {
                $('#stderr').append(errText);
            }
        } else {
            term.echo('');
        }
    }, {
        greetings: false,
        outputLimit: 0,
        name: 'paste_bar',
        height: $('.cmd').height,
        prompt: ' ' + window.name.split(':')[0] + '> '

    });

$('#up-btn').hover(
    function () {
        $('#up-btn').removeClass('uk-button-secondary uk-text-muted');
        $('#up-btn').css('color', 'black');
    },
    function () {
        $('#up-btn').addClass('uk-button-secondary');
        $('#up-btn').css('color', '#999999');
    }
);
$('#up-btn').click(function () {
    $('#termBar').css('filter', 'blur(3px)');
    $('#upload-overlay').show();
});

$('.icon-btn').hover(function (e) {

        for (var i = 0; i < 5; i++) {
            $(this)
                .animate({
                    backgroundColor: "gainsbro"
                }, 500)
                .animate({
                    backgroundColor: "transparent"
                }, 500);
        }
    },
    function (e) {
        $(this).stop(true, true);
        $(this).css('background-color', 'transparent');
    });

$('#upload').click(function () {
    $('#nav').css('filter', 'blur(1px)');
    $('#term').css('filter', 'blur(1px)');
    $('#upload-overlay').show();

});

$('#close-over').click(function () {
    $('#upload-overlay').hide();
    $('#nav').css('filter', 'blur(0px)');
    $('#term').css('filter', 'blur(0px)');
});

$('#cad').click(function () {
    var wmks = window.opener.WMKS.createWMKS('container', {});
    wmks.sendCAD();
})

$(window).keydown(function (e) {
    if (e.key == "c" && e.ctrlKey == true) {
        var wmks = window.opener.WMKS.createWMKS('container', {});
        wmks.sendKeyCodes([67, 17]);
    }
})
