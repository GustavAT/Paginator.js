/*
**The MIT License (MIT)
**
**Copyright (c) 2014 Andreas Tscheinig
**
**Permission is hereby granted, free of charge, to any person obtaining a copy
**of this software and associated documentation files (the "Software"), to deal
**in the Software without restriction, including without limitation the rights
**to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
**copies of the Software, and to permit persons to whom the Software is
**furnished to do so, subject to the following conditions:
**
**The above copyright notice and this permission notice shall be included in all
**copies or substantial portions of the Software.
**
**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
**IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
**FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
**AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
**LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
**OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
**SOFTWARE.
*/
/*
** TODO:
** - refactor event handling (support use of using multiple callbacks on one event)
** - refactor constructor
** - [optional] add type to column for advanced sorting
** - showColumns Bug: not table displayed when not columns should be displayed -> empty lines expected
*/
Paginator = (function () {
    var paginator = function (root, entries, header, options) {
        if (!root) return;
        if (!entries) entries = [];
        if (!options) options = {};
        if (!header) header = [];

        if (!options.visibleColumns) options.visibleColumns = -1;
        if (!options.sortableColumns) options.sortableColumns = -1;
        if (!options.defaultColumn || options.defaultColumn < 0 || options.defaultColumn >= header.length) options.defaultColumn = 0;
        options.sorting = options.sorting === "asc" ? "asc" : "dsc";
        options.fillEmptyRows = options.fillEmptyRows === false ? false : true;
        options.hideSwitchBar = options.hideSwitchBar === false ? false : true;
        options.hideHeader = options.hideHeader === true ? true : false;
        options.maxRows = options.maxRows && options.maxRows > 0 ? options.maxRows : 7;
        if (!options.types) options.types = -1;

        this.activeColumn = options.defaultColumn;


        this.rootElement = document.getElementById(root);
        if (!this.rootElement) return;

        this.id = this.generateUUID();

        this.entries = entries;
        this.header = header;
        this.options = options;

        this.currentPage = 1;
        this.pageCount = 0;

        this.handlers = [];

        this.createDOM();
        this.initButtons();
        this.initSwitchBar();
        this.initTypes();
        this.initHandlers();
        this.initVisibleColumns();
        this.initSortableColumns();

        if (this.entries[0]) { // init table if entries has items
            this.setTableFromPageIndex();
        }
    };

    paginator.prototype.initVisibleColumns = function() {
        var i;
        if (this.options.visibleColumns === -1) {
            this.options.visibleColumns = [];
            for (i = 0; i < this.header.length; i++) {
                this.options.visibleColumns.push(i);
            }
        }
    };

    paginator.prototype.initSortableColumns = function () {
        var i;
        if (this.options.sortableColumns === -1) {
            this.options.sortableColumns = [];
            for (i = 0; i < this.header.length; i++) {
                this.options.sortableColumns.push(i);
            }
        }
    };

    paginator.prototype.initTypes = function() {
        var i;
        if (this.options.types === -1) {
            this.options.types = [];
            for (i = 0; i < this.header.length; i++) {
                this.options.types.push("string");
            }
        }
    };

    paginator.prototype.generateUUID = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    };

    paginator.prototype.initButtons = function () {
        this.spanCurrentIndex = document.getElementById("contentCurrentPage-" + this.id);
        this.spanPageCount = document.getElementById("contentPageCount-" + this.id);

        this.buttonFirst = document.getElementById("paginatorSwitchButtonFirst-" + this.id);
        this.buttonPrevious = document.getElementById("paginatorSwitchButtonPrevious-" + this.id);
        this.buttonNext = document.getElementById("paginatorSwitchButtonNext-" + this.id);
        this.buttonLast = document.getElementById("paginatorSwitchButtonLast-" + this.id);

        this.paginatorContent = document.getElementById("paginatorContent-" + this.id);
    };

    paginator.prototype.createDOM = function () {
        var html = '<div id="paginatorContainer-' + this.id + '" class="paginatorContainer">' +
						'<div id="paginatorContent-' + this.id + '" class="paginatorContent">' +
						'</div>' +
						'<div id="paginatorSwitch-' + this.id + '" class="paginatorSwitch">' +
							'<div class="paginatorLeftButtons">' +
								'<div class="paginatorSwitchButton">' +
									'<input type="button" value="&laquo;" id="paginatorSwitchButtonFirst-' + this.id + '" class="paginatorSwitchButtonInput">' +
								'</div>' +
								'<div class="paginatorSwitchButton">' +
									'<input type="button" value="&lsaquo;" id="paginatorSwitchButtonPrevious-' + this.id + '" class="paginatorSwitchButtonInput">' +
								'</div>' +
							'</div>	' +
							'<div class="paginatorRightButtons">' +
								'<div class="paginatorSwitchButton">' +
									'<input type="button" value="&rsaquo;" id="paginatorSwitchButtonNext-' + this.id + '" class="paginatorSwitchButtonInput">' +
								'</div>' +
								'<div class="paginatorSwitchButton">' +
									'<input type="button" value="&raquo;" id="paginatorSwitchButtonLast-' + this.id + '" class="paginatorSwitchButtonInput">' +
								'</div>' +
							'</div>' +
							'<div class="paginatorCenterButtons">' +
								'<span><span> Seite </span><span id="contentCurrentPage-' + this.id + '"> i </span><span> von </span><span id="contentPageCount-' + this.id + '"> n </span></span>' +
							'</div>' +
						'</div>' +
					'</div>';

        this.rootElement.innerHTML = html;
    };

    paginator.prototype.initHandlers = function () {
        this.buttonFirst.onclick = function () {
            this.currentPage = 1;
            this.spanCurrentIndex.innerHTML = this.currentPage;
            this.enableLeftInputs(false);
            this.enableRightInputs(true);
            this.setTableFromPageIndex();
            this.fire("page-changed");
        } .bind(this);

        this.buttonLast.onclick = function () {
            this.currentPage = this.pageCount;
            this.spanCurrentIndex.innerHTML = this.currentPage;
            this.enableLeftInputs(true);
            this.enableRightInputs(false);
            this.setTableFromPageIndex();
            this.fire("page-changed");
        } .bind(this);

        this.buttonPrevious.onclick = function () {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.spanCurrentIndex.innerHTML = this.currentPage;
                this.enableRightInputs(true);
            }
            if (this.currentPage === 1) {
                this.enableLeftInputs(false);
            }
            this.setTableFromPageIndex();
            this.fire("page-changed");
        } .bind(this);

        this.buttonNext.onclick = function () {
            if (this.currentPage < this.pageCount) {
                this.currentPage++;
                this.spanCurrentIndex.innerHTML = this.currentPage;
                this.enableLeftInputs(true);
            }
            if (this.currentPage === this.pageCount) {
                this.enableRightInputs(false);
            }
            this.setTableFromPageIndex();
            this.fire("page-changed");
        } .bind(this);
    };

    paginator.prototype.initSwitchBar = function () {
        this.pageCount = Math.ceil(this.entries.length / this.options.maxRows);
        this.enableLeftInputs(false);
        if (this.pageCount === 1) this.enableRightInputs(false);

        this.spanCurrentIndex.innerHTML = this.currentPage;
        this.spanPageCount.innerHTML = this.pageCount;
    };

    paginator.prototype.enableLeftInputs = function (enable) {
        this.enableElement(this.buttonFirst, enable);
        this.enableElement(this.buttonPrevious, enable);
    };

    paginator.prototype.enableRightInputs = function (enable) {
        this.enableElement(this.buttonNext, enable);
        this.enableElement(this.buttonLast, enable);
    };

    paginator.prototype.enableElement = function (elem, enable) {
        if (enable) {
            elem.removeAttribute("disabled");
        } else {
            elem.setAttribute("disabled", true);
        }
    };

    paginator.prototype.setTableFromPageIndex = function() {
        var realIdx = this.currentPage - 1,
            startIdx = realIdx * this.options.maxRows,
            pageLength = this.options.maxRows,
            tableBody = '<table id="paginatorTable-' + this.id + '" class="paginatorTable" cellspacing="0"><tbody>',
            tableHeader,
            row,
            inner = '', i, j, sortSymbol, styleHide = 'style="display: none;" ', styleHide2 = 'style="visibility: hidden;" ';



        sortSymbol = this.options.sorting === "asc" ? SORT_ASC : SORT_DSC;
        for (i = 0; i < this.header.length; i++) {
            inner += '<td id="headerCell-' + i + '-' + this.id + '"><span>' + (this.header[i] || 'test') + '</span><span ' + (i === this.activeColumn ? '' : styleHide2) + 'id="headerCellArrow-' + i + '-' + this.id + '">&nbsp;' + sortSymbol + '</span></td>';
        }

        /*this.entries.sort( function(a, b) {
            return a[this.options.defaultColumn].replace(/(<([^>]+)>)/ig, "").localeCompare(b[this.options.defaultColumn].replace(/(<([^>]+)>)/ig, ""));
        }.bind(this));*/

        this.sort(this.options.sorting);

        tableHeader = '<tr ' + (this.options.hideHeader ? styleHide : '') + 'id="paginatorTableHeader-' + this.id + '" class="paginatorTableHeader">' + inner + '</tr>';
        tableBody += tableHeader;

        if (this.currentPage === this.pageCount) { // entries on the last page
            pageLength = this.entries.length - realIdx * this.options.maxRows;
        }

        for (i = startIdx; i < (startIdx + pageLength); i++) {
            inner = '';
            for (j = 0; j < this.header.length; j++) {
                inner += '<td>' + this.entries[i][j] + '</td>';
            }
            row = '<tr>' + inner + '</tr>';
            tableBody += row;
        }

        if (this.options.fillEmptyRows) {
            for (i = 0; i < this.options.maxRows - pageLength; i++) {
                inner = '';
                for (j = 0; j < this.header.length; j++) {
                    inner += '<td>&nbsp;</td>';
                }
                row = '<tr>' + inner + '</tr>';
                tableBody += row;
            }
        }

        tableBody += '</tbody></table>';

        if (this.paginatorContent.firstChild) this.paginatorContent.removeChild(this.paginatorContent.firstChild);
        this.paginatorContent.innerHTML = tableBody;
        this.fire("table-created", this.paginatorContent.firstChild);

        this.showColumns(this.options.visibleColumns);

        this.initHeaderCellHandlers();

        if (this.options.hideSwitchBar && this.entries.length <= this.options.maxRows) {
            this.hideSwitchBar();
        }
        else {
            this.showSwitchBar();
        }

    };

    paginator.prototype.initHeaderCellHandlers = function() {
        this.paginatorContent.firstChild.addEventListener("click", function (e) {
            var cellIndex = e.target.cellIndex, rowIndex, target = e.target;
            while (target = target.parentElement) {
                if (!cellIndex && cellIndex !== 0) {
                    cellIndex = target.cellIndex;
                }
                if (target.tagName.toLowerCase() === 'tr') {
                    rowIndex = target.rowIndex;
                    break;
                }
            }
            if (rowIndex !== 0) return;
            if (this.options.sortableColumns.indexOf(cellIndex) < 0) return;

            if (this.activeColumn === cellIndex) {
                this.options.sorting = this.options.sorting === "dsc" ? "asc" : "dsc";
                this.currentPage = 1;
                this.setTableFromPageIndex();
            }
            else {
                this.activeColumn = cellIndex;
                this.currentPage = 1;
                this.setTableFromPageIndex();
                this.showSortingArrow(cellIndex);
            }
        } .bind(this));
    };

    paginator.prototype.showSortingArrow = function(cellIndex) {
        var i, headerArrow;
        for (i = 0; i < this.header.length; i++) {
            headerArrow = document.getElementById("headerCellArrow-" + i + '-' + this.id);
            if (i === cellIndex) {
                headerArrow.style.visibility = "visible";
            }
            else {
                headerArrow.style.visibility = "hidden";
            }
        }
    };

    paginator.prototype.showSwitchBar = function() {
        var bar = document.getElementById('paginatorSwitch-' + this.id);
        bar.style.display = 'block';
    };

    paginator.prototype.hideSwitchBar = function() {
        var bar = document.getElementById('paginatorSwitch-' + this.id);
        bar.style.display = 'none';
    };

    paginator.prototype.register = function(event, callback) {
        this.handlers[event] = callback;
    };

    paginator.prototype.fire = function(event, data) {
        if (this.handlers[event]) {
            this.handlers[event](data);
        }
    };

    paginator.prototype.showColumns = function(columns) {
        if (!columns) return;
        this.options.visibleColumns = columns;
        var table = document.getElementById("paginatorTable-" + this.id),
            rows = table.rows, cells, cell, i, j, lastCell;
        for (i = 0; i < rows.length; i++) {
            cells = rows[i].children;
            lastCell = true;
            for (j = cells.length - 1; j >= 0; j--) {
                cell = cells[j];
                if (this.options.visibleColumns.indexOf(j) > -1) {
                    cell.style.display = "table-cell";
                    /** apply width 100% to last visible cell in order to render table correctly **/
                    if (lastCell) {
                        cell.style.width = "100%";
                        cell.style.whiteSpace = "normal";
                        cell.style.wordBreak = "break-all";
                    }
                    else {
                        cell.style.width = "auto";
                        cell.style.whiteSpace = "nowrap";
                        cell.style.wordBreak = "keep-all";
                    }
                    lastCell = false;
                }
                else {
                    cell.style.display = "none";
                }
            }
        }
        this.fire("columns-changed", { visibleColumns: this.options.visibleColumns, table: table });
    };

    paginator.prototype.showHeader = function() {
        document.getElementById("paginatorTableHeader-" + this.id).style.display = "table-row";
    }

    paginator.prototype.hideHeader = function () {
        document.getElementById("paginatorTableHeader-" + this.id).style.display = "none";
    };


    paginator.prototype.sort = function(sort) {
        this.entries.sort(function (a, b) {
            var type = this.options.types[this.activeColumn];
            if (sort === "dsc") {
                if (type === "string") {
                    return a[this.activeColumn].replace(/(<([^>]+)>)/ig, "").localeCompare(b[this.activeColumn].replace(/(<([^>]+)>)/ig, ""));
                } else if (type === "number") {
                    return a[this.activeColumn] - b[this.activeColumn];
                } else if (type === "boolean") {
                    return a[this.activeColumn] - b[this.activeColumn];
                } else if (type === "date") {
                    return new Date(a[this.activeColumn]) - new Date(b[this.activeColumn]);                
                }
            }
            else {
                if (type === "string") {
                    return b[this.activeColumn].replace(/(<([^>]+)>)/ig, "").localeCompare(a[this.activeColumn].replace(/(<([^>]+)>)/ig, ""));
                } else if (type === "number") {
                    return b[this.activeColumn] - a[this.activeColumn];
                } else if (type === "boolean") {
                    return b[this.activeColumn] - a[this.activeColumn];
                } else if (type === "date") {
                    return new Date(b[this.activeColumn]) - new Date(a[this.activeColumn]);  
                }
            }
            
        } .bind(this));
    };

    return paginator;
})();

SORT_DSC = "&#9662;";
SORT_ASC = "&#9652;";

// down &#9662;, up &#9652;
