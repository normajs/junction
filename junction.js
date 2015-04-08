/*

  Junction Object Constructor
 */

/*

  @param {string, object} selector
    The selector to find or element to wrap
  @param {object} context
    The context in which to match the selector
  @returns junction
  @this window
 */
var _$, _junction, _nameSpace, junction, bind = function (fn, me) {
    return function () {
        return fn.apply(me, arguments);
    };
};

junction = function (selector, context) {
    var domFragment, element, elements, m, match, returnElements, rquickExpr, selectorType;
    selectorType = typeof selector;
    returnElements = [];
    if (selector) {
        if (selectorType === "string" && selector.indexOf("<") === 0) {
            domFragment = document.createElement("div");
            domFragment.innerHTML = selector;
            return junction(domFragment).children().each(function () {
                return domFragment.removeChild(this);
            });
        } else if (selectorType === "function") {
            return junction.ready(selector);
        } else if (selectorType === "string") {
            if (context) {
                return junction(context).find(selector);
            }
            rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
            if (match = rquickExpr.exec(selector)) {
                if ((m = match[1])) {
                    elements = [document.getElementById(m)];
                } else if (match[2]) {
                    elements = document.getElementsByTagName(selector);
                } else if ((m = match[3])) {
                    elements = document.getElementsByClassName(m);
                }
            } else {
                elements = document.querySelectorAll(selector);
            }
            returnElements = (function () {
                var k, len, results1;
                results1 = [];
                for (k = 0, len = elements.length; k < len; k++) {
                    element = elements[k];
                    results1.push(element);
                }
                return results1;
            })();
        } else if (Object.prototype.toString.call(selector) === "[object Array]" || selectorType === "object" && selector instanceof window.NodeList) {
            returnElements = (function () {
                var k, len, results1;
                results1 = [];
                for (k = 0, len = selector.length; k < len; k++) {
                    element = selector[k];
                    results1.push(element);
                }
                return results1;
            })();
        } else {
            returnElements = returnElements.concat(selector);
        }
    }
    returnElements = junction.extend(returnElements, junction.fn);
    returnElements.selector = selector;
    return returnElements;
};

junction.fn = {};

junction.state = {};

junction.plugins = {};

junction.extend = function (first, second) {
    var key;
    for (key in second) {
        if (second.hasOwnProperty(key)) {
            first[key] = second[key];
        }
    }
    return first;
};

window["junction"] = junction;

_junction = window.junction;

_$ = window.$;

junction.noConflict = function (deep) {
    if (window.$ === junction) {
        window.$ = _$;
    }
    if (deep && window.junction === junction) {
        window.junction = _junction;
    }
    return junction;
};


/*

  Iterates over `junction` collections.

  @param {function} callback The callback to be invoked on
    each element and index
  @return junction
  @this junction
 */

junction.fn.each = function (callback) {
    return junction.each(this, callback);
};

junction.each = function (collection, callback) {
    var index, item, k, len, val;
    for (index = k = 0, len = collection.length; k < len; index = ++k) {
        item = collection[index];
        val = callback.call(item, index, item);
        if (val === false) {
            break;
        }
    }
    return collection;
};


/*

  Check for array membership.

  @param {object} element The thing to find.
  @param {object} collection The thing to find the needle in.
  @return {boolean}
  @this window
 */

junction.inArray = function (element, collection) {
    var exists, index, item, k, len;
    exists = -1;
    for (index = k = 0, len = collection.length; k < len; index = ++k) {
        item = collection[index];
        if (collection.hasOwnProperty(index) && collection[index] === element) {
            exists = index;
        }
    }
    return exists;
};

junction.state.ready = false;

junction.readyQueue = [];


/*

  Bind callbacks to be run with the DOM is "ready"

  @param {function} fn The callback to be run
  @return junction
  @this junction
 */

junction.ready = function (fn) {
    if (junction.ready && fn) {
        fn.call(document);
    } else if (fn) {
        junction.readyQueue.push(fn);
    } else {
        junction.runReady();
    }
    return [document];
};

junction.fn.ready = function (fn) {
    junction.ready(fn);
    return this;
};

junction.runReady = function () {
    if (!junction.state.ready) {
        while (junction.readyQueue.length) {
            junction.readyQueue.shift().call(document);
        }
        return junction.state.ready = true;
    }
};


/*

  If DOM is already ready at exec time, depends on the browser.
  From:
  https://github.com/mobify/mobifyjs/blob/
  526841be5509e28fc949038021799e4223479f8d/src/capture.js#L128
 */

if ((document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading")) {
    junction.runReady();
} else {
    if (!window.document.addEventListener) {
        window.document.attachEvent("DOMContentLoaded", junction.runReady);
        window.document.attachEvent("onreadystatechange", junction.runReady);
    } else {
        window.document.addEventListener("DOMContentLoaded", junction.runReady, false);
        window.document.addEventListener("onreadystatechange", junction.runReady, false);
    }
    window.addEventListener("load", junction.runReady, false);
}


/*
@class Debouncer

@author
  James E Baxley III
  NewSpring Church

@version 0.3

@note
  Handles debouncing of events via requestAnimationFrame
    @see http://www.html5rocks.com/en/tutorials/speed/animations/
 */

junction._debounce = (function () {
    function _debounce(data1) {
        this.data = data1;
        this.handleEvent = bind(this.handleEvent, this);
        this.requestTick = bind(this.requestTick, this);
        this.update = bind(this.update, this);
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
        this.callback = this.data;
        this.ticking = false;
    }

    _debounce.prototype.update = function () {
        this.callback && this.callback();
        return this.ticking = false;
    };

    _debounce.prototype.requestTick = function () {
        if (!this.ticking) {
            requestAnimationFrame(this.rafCallback || (this.rafCallback = this.update.bind(this)));
            return this.ticking = true;
        }
    };

    _debounce.prototype.handleEvent = function () {
        return this.requestTick();
    };

    return _debounce;

})();

junction.debounce = function (callback) {
    return new this._.debounce(callback);
};


/*

  @function flatten()

  @param {Array} single or multilevel array

  @return {Array} a flattened version of an array.

  @note
    Handy for getting a list of children from the nodes.
 */

junction.flatten = function (array) {
    var element, flattened, k, len;
    flattened = [];
    for (k = 0, len = array.length; k < len; k++) {
        element = array[k];
        if (element instanceof Array) {
            flattened = flattened.concat(this.flatten(element));
        } else {
            flattened.push(element);
        }
    }
    return flattened;
};

junction.flattenObject = (function (_this) {
    return function (object) {
        var array, value;
        array = [];
        for (value in object) {
            if (object.hasOwnProperty(value)) {
                array.push(object[value]);
            }
        }
        return array;
    };
})(this);


/*

@function getKeys()

@param {Object}
@param {value}

@return {Array} array of keys that match on a certain value

@note
  helpful for searching objects


@todo add ability to search string and multi level
 */

junction.getKeys = function (obj, val) {
    var element, objects;
    objects = [];
    for (element in obj) {
        if (!obj.hasOwnProperty(element)) {
            continue;
        }
        if (obj[element] === "object") {
            objects = objects.concat(this.getKeys(obj[element], val));
        } else {
            if (obj[element] === val) {
                objects.push(element);
            }
        }
    }
    return objects;
};


/*

  @function getQueryVariable()

  @param {Val}

  @return {Array} array of query values in url string matching the value
 */

junction.getQueryVariable = function (val) {
    var query, results, vars;
    query = window.location.search.substring(1);
    vars = query.split("&");
    results = vars.filter(function (element) {
        var pair;
        pair = element.split("=");
        if (decodeURIComponent(pair[0]) === val) {
            return decodeURIComponent(pair[1]);
        }
    });
    return results;
};


/*

  @function isMobile()

  @return {Boolean} true if Mobile
 */

junction.isMobile = function () {
    return /(Android|iPhone|iPad|iPod|IEMobile)/g.test(navigator.userAgent);
};


/*

@function last()

@param {Array}
@param {Val} ** optional

@return {Val} last value of array or value certain length from end
 */

junction.last = function (array, back) {
    return array[array.length - (back || 0) - 1];
};


/*

@function truthful()

@param {Array} any array to be tested for true values

@return {Array} array without false values

@note
  Handy for triming out all falsy values from an array.
 */

junction.truthful = function (array) {
    var item, k, len, results1;
    results1 = [];
    for (k = 0, len = array.length; k < len; k++) {
        item = array[k];
        if (item) {
            results1.push(item);
        }
    }
    return results1;
};


/*

  Get data attached to the first element or set data values on
  all elements in the current set

  @param {string} name The data attribute name
  @param {any} value The value assigned to the data attribute
  @return {any|junction}
  @this junction
 */

junction.fn.data = function (name, value) {
    if (name !== void 0) {
        if (value !== void 0) {
            return this.each(function () {
                if (!this.junctionData) {
                    this.junctionData = {};
                }
                this.junctionData[name] = value;
            });
        } else {
            if (this[0] && this[0].junctionData) {
                return this[0].junctionData[name];
            } else {
                return void 0;
            }
        }
    } else {
        if (this[0]) {
            return this[0].junctionData || {};
        } else {
            return void 0;
        }
    }
};


/*

  Remove data associated with `name` or all the data, for each
  element in the current set

  @param {string} name The data attribute name
  @return junction
  @this junction
 */

junction.fn.removeData = function (name) {
    return this.each(function () {
        if (name !== void 0 && this.junctionData) {
            this.junctionData[name] = void 0;
            delete this.junctionData[name];
        } else {
            this[0].junctionData = {};
        }
    });
};


/*

  Make an HTTP request to a url.

  NOTE** the following options are supported:

  - *method* - The HTTP method used with the request. Default: `GET`.
  - *data* - Raw object with keys and values to pass with request
      Default `null`.
  - *async* - Whether the opened request is asynchronouse. Default `true`.
  - *success* - Callback for successful request and response
      Passed the response data.
  - *error* - Callback for failed request and response.
  - *cancel* - Callback for cancelled request and response.

  @param {string} url The url to request.
  @param {object} options The options object, see Notes.
  @return junction
  @this junction
 */

junction.ajax = function (url, options) {
    var req, settings, xmlHttp;
    xmlHttp = function () {
        var e;
        try {
            return new XMLHttpRequest();
        } catch (_error) {
            e = _error;
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    };
    req = xmlHttp();
    settings = junction.extend({}, junction.ajax.settings);
    if (options) {
        junction.extend(settings, options);
    }
    if (!url) {
        url = settings.url;
    }
    if (!req || !url) {
        return;
    }
    req.open(settings.method, url, settings.async);
    if (req.setRequestHeader) {
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    }
    req.onreadystatechange = function () {
        var res;
        if (req.readyState === 4) {
            res = (req.responseText || "").replace(/^\s+|\s+$/g, "");
            if (req.status.toString().indexOf("0") === 0) {
                return settings.cancel(res, req.status, req);
            } else if (req.status.toString().match(/^(4|5)/) && RegExp.$1) {
                return settings.error(res, req.status, req);
            } else {
                return settings.success(res, req.status, req);
            }
        }
    };
    if (req.readyState === 4) {
        return req;
    }
    req.send(settings.data || null);
    return req;
};

junction.ajax.settings = {
    success: function () {},
    error: function () {},
    cancel: function () {},
    method: "GET",
    async: true,
    data: null
};


/*

  Helper function wrapping a call to [ajax](ajax.js.html)
  using the `GET` method.

  @param {string} url The url to GET from.
  @param {function} callback Callback to invoke on success.
  @return junction
  @this junction
 */

junction.get = function (url, callback) {
    return junction.ajax(url, {
        success: callback
    });
};


/*

  Load the HTML response from `url` into the current set of elements.

  @param {string} url The url to GET from.
  @param {function} callback Callback to invoke after HTML is inserted.
  @return junction
  @this junction
 */

junction.fn.load = function (url, callback) {
    var args, intCB, self;
    self = this;
    args = arguments;
    intCB = function (data) {
        self.each(function () {
            junction(this).html(data);
        });
        if (callback) {
            callback.apply(self, args);
        }
    };
    junction.ajax(url, {
        success: intCB
    });
    return this;
};


/*

  Helper function wrapping a call to [ajax](ajax.js.html)
  using the `POST` method.

  @param {string} url The url to POST to.
  @param {object} data The data to send.
  @param {function} callback Callback to invoke on success.
  @return junction
  @this junction
 */

junction.post = function (url, data, callback) {
    return junction.ajax(url, {
        data: data,
        method: "POST",
        success: callback
    });
};


/*

  Add elements matching the selector to the current set.

  @param {string} selector The selector for the elements to add from the DOM
  @return junction
  @this junction
 */

junction.fn.add = function (selector) {
    var ret;
    ret = [];
    this.each(function () {
        ret.push(this);
    });
    if (junction(selector)[0]) {
        junction(selector).each(function () {
            ret.push(this);
        });
    }
    return junction(ret);
};


/*

  Add a class to each DOM element in the set of elements.

  @param {string} className The name of the class to be added.
  @return junction
  @this junction
 */

junction.fn.addClass = function (className) {
    var classes;
    classes = className.replace(/^\s+|\s+$/g, "").split(" ");
    return this.each(function () {
        var k, klass, len, regex, withoutClass;
        for (k = 0, len = classes.length; k < len; k++) {
            klass = classes[k];
            if (this.className !== void 0) {
                klass = klass.trim();
                regex = new RegExp("(?:^| )(" + klass + ")(?: |$)");
                withoutClass = !this.className.match(regex);
                if (this.className === "" || withoutClass) {
                    if (this.className === "") {
                        this.className += "" + klass;
                    } else {
                        this.className += " " + klass;
                    }
                    return;
                }
            }
        }
    });
};


/*

  Insert an element or HTML string after each element in the current set.

  @param {string|HTMLElement} fragment The HTML or HTMLElement to insert.
  @return junction
  @this junction
 */

junction.fn.after = function (fragment) {
    if (typeof fragment === "string" || fragment.nodeType !== void 0) {
        fragment = junction(fragment);
    }
    if (fragment.length > 1) {
        fragment = fragment.reverse();
    }
    return this.each(function (index) {
        var insertEl, k, len, piece;
        for (k = 0, len = fragment.length; k < len; k++) {
            piece = fragment[k];
            insertEl = (index > 0 ? piece.cloneNode(true) : piece);
            this.parentNode.insertBefore(insertEl, this.nextSibling);
            return;
        }
    });
};


/*

  Insert an element or HTML string as the last child of each element in the set.

  @param {string|HTMLElement} fragment The HTML or HTMLElement to insert.
  @return junction
  @this junction
 */

junction.fn.append = function (fragment) {
    if (typeof fragment === "string" || fragment.nodeType !== void 0) {
        fragment = junction(fragment);
    }
    return this.each(function (index) {
        var element, k, len, piece;
        for (k = 0, len = fragment.length; k < len; k++) {
            piece = fragment[k];
            element = (index > 0 ? piece.cloneNode(true) : piece);
            this.appendChild(element);
            return;
        }
    });
};


/*

  Insert the current set as the last child of the elements
  matching the selector.

  @param {string} selector The selector after which to append the current set.
  @return junction
  @this junction
 */

junction.fn.appendTo = function (selector) {
    return this.each(function () {
        junction(selector).append(this);
    });
};


/*

  Get the value of the first element of the set or set
  the value of all the elements in the set.

  @param {string} name The attribute name.
  @param {string} value The new value for the attribute.
  @return {junction|string|undefined}
  @this {junction}
 */

junction.fn.attr = function (name, value) {
    var nameStr;
    nameStr = typeof name === "string";
    if (value !== void 0 || !nameStr) {
        return this.each(function () {
            var i;
            if (nameStr) {
                this.setAttribute(name, value);
            } else {
                for (i in name) {
                    if (name.hasOwnProperty(i)) {
                        this.setAttribute(i, name[i]);
                    }
                }
            }
        });
    } else {
        if (this[0]) {
            return this[0].getAttribute(name);
        } else {
            return void 0;
        }
    }
};


/*

  Insert an element or HTML string before each
  element in the current set.

  @param {string|HTMLElement} fragment The HTML or HTMLElement to insert.
  @return junction
  @this junction
 */

junction.fn.before = function (fragment) {
    if (typeof fragment === "string" || fragment.nodeType !== undefined) {
        fragment = junction(fragment);
    }
    return this.each(function (index) {
        var insertEl, k, len, piece;
        for (k = 0, len = fragment.length; k < len; k++) {
            piece = fragment[k];
            insertEl = (index > 0 ? piece.cloneNode(true) : piece);
            this.parentNode.insertBefore(insertEl, this);
            return;
        }
    });
};


/*

  Get the children of the current collection.
  @return junction
  @this junction
 */

junction.fn.children = function () {
    var returns;
    returns = [];
    this.each(function () {
        var children, i, results1;
        children = this.children;
        i = -1;
        results1 = [];
        while (i++ < children.length - 1) {
            if (junction.inArray(children[i], returns) === -1) {
                results1.push(returns.push(children[i]));
            } else {
                results1.push(void 0);
            }
        }
        return results1;
    });
    return junction(returns);
};


/*

  Clone and return the current set of nodes into a
  new `junction` object.

  @return junction
  @this junction
 */

junction.fn.clone = function () {
    var returns;
    returns = [];
    this.each(function () {
        returns.push(this.cloneNode(true));
    });
    return junction(returns);
};


/*

  Find an element matching the selector in the
  set of the current element and its parents.

  @param {string} selector The selector used to identify the target element.
  @return junction
  @this junction
 */

junction.fn.closest = function (selector) {
    var returns;
    returns = [];
    if (!selector) {
        return junction(returns);
    }
    this.each(function () {
        var $self, element;
        element = void 0;
        $self = junction(element = this);
        if ($self.is(selector)) {
            returns.push(this);
            return;
        }
        while (element.parentElement) {
            if (junction(element.parentElement).is(selector)) {
                returns.push(element.parentElement);
                break;
            }
            element = element.parentElement;
        }
    });
    return junction(returns);
};


/*

  Get the compute style property of the first
  element or set the value of a style property
  on all elements in the set.

  @method _setStyle
  @param {string} property The property being used to style the element.
  @param {string|undefined} value The css value for the style property.
  @return {string|junction}
  @this junction
 */

junction.fn.css = function (property, value) {
    if (!this[0]) {
        return;
    }
    if (typeof property === "object") {
        return this.each(function () {
            var key;
            for (key in property) {
                if (property.hasOwnProperty(key)) {
                    junction._setStyle(this, key, property[key]);
                }
            }
        });
    } else {
        if (value !== undefined) {
            return this.each(function () {
                junction._setStyle(this, property, value);
            });
        }
        return junction._getStyle(this[0], property);
    }
};

junction.cssExceptions = {
    'float': ['cssFloat', 'styleFloat']
};

(function () {
    var _getStyle, convertPropertyName, cssExceptions, vendorPrefixes;
    convertPropertyName = function (str) {
        return str.replace(/\-([A-Za-z])/g, function (match, character) {
            return character.toUpperCase();
        });
    };
    _getStyle = function (element, property) {
        return window.getComputedStyle(element, null).getPropertyValue(property);
    };
    cssExceptions = junction.cssExceptions;
    vendorPrefixes = ["", "-webkit-", "-ms-", "-moz-", "-o-", "-khtml-"];

/*
  
    Private function for getting the computed
    style of an element.
  
    NOTE** Please use the [css](../css.js.html) method instead.
  
    @method _getStyle
    @param {HTMLElement} element The element we want the style property for.
    @param {string} property The css property we want the style for.
   */
    return junction._getStyle = function (element, property) {
        var convert, exception, k, l, len, len1, prefix, ref, value;
        if (cssExceptions[property]) {
            ref = cssExceptions[property];
            for (k = 0, len = ref.length; k < len; k++) {
                exception = ref[k];
                value = _getStyle(element, exception);
                if (value) {
                    return value;
                }
            }
        }
        for (l = 0, len1 = vendorPrefixes.length; l < len1; l++) {
            prefix = vendorPrefixes[l];
            convert = convertPropertyName(prefix + property);
            value = _getStyle(element, convert);
            if (convert !== property) {
                value = value || _getStyle(element, property);
            }
            if (prefix) {
                value = value || _getStyle(element, prefix);
            }
            if (value) {
                return value;
            }
        }
        return void 0;
    };
})();

(function () {
    var convertPropertyName, cssExceptions;
    convertPropertyName = function (str) {
        return str.replace(/\-([A-Za-z])/g, function (match, character) {
            return character.toUpperCase();
        });
    };
    cssExceptions = junction.cssExceptions;

/*
  
    Private function for setting the style of an element.
  
    NOTE** Please use the [css](../css.js.html) method instead.
  
    @method _setStyle
    @param {HTMLElement} element The element we want to style.
    @param {string} property The property being used to style the element.
    @param {string} value The css value for the style property.
   */
    return junction._setStyle = function (element, property, value) {
        var convertedProperty, exception, k, len, ref;
        convertedProperty = convertPropertyName(property);
        element.style[property] = value;
        if (convertedProperty !== property) {
            element.style[convertedProperty] = value;
        }
        if (cssExceptions[property]) {
            ref = cssExceptions[property];
            for (k = 0, len = ref.length; k < len; k++) {
                exception = ref[k];
                element.style[exception] = value;
                return;
            }
        }
    };
})();


/*

  Private function for setting/getting the offset
  property for height/width.

  NOTE** Please use the [width](width.js.html)
  or [height](height.js.html) methods instead.

  @param {junction} set The set of elements.
  @param {string} name The string "height" or "width".
  @param {float|undefined} value The value to assign.
  @return junction
  @this window
 */

junction._dimension = function (set, name, value) {
    var offsetName;
    if (value === undefined) {
        offsetName = name.replace(/^[a-z]/, function (letter) {
            return letter.toUpperCase();
        });
        return set[0]["offset" + offsetName];
    } else {
        value = (typeof value === "string" ? value : value + "px");
        return set.each(function () {
            this.style[name] = value;
        });
    }
};


/*

  Returns the indexed element wrapped in a new `junction` object.

  @param {integer} index The index of the element to wrap and return.
  @return junction
  @this junction
 */

junction.fn.eq = function (index) {
    if (this[index]) {
        return junction(this[index]);
    }
    return junction([]);
};


/*

  Filter out the current set if they do *not*
  match the passed selector or the supplied callback returns false

  @param {string,function} selector The selector or boolean return value callback used to filter the elements.
  @return junction
  @this junction
 */

junction.fn.filter = function (selector) {
    var returns;
    returns = [];
    this.each(function (index) {
        var context, filterSelector;
        if (typeof selector === "function") {
            if (selector.call(this, index) !== false) {
                returns.push(this);
            }
        } else {
            if (!this.parentNode) {
                context = junction(document.createDocumentFragment());
                context[0].appendChild(this);
                filterSelector = junction(selector, context);
            } else {
                filterSelector = junction(selector, this.parentNode);
            }
            if (junction.inArray(this, filterSelector) > -1) {
                returns.push(this);
            }
        }
    });
    return junction(returns);
};


/*

  Find descendant elements of the current collection.

  @param {string} selector The selector used to find the children
  @return junction
  @this junction
 */

junction.fn.find = function (selector) {
    var returns;
    returns = [];
    this.each(function () {
        var e, elements, found, k, len, m, match, results1, rquickExpr;
        try {
            rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
            if (match = rquickExpr.exec(selector)) {
                if ((m = match[1])) {
                    elements = [document.getElementById(m)];
                } else if (match[2]) {
                    elements = this.getElementsByTagName(selector);
                } else if ((m = match[3])) {
                    elements = this.getElementsByClassName(m);
                }
            } else {
                elements = this.querySelectorAll(selector);
            }
        } catch (_error) {
            e = _error;
            return false;
        }
        results1 = [];
        for (k = 0, len = elements.length; k < len; k++) {
            found = elements[k];
            results1.push(returns = returns.concat(found));
        }
        return results1;
    });
    return junction(returns);
};


/*

  Returns the first element of the set wrapped in a new `shoestring` object.

  @return junction
  @this junction
 */

junction.fn.first = function () {
    return this.eq(0);
};


/*

  Returns the raw DOM node at the passed index.

  @param {integer} index The index of the element to wrap and return.
  @return HTMLElement
  @this junction
 */

junction.fn.get = function (index) {
    return this[index];
};


/*

  Returns a boolean if elements have the class passed

  @param {string} selector The selector to check.
  @return {boolean}
  @this {junction}
 */

junction.fn.hasClass = function (className) {
    var returns;
    returns = false;
    this.each(function () {
        var regex;
        regex = new RegExp(" " + className + " ");
        return returns = regex.test(" " + this.className + " ");
    });
    return returns;
};


/*

  Gets the height value of the first element or
  sets the height for the whole set.

  @param {float|undefined} value The value to assign.
  @return junction
  @this junction
 */

junction.fn.height = function (value) {
    return junction._dimension(this, "height", value);
};


/*

  Gets or sets the `innerHTML` from all the elements in the set.

  @param {string|undefined} html The html to assign
  @return {string|junction}
  @this junction
 */

junction.fn.html = function (html) {
    var pile, set;
    set = function (html) {
        var k, len, part;
        if (typeof html === "string") {
            return this.each(function () {
                this.innerHTML = html;
            });
        } else {
            part = "";
            if (typeof html.length !== "undefined") {
                for (k = 0, len = html.length; k < len; k++) {
                    part = html[k];
                    part += part.outerHTML;
                    return;
                }
            } else {
                part = html.outerHTML;
            }
            return this.each(function () {
                this.innerHTML = part;
            });
        }
    };
    if (typeof html !== "undefined") {
        return set.call(this, html);
    } else {
        pile = "";
        this.each(function () {
            pile += this.innerHTML;
        });
        return pile;
    }
};

(function () {
    var _getIndex;
    _getIndex = function (set, test) {
        var element, i, result;
        i = result = 0;
        while (i < set.length) {
            element = set.item ? set.item(i) : set[i];
            if (test(element)) {
                return result;
            }
            if (element.nodeType === 1) {
                result++;
            }
            i++;
        }
        return -1;
    };

/*
  
    Find the index in the current set for the passed
    selector. Without a selector it returns the
    index of the first node within the array of its siblings.
  
    @param {string|undefined} selector The selector used to search for the index.
    @return {integer}
    @this {junction}
   */
    return junction.fn.index = function (selector) {
        var children, self;
        self = this;
        if (selector === undefined) {
            children = ((this[0] && this[0].parentNode) || document.documentElement).childNodes;
            return _getIndex(children, function (element) {
                return self[0] === element;
            });
        } else {
            return _getIndex(self, function (element) {
                return element === (junction(selector, element.parentNode)[0]);
            });
        }
    };
})();


/*

  Insert the current set after the elements matching the selector.

  @param {string} selector The selector after which to insert the current set.
  @return junction
  @this junction
 */

junction.fn.insertAfter = function (selector) {
    return this.each(function () {
        junction(selector).after(this);
    });
};


/*

  Insert the current set after the elements matching the selector.

  @param {string} selector The selector after which to insert the current set.
  @return junction
  @this junction
 */

junction.fn.insertBefore = function (selector) {
    return this.each(function () {
        junction(selector).before(this);
    });
};


/*

  Checks the current set of elements against
  the selector, if one matches return `true`.

  @param {string} selector The selector to check.
  @return {boolean}
  @this {junction}
 */

junction.fn.is = function (selector) {
    var returns;
    returns = false;
    this.each(function () {
        if (junction.inArray(this, junction(selector)) > -1) {
            returns = true;
        }
    });
    return returns;
};

junction.fn.isElement = function () {
    var el;
    el = this[0];
    return (typeof HTMLElement === "object" ? el instanceof HTMLElement : el && typeof el === "object" && el !== null && el.nodeType === 1 && typeof el.nodeName === "string");
};


/*

@function isElementInView()

@param {Element} element to check against

@return {Boolean} if element is in view
 */

junction.fn.isElementInView = function () {
    var coords, element;
    element = this[0];
    if ((typeof jQuery !== "undefined" && jQuery !== null) && element instanceof jQuery) {
        element = element.get(0);
    }
    if (element instanceof junction) {
        element = element.get(0);
    }
    coords = element.getBoundingClientRect();
    return (Math.abs(coords.left) >= 0 && Math.abs(coords.top)) <= (window.innerHeight || document.documentElement.clientHeight);
};


/*

  Returns the last element of the set wrapped in a new `shoestring` object.

  @return junction
  @this junction
 */

junction.fn.last = function () {
    return this.eq(this.length - 1);
};


/*

  Returns a `junction` object with the set of siblings of each element in the original set.

  @return junction
  @this junction
 */

junction.fn.next = function () {
    var returns;
    returns = [];
    this.each(function () {
        var child, children, found, index, item, k, len, results1;
        children = junction(this.parentNode)[0].childNodes;
        found = false;
        results1 = [];
        for (index = k = 0, len = children.length; k < len; index = ++k) {
            child = children[index];
            item = children.item(index);
            if (found && item.nodeType === 1) {
                returns.push(item);
                break;
            }
            if (item === this) {
                results1.push(found = true);
            } else {
                results1.push(void 0);
            }
        }
        return results1;
    });
    return junction(returns);
};


/*

  Removes elements from the current set.

  @param {string} selector The selector to use when removing the elements.
  @return junction
  @this junction
 */

junction.fn.not = function (selector) {
    var returns;
    returns = [];
    this.each(function () {
        var found;
        found = junction(selector, this.parentNode);
        if (junction.inArray(this, found) === -1) {
            returns.push(this);
        }
    });
    return junction(returns);
};


/*

  Returns an object with the `top` and `left`
  properties corresponging to the first elements offsets.

  @return object
  @this junction
 */

junction.fn.offset = function () {
    return {
        top: this[0].offsetTop,
        left: this[0].offsetLeft
    };
};


/*

  Returns the set of first parents for each element
  in the current set.

  @return junction
  @this junction
 */

junction.fn.parent = function () {
    var returns;
    returns = [];
    this.each(function () {
        var parent;
        parent = (this === document.documentElement ? document : this.parentNode);
        if (parent && parent.nodeType !== 11) {
            returns.push(parent);
        }
    });
    return junction(returns);
};


/*

  Returns the set of all parents matching the
  selector if provided for each element in the current set.

  @param {string} selector The selector to check the parents with.
  @return junction
  @this junction
 */

junction.fn.parents = function (selector) {
    var returns;
    returns = [];
    this.each(function () {
        var current, match;
        current = this;
        match;
        while (current.parentElement && !match) {
            current = current.parentElement;
            if (selector) {
                if (current === junction(selector)[0]) {
                    match = true;
                    if (junction.inArray(current, returns) === -1) {
                        returns.push(current);
                    }
                }
            } else {
                if (junction.inArray(current, returns) === -1) {
                    returns.push(current);
                }
            }
        }
    });
    return junction(returns);
};


/*

  Add an HTML string or element before the children
  of each element in the current set.

  @param {string|HTMLElement} fragment The HTML string or element to add.
  @return junction
  @this junction
 */

junction.fn.prepend = function (fragment) {
    if (typeof fragment === "string" || fragment.nodeType !== undefined) {
        fragment = junction(fragment);
    }
    return this.each(function (index) {
        var insertEl, k, len, piece, results1;
        results1 = [];
        for (index = k = 0, len = fragment.length; k < len; index = ++k) {
            piece = fragment[index];
            insertEl = (index > 0 ? piece.cloneNode(true) : piece);
            if (this.firstChild) {
                results1.push(this.insertBefore(insertEl, this.firstChild));
            } else {
                results1.push(this.appendChild(insertEl));
            }
        }
        return results1;
    });
};


/*

  Add each element of the current set before the
  children of the selected elements.

  @param {string} selector The selector for the elements to add the current set to..
  @return junction
  @this junction
 */

junction.fn.prependTo = function (selector) {
    return this.each(function () {
        junction(selector).prepend(this);
    });
};


/*

  Returns a `junction` object with the set of *one*
  sibling before each element in the original set.

  @return junction
  @this junction
 */

junction.fn.prev = function () {
    var returns;
    returns = [];
    this.each(function () {
        var child, children, found, index, item, k, results1;
        children = junction(this.parentNode)[0].childNodes;
        found = false;
        results1 = [];
        for (index = k = children.length - 1; k >= 0; index = k += -1) {
            child = children[index];
            item = children.item(index);
            if (found && item.nodeType === 1) {
                returns.push(item);
                break;
            }
            if (item === this) {
                results1.push(found = true);
            } else {
                results1.push(void 0);
            }
        }
        return results1;
    });
    return junction(returns);
};


/*

  Returns a `junction` object with the set of *all*
  siblings before each element in the original set.

  @return junction
  @this junction
 */

junction.fn.prevAll = function () {
    var returns;
    returns = [];
    this.each(function () {
        var $previous;
        $previous = junction(this).prev();
        while ($previous.length) {
            returns.push($previous[0]);
            $previous = $previous.prev();
        }
    });
    return junction(returns);
};


/*

  Gets the property value from the first element
  or sets the property value on all elements of the currrent set.

  @param {string} name The property name.
  @param {any} value The property value.
  @return {any|junction}
  @this junction
 */

junction.fn.prop = function (name, value) {
    if (!this[0]) {
        return;
    }
    name = junction.propFix[name] || name;
    if (value !== undefined) {
        return this.each(function () {
            this[name] = value;
        });
    } else {
        return this[0][name];
    }
};

junction.propFix = {
    "class": "className",
    "contenteditable": "contentEditable",
    "for": "htmlFor",
    "readonly": "readOnly",
    "tabindex": "tabIndex"
};


/*

  Remove the current set of elements from the DOM.

  @return junction
  @this junction
 */

junction.fn.remove = function () {
    return this.each(function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    });
};


/*

  Remove an attribute from each element in the current set.

  @param {string} name The name of the attribute.
  @return junction
  @this junction
 */

junction.fn.removeAttr = function (name) {
    return this.each(function () {
        this.removeAttribute(name);
    });
};


/*

  Remove a class from each DOM element in the set of elements.

  @param {string} className The name of the class to be removed.
  @return junction
  @this junction
 */

junction.fn.removeClass = function (className) {
    var classes;
    classes = className.replace(/^\s+|\s+$/g, "").split(" ");
    return this.each(function () {
        var k, klass, len, newClassName, regex;
        for (k = 0, len = classes.length; k < len; k++) {
            klass = classes[k];
            if (this.className !== undefined) {
                regex = new RegExp("(^|\\s)" + klass + "($|\\s)", "gmi");
                newClassName = this.className.replace(regex, " ");
                this.className = newClassName.replace(/^\s+|\s+$/g, "");
            }
            return;
        }
    });
};


/*

  Remove a proprety from each element in the current set.

  @param {string} name The name of the property.
  @return junction
  @this junction
 */

junction.fn.removeProp = function (property) {
    var name;
    name = junction.propFix[property] || property;
    return this.each(function () {
        this[name] = undefined;
        delete this[name];
    });
};


/*

  Replace each element in the current set with that argument HTML string or HTMLElement.

  @param {string|HTMLElement} fragment The value to assign.
  @return junction
  @this junction
 */

junction.fn.replaceWith = function (fragment) {
    var framgent, returns;
    if (typeof fragment === "string") {
        fragment = junction(fragment);
    }
    returns = [];
    if (fragment.length > 1) {
        framgent = framgent.reverse();
    }
    this.each(function (index) {
        var clone, insertEl, k, len, piece;
        clone = this.cloneNode(true);
        returns.push(clone);
        if (!this.parentNode) {
            return;
        }
        if (fragment.length === 1) {
            insertEl = (index > 0 ? fragment[0].cloneNode(true) : fragment[0]);
            return this.parentNode.replaceChild(insertEl, this);
        } else {
            for (k = 0, len = fragment.length; k < len; k++) {
                piece = fragment[k];
                insertEl = (index > 0 ? piece.cloneNode(true) : piece);
                this.parentNode.insertBefore(insertEl, this.nextSibling);
                return;
            }
            return this.parentNode.removeChild(this);
        }
    });
    return junction(returns);
};

junction.inputTypes = ["text", "hidden", "password", "color", "date", "datetime", "email", "month", "number", "range", "search", "tel", "time", "url", "week"];

junction.inputTypeTest = new RegExp(junction.inputTypes.join("|"));


/*

  Serialize child input element values into an object.

  @return junction
  @this junction
 */

junction.fn.serialize = function () {
    var data;
    data = {};
    junction("input, select", this).each(function () {
        var name, type, value;
        type = this.type;
        name = this.name;
        value = this.value;
        if (junction.inputTypeTest.test(type) || (type === "checkbox" || type === "radio") && this.checked) {
            data[name] = value;
        } else if (this.nodeName === "select") {
            data[name] = this.options[this.selectedIndex].nodeValue;
        }
    });
    return data;
};


/*

  Get all of the sibling elements for each element in the current set.

  @return junction
  @this junction
 */

junction.fn.siblings = function () {
    var el, siblings;
    if (!this.length) {
        return junction([]);
    }
    siblings = [];
    el = this[0].parentNode.firstChild;
    while (true) {
        if (el.nodeType === 1 && el !== this[0]) {
            siblings.push(el);
        }
        el = el.nextSibling;
        if (!el) {
            break;
        }
    }
    return junction(siblings);
};


/*

  Recursively retrieve the text content of the each element in the current set.

  @return junction
  @this junction
 */

junction.fn.text = function () {
    var getText;
    getText = function (elem) {
        var i, node, nodeType, text;
        text = "";
        nodeType = elem.nodeType;
        i = 0;
        if (!nodeType) {
            while (node = elem[i++]) {
                text += getText(node);
            }
        } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
            if (typeof elem.textContent === "string") {
                return elem.textContent;
            } else {
                elem = elem.firstChild;
                while (elem) {
                    ret += getText(elem);
                    elem = elem.nextSibling;
                }
            }
        } else if (nodeType === 3 || nodeType === 4) {
            return elem.nodeValue;
        }
        return text;
    };
    return getText(this);
};


/*

  Toggles class of elements in selector

  @param {string} className Class to be toggled
  @return junction
  @this junction
 */

junction.fn.toggleClass = function (className) {
    if (this.hasClass(className)) {
        return this.removeClass(className);
    } else {
        return this.addClass(className);
    }
};


/*

  Get the value of the first element or set the value
  of all elements in the current set.

  @param {string} value The value to set.
  @return junction
  @this junction
 */

junction.fn.val = function (value) {
    var el;
    if (value !== undefined) {
        return this.each(function () {
            var i, inArray, newIndex, optionSet, options, values;
            if (this.tagName === "SELECT") {
                options = this.options;
                values = [];
                i = options.length;
                values[0] = value;
                while (i--) {
                    options = options[i];
                    inArray = junction.inArray(option.value, values) >= 0;
                    if ((option.selected = inArray)) {
                        optionSet = true;
                        newIndex = i;
                    }
                }
                if (!optionSet) {
                    return this.selectedIndex = -1;
                } else {
                    return this.selectedIndex = newIndex;
                }
            } else {
                return this.value = value;
            }
        });
    } else {
        el = this[0];
        if (el.tagName === "SELECT") {
            if (el.selectedIndex < 0) {
                return "";
            }
        } else {
            return el.value;
        }
    }
};


/*

  Gets the width value of the first element or
  sets the width for the whole set.

  @param {float|undefined} value The value to assign.
  @return junction
  @this junction
 */

junction.fn.width = function (value) {
    return junction._dimension(this, "width", value);
};


/*

  Wraps the child elements in the provided HTML.

  @param {string} html The wrapping HTML.
  @return junction
  @this junction
 */

junction.fn.wrapInner = function (html) {
    return this.each(function () {
        var inH;
        inH = this.innerHTML;
        this.innerHTML = "";
        junction(this).append(junction(html).html(inH));
    });
};


/*

  Bind a callback to an event for the currrent set of elements.

  @param {string} evt The event(s) to watch for.
  @param {object,function} data Data to be included
    with each event or the callback.
  @param {function} originalCallback Callback to be
    invoked when data is define.d.
  @return junction
  @this junction
 */

junction.fn.bind = function (evt, data, originalCallback) {
    var addToEventCache, docEl, encasedCallback, evts, initEventCache;
    initEventCache = function (el, evt) {
        if (!el.junctionData) {
            el.junctionData = {};
        }
        if (!el.junctionData.events) {
            el.junctionData.events = {};
        }
        if (!el.junctionData.loop) {
            el.junctionData.loop = {};
        }
        if (!el.junctionData.events[evt]) {
            return el.junctionData.events[evt] = [];
        }
    };
    addToEventCache = function (el, evt, eventInfo) {
        var obj;
        obj = {};
        obj.isCustomEvent = eventInfo.isCustomEvent;
        obj.callback = eventInfo.callfunc;
        obj.originalCallback = eventInfo.originalCallback;
        obj.namespace = eventInfo.namespace;
        el.junctionData.events[evt].push(obj);
        if (eventInfo.customEventLoop) {
            return el.junctionData.loop[evt] = eventInfo.customEventLoop;
        }
    };
    if (typeof data === "function") {
        originalCallback = data;
        data = null;
    }
    evts = evt.split(" ");
    docEl = document.documentElement;
    encasedCallback = function (e, namespace, triggeredElement) {
        var originalPreventDefault, preventDefaultConstructor, result, returnTrue;
        if (e._namespace && e._namespace !== namespace) {
            return;
        }
        e.data = data;
        e.namespace = e._namespace;
        returnTrue = function () {
            return true;
        };
        e.isDefaultPrevented = function () {
            return false;
        };
        originalPreventDefault = e.preventDefault;
        preventDefaultConstructor = function () {
            if (originalPreventDefault) {
                return function () {
                    e.isDefaultPrevented = returnTrue;
                    originalPreventDefault.call(e);
                };
            } else {
                return function () {
                    e.isDefaultPrevented = returnTrue;
                    e.returnValue = false;
                };
            }
        };
        e.target = triggeredElement || e.target || e.srcElement;
        e.preventDefault = preventDefaultConstructor();
        e.stopPropagation = e.stopPropagation ||
        function () {
            e.cancelBubble = true;
        };
        result = originalCallback.apply(this, [e].concat(e._args));
        if (!result) {
            e.preventDefault();
            e.stopPropagation();
        }
        return result;
    };
    return this.each(function () {
        var customEventCallback, customEventLoop, domEventCallback, evnObj, evnt, k, len, namespace, oEl, split;
        oEl = this;
        for (k = 0, len = evts.length; k < len; k++) {
            evnt = evts[k];
            split = evnt.split(".");
            evt = split[0];
            namespace = (split.length > 0 ? split[1] : null);
            domEventCallback = function (originalEvent) {
                if (oEl.ssEventTrigger) {
                    originalEvent._namespace = oEl.ssEventTrigger._namespace;
                    originalEvent._args = oEl.ssEventTrigger._args;
                    oEl.ssEventTrigger = null;
                }
                return encasedCallback.call(oEl, originalEvent, namespace);
            };
            customEventCallback = null;
            customEventLoop = null;
            initEventCache(this, evt);
            if ("addEventListener" in this) {
                this.addEventListener(evt, domEventCallback, false);
            } else if (this.attachEvent) {
                if (this["on" + evt] !== void 0) {
                    this.attachEvent("on" + evt, domEventCallback);
                }
            }
            evnObj = {
                callfunc: customEventCallback || domEventCallback,
                isCustomEvent: !! customEventCallback,
                customEventLoop: customEventLoop,
                originalCallback: originalCallback,
                namespace: namespace
            };
            addToEventCache(this, evt, evnObj);
            return;
        }
    });
};

junction.fn.on = junction.fn.bind;


/*

  Bind a callback to an event for the currrent
  set of elements, unbind after one occurence.

  @param {string} event The event(s) to watch for.
  @param {function} callback Callback to invoke on the event.
  @return junction
  @this junction
 */

junction.fn.one = function (event, callback) {
    var evts;
    evts = event.split(" ");
    return this.each(function () {
        var $t, cbs, k, len, thisevt;
        cbs = {};
        $t = junction(this);
        for (k = 0, len = evts.length; k < len; k++) {
            thisevt = evts[k];
            cbs[thisevt] = function (e) {
                var j;
                $t = junction(this);
                for (j in cbs) {
                    $t.unbind(j, cbs[j]);
                }
                return callback.apply(this, [e].concat(e._args));
            };
            $t.bind(thisevt, cbs[thisevt]);
            return;
        }
    });
};


/*

  Trigger an event on each of the DOM elements in the current set.

  @param {string} event The event(s) to trigger.
  @param {object} args Arguments to append to callback invocations.
  @return junction
  @this junction
 */

junction.fn.trigger = function (event, args) {
    var evts;
    evts = event.split(" ");
    return this.each(function () {
        var evnt, evt, k, len, namespace, split;
        for (k = 0, len = evts.length; k < len; k++) {
            evnt = evts[k];
            split = evnt.split(".");
            evt = split[0];
            namespace = (split.length > 0 ? split[1] : null);
            if (evt === "click") {
                if (this.tagName === "INPUT" && this.type === "checkbox" && this.click) {
                    this.click();
                    return false;
                }
            }
            if (document.createEvent) {
                event = document.createEvent("Event");
                event.initEvent(evt, true, true);
                event._args = args;
                event._namespace = namespace;
                this.dispatchEvent(event);
            } else if (document.createEventObject) {
                if (("" + this[evt]).indexOf("function") > -1) {
                    this.ssEventTrigger = {
                        _namespace: namespace,
                        _args: args
                    };
                    this[evt]();
                } else {
                    document.documentElement[evt] = {
                        el: this,
                        _namespace: namespace,
                        _args: args
                    };
                }
            }
        }
    });
};


/*

  Unbind a previous bound callback for an event.

  @param {string} event The event(s) the callback was bound to..
  @param {function} callback Callback to unbind.
  @return junction
  @this junction
 */

junction.fn.unbind = function (event, callback) {
    var evts, unbind, unbindAll;
    unbind = function (e, namespace, cb) {
        var bnd, bound, k, l, len, len1, match, matched, results1;
        matched = [];
        bound = this.junctionData.events[e];
        if (!bound.length) {
            return;
        }
        for (k = 0, len = bound.length; k < len; k++) {
            bnd = bound[k];
            if (!namespace || namespace === bnd.namespace) {
                if (cb === void 0 || cb === bnd.originalCallback) {
                    if (window["removeEventListener"]) {
                        this.removeEventListener(e, bnd.callback, false);
                    } else if (this.detachEvent) {
                        this.detachEvent("on" + e, bnd.callback);
                        if (bound.length === 1 && this.junctionData.loop && this.junctionData.loop[e]) {
                            document.documentElement.detachEvent("onpropertychange", this.junctionData.loop[e]);
                        }
                    }
                    matched.push(bound.indexOf(bnd));
                }
            }
            return;
        }
        results1 = [];
        for (l = 0, len1 = matched.length; l < len1; l++) {
            match = matched[l];
            results1.push(this.junctionData.events[e].splice(matched.indexOf(match), 1));
        }
        return results1;
    };
    unbindAll = function (namespace, cb) {
        var evtKey;
        for (evtKey in this.junctionData.events) {
            unbind.call(this, evtKey, namespace, cb);
        }
    };
    evts = (event ? event.split(" ") : []);
    return this.each(function () {
        var evnt, evt, k, len, namespace, results1, split;
        if (!this.junctionData || !this.junctionData.events) {
            return;
        }
        if (!evts.length) {
            return unbindAll.call(this);
        } else {
            results1 = [];
            for (k = 0, len = evts.length; k < len; k++) {
                evnt = evts[k];
                split = evnt.split(".");
                evt = split[0];
                namespace = (split.length > 0 ? split[1] : null);
                if (evt) {
                    results1.push(unbind.call(this, evt, namespace, callback));
                } else {
                    results1.push(unbindAll.call(this, namespace, callback));
                }
            }
            return results1;
        }
    });
};

junction.fn.off = junction.fn.unbind;

_nameSpace = function (target, attribute, obj, force) {
    var originalAttr, params;
    originalAttr = attribute.replace(/[\[\]']+/g, '');
    params = target.attributes[originalAttr].value.split(',');
    params = params.map(function (param) {
        return param.trim();
    });
    attribute = originalAttr.split('-');
    if (!this[attribute[1]]) {
        this[attribute[1]] = {};
    }
    if (!this[attribute[1]][params[0]] || force) {
        this[attribute[1]][params[0]] = null;
        return this[attribute[1]][params[0]] = new obj(target, originalAttr);
    }
};

junction.addModel = function (scope, model, attr, force, cb) {
    var k, len, ref, target;
    if (typeof force === "function") {
        force = false;
        cb = force;
    }
    ref = scope.querySelectorAll(attr);
    for (k = 0, len = ref.length; k < len; k++) {
        target = ref[k];
        _nameSpace(target, attr, model, force);
    }
    if (scope.querySelectorAll(attr).length) {
        if (typeof cb === "function") {
            return cb();
        }
    }
};

junction.addPlugin = function (name, obj, attr, cb) {
    var k, len, plugin, ref, savePlugin, self;
    self = this;
    savePlugin = function (name, obj, attr, cb) {
        return self['plugins'][name] = {
            _id: name,
            model: obj,
            attr: attr,
            callback: cb
        };
    };
    if (self.plugins.length) {
        ref = self.plugins;
        for (k = 0, len = ref.length; k < len; k++) {
            plugin = ref[k];
            if (plugin._id === obj.name) {
                savePlugin(name, obj, attr, cb);
            }
            self.addModel(document, obj, attr, cb);
            return;
        }
    } else {
        savePlugin(name, obj, attr, cb);
    }
    return self.addModel(document, obj, attr, cb);
};

junction.updateModels = function (scope, force) {
    var k, len, plugin, ref, results1;
    if (!scope) {
        scope = document;
    }
    if (typeof scope === "boolean") {
        force = scope;
        scope = document;
    }
    ref = this.flattenObject(this['plugins']);
    results1 = [];
    for (k = 0, len = ref.length; k < len; k++) {
        plugin = ref[k];
        results1.push(this.addModel(scope, plugin.model, plugin.attr, false, force));
    }
    return results1;
};