# hyper-venn

A D3 plugin for rendering 3-, 5-, and 7-set Venn diagrams[^todo-setcounts]. Though, using this plug-in for 3-set diagrams is a bit unnecessary - this was included as a baseline for development purposes. I wrote this package because I was looking for a 5-set Venn diagram in D3 and came across <a href="https://github.com/habtom/biojs-vis-genvenn">this repo</a>. I thought the main drawing component could be done a little more thoroughly. (Perhaps ironically, I haven't fully fleshed that functionality out in this plugin, but the objects are all there.)

The base obloids are sourced from <a href="https://github.com/dusadrian/venn">this waaaaaaaay more powerful R package</a> and the objects used to render the intersection paths can be found in the <a href="man/development">/man/development/</a> directory.

And, finally, the package was structured following the guidance outlined <a href="https://bost.ocks.org/mike/d3-plugin/">here</a>.

Note: throughout this document I will use the term "obloid" to refer to concave / non-elliptical shapes.

## Examples

<a href="https://3sigmatech.github.io/hyper-venn/examples/simple.html">See example here.</a>

### 3-set diagrams 

| By intersection | By non-overlapping area |
| --- | --- |
| <img src="man/figures/3-venn.svg" /> | <img src="man/figures/3-venn-by-area.svg" /> |

### 5-set diagrams

| By intersection | By non-overlapping area |
| --- | --- |
| <img src="man/figures/5-venn.svg" /> | <img src="man/figures/5-venn-by-area.svg" /> |

### 5-set diagrams rendered with ellipses

| By intersection | By non-overlapping area |
| --- | --- |
| <img src="man/figures/5-venn-as-ellipses.svg" /> | <img src="man/figures/5-venn-as-ellipses-by-area.svg" /> |

### 7-set diagrams

| By intersection | By non-overlapping area |
| --- | --- |
| <img src="man/figures/7-venn.svg" /> | <img src="man/figures/7-venn-by-area.svg" /> |

# Installing

If you use NPM, `npm install hyper-venn`. Otherwise, download the [latest release](https://github.com/d3/hyper-venn/releases/latest).

# API Reference

## hyperVenn(data, [options])

The main function **hyperVenn.hyperVenn**(data, [options]) returns a method that will draw the SVG elements it renders. This function has one required input and one optional input.

### data
Array of arrays or object of arrays representing sets to use in defining the intersections for the Venn diagram.
```javascript
    ExampleDataAsObject = {
        "Purple": ["001", "002", "003", "004", "005"],
        "Blue": ["001", "002", "005", "007", "008"],
        "Green": ["001", "002", "003", "004", "0012"],
        "Orange": ["001", "002", "003", "006", "004"],
        "Red": ["001", "002", "003", "007", "008"],
        "Yellow": ["001", "002", "003", "005", "004"],
        "Cyan": ["001", "002", "003", "006", "008"],
        "Other": "Non-array properties will be ignored."
    };
```
or
```javascript
    ExampleDataAsArray = [
        ["001", "002", "003", "004", "005"],
        ["001", "002", "005", "007", "008"],
        ["001", "002", "003", "004", "0012"],
        ["001", "002", "003", "006", "004"],
        ["001", "002", "003", "007", "008"],
        ["001", "002", "003", "005", "004"],
        ["001", "002", "003", "006", "008"]
    ];
```

### options (optional)
Customizes behavior of **hyperVenn**(). The default options are:

```javascript
    {
        width: 500,
        height: 500,
        tooltip: true,
        tooltipCallbackRenderer: _defaultTooltipCallbackRenderer /* Renders simple tooltip showing intersection label and contents. */,
        click: true,
        clickCallbackRenderer: _defaultClickCallbackRenderer /* Prints the intersection's label and contents to the console. */,
        hover: true,
        hoverCallbackRenderer: _defaultHoverCallbackRenderer /* Sets fill-opacity to 0.6, stroke-opacity to 1, and stroke-width to 4. */ ,
        useEllipses: false,
        useDistinctAreas: false,
        showLabels: true,
        labelStyle: "stroke:#ffffff;fill:#000000;stroke-width:0.25px;",
        labels: ["A", "B", "C", "D", "E", "F", "G"],
        colors: ["#6600ff", "#0099ff", "#00cc00", "#cc9900", "#ff0000", "#999999", "#009933"],
        style: "fill-opacity:0.05;stroke-width:1;stroke-opacity:1;stroke:#ffffff"
    }

```
    

| Option | Property Type | Description |
| --- | --- | --- |
| width | integer | If the D3 selection passed to the rendering function, returned from **hyperVenn**(), does not have a child *svg* selement, the renderer will add an *svg* element with this width.[^todo-width] |
| height | integer | If the D3 selection passed to the rendering function, returned from **hyperVenn**(), does not have a child *svg* selement, the renderer will add an *svg* element with this height.[^todo-height] |
| tooltip | boolean | If *false*, the tooltip callback function will not be added to the rendered paths. |
| tooltipCallbackRenderer[^todo-callbacks] | (string, object) => {} | May render callback functions for `mouseover`, `mouseout`, and `mousemove` events (the event type is passed in the first parameter). The object passed in will be the relevant <a href="#hyperVenn.intersections()">hyperVenn.intersections()</a> object. This must return a function of the form `() => {}`. |
| click | boolean | If *false*, the click callback function will not be added to the rendered paths. |
| clickCallbackRenderer | (object) => {} | The object passed in will be the relevant <a href="#hyperVenn.intersections()">hyperVenn.intersections()</a> object. This must return a function of the form `() => {}`. |
| hover | boolean | If *false*, the hover callback function will not be added to the rendered paths. |
| hoverCallbackRenderer | (string, object) => {} | May render callback functions for `mouseover`, `mouseout` events (the event type is passed in the first parameter). The object passed in will be the relevant <a href="#hyperVenn.intersections()">hyperVenn.intersections()</a> object. This must return a function of the form `() => {}`. |
| useEllipses | boolean | For 5-set data arrays. Set to *true* to use ellipses instead of obloids. |
| useDistinctAreas | boolean | Set to *true* to render diagram as a collection of non-overlapping elements. By default, the paths will draw out the whole region of intersection. Consider the 3-set diagram. `1 or 2 or 3` middle "triangle" is part of the `1 or 2` set. Thus, by default, the rendered path for `1 or 2` includes that middle area. Setting this to true will render the path for `1 or 2` as `1 or 2 and not 3` (this only effects how the path is rendered; it does not effect calculations). |
| showLabels | boolean | Set to *false* to hide the labels from the diagram. |
| labelStyle | string | Allows for embedding specific CSS on the label elements. It is recommended to set this to `''` and use CSS styling to style the elements. (Details on `id` and `class` attributes can be found in the <a href="#hyperVenn.labels">hyperVenn.labels()</a> documentation below.) |
| labels | string[] | <a id="options-labels"></a> Allows for setting the data labels for array-type data. If a data object is used, it is recommended to set this to an empty array which will trigger the use of the object's properties as data labels. (Not following this recommendation will result in indeterminant behavior since the ordering of an object's keys is not guaranteed.[^todo-labels])  |
| colors | string[] | Fill colors for the data sets themselves. (It is *not* possible to set the fill colors of intersection areas using this array.[^todo-colors]) |
| style | string | Allows for embedding specific CSS on the path elements. It is recommended to set this to `''` and use CSS styling to style the elements. (Details on `id` and `class` attributes can be found in the <a href="#hyperVenn.paths">hyperVenn.paths()</a> documentation below.) |


## Other public functions

The other functions are used to access the internal data structures used by this drawing method to support implementing your own rendering method.

### hyperVenn.intersections()
Returns the object representing all set intersections and original sets. The object is keyed using the **name** field described below. It includes an `areas` property that counts the number of areas in the diagram:
```javascript
`intersections.areas = Object.keys(intersections).length - 1`
```

| Field | Field Type | Description |
| --- | --- | --- |
| name | string | <a id="intersection-name"></a>Intersection naming convention. Example: `S0n1n2` is the name for the intersection of the first three sets of data. Note: `S0`, `S1`, etc. are the original data sets and *are* included in this object. |
| index | integer[] | <a id="intersection-index"></a>Array representing the sets in the intersection. Example: `[0,1,2]` is the index for the intersection of the first three sets of data. Note: `[0]`, `[1]`, etc. are the original data sets and *are* included in this object. |
| label | string | A pretty-print label defined by the data labels in **options** or the keys from the data object (as described in <a href="#options-labels">options.labels</a>). Example: `Green `&#8745;` Blue` is the intersection of sets <i>Green</i> and <i>Blue</i>. Note: The original data sets will have their respective labels (e.g. `Green`). |
| array | variant[] | Array of elements in the intersection of relevant data sets. This array will contain elements of whatever type were in the data (integers, floats, strings, etc.). |

### hyperVenn.paths()
Returns an array of objects used to render the paths (note: this includes circle and ellipse elements). Each object in the array will have the following fields: 

| Field | Field Type | Description |
| --- | --- | --- |
| tag | string | HTML element type (`path`, `circle`, `ellipse`) |
| attrs | object | Each property of `attrs` is described in the rest of this table. |
| attrs.id | string | HTML element ID. This will be equivalent to the <a href="#intersection-name">Name</a> of the rendered intersection. |
| attrs.index | string | <a href="#intersection-index">Index</a> of the rendered intersection. |
| attrs.style | string | Style string as computed from `options.style` and `options.colors`. |
| attrs.class | string | If the path represents a data set, the class is `set`. Otherwise, it is `intersection`. |

### hyperVenn.labels()
Returns an array of objects used to render the labels (note: this includes data labels outside of the diagram). Each object in the array will have the following fields: 

| Field | Field Type | Description |
| --- | --- | --- |
| tag | string | This will always be `text`. |
| text | string | The text contained in the label. This will be the data sets's label or the intersection's size. |
| attrs | object | Each property of `attrs` is described in the rest of this table. |
| attrs.id | string | HTML element ID. This will be equivalent to the <a href="#intersection-name">Name</a> of the rendered intersection appended with `Label` (e.g. `S0n1Label`). |
| attrs.index | string | <a href="#intersection-index">Index</a> of the rendered intersection. |
| attrs.style | string | Style string as computed from `options.labelStyle` and `options.colors`. |
| attrs.class | string | If the path represents a data set, the class is `set-label`. Otherwise, it is `intersection-label`. |
| attrs.x | integer | The X-coordinate of the center of the text element. The renderer returned from `hyperVenn(data, [options])` will offset the text element accordingly. |
| attrs.y | integer | The Y-coordinate of the center of the text element. The renderer returned from `hyperVenn(data, [options])` will offset the text element accordingly. |

### hyperVenn.data()
This is either the passed-in 2D array of data, or the 2D array resulting by parsing the data object.

### hyperVenn.options()
The amalgamation of default options and passed in options.

[^todo-setcounts]: TODO: Add paths for 4- and 6-set diagrams
[^todo-width]: TODO: Apply transforms to rendered paths and texts to fit into non-default SVG sizes.
[^todo-height]: TODO: Apply transforms to rendered paths and texts to fit into non-default SVG sizes.
[^todo-callbacks]: TODO: Apply callbacks to labels as well.
[^todo-labels]: TODO: Update *options.labels* to support callback function for calculating the label.
[^todo-colors]: TODO: Update *options.colors* to support callback function for calculating the fill color.
[^todo-style]: TODO: Update *options.style* to support callback function for calculating the style.