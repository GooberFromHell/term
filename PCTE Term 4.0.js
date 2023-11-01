// ==UserScript==
// @name         PCTE Term 4.0
// @version      4.1
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
    height: 100%;
}

#rework-container > * {
    font-family: Hack, "Segoe UI" !important;
}

#terminal {
    height: 15%;
    display: flex;
    flex-direction: column;
    position: relative;
    flex-grow: 1;
    background-color: #000;
}

#nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 2px;
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
#action-btns {
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
    height: 99%;
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
    border-bottom: 1px dotted black;
}

.tooltip .tooltiptext {
    visibility: hidden;
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

.tooltip:hover .tooltiptext {
    visibility: visible;
}

.tooltip .tooltiptext .arrow-bottom {
    content: " ";
    position: absolute;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgb(32, 32, 32) transparent transparent transparent;
}

#divider {
    width: 100%;
    cursor: row-resize;
    height: 8px;
    background-color: #404040;
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

`

const html = `
<div id="rework-container">
<div id="divider"></div>
<div id=terminal>
    <div id="nav">
        <div id='checkboxes'>
        </div>
        <span id='vmTitle'>${window.location.href.split('vmName=')[1]}</span>
        <div id="action-btns">
        </div>
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
                "CTRL+C": function (e, origional) {
                    this.actions.sendKeys([67, 17])
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
                tooltip: "When the Window is moves the VM console will stretch to fill the availible space. Will cause distortion on VMs with smaller console Windows.",
                action: (e) => {
                    this.toggles.rescale = e.target.checked
                    this.actions.rescale(this.toggles.rescale)
                }
            },
        }
        toggles = {
            closings: false,
            newline: true,
            rescale: false,
        }
        elementEvents = {
            droparea: {
                dragover: (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                },
                drop: (e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    var selectedFile = e.originalEvent.dataTransfer.files[0]
                    $('#fileInfo').text('Selected File: ' + selectedFile.name)

                    // Read and display the text content of the dropped file
                    var reader = new FileReader()
                    reader.onload = function (e) {
                        var contents = e.target.result
                        var lines = contents.split('\n')
                        HandleCommand({ type: 'InputStringMulti', arg: lines })
                        toggleUploadOverlay()
                    }
                    reader.readAsText(selectedFile)
                },
            },
        }
        actionHandlers = {
            cad: (wmks) => {
                wmks.CAD()
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
                wmks.setOption('rescale', value)
                wmks.setOption('changeResolution', value)
                wmks.setOption('useUnicodeKeyboardInput', true)
                this.actions.resizeConsole()
            },
            initConsole: (wmks) => {
                return
            },
            resizeConsole: (wmks) => {
                if (this.toggles.rescale) {
                    function getMargin() {
                        // get scale factor with regex, becasue jquery dosen't support 'scale' css property
                        let scaleFactor = parseFloat($('#mainCanvas').css('transform').match(/matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/)[1])
                        let mainCanvasWidth = $('#mainCanvas').width() * scaleFactor
                        let screenWidth = $('#vmware-interface').width()
                        return ((screenWidth - mainCanvasWidth) / 2)
                    }
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
                            changeResolution: target.toggles.rescale,
                        })
                        return target.actionHandlers[`${prop}`].bind(target, wmks)
                    } else {
                        return target[`${prop}`].bind(this)
                    }

                }
            })

            this.topCurrentHeight = 0
            this.bottomCurrentHeight = 0
            this.currentPosition = 0
            this.newPosition = 0
            this.direction = 'Released'
            this.terminalHeight = $('#stdin').height()

            this.initStyle()
            this.initHtml()
            this.initButtons()
            this.initCheckboxes()
            this.initTooltips()
            this.initEvents()
            this.actions.initConsole()

            this.terminalOptions.keymap.ENTER = this.terminalOptions.keymap.ENTER.bind(this)
            this.terminalOptions.keymap["CTRL+C"] = this.terminalOptions.keymap["CTRL+C"].bind(this)
            let terminal = $('#stdin').terminal((command) => this.terminalCommands, {
                ...this.terminalOptions
            })
            this.terminal = terminal
            this._showNewInterface()

        }

        initStyle() {
            let jqterminal_css = GM_getResourceText('jqterminal_css')
            let fontawesome_css = GM_getResourceText('fontawesome_css')
            let hack_font = GM_getResourceText('hack_font')
            GM_addStyle(jqterminal_css)
            GM_addStyle(fontawesome_css)
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
        initEvents() {
            function mouseUp(event) {
                this.direction = 'Released'
                $('body').off('mouseup')
                $('body').off('mousemove')
            }
            mouseUp = mouseUp.bind(this)

            function mouseMove(event) {
                this._setDivPosition(event)
            }

            mouseMove = mouseMove.bind(this)

            function mouseDown(event) {
                $('body').on('mouseup', mouseUp)
                $('body').on('mousemove', mouseMove)
            }

            $('#divider').mousedown(mouseDown.bind(this))

            $('#upload').click(this.toggleUploadOverlay)

            function getFileContents(e) {
                let contents = e.target.result
                let lines = contents.split('\n')
                this.actions.sendInputStringMulti(lines)
                this.toggleUploadOverlay()
            }

            getFileContents = getFileContents.bind(this)

            function uploadFile(e) {
                let file = $(this).prop('files')[0]
                if (!file) {
                    return
                }

                let reader = new FileReader()
                reader.onload = getFileContents
                reader.readAsText(selectedFile)

                $(this).attr("value", "")
            }
            $("#upload-file").on("change", uploadFile.bind(this))

            // Prevent the default behavior of the drop event (opening the file in the browser)
            function dragOver(event) {
                event.preventDefault()
                event.stopPropagation()
            }
            $('#dropArea').on('dragover', dragOver.bind(this))

            // Drop file uploads
            function dragDrop(e) {
                e.preventDefault()
                e.stopPropagation()

                let selectedFile = e.originalEvent.dataTransfer.files[0]

                // Read and display the text content of the dropped file
                let reader = new FileReader()
                reader.onload = getFileContents
                reader.readAsText(selectedFile)

            }
            $('#dropArea').on('drop', dragDrop.bind(this))

            $('#close-over').click(this.toggleUploadOverlay)

        }
        initTooltips(arg) {
            function makeTooltip(element) {
                let tooltip = $(`<div class='tooltiptext'>${$(element).data('tooltip')}</div>`)
                $(element).append(tooltip)
                $(tooltip).css('min-width', 150)
                $(tooltip).css('max-width', 250)

                // calulate top position of tooltip
                let top = -($(tooltip).height() + $(element).height())

                // calculate left position of tooltip but make sure it doesn't go off the screen
                let left = -($(tooltip).width() / 2) + 10

                // apply the css styles
                $(tooltip).css('top', top)
                $(tooltip).css('left', left)

                // Account for padding on the tooltip
                let padding = parseFloat($(tooltip).css('padding')) * 2

                // check is the tooltip is going off the screen based on the left position
                let rightMost = $(tooltip).offset().left + $(tooltip).width()
                if (rightMost > $(window).width()) {
                    let leftOffset = (rightMost + padding) - $(window).width()
                    $(tooltip).css('left', left - leftOffset)
                }
                let leftMost = $(tooltip).offset().left
                if (leftMost < 0) {
                    let leftOffset = leftMost * -1
                    $(tooltip).css('left', left + leftOffset)
                }
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

        toggleUploadOverlay() {
            $('#upload-overlay').toggleClass("d-grid")
        }
        toggleInterface() {
            let toggle = $("#content-wrapper").hasClass("d-none")
            toggle ? this._showOldInterface() : this._showNewInterface()
        }
        _showOldInterface() {
            // hide old container
            $('#content-wrapper').removeClass('d-none')

            // replace #vmware-interface to .interface
            $('#vmware-interface').appendTo($('.interface').children().first())

            // add button to revert back to new interface in the top right corner
            let newInterfaceBtn = this._createButton({ id: 'new', tooltip: this.staticButtons.new.tooltip, btnClass: this.staticButtons.new.class, icon: this.staticButtons.new.icon, action: this.staticButtons.new.action })

            $('#content-wrapper').append(newInterfaceBtn)

            // hide #rework-container
            $('#rework-container').addClass('d-none')

            // resize vmware console to fill the screen
            this.actions.revertConsole()
        }
        _showNewInterface() {
            $('#content-wrapper').addClass('d-none')

            // move vmware console to new interface before the divider
            $('#vmware-interface').insertBefore('#divider')

            // remove button to revert back to new interface in the top right corner
            $('#new-button').remove()

            // show new interface container
            $('#rework-container').removeClass('d-none')

            // resize vmware console to fill the screen
            this.actions.resizeConsole()
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
            let label = $(`<label id="${id}-checkbox-label" for="${id}">${id.charAt(0).toUpperCase() + id.slice(1)}</label>`)
            checkbox.append(input)
            checkbox.append(label)
            input.prop('checked', checked)

            input.click(action)

            return checkbox
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
    GM_setValue('terminal', terminal)
}

function wait() {
    if (window.location.href.includes('#/app/range/console/live-action/')) {
        setTimeout(() => {
            var ele = $('#mainCanvas')
            if (ele) {
                setTimeout(() => init(), 1200)
            } else {
                wait()
            }
        }, 500)
    }
}

wait()
