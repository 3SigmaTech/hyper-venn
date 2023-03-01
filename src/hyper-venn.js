import { default as calculateIntersections } from './hyper-venn-intersect';
import { default as pathData } from './hyper-venn-base-paths';


export function hyperVenn(data, opts) {
  return _hyperVenn(data, opts);
};

var SUPPORTED_SIZES = [3, 5, 7];

var INTERSECTIONS = {};
var PATHS = [];
var LABELS = [];
var DATA = [];
var OPTIONS = {};
var TOOLTIP = null;
var VENN = null;

export function intersections() {
    return INTERSECTIONS;
}
export function paths() {
    return PATHS;
}
export function labels() {
    return LABELS;
}
export function data() {
    return DATA;
}
export function options() {
    return OPTIONS;
}
export function clear() {
    for (let i = 0; i < PATHS.length; i++) {
        document.getElementById(PATHS[i].attrs['id']).remove();
    }
    reset();
}
export function reset() {
    INTERSECTIONS = {};
    PATHS = [];
    LABELS = [];
    DATA = [];
}

function _defaultOpts() {
    return {
        width: 500,
        height: 500,
        tooltip: true,
        tooltipCallbackRenderer: _defaultTooltipCallbackRenderer /* Renders simple tooltip showing intersection label and contents. */,
        click: true,
        clickCallbackRenderer: _defaultClickCallbackRenderer /* Prints the intersection's label and contents to the console. */,
        hover: true,
        hoverCallbackRenderer: _defaultHoverCallbackRenderer /* Sets fill-opacity to 0.6, stroke-opacity to 1, and stroke-width to 4. */,
        useEllipses: false,
        useDistinctAreas: false,
        showLabels: true,
        labelStyle: "stroke:#ffffff;fill:#000000;stroke-width:0.25px;",
        labels: [], // ["A", "B", "C", "D", "E", "F", "G"] - left empty for implementation reasons, but computed as commented
        colors: ["#6600ff", "#0099ff", "#00cc00", "#cc9900", "#ff0000", "#999999", "#009933"],
        style: "fill-opacity:0.05;stroke-width:1;stroke-opacity:1;stroke:#ffffff"
    };
}

function _hyperVenn(data, opts) {
    if (opts === undefined) {
        OPTIONS = {};
    } else {
        OPTIONS = {...opts};
    }
    _applyDefaultOptions(OPTIONS);

    let dErrMsg = _validateData(data);
    if (dErrMsg) { console.error(dErrMsg); return; }

    OPTIONS.numSets = DATA.length;
    
    let oErrMsg = _validateOptions(OPTIONS);
    if (oErrMsg) { console.error(oErrMsg); return; }
    
    INTERSECTIONS = calculateIntersections(DATA, OPTIONS.labels);
    PATHS = _generatePaths(OPTIONS);
    LABELS = _generateLabels(OPTIONS);

    return _drawHyperVenn;
}

function _validateData(data) {
    if (data === null) {
        return "Data cannot be null.";
    }
    if (Array.isArray(data)) {
        DATA = [...data];
        while (OPTIONS.labels.length < DATA.length) {
            OPTIONS.labels.push(String.fromCharCode(65 + OPTIONS.labels.length));
        }
    }
    if (typeof data === 'object') {
        DATA = [];
        OPTIONS.datalabels = [];
        for (let prop of Object.keys(data)) {
            if (Array.isArray(data[prop])) {
                DATA.push(data[prop]);
                if (OPTIONS.labels.length < DATA.length) {
                    OPTIONS.labels.push(prop);
                }
            }
        }
    }

    if (SUPPORTED_SIZES.indexOf(DATA.length) == -1) {
        return "Array sizes of [" + SUPPORTED_SIZES.toString() + '] are supported.';
    }
    return '';
}

function _applyDefaultOptions(opts) {
    let defaultOpts = _defaultOpts();
    for (let prop of Object.keys(defaultOpts)) {
        if (!opts.hasOwnProperty(prop)) {
            opts[prop] = defaultOpts[prop];
        }
    }
}

function _validateOptions(opts) {
    if (opts.useEllipses && opts.numSets != 5) {
        return 'Ellipses only supported for sets of size 5';
    }
}

function _generatePaths(opts) {
    let basePaths = pathData();
    let paths = [];

    let base = 'S' + opts.numSets + (opts.useEllipses ? 'e': '');
    let myBase = basePaths[base];
    let meta = myBase['meta'];
    
    for (let path of Object.keys(myBase['sets'])) {

        let myPath = myBase['sets'][path];
        if (opts.useDistinctAreas) {
            myPath = myBase['areas'][path];
        }

        let tag = 'path';
        if (opts.numSets == 3 && path == '0' && typeof myPath === 'object') { tag = 'circle'; }
        if (opts.useEllipses && path == '0' && typeof myPath === 'object') { tag = 'ellipse'; }

        let index = path.split(',');
        index.forEach((x, n) => { index[n] = parseInt(x); })

        for (let r = 0; r < opts.numSets; r++) {
            
            let angle = (360 / opts.numSets) * r;

            let el = {tag: tag, attrs: {}};
            
            if (tag == 'path') {
                el.attrs['d'] = myPath;
            } else {
                for (let prop of Object.keys(myPath)) {
                    el.attrs[prop] = myPath[prop];
                }
            }

            if (angle != 0) {
                el.attrs['transform'] = `rotate(${angle} ${meta.rx} ${meta.ry})`;
            }

            let myIndex = [...index];
            for (let i = 0; i < myIndex.length; i++) {
                myIndex[i] += r;
                if (myIndex[i] % opts.numSets < myIndex[i]) {
                    myIndex[i] -= opts.numSets;
                }
            }
            myIndex.sort();
            el.attrs['index'] = myIndex.toString();
            el.attrs['id'] = 'S' + myIndex.join('n');
            
            let myStyle = opts.style;
            if (path == '0' && opts.colors[r]) {
                myStyle += `;fill:${opts.colors[r]}`;
                myStyle += `;stroke:${opts.colors[r]}`;
            }
            el.attrs['style'] = myStyle;

            let myClass = (path == '0' ? 'set' : 'intersection');
            el.attrs['class'] = myClass;

            paths.push(el);

            // Intersection of all sets is rotationally symmetric with itself
            if (index.length == opts.numSets) { break; }
        }
    }
    return paths;
}

function _generateLabels(opts) {
    let baseLabels = pathData();
    let labels = [];

    let base = 'S' + opts.numSets + (opts.useEllipses ? 'e' : '');
    let myBase = baseLabels[base];
    let meta = myBase['meta'];

    if (myBase['labels'] == undefined) { return []; }
    for (let label of Object.keys(myBase['labels'])) {

        let myLabel = myBase['labels'][label];

        let tag = 'text';

        let index = label.split(',');
        index.forEach((x, n) => { index[n] = parseInt(x); })

        for (let r = 0; r < opts.numSets; r++) {

            let el = { tag: tag, attrs: {} };
            // Rotate X and Y coordinates about the center
            let angle = ((2.0 * Math.PI * r) / opts.numSets);
            let sin = Math.sin(angle);
            let cos = Math.cos(angle);
            let myX = myLabel.x - meta.rx;
            let myY = myLabel.y - meta.ry;
            el.attrs.x = Math.round(myX * cos - myY * sin) + meta.rx;
            el.attrs.y = Math.round(myX * sin + myY * cos) + meta.ry;

            if (myLabel.offsets != undefined) {
                if (myLabel.offsets[r] != undefined) {
                    if (myLabel.offsets[r].x != undefined) {
                        el.attrs.x += myLabel.offsets[r].x;
                    }
                    if (myLabel.offsets[r].y != undefined) {
                        el.attrs.y += myLabel.offsets[r].y;
                    }
                }
            }
            let myIndex = [...index];
            for (let i = 0; i < myIndex.length; i++) {
                myIndex[i] += r;
                if (myIndex[i] % opts.numSets < myIndex[i]) {
                    myIndex[i] -= opts.numSets;
                }
            }
            myIndex.sort();
            el.attrs['index'] = myIndex.toString();
            el.attrs['id'] = 'S' + myIndex.join('n') + 'Label';
            if (label == '-1') {
                el.text = opts.labels[r];
            } else {
                el.text = INTERSECTIONS['S' + myIndex.join('n')].size;
            }
            
            let myStyle = opts.labelStyle;
            myStyle += ';font-size:' + meta.fontSize + 'px';
            if (label == '-1') {
                myStyle += `;fill:${opts.colors[r]}`;
                myStyle += `;stroke:${opts.colors[r]}`;
            }
            el.attrs['style'] = myStyle;
            
            let myClass = (label == '-1' ? 'set-label' : 'intersection-label');
            el.attrs['class'] = myClass;

            labels.push(el);

            // Intersection of all sets is rotationally symmetric with itself
            if (index.length == opts.numSets) { break; }
        }
    }
    return labels;
}


function _drawHyperVenn(selection) {

    VENN = selection.select("svg");
    if (VENN._groups[0][0] == null) {
        VENN = selection.append("svg")
            .attr("width", OPTIONS.width)
            .attr("height", OPTIONS.height)
    }

    if (TOOLTIP != null) {
        let el = document.getElementById(TOOLTIP.attr("id"));
        if (el == undefined) { TOOLTIP = null; }
    }
    if (TOOLTIP == null) {
        TOOLTIP = selection.append("div")
            .attr("id", "tooltip")
            .attr("class", "hypervenntooltip")
            .style("position", "absolute")
            .style("width", "120px")
            .style("height", "auto")
            .style("padding", "10px")
            .style("background-color", "white")
            .style("border-radius", "10px")
            .style("box-shadow", "4px 4px 10px rgba(0, 0, 0, 0.4)")
            .style("pointer-events", "none")
            .style("display", "none");
    }

    for (let i = 0; i < PATHS.length; i++) {
        let mypath = VENN.append(PATHS[i].tag);
        for (let prop of Object.keys(PATHS[i].attrs)) {
            mypath.attr(prop, PATHS[i].attrs[prop]);
        }
        let mymeta = INTERSECTIONS[PATHS[i].attrs.id];
        _applyCallbacks(mypath, mymeta, OPTIONS);
    }

    for (let i = 0; i < LABELS.length; i++) {
        let mylabel = VENN.append(LABELS[i].tag);
        for (let prop of Object.keys(LABELS[i].attrs)) {
            mylabel.attr(prop, LABELS[i].attrs[prop]);
        }
        mylabel.text(LABELS[i].text);

        // Offset placement to account for text size
        let rect = mylabel.node().getBoundingClientRect();
        mylabel.attr('x', LABELS[i].attrs.x - rect.width / 2);
        mylabel.attr('y', LABELS[i].attrs.y + rect.height / 2);
    }
}

function _defaultTooltipCallbackRenderer(evt, meta) {
    if (evt == "mouseover") {
        return () => {
            TOOLTIP
                .style("left", (d3.event.pageX - 150) + "px")
                .style("top", (d3.event.pageY - 150) + "px")
                .style("display", "block")
                .html(meta.label + ": <br>" + meta.array.join("<br>"));
        }
    } else if (evt == "mouseout") {
        return () => {
            TOOLTIP.style("display", "none");
        }
    } else if (evt == "mousemove") {
        return () => {
            TOOLTIP
                .style("left", (d3.event.pageX - 150) + "px")
                .style("top", (d3.event.pageY - 150) + "px");
        }
    }
}

function _defaultClickCallbackRenderer(meta) {
    return () => {
        console.log("Common list elements in "
            + meta.label.replaceAll('&#8745;', 'n') + ": "
            + meta.join(",")
        );
    }
}

function _defaultHoverCallbackRenderer(evt, meta) {
    if (evt == "mouseover") {
        return () => {
            let tgt = d3.select(d3.event.currentTarget);
            let origFill = tgt.style("fill-opacity");
            let origStroke = tgt.style("stroke-opacity");
            let origStrokeWidth = tgt.style("stroke-width");
            tgt.transition()
                .attr("orig-fill-opacity", origFill)
                .attr("orig-stroke-opacity", origStroke)
                .attr("orig-stroke-width", origStrokeWidth)
                .style("fill-opacity", 0.6)
                .style("stroke-opacity", 1)
                .style("stroke-width", 4);
        }
    } else if (evt == "mouseout") {
        return () => {
            let tgt = d3.select(d3.event.currentTarget);
            let origFill = tgt.attr("orig-fill-opacity");
            let origStroke = tgt.attr("orig-stroke-opacity");
            let origStrokeWidth = tgt.attr("orig-stroke-width");
            tgt
                .attr("orig-fill-opacity", null)
                .attr("orig-stroke-opacity", null)
                .attr("orig-stroke-width", null)
                .style("fill-opacity", origFill)
                .style("stroke-opacity", origStroke)
                .style("stroke-width", origStrokeWidth);
        }
    }
}

function _applyCallbacks(path, meta, opts) {
    if (opts.tooltip) {
        path
            .on("mouseover.tt", opts.tooltipCallbackRenderer("mouseover", meta))
            .on("mouseout.tt", opts.tooltipCallbackRenderer("mouseout", meta))
            .on("mousemove.tt", opts.tooltipCallbackRenderer("mousemove", meta));

    }
    if (opts.click) {
        path.on("click", opts.clickCallbackRenderer(meta));
    }
    if (opts.hover) {
        path
            .on("mouseover.h", opts.hoverCallbackRenderer("mouseover", meta))
            .on("mouseout.h", opts.hoverCallbackRenderer("mouseout", meta));
    }
}