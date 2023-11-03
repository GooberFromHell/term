// ==UserScript==
// @name         PCTE Term
// @version      4.1.3
// @updateURL    https://raw.githubusercontent.com/GooberFromHell/term/master/PCTE%20Term%204.0.js
// @downloadURL  https://raw.githubusercontent.com/GooberFromHell/term/master/PCTE%20Term%204.0.js
// @author       @LordGoober
// @match        https://rcs00-portal.pcte.mil/
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery.terminal/2.37.2/js/jquery.terminal.js
// @resource     jqterminal_css https://cdnjs.cloudflare.com/ajax/libs/jquery.terminal/2.37.2/css/jquery.terminal.css
// @resource     fontawesome_css https://raw.githubusercontent.com/bryfry/chronos_trigger/master/font-awesome.css
// @resource     hack_font https://raw.githubusercontent.com/GooberFromHell/term/master/hack.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==


const style = `
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    background-color: rgb(19, 19, 19);
    color: rgb(211, 211, 211);
    overflow-y: hidden;
}

label {
    font-size: 10px;
    display: inline-block;
}

#rework-container {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    font-family: Hack, "Segoe UI" !important;
}

#rework-container > #vmware-interface {
    position: fixed;
    flex: 1 1 auto;
    height: 80%;
    width: 100%;
}

#terminal {
    position: fixed;
    bottom: 0;
    display: flex;
    flex-direction: column;
    background-color: #000;
    flex: 1 1 auto;
    width: 100%;

    /* resizable */
    height: 20%;
}

#nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    background-color: #0a0a0a;
}

#term {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: rgb(10, 10, 10);
}

#vmTitle {
    height: 20px;
}

#stdin {
    flex-grow: 1;
    padding-bottom: 10px
}

#checkboxes,
#action-btns,
#selections {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
}

#upload-overlay {
    display: none;
    position: absolute;
    inset: 0;
    z-index: 999;
    place-items: center;
    margin: 0px;
    color: rgba(211, 211, 211, 0.514);
    background-color: #242424ad;
}

#close-over {
    position: absolute;
    top: 20px;
    right: 20px;
    color: gainsboro;
    float: right;
    height: 25px;
    width: 25px;
}


#checkboxes {
    margin-right: 15px;
}
#action-btns {
    margin-left: auto;
}

#selections {
    margin-left: 15px;
}

#selections > select {
    min-width: 300px;
    background-color: #262626;
    border-radius: 3px;
}


#checkboxes input {
    border-radius: 5px;
}

.terminal-scroller {
    display: flex;
    flex-direction: column;

}

.terminal-wrapper {
    position: relative;
    flex-grow: 1;
    bottom: 0;
    padding-bottom: 10px;
}

.terminal-output {
    display: flex;
    flex-direction: column;
    justify-content: end;
    overflow-y: auto;
}

.icon-btn > i {
    color: #1e87f0 !important;
    font-size: 16px;
}

.icon-btn {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    height: 26px;
    width: 26px;
    transition: all 0.2s ease-in-out;
}

.icon-btn:hover {
    background-color: rgba(199, 199, 199, 12%);
}

a {
    text-decoration: none !important;
}

.tooltip {
    position: relative;
}

.tooltip .tooltiptext {
    display: block;
    background-color: rgb(32, 32, 32);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;

    /* Position the tooltip */
    position: absolute;
    z-index: 1;
}

#divider2 {
    width: 100%;
    cursor: none;
    display: flex;
    justify-content: center;\
    padding-bottom: 5px;
}

#divider2 > span {
    min-width: 50px;
    min-height: 10px;
    cursor: row-resize;
    background-color: #404040;
    border-radius: 3px;
}

#new-button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: rgba(0,0,0,.35);
}

#new-button:hover {
    background-color: rgba(0,0,0,.55) !important;
}

.d-none {
display: none !important;
}

.d-grid {
display: grid !important;
}

#log {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;
    color: white;
    pointer-events: none;
    height: 500px;
    width: 400px;
}
`
const html = `
<div id='log'></div>
<div id="rework-container">

    <div id="terminal">
    <div id="divider2" class="ui-resizable-handle ui-resizable-n"><span></span></div>
        <div id="nav">
            <div id='checkboxes'>
            </div>
            <div id="action-btns">
            </div>
            <div id="selections"></div>

        </div>
        <div id='term'>
            <div id='stderr'></div>
            <div id='stdin'></div>
        </div>
    </div>
</div>
<div id="upload-overlay" class="d-none">
    <div id='dropArea' style="color:inherit;border:1px dashed rgba(211, 211, 211, 0.514);background-color:rgba(211, 211, 211, 0.233); padding: 5px;">
        <div>
            <span class='fa fa-cloud-upload'</span>
            <span>Dropping file here or</span>
            <div>
                <input id='upload-file' type="file">
                <a>select one</a>
            </div>
        </div>
    </div>
    <a id='close-over' class="icon-btn"><i class="fa fa-close"></i></a>
</div>
`

function init() {

    class PCTETerminal {
        style = style
        html = html
        terminalPrompts = {
            default: ' ' + window.name.split(':')[0] + '> ',
        }
        terminalEvents = {
            onResize: function () {
                this.scroll_to_bottom()
            },
        }
        terminalKeymap = {
            keymap: {
                ENTER: function (e, original) {
                    $('#stderr').text && $('#stderr').text("")
                    if (this.toggles.closings) {
                        let errText = ''
                        let missing = PCTETerminal.balance(this.terminal.get_command()).values()
                        $('.terminal-output').text = ''
                        for (let err of missing) {
                            if (err) {
                                errText += `<div class="command"><div style="width: 100%;"><span style="color: red;">${err}</span></div></div>\n`
                            }
                        }
                    }

                    let command = this.terminal.get_command()
                    command = this.toggles.newline ? `${command}\n` : command
                    this.actions.sendInputString(command)
                    original()
                },
            },
        }
        terminalCommands = function (command) {
            let height = $('.terminal-scroller').height()
            this.height(height)
            this.scroll_to_bottom()
            return null
        }
        terminalOptions = {
            ...this.terminalKeymap,
            ...this.terminalEvents,
            height: $('#stdin').height(),
            greetings: false,
            prompt: this.terminalPrompts.default,
        }
        actionButtons = {
            open_terminal: {
                tooltip: "Open Terminal",
                class: "icon-btn",
                icon: "fa fa-terminal",
                action: function () {
                    // Windows
                    this.actions.sendKeyCodes([WMKS.CONST.KB.KEY_CODE.META, 82])
                    setTimeout(function () { $("#console").wmks('sendInputString', "cmd.exe /c \"start /max cmd /k mode con:cols=120 lines=2500\"\n") }, 200)

                    // linux
                    this.actions.sendKeyCodes([WMKS.CONST.KB.KEY_CODE.ALT, 113])
                    setTimeout(function () { $("#console").wmks('sendInputString', "gnome-terminal --hide-menubar --window --maximize \n") }, 200)
                },
            },
            cad: {
                tooltip: "Send Ctrl + Alt + Del to the VM.",
                class: "icon-btn",
                icon: "fa fa-keyboard-o",
                action: function () {
                    this.actions.cad()
                }
            },
            upload: {
                tooltip: "Upload file. If 'New line' is enabled, each line is read as a seperate command. If NOT, then it attempts to paste in the entire file, without submitting it to the VM. (Experimental)",
                class: "icon-btn",
                icon: "fa fa-file-text-o",
                action: function () {
                    this.toggleUploadOverlay()
                },
            },
            popout: {
                tooltip: "Popout terminal into seperate window. (Experimental)",
                class: "icon-btn",
                icon: "fa fa-eject",
                action: () => { },
            },
            fullscreen: {
                tooltip: "Fullscreen",
                class: "icon-btn",
                icon: "fa fa-tv",
                action: function () {
                    this.actions.fullscreen()
                },
            },
            old: {
                tooltip: "Switch back to old interface.",
                class: "icon-btn",
                icon: "fa fa-trash-o",
                action: function (e) {
                    this.toggleInterface()
                },
            },
        }
        staticButtons = {
            new: {
                tooltip: "Switch back to old interface.",
                class: "icon-btn",
                icon: "fa fa-chevron-circle-left",
                action: function (e) {
                    this._showNewInterface()
                },
            }
        }
        checkboxes = {
            closings: {
                tooltip: "Check for closing partners for all brackets, paraenes, quotes, and back ticks (`). Prints what is missing, if any are found. Will not trip-up on escaped characters.",
                action: (e) => {
                    this.toggles.closings = e.target.checked
                }
            },
            newline: {
                tooltip: "Submit command to VM rather than just paste to VM.",
                action: (e) => {
                    this.toggles.newline = e.target.checked
                }
            },
            rescale: {
                tooltip: "When the Window is moved or adjusted the VM console will stretch to fill the availible space. Can cause distortion on VMs with smaller console Windows.",
                action: (e) => {
                    this.toggles.rescale = e.target.checked
                    this.actions.rescale()
                }
            },
            adjust_resolution: {
                tooltip: "When the VM Console is resized the VM with adjust its resolution to match the new console side. Reccommened use with rescale.",
                action: (e) => {
                    this.toggles.adjust_resolution = e.target.checked
                    this.actions.resolution()
                }
            },
        }
        selections = {
            vm: {
                tooltip: "Select VM to connect to.",
                preload: (e) => {
                    // Get list of VMs for connected range
                    let host = window.location.host
                    let id = window.location.href.split("/")[8]
                    $.get(`https://${host}/api/range-server/events/${id}/range-info/vm-names-consoles`)
                        .then((data) => {
                            $.each(data.vms, (idx, value) => {
                                let option = $(`<option key=${value.key.index} data-repetitionGroup="${value.key.repetitionGroup}" value="${value.val}">${value.val}</option>`)
                                window.location.href.split("vmName=")[1] == value.val ? option.prop('selected', true) : null
                                $('#vm-select').append(option)
                            })

                        })
                },
                selection: (e) => {
                    $('#vmware-interface').remove()
                    let host = window.location.host
                    let urlParts = window.location.href.split("/")
                    let selected = $(e.currentTarget).find(':selected')
                    let key = selected.attr('key')
                    let repetitionGroup = selected.attr('data-repetitionGroup')
                    let vmName = selected.val()
                    let connectUrl = `https://${host}/#/app/range/console/live-action/${urlParts[8]}/${urlParts[9]}/${repetitionGroup}/${key}?vmName=${vmName}`
                    window.location.href = connectUrl
                    // create mutation observer to watch foir #vmware-interface to be added to the DOM
                    setTimeout(() => {
                        $('#vmware-interface').prependTo('#rework-container')
                    }, 1000)

                }
            },
        }
        toggles = {
            closings: false,
            newline: true,
            rescale: false,
            adjust_resolution: true,
        }
        elementEvents = {
            dragOver: (e) => {
                e.preventDefault()
                e.stopPropagation()
            },
            mouseUp: function (event) {
                this.direction = 'Released'
                $('body').off('mouseup')
                $('body').off('mousemove')
            },
            mouseMove: function (event) {
                this._setDivPosition(event)
            },
            mouseDown: function (event) {
                $('body').on('mouseup', this.elementEvents.mouseUp)
                $('body').on('mousemove', this.elementEvents.mouseMove)
            },
            getFileContents: function (e) {
                let contents = e.target.result
                let lines = contents.split('\n')
                this.actions.sendInputStringMulti(lines)
                this.toggleUploadOverlay()
            },
            uploadFile: function (e) {
                let file = $(this).prop('files')[0]
                if (!file) {
                    return
                }

                let reader = new FileReader()
                reader.onload = getFileContents
                reader.readAsText(selectedFile)

                $(this).attr("value", "")
            },
            dragDrop: function (e) {
                e.preventDefault()
                e.stopPropagation()

                let selectedFile = e.originalEvent.dataTransfer.files[0]

                // Read and display the text content of the dropped file
                let reader = new FileReader()
                reader.onload = getFileContents
                reader.readAsText(selectedFile)

            }
        }
        actionHandlers = {
            cad: (wmks) => {
                wmks.CAD()
            },
            sendKeyCodes: (wmks, keyCodes) => {
                wmks.sendKeyCodes(keyCodes)
            },
            sendInputString: (wmks, text) => {
                wmks.sendInputString(text)
            },
            sendInputStringMulti: (wmks, lines) => {
                setTimeout(function () {
                    for (var line = 0; line < lines.length; line++) {
                        lines[line] = line == lines.length - 1 ? lines[line] + '\r' : lines[line]
                        setTimeout(function (lines, line) {
                            wmks.sendInputString(lines[line])
                        }(lines, line), 100 * line)
                    }
                }(), 500)
            },
            fullscreen: (wmks) => {
                wmks.isFullScreen() ? wmks.exitFullScreen() : wmks.enterFullScreen()
            },
            revertConsole: (wmks) => {
                wmks.setOption('rescale', false)
                wmks.setOption('changeResolution', false)
                wmks.setOption('useUnicodeKeyboardInput', true)
                $('#mainCanvas').css('margin', '0 auto')
            },
            rescale: (wmks, value) => {
                this.actions.resizeConsole()
                wmks.updateScreen()
            },
            resolution: (wmks, value) => {
                this.actions.resizeConsole()
                wmks.updateScreen()
            },
            resizeConsole: (wmks) => {
                function getMargin() {
                    // get scale factor with regex, becasue jquery dosen't support 'scale' css property

                    if ($('#mainCanvas').css('transform') == 'none') return
                    let scaleFactor = parseFloat($('#mainCanvas').css('transform').match(/matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/)[1])
                    let mainCanvasWidth = $('#mainCanvas').width() * scaleFactor
                    let screenWidth = $('#vmware-interface').width()
                    return ((screenWidth - mainCanvasWidth) / 2)
                }

                if (!this.toggles.adjust_resolution) {
                    $('#mainCanvas').css('margin-left', getMargin)
                    $('#mainCanvas').css('margin-right', getMargin)
                } else {
                    $('#mainCanvas').css('margin', '0 auto')
                }
            },
            register(wmks, event, callback) {
                wmks.register(event, callback)
            },
        }

        constructor() {
            this.actions = new Proxy(this, {
                get: function (target, prop, receiver) {
                    console.log(`Prop called: ${prop} by line ${new Error().stack.split('\n')[2]}`)
                    if (prop in target.actionHandlers) {
                        let wmks = WMKS.createWMKS("vmware-interface", {
                            useUnicodeKeyboardinput: true,
                            rescale: target.toggles.rescale,
                            changeResolution: target.toggles.adjust_resolution,
                        })
                        return target.actionHandlers[`${prop}`].bind(target, wmks)
                    } else {
                        return target[`${prop}`].bind(this)
                    }

                }
            })

            this.direction = 'Released'
            this.terminalHeight = $('#stdin').height()

            this.initStyle()
            this.initHtml()
            this.initButtons()
            this.initCheckboxes()
            this.initSelections()
            this.initTooltips()
            this.initEvents()

            this.terminalOptions.keymap.ENTER = this.terminalOptions.keymap.ENTER.bind(this)
            let terminal = $('#stdin').terminal((command) => this.terminalCommands, {
                ...this.terminalOptions
            })
            this.terminal = terminal
            this._showNewInterface()

        }

        initStyle() {
            let jqterminal_css = GM_getResourceText('jqterminal_css')
            let fontawesome_css = GM_getResourceText('fontawesome_css')
            let jquery_ui_css = GM_getResourceText('jquery_ui_css')
            let hack_font = GM_getResourceText('hack_font')
            GM_addStyle(jqterminal_css)
            GM_addStyle(fontawesome_css)
            GM_addStyle(jquery_ui_css)
            GM_addStyle(hack_font)
            GM_addStyle(style)
        }
        initHtml() {
            $(document.body).append(html)
        }
        initButtons() {
            for (let [key, value] of Object.entries(this.actionButtons)) {
                let button = this._createButton({ id: key, tooltip: value.tooltip, btnClass: value.class, icon: value.icon, action: value.action })
                $('#action-btns').append(button)
            }
        }
        initCheckboxes() {
            for (let [key, value] of Object.entries(this.checkboxes)) {
                value.action = value.action.bind(this)
                let checkbox = this._createCheckbox({ id: key, tooltip: value.tooltip, icon: value.icon, action: value.action, checked: this.toggles[`${key}`] })
                $('#checkboxes').append(checkbox)
            }
        }
        initSelections() {
            for (let [key, value] of Object.entries(this.selections)) {
                value.preload = value.preload.bind(this)
                value.selection = value.selection.bind(this)
                let selection = $(`<select id="${key}-select" data-tooltip="${value.tooltip} icon='${value.icon}"></select>`)
                value.preload()
                selection.on('change', value.selection)
                $('#selections').append(selection)
            }

        }
        initEvents() {
            $.each(this.elementEvents, (key, value) => {
                this.elementEvents[key] = this.elementEvents[key].bind(this)
            })
            // Triggers resizing the console and terminal panes
            $('#divider').on('mousedown', this.elementEvents.mouseDown)
            // Triggers showing the upload overlay
            $('#upload').on('click', this.toggleUploadOverlay)
            // Triggers hiding the upload overlay
            $('#close-over').on('click', this.toggleUploadOverlay)
            // Triggers uploading a file when a file sleected from the file selector
            $("#upload-file").on("change", this.elementEvents.uploadFile)
            // Only prevents the browser from trying to open files when they are dropped in the upload overlay
            $('#dropArea').on('dragover', this.elementEvents.dragOver)
            // Triggers uploading a file when a file is dropped in terminal
            $('#terminal').on('drop', this.elementEvents.dragDrop)
            // Triggers uploading a file when a file is dropped in the upload overlay
            $('#dropArea').on('drop', this.elementEvents.dragDrop)

        }
        initTooltips(arg) {
            function makeTooltip(element) {
                let tooltip = $(`<div class='tooltiptext d-none'>${$(element).data('tooltip')}</div>`)
                $(element).append(tooltip)
                $(tooltip).css('min-width', 150)
                $(tooltip).css('max-width', 350)

                $(element).on('mouseenter', function (e) {

                    $(tooltip).removeClass('d-none')
                    $(tooltip).css('top', -($(tooltip).height()) - 10)
                    let left = -($(tooltip).width() / 2)

                    let rightMost = $(tooltip).offset().left + $(tooltip).width()
                    if (rightMost > $(window).width()) {
                        left = -((rightMost - $(window).width()) + (left * -1))
                    }
                    let leftMost = $(tooltip).offset().left
                    if (leftMost < 0) {
                        left = 0
                    }
                    $(tooltip).css('left', left)
                })

                $(element).on('mouseleave', function (e) {
                    $(tooltip).addClass('d-none')
                })
            }
            if (!arg) {
                $('[data-tooltip]').each(function () {
                    $(this).addClass('tooltip')
                    makeTooltip(this)
                })
            } else {
                makeTooltip(arg)
            }
        }

        initConsole() {
            this.actions.resizeConsole()
        }

        toggleUploadOverlay() {
            $('#upload-overlay').toggleClass("d-grid")
        }
        toggleInterface() {
            let toggle = $("#content-wrapper").hasClass('d-none')
            toggle ? this._showOldInterface() : this._showNewInterface()
        }
        log(text) {
            if (typeof text == 'object') {
                text = JSON.stringify(text)
            }
            $('#log').text(text)
        }
        _showOldInterface() {

            // replace #vmware-interface to .interface
            $('#vmware-interface').appendTo($('.interface').children().first())

            // add button to revert back to new interface in the top right corner
            let newInterfaceBtn = this._createButton({ id: 'new', tooltip: this.staticButtons.new.tooltip, btnClass: this.staticButtons.new.class, icon: this.staticButtons.new.icon, action: this.staticButtons.new.action })

            $('#content-wrapper').append(newInterfaceBtn)

            // show old container
            $('#content-wrapper').removeClass('d-none')

            // hide #rework-container
            $('#rework-container').addClass('d-none')

            // resize vmware console to fill the screen
            this.actions.revertConsole()
        }
        _showNewInterface() {

            // move vmware console to new interface before the divider
            $('#vmware-interface').prependTo('#rework-container')

            // remove button to revert back to new interface in the top right corner
            $('#new-button').remove()

            // show new interface container
            $('#rework-container').removeClass('d-none')

            // hide old container
            $('#content-wrapper').addClass('d-none')

            function logData(text) {
                this.log(text)
            }

            function adjustScreen() {
                this.actions.resizeConsole()
            }

            logData = logData.bind(this)
            adjustScreen = adjustScreen.bind(this)

            $("#terminal").resizable({
                handles: {
                    n: "#divider2",
                },
                ghost: true,
                resize: function (event, ui) {
                    $('#mainCanvas').height(ui.position.top)
                    $('#vmware-interface').height(event.pageY)
                    logData({ ...ui.position, ...ui.size })
                    adjustScreen()
                },
                minHeight: $('#nav').outerHeight()
            })

            $(".selector").on("resizestart", function (event, ui) { })

            // resize vmware console to fill the screen
            $('#adjust_resolution').prop('checked', this.toggles.adjust_resolution)
        }
        _createButton({ id, tooltip, btnClass, icon, action }) {
            let button = $(`<button id='${id}-button' data-tooltip='${tooltip}' class='${btnClass}'><i class='${icon}'></i></button>`)
            action = action.bind(this)
            $(button).click(action)
            return button
        }
        _createCheckbox({ id, tooltip, icon, action, checked }) {
            let checkbox = $(`<div id="${id}-checkbox" data-tooltip="${tooltip}"></div>`)
            checkbox.css({
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'gap': '5px',
            })
            let input = $(`<input id="${id}" type="checkbox" name="${id}">`)
            let label = $(`<label id="${id}-checkbox-label" for="${id}">${(id.charAt(0).toUpperCase() + id.slice(1)).replace("_", " ")}</label>`)
            checkbox.append(input)
            checkbox.append(label)
            input.prop('checked', checked)

            input.click(action)

            return checkbox
        }

        _createOption({ name }) {
            let option = $(`<option id="${name}" name="${name}">${name}</option>`)
            return option
        }
        _setDivPosition(mouse) {
            let pageHeight = $(window).height()
            let dividerHeight = $('#divider').height()
            let newVmwareHeight = mouse.pageY
            if (newVmwareHeight < 200) {
                newVmwareHeight = 200
            }
            let newTerminalHeight = pageHeight - dividerHeight - newVmwareHeight
            if (newTerminalHeight < 200) {
                newTerminalHeight = 200
            }

            $('#vmware-interface').height(newVmwareHeight)
            $('#terminal').height()
            this.actions.resizeConsole()
        }
        static balance(code) {
            var tokens = code
            var braceO = 0
            var braceC = 0
            var quoteD = 0
            var quoteS = 0
            var ticks = 0
            var bracketO = 0
            var bracketC = 0
            var cbracketO = 0
            var cbracketC = 0
            var previousToken = ''
            var token
            var i = tokens.length
            while ((token = tokens[--i])) {
                if (tokens[i - 1] != '\\') {
                    switch (token) {
                        case '(':
                            braceO++
                            break
                        case ')':
                            braceC++
                            break
                        case '"':
                            quoteD == 0 ? quoteD++ : quoteD--
                            break
                        case "'":
                            quoteS == 0 ? quoteS++ : quoteS--
                            break
                        case '`':
                            ticks == 0 ? ticks++ : ticks--
                            break
                        case '[':
                            bracketO++
                            break
                        case ']':
                            bracketC++
                            break
                        case '{':
                            cbracketO++
                            break
                        case '}':
                            cbracketC++
                            break
                    }
                }
            }
            var error = []
            error.push(braceO < braceC ? "Missing opening '(' ." : false)
            error.push(braceC < braceO ? "Missing closing ')'." : false)
            error.push(bracketO < bracketC ? "Missing opening '[' ." : false)
            error.push(bracketC < bracketO ? "Missing closing ']'." : false)
            error.push(cbracketO < cbracketC ? "Missing opening '{' ." : false)
            error.push(cbracketC < cbracketO ? "Missing closing '}'." : false)
            error.push(quoteD > 0 ? "Missing a '\"'." : false)
            error.push(quoteS > 0 ? 'Missing a "\'" .' : false)
            error.push(ticks > 0 ? "Missing a '`'." : false)

            return error
        }
    }

    let newPCTETerminal = new PCTETerminal()

}

$.fn.extend({
    toggleHtml: function () {
        if (this.data('html') == undefined) {
            this.data('html', this.html())
            this.html('')
        } else {
            this.html(this.data('html'))
            this.data('html', undefined)
        }
    },
})

function wait() {
    if (window.location.href.includes('#/app/range/console/live-action/')) {
        $.when($('#mainCanvas'))
        setTimeout(() => {
            var ele = $('#mainCanvas')
            if (ele) {
                setTimeout(() => init(), 1200)
            } else {
                wait()
            }
        }, 1500)
    }
}

wait()
