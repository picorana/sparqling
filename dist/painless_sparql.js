var palette, state_buffer_max_length;

palette = ["b58900", "cb4b16", "dc322f", "d33682", "6c71c4", "268bd2", "2aa198", "859900"];

state_buffer_max_length = 20;

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dragula = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var cache = {};
var start = '(?:^|\\s)';
var end = '(?:\\s|$)';

function lookupClass (className) {
  var cached = cache[className];
  if (cached) {
    cached.lastIndex = 0;
  } else {
    cache[className] = cached = new RegExp(start + className + end, 'g');
  }
  return cached;
}

function addClass (el, className) {
  var current = el.className;
  if (!current.length) {
    el.className = className;
  } else if (!lookupClass(className).test(current)) {
    el.className += ' ' + className;
  }
}

function rmClass (el, className) {
  el.className = el.className.replace(lookupClass(className), ' ').trim();
}

module.exports = {
  add: addClass,
  rm: rmClass
};

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

var emitter = require('contra/emitter');
var crossvent = require('crossvent');
var classes = require('./classes');
var doc = document;
var documentElement = doc.documentElement;

function dragula (initialContainers, options) {
  var len = arguments.length;
  if (len === 1 && Array.isArray(initialContainers) === false) {
    options = initialContainers;
    initialContainers = [];
  }
  var _mirror; // mirror image
  var _source; // source container
  var _item; // item being dragged
  var _offsetX; // reference x
  var _offsetY; // reference y
  var _moveX; // reference move x
  var _moveY; // reference move y
  var _initialSibling; // reference sibling when grabbed
  var _currentSibling; // reference sibling now
  var _copy; // item used for copying
  var _renderTimer; // timer for setTimeout renderMirrorImage
  var _lastDropTarget = null; // last container item was over
  var _grabbed; // holds mousedown context until first mousemove

  var o = options || {};
  if (o.moves === void 0) { o.moves = always; }
  if (o.accepts === void 0) { o.accepts = always; }
  if (o.invalid === void 0) { o.invalid = invalidTarget; }
  if (o.containers === void 0) { o.containers = initialContainers || []; }
  if (o.isContainer === void 0) { o.isContainer = never; }
  if (o.copy === void 0) { o.copy = false; }
  if (o.copySortSource === void 0) { o.copySortSource = false; }
  if (o.revertOnSpill === void 0) { o.revertOnSpill = false; }
  if (o.removeOnSpill === void 0) { o.removeOnSpill = false; }
  if (o.direction === void 0) { o.direction = 'vertical'; }
  if (o.ignoreInputTextSelection === void 0) { o.ignoreInputTextSelection = true; }
  if (o.mirrorContainer === void 0) { o.mirrorContainer = doc.body; }

  var drake = emitter({
    containers: o.containers,
    start: manualStart,
    end: end,
    cancel: cancel,
    remove: remove,
    destroy: destroy,
    canMove: canMove,
    dragging: false
  });

  if (o.removeOnSpill === true) {
    drake.on('over', spillOver).on('out', spillOut);
  }

  events();

  return drake;

  function isContainer (el) {
    return drake.containers.indexOf(el) !== -1 || o.isContainer(el);
  }

  function events (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousedown', grab);
    touchy(documentElement, op, 'mouseup', release);
  }

  function eventualMovements (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousemove', startBecauseMouseMoved);
  }

  function movements (remove) {
    var op = remove ? 'remove' : 'add';
    crossvent[op](documentElement, 'selectstart', preventGrabbed); // IE8
    crossvent[op](documentElement, 'click', preventGrabbed);
  }

  function destroy () {
    events(true);
    release({});
  }

  function preventGrabbed (e) {
    if (_grabbed) {
      e.preventDefault();
    }
  }

  function grab (e) {
    _moveX = e.clientX;
    _moveY = e.clientY;

    var ignore = whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey;
    if (ignore) {
      return; // we only care about honest-to-god left clicks and touch events
    }
    var item = e.target;
    var context = canStart(item);
    if (!context) {
      return;
    }
    _grabbed = context;
    eventualMovements();
    if (e.type === 'mousedown') {
      if (isInput(item)) { // see also: https://github.com/bevacqua/dragula/issues/208
        item.focus(); // fixes https://github.com/bevacqua/dragula/issues/176
      } else {
        e.preventDefault(); // fixes https://github.com/bevacqua/dragula/issues/155
      }
    }
  }

  function startBecauseMouseMoved (e) {
    if (!_grabbed) {
      return;
    }
    if (whichMouseButton(e) === 0) {
      release({});
      return; // when text is selected on an input and then dragged, mouseup doesn't fire. this is our only hope
    }
    // truthy check fixes #239, equality fixes #207
    if (e.clientX !== void 0 && e.clientX === _moveX && e.clientY !== void 0 && e.clientY === _moveY) {
      return;
    }
    if (o.ignoreInputTextSelection) {
      var clientX = getCoord('clientX', e);
      var clientY = getCoord('clientY', e);
      var elementBehindCursor = doc.elementFromPoint(clientX, clientY);
      if (isInput(elementBehindCursor)) {
        return;
      }
    }

    var grabbed = _grabbed; // call to end() unsets _grabbed
    eventualMovements(true);
    movements();
    end();
    start(grabbed);

    var offset = getOffset(_item);
    _offsetX = getCoord('pageX', e) - offset.left;
    _offsetY = getCoord('pageY', e) - offset.top;

    classes.add(_copy || _item, 'gu-transit');
    renderMirrorImage();
    drag(e);
  }

  function canStart (item) {
    if (drake.dragging && _mirror) {
      return;
    }
    if (isContainer(item)) {
      return; // don't drag container itself
    }
    var handle = item;
    while (getParent(item) && isContainer(getParent(item)) === false) {
      if (o.invalid(item, handle)) {
        return;
      }
      item = getParent(item); // drag target should be a top element
      if (!item) {
        return;
      }
    }
    var source = getParent(item);
    if (!source) {
      return;
    }
    if (o.invalid(item, handle)) {
      return;
    }

    var movable = o.moves(item, source, handle, nextEl(item));
    if (!movable) {
      return;
    }

    return {
      item: item,
      source: source
    };
  }

  function canMove (item) {
    return !!canStart(item);
  }

  function manualStart (item) {
    var context = canStart(item);
    if (context) {
      start(context);
    }
  }

  function start (context) {
    if (isCopy(context.item, context.source)) {
      _copy = context.item.cloneNode(true);
      drake.emit('cloned', _copy, context.item, 'copy');
    }

    _source = context.source;
    _item = context.item;
    _initialSibling = _currentSibling = nextEl(context.item);

    drake.dragging = true;
    drake.emit('drag', _item, _source);
  }

  function invalidTarget () {
    return false;
  }

  function end () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    drop(item, getParent(item));
  }

  function ungrab () {
    _grabbed = false;
    eventualMovements(true);
    movements(true);
  }

  function release (e) {
    ungrab();

    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var clientX = getCoord('clientX', e);
    var clientY = getCoord('clientY', e);
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    if (dropTarget && ((_copy && o.copySortSource) || (!_copy || dropTarget !== _source))) {
      drop(item, dropTarget);
    } else if (o.removeOnSpill) {
      remove();
    } else {
      cancel();
    }
  }

  function drop (item, target) {
    var parent = getParent(item);
    if (_copy && o.copySortSource && target === _source) {
      parent.removeChild(_item);
    }
    if (isInitialPlacement(target)) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, target, _source, _currentSibling);
    }
    cleanup();
  }

  function remove () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var parent = getParent(item);
    if (parent) {
      parent.removeChild(item);
    }
    drake.emit(_copy ? 'cancel' : 'remove', item, parent, _source);
    cleanup();
  }

  function cancel (revert) {
    if (!drake.dragging) {
      return;
    }
    var reverts = arguments.length > 0 ? revert : o.revertOnSpill;
    var item = _copy || _item;
    var parent = getParent(item);
    var initial = isInitialPlacement(parent);
    if (initial === false && reverts) {
      if (_copy) {
        if (parent) {
          parent.removeChild(_copy);
        }
      } else {
        _source.insertBefore(item, _initialSibling);
      }
    }
    if (initial || reverts) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, parent, _source, _currentSibling);
    }
    cleanup();
  }

  function cleanup () {
    var item = _copy || _item;
    ungrab();
    removeMirrorImage();
    if (item) {
      classes.rm(item, 'gu-transit');
    }
    if (_renderTimer) {
      clearTimeout(_renderTimer);
    }
    drake.dragging = false;
    if (_lastDropTarget) {
      drake.emit('out', item, _lastDropTarget, _source);
    }
    drake.emit('dragend', item);
    _source = _item = _copy = _initialSibling = _currentSibling = _renderTimer = _lastDropTarget = null;
  }

  function isInitialPlacement (target, s) {
    var sibling;
    if (s !== void 0) {
      sibling = s;
    } else if (_mirror) {
      sibling = _currentSibling;
    } else {
      sibling = nextEl(_copy || _item);
    }
    return target === _source && sibling === _initialSibling;
  }

  function findDropTarget (elementBehindCursor, clientX, clientY) {
    var target = elementBehindCursor;
    while (target && !accepted()) {
      target = getParent(target);
    }
    return target;

    function accepted () {
      var droppable = isContainer(target);
      if (droppable === false) {
        return false;
      }

      var immediate = getImmediateChild(target, elementBehindCursor);
      var reference = getReference(target, immediate, clientX, clientY);
      var initial = isInitialPlacement(target, reference);
      if (initial) {
        return true; // should always be able to drop it right back where it was
      }
      return o.accepts(_item, target, _source, reference);
    }
  }

  function drag (e) {
    if (!_mirror) {
      return;
    }
    e.preventDefault();

    var clientX = getCoord('clientX', e);
    var clientY = getCoord('clientY', e);
    var x = clientX - _offsetX;
    var y = clientY - _offsetY;

    _mirror.style.left = x + 'px';
    _mirror.style.top = y + 'px';

    var item = _copy || _item;
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    var changed = dropTarget !== null && dropTarget !== _lastDropTarget;
    if (changed || dropTarget === null) {
      out();
      _lastDropTarget = dropTarget;
      over();
    }
    var parent = getParent(item);
    if (dropTarget === _source && _copy && !o.copySortSource) {
      if (parent) {
        parent.removeChild(item);
      }
      return;
    }
    var reference;
    var immediate = getImmediateChild(dropTarget, elementBehindCursor);
    if (immediate !== null) {
      reference = getReference(dropTarget, immediate, clientX, clientY);
    } else if (o.revertOnSpill === true && !_copy) {
      reference = _initialSibling;
      dropTarget = _source;
    } else {
      if (_copy && parent) {
        parent.removeChild(item);
      }
      return;
    }
    if (
      (reference === null && changed) ||
      reference !== item &&
      reference !== nextEl(item)
    ) {
      _currentSibling = reference;
      dropTarget.insertBefore(item, reference);
      drake.emit('shadow', item, dropTarget, _source);
    }
    function moved (type) { drake.emit(type, item, _lastDropTarget, _source); }
    function over () { if (changed) { moved('over'); } }
    function out () { if (_lastDropTarget) { moved('out'); } }
  }

  function spillOver (el) {
    classes.rm(el, 'gu-hide');
  }

  function spillOut (el) {
    if (drake.dragging) { classes.add(el, 'gu-hide'); }
  }

  function renderMirrorImage () {
    if (_mirror) {
      return;
    }
    var rect = _item.getBoundingClientRect();
    _mirror = _item.cloneNode(true);
    _mirror.style.width = getRectWidth(rect) + 'px';
    _mirror.style.height = getRectHeight(rect) + 'px';
    classes.rm(_mirror, 'gu-transit');
    classes.add(_mirror, 'gu-mirror');
    o.mirrorContainer.appendChild(_mirror);
    touchy(documentElement, 'add', 'mousemove', drag);
    classes.add(o.mirrorContainer, 'gu-unselectable');
    drake.emit('cloned', _mirror, _item, 'mirror');
  }

  function removeMirrorImage () {
    if (_mirror) {
      classes.rm(o.mirrorContainer, 'gu-unselectable');
      touchy(documentElement, 'remove', 'mousemove', drag);
      getParent(_mirror).removeChild(_mirror);
      _mirror = null;
    }
  }

  function getImmediateChild (dropTarget, target) {
    var immediate = target;
    while (immediate !== dropTarget && getParent(immediate) !== dropTarget) {
      immediate = getParent(immediate);
    }
    if (immediate === documentElement) {
      return null;
    }
    return immediate;
  }

  function getReference (dropTarget, target, x, y) {
    var horizontal = o.direction === 'horizontal';
    var reference = target !== dropTarget ? inside() : outside();
    return reference;

    function outside () { // slower, but able to figure out any position
      var len = dropTarget.children.length;
      var i;
      var el;
      var rect;
      for (i = 0; i < len; i++) {
        el = dropTarget.children[i];
        rect = el.getBoundingClientRect();
        if (horizontal && (rect.left + rect.width / 2) > x) { return el; }
        if (!horizontal && (rect.top + rect.height / 2) > y) { return el; }
      }
      return null;
    }

    function inside () { // faster, but only available if dropped inside a child element
      var rect = target.getBoundingClientRect();
      if (horizontal) {
        return resolve(x > rect.left + getRectWidth(rect) / 2);
      }
      return resolve(y > rect.top + getRectHeight(rect) / 2);
    }

    function resolve (after) {
      return after ? nextEl(target) : target;
    }
  }

  function isCopy (item, container) {
    return typeof o.copy === 'boolean' ? o.copy : o.copy(item, container);
  }
}

function touchy (el, op, type, fn) {
  var touch = {
    mouseup: 'touchend',
    mousedown: 'touchstart',
    mousemove: 'touchmove'
  };
  var pointers = {
    mouseup: 'pointerup',
    mousedown: 'pointerdown',
    mousemove: 'pointermove'
  };
  var microsoft = {
    mouseup: 'MSPointerUp',
    mousedown: 'MSPointerDown',
    mousemove: 'MSPointerMove'
  };
  if (global.navigator.pointerEnabled) {
    crossvent[op](el, pointers[type], fn);
  } else if (global.navigator.msPointerEnabled) {
    crossvent[op](el, microsoft[type], fn);
  } else {
    crossvent[op](el, touch[type], fn);
    crossvent[op](el, type, fn);
  }
}

function whichMouseButton (e) {
  if (e.touches !== void 0) { return e.touches.length; }
  if (e.which !== void 0 && e.which !== 0) { return e.which; } // see https://github.com/bevacqua/dragula/issues/261
  if (e.buttons !== void 0) { return e.buttons; }
  var button = e.button;
  if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
    return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
  }
}

function getOffset (el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + getScroll('scrollLeft', 'pageXOffset'),
    top: rect.top + getScroll('scrollTop', 'pageYOffset')
  };
}

function getScroll (scrollProp, offsetProp) {
  if (typeof global[offsetProp] !== 'undefined') {
    return global[offsetProp];
  }
  if (documentElement.clientHeight) {
    return documentElement[scrollProp];
  }
  return doc.body[scrollProp];
}

function getElementBehindPoint (point, x, y) {
  var p = point || {};
  var state = p.className;
  var el;
  p.className += ' gu-hide';
  el = doc.elementFromPoint(x, y);
  p.className = state;
  return el;
}

function never () { return false; }
function always () { return true; }
function getRectWidth (rect) { return rect.width || (rect.right - rect.left); }
function getRectHeight (rect) { return rect.height || (rect.bottom - rect.top); }
function getParent (el) { return el.parentNode === doc ? null : el.parentNode; }
function isInput (el) { return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || isEditable(el); }
function isEditable (el) {
  if (!el) { return false; } // no parents were editable
  if (el.contentEditable === 'false') { return false; } // stop the lookup
  if (el.contentEditable === 'true') { return true; } // found a contentEditable element in the chain
  return isEditable(getParent(el)); // contentEditable is set to 'inherit'
}

function nextEl (el) {
  return el.nextElementSibling || manually();
  function manually () {
    var sibling = el;
    do {
      sibling = sibling.nextSibling;
    } while (sibling && sibling.nodeType !== 1);
    return sibling;
  }
}

function getEventHost (e) {
  // on touchend event, we have to use `e.changedTouches`
  // see http://stackoverflow.com/questions/7192563/touchend-event-properties
  // see https://github.com/bevacqua/dragula/issues/34
  if (e.targetTouches && e.targetTouches.length) {
    return e.targetTouches[0];
  }
  if (e.changedTouches && e.changedTouches.length) {
    return e.changedTouches[0];
  }
  return e;
}

function getCoord (coord, e) {
  var host = getEventHost(e);
  var missMap = {
    pageX: 'clientX', // IE8
    pageY: 'clientY' // IE8
  };
  if (coord in missMap && !(coord in host) && missMap[coord] in host) {
    coord = missMap[coord];
  }
  return host[coord];
}

module.exports = dragula;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes":1,"contra/emitter":5,"crossvent":6}],3:[function(require,module,exports){
module.exports = function atoa (a, n) { return Array.prototype.slice.call(a, n); }

},{}],4:[function(require,module,exports){
'use strict';

var ticky = require('ticky');

module.exports = function debounce (fn, args, ctx) {
  if (!fn) { return; }
  ticky(function run () {
    fn.apply(ctx || null, args || []);
  });
};

},{"ticky":9}],5:[function(require,module,exports){
'use strict';

var atoa = require('atoa');
var debounce = require('./debounce');

module.exports = function emitter (thing, options) {
  var opts = options || {};
  var evt = {};
  if (thing === undefined) { thing = {}; }
  thing.on = function (type, fn) {
    if (!evt[type]) {
      evt[type] = [fn];
    } else {
      evt[type].push(fn);
    }
    return thing;
  };
  thing.once = function (type, fn) {
    fn._once = true; // thing.off(fn) still works!
    thing.on(type, fn);
    return thing;
  };
  thing.off = function (type, fn) {
    var c = arguments.length;
    if (c === 1) {
      delete evt[type];
    } else if (c === 0) {
      evt = {};
    } else {
      var et = evt[type];
      if (!et) { return thing; }
      et.splice(et.indexOf(fn), 1);
    }
    return thing;
  };
  thing.emit = function () {
    var args = atoa(arguments);
    return thing.emitterSnapshot(args.shift()).apply(this, args);
  };
  thing.emitterSnapshot = function (type) {
    var et = (evt[type] || []).slice(0);
    return function () {
      var args = atoa(arguments);
      var ctx = this || thing;
      if (type === 'error' && opts.throws !== false && !et.length) { throw args.length === 1 ? args[0] : args; }
      et.forEach(function emitter (listen) {
        if (opts.async) { debounce(listen, args, ctx); } else { listen.apply(ctx, args); }
        if (listen._once) { thing.off(type, listen); }
      });
      return thing;
    };
  };
  return thing;
};

},{"./debounce":4,"atoa":3}],6:[function(require,module,exports){
(function (global){
'use strict';

var customEvent = require('custom-event');
var eventmap = require('./eventmap');
var doc = global.document;
var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!global.addEventListener) {
  addEvent = addEventHard;
  removeEvent = removeEventHard;
}

module.exports = {
  add: addEvent,
  remove: removeEvent,
  fabricate: fabricateEvent
};

function addEventEasy (el, type, fn, capturing) {
  return el.addEventListener(type, fn, capturing);
}

function addEventHard (el, type, fn) {
  return el.attachEvent('on' + type, wrap(el, type, fn));
}

function removeEventEasy (el, type, fn, capturing) {
  return el.removeEventListener(type, fn, capturing);
}

function removeEventHard (el, type, fn) {
  var listener = unwrap(el, type, fn);
  if (listener) {
    return el.detachEvent('on' + type, listener);
  }
}

function fabricateEvent (el, type, model) {
  var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
  if (el.dispatchEvent) {
    el.dispatchEvent(e);
  } else {
    el.fireEvent('on' + type, e);
  }
  function makeClassicEvent () {
    var e;
    if (doc.createEvent) {
      e = doc.createEvent('Event');
      e.initEvent(type, true, true);
    } else if (doc.createEventObject) {
      e = doc.createEventObject();
    }
    return e;
  }
  function makeCustomEvent () {
    return new customEvent(type, { detail: model });
  }
}

function wrapperFactory (el, type, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || global.event;
    e.target = e.target || e.srcElement;
    e.preventDefault = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    e.which = e.which || e.keyCode;
    fn.call(el, e);
  };
}

function wrap (el, type, fn) {
  var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
  hardCache.push({
    wrapper: wrapper,
    element: el,
    type: type,
    fn: fn
  });
  return wrapper;
}

function unwrap (el, type, fn) {
  var i = find(el, type, fn);
  if (i) {
    var wrapper = hardCache[i].wrapper;
    hardCache.splice(i, 1); // free up a tad of memory
    return wrapper;
  }
}

function find (el, type, fn) {
  var i, item;
  for (i = 0; i < hardCache.length; i++) {
    item = hardCache[i];
    if (item.element === el && item.type === type && item.fn === fn) {
      return i;
    }
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./eventmap":7,"custom-event":8}],7:[function(require,module,exports){
(function (global){
'use strict';

var eventmap = [];
var eventname = '';
var ron = /^on/;

for (eventname in global) {
  if (ron.test(eventname)) {
    eventmap.push(eventname.slice(2));
  }
}

module.exports = eventmap;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
(function (global){

var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
var si = typeof setImmediate === 'function', tick;
if (si) {
  tick = function (fn) { setImmediate(fn); };
} else {
  tick = function (fn) { setTimeout(fn, 0); };
}

module.exports = tick;
},{}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGFzc2VzLmpzIiwiZHJhZ3VsYS5qcyIsIm5vZGVfbW9kdWxlcy9hdG9hL2F0b2EuanMiLCJub2RlX21vZHVsZXMvY29udHJhL2RlYm91bmNlLmpzIiwibm9kZV9tb2R1bGVzL2NvbnRyYS9lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2Nyb3NzdmVudC9zcmMvY3Jvc3N2ZW50LmpzIiwibm9kZV9tb2R1bGVzL2Nyb3NzdmVudC9zcmMvZXZlbnRtYXAuanMiLCJub2RlX21vZHVsZXMvY3VzdG9tLWV2ZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RpY2t5L3RpY2t5LWJyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2htQkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FjaGUgPSB7fTtcbnZhciBzdGFydCA9ICcoPzpefFxcXFxzKSc7XG52YXIgZW5kID0gJyg/OlxcXFxzfCQpJztcblxuZnVuY3Rpb24gbG9va3VwQ2xhc3MgKGNsYXNzTmFtZSkge1xuICB2YXIgY2FjaGVkID0gY2FjaGVbY2xhc3NOYW1lXTtcbiAgaWYgKGNhY2hlZCkge1xuICAgIGNhY2hlZC5sYXN0SW5kZXggPSAwO1xuICB9IGVsc2Uge1xuICAgIGNhY2hlW2NsYXNzTmFtZV0gPSBjYWNoZWQgPSBuZXcgUmVnRXhwKHN0YXJ0ICsgY2xhc3NOYW1lICsgZW5kLCAnZycpO1xuICB9XG4gIHJldHVybiBjYWNoZWQ7XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzIChlbCwgY2xhc3NOYW1lKSB7XG4gIHZhciBjdXJyZW50ID0gZWwuY2xhc3NOYW1lO1xuICBpZiAoIWN1cnJlbnQubGVuZ3RoKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICB9IGVsc2UgaWYgKCFsb29rdXBDbGFzcyhjbGFzc05hbWUpLnRlc3QoY3VycmVudCkpIHtcbiAgICBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJtQ2xhc3MgKGVsLCBjbGFzc05hbWUpIHtcbiAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UobG9va3VwQ2xhc3MoY2xhc3NOYW1lKSwgJyAnKS50cmltKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZENsYXNzLFxuICBybTogcm1DbGFzc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVtaXR0ZXIgPSByZXF1aXJlKCdjb250cmEvZW1pdHRlcicpO1xudmFyIGNyb3NzdmVudCA9IHJlcXVpcmUoJ2Nyb3NzdmVudCcpO1xudmFyIGNsYXNzZXMgPSByZXF1aXJlKCcuL2NsYXNzZXMnKTtcbnZhciBkb2MgPSBkb2N1bWVudDtcbnZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuXG5mdW5jdGlvbiBkcmFndWxhIChpbml0aWFsQ29udGFpbmVycywgb3B0aW9ucykge1xuICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgaWYgKGxlbiA9PT0gMSAmJiBBcnJheS5pc0FycmF5KGluaXRpYWxDb250YWluZXJzKSA9PT0gZmFsc2UpIHtcbiAgICBvcHRpb25zID0gaW5pdGlhbENvbnRhaW5lcnM7XG4gICAgaW5pdGlhbENvbnRhaW5lcnMgPSBbXTtcbiAgfVxuICB2YXIgX21pcnJvcjsgLy8gbWlycm9yIGltYWdlXG4gIHZhciBfc291cmNlOyAvLyBzb3VyY2UgY29udGFpbmVyXG4gIHZhciBfaXRlbTsgLy8gaXRlbSBiZWluZyBkcmFnZ2VkXG4gIHZhciBfb2Zmc2V0WDsgLy8gcmVmZXJlbmNlIHhcbiAgdmFyIF9vZmZzZXRZOyAvLyByZWZlcmVuY2UgeVxuICB2YXIgX21vdmVYOyAvLyByZWZlcmVuY2UgbW92ZSB4XG4gIHZhciBfbW92ZVk7IC8vIHJlZmVyZW5jZSBtb3ZlIHlcbiAgdmFyIF9pbml0aWFsU2libGluZzsgLy8gcmVmZXJlbmNlIHNpYmxpbmcgd2hlbiBncmFiYmVkXG4gIHZhciBfY3VycmVudFNpYmxpbmc7IC8vIHJlZmVyZW5jZSBzaWJsaW5nIG5vd1xuICB2YXIgX2NvcHk7IC8vIGl0ZW0gdXNlZCBmb3IgY29weWluZ1xuICB2YXIgX3JlbmRlclRpbWVyOyAvLyB0aW1lciBmb3Igc2V0VGltZW91dCByZW5kZXJNaXJyb3JJbWFnZVxuICB2YXIgX2xhc3REcm9wVGFyZ2V0ID0gbnVsbDsgLy8gbGFzdCBjb250YWluZXIgaXRlbSB3YXMgb3ZlclxuICB2YXIgX2dyYWJiZWQ7IC8vIGhvbGRzIG1vdXNlZG93biBjb250ZXh0IHVudGlsIGZpcnN0IG1vdXNlbW92ZVxuXG4gIHZhciBvID0gb3B0aW9ucyB8fCB7fTtcbiAgaWYgKG8ubW92ZXMgPT09IHZvaWQgMCkgeyBvLm1vdmVzID0gYWx3YXlzOyB9XG4gIGlmIChvLmFjY2VwdHMgPT09IHZvaWQgMCkgeyBvLmFjY2VwdHMgPSBhbHdheXM7IH1cbiAgaWYgKG8uaW52YWxpZCA9PT0gdm9pZCAwKSB7IG8uaW52YWxpZCA9IGludmFsaWRUYXJnZXQ7IH1cbiAgaWYgKG8uY29udGFpbmVycyA9PT0gdm9pZCAwKSB7IG8uY29udGFpbmVycyA9IGluaXRpYWxDb250YWluZXJzIHx8IFtdOyB9XG4gIGlmIChvLmlzQ29udGFpbmVyID09PSB2b2lkIDApIHsgby5pc0NvbnRhaW5lciA9IG5ldmVyOyB9XG4gIGlmIChvLmNvcHkgPT09IHZvaWQgMCkgeyBvLmNvcHkgPSBmYWxzZTsgfVxuICBpZiAoby5jb3B5U29ydFNvdXJjZSA9PT0gdm9pZCAwKSB7IG8uY29weVNvcnRTb3VyY2UgPSBmYWxzZTsgfVxuICBpZiAoby5yZXZlcnRPblNwaWxsID09PSB2b2lkIDApIHsgby5yZXZlcnRPblNwaWxsID0gZmFsc2U7IH1cbiAgaWYgKG8ucmVtb3ZlT25TcGlsbCA9PT0gdm9pZCAwKSB7IG8ucmVtb3ZlT25TcGlsbCA9IGZhbHNlOyB9XG4gIGlmIChvLmRpcmVjdGlvbiA9PT0gdm9pZCAwKSB7IG8uZGlyZWN0aW9uID0gJ3ZlcnRpY2FsJzsgfVxuICBpZiAoby5pZ25vcmVJbnB1dFRleHRTZWxlY3Rpb24gPT09IHZvaWQgMCkgeyBvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbiA9IHRydWU7IH1cbiAgaWYgKG8ubWlycm9yQ29udGFpbmVyID09PSB2b2lkIDApIHsgby5taXJyb3JDb250YWluZXIgPSBkb2MuYm9keTsgfVxuXG4gIHZhciBkcmFrZSA9IGVtaXR0ZXIoe1xuICAgIGNvbnRhaW5lcnM6IG8uY29udGFpbmVycyxcbiAgICBzdGFydDogbWFudWFsU3RhcnQsXG4gICAgZW5kOiBlbmQsXG4gICAgY2FuY2VsOiBjYW5jZWwsXG4gICAgcmVtb3ZlOiByZW1vdmUsXG4gICAgZGVzdHJveTogZGVzdHJveSxcbiAgICBjYW5Nb3ZlOiBjYW5Nb3ZlLFxuICAgIGRyYWdnaW5nOiBmYWxzZVxuICB9KTtcblxuICBpZiAoby5yZW1vdmVPblNwaWxsID09PSB0cnVlKSB7XG4gICAgZHJha2Uub24oJ292ZXInLCBzcGlsbE92ZXIpLm9uKCdvdXQnLCBzcGlsbE91dCk7XG4gIH1cblxuICBldmVudHMoKTtcblxuICByZXR1cm4gZHJha2U7XG5cbiAgZnVuY3Rpb24gaXNDb250YWluZXIgKGVsKSB7XG4gICAgcmV0dXJuIGRyYWtlLmNvbnRhaW5lcnMuaW5kZXhPZihlbCkgIT09IC0xIHx8IG8uaXNDb250YWluZXIoZWwpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRzIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsIG9wLCAnbW91c2Vkb3duJywgZ3JhYik7XG4gICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgb3AsICdtb3VzZXVwJywgcmVsZWFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiBldmVudHVhbE1vdmVtZW50cyAocmVtb3ZlKSB7XG4gICAgdmFyIG9wID0gcmVtb3ZlID8gJ3JlbW92ZScgOiAnYWRkJztcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCBvcCwgJ21vdXNlbW92ZScsIHN0YXJ0QmVjYXVzZU1vdXNlTW92ZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZW1lbnRzIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIGNyb3NzdmVudFtvcF0oZG9jdW1lbnRFbGVtZW50LCAnc2VsZWN0c3RhcnQnLCBwcmV2ZW50R3JhYmJlZCk7IC8vIElFOFxuICAgIGNyb3NzdmVudFtvcF0oZG9jdW1lbnRFbGVtZW50LCAnY2xpY2snLCBwcmV2ZW50R3JhYmJlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBkZXN0cm95ICgpIHtcbiAgICBldmVudHModHJ1ZSk7XG4gICAgcmVsZWFzZSh7fSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcmV2ZW50R3JhYmJlZCAoZSkge1xuICAgIGlmIChfZ3JhYmJlZCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdyYWIgKGUpIHtcbiAgICBfbW92ZVggPSBlLmNsaWVudFg7XG4gICAgX21vdmVZID0gZS5jbGllbnRZO1xuXG4gICAgdmFyIGlnbm9yZSA9IHdoaWNoTW91c2VCdXR0b24oZSkgIT09IDEgfHwgZS5tZXRhS2V5IHx8IGUuY3RybEtleTtcbiAgICBpZiAoaWdub3JlKSB7XG4gICAgICByZXR1cm47IC8vIHdlIG9ubHkgY2FyZSBhYm91dCBob25lc3QtdG8tZ29kIGxlZnQgY2xpY2tzIGFuZCB0b3VjaCBldmVudHNcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSBlLnRhcmdldDtcbiAgICB2YXIgY29udGV4dCA9IGNhblN0YXJ0KGl0ZW0pO1xuICAgIGlmICghY29udGV4dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBfZ3JhYmJlZCA9IGNvbnRleHQ7XG4gICAgZXZlbnR1YWxNb3ZlbWVudHMoKTtcbiAgICBpZiAoZS50eXBlID09PSAnbW91c2Vkb3duJykge1xuICAgICAgaWYgKGlzSW5wdXQoaXRlbSkpIHsgLy8gc2VlIGFsc286IGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8yMDhcbiAgICAgICAgaXRlbS5mb2N1cygpOyAvLyBmaXhlcyBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMTc2XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIGZpeGVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8xNTVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydEJlY2F1c2VNb3VzZU1vdmVkIChlKSB7XG4gICAgaWYgKCFfZ3JhYmJlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAod2hpY2hNb3VzZUJ1dHRvbihlKSA9PT0gMCkge1xuICAgICAgcmVsZWFzZSh7fSk7XG4gICAgICByZXR1cm47IC8vIHdoZW4gdGV4dCBpcyBzZWxlY3RlZCBvbiBhbiBpbnB1dCBhbmQgdGhlbiBkcmFnZ2VkLCBtb3VzZXVwIGRvZXNuJ3QgZmlyZS4gdGhpcyBpcyBvdXIgb25seSBob3BlXG4gICAgfVxuICAgIC8vIHRydXRoeSBjaGVjayBmaXhlcyAjMjM5LCBlcXVhbGl0eSBmaXhlcyAjMjA3XG4gICAgaWYgKGUuY2xpZW50WCAhPT0gdm9pZCAwICYmIGUuY2xpZW50WCA9PT0gX21vdmVYICYmIGUuY2xpZW50WSAhPT0gdm9pZCAwICYmIGUuY2xpZW50WSA9PT0gX21vdmVZKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbikge1xuICAgICAgdmFyIGNsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpO1xuICAgICAgdmFyIGNsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpO1xuICAgICAgdmFyIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBkb2MuZWxlbWVudEZyb21Qb2ludChjbGllbnRYLCBjbGllbnRZKTtcbiAgICAgIGlmIChpc0lucHV0KGVsZW1lbnRCZWhpbmRDdXJzb3IpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZ3JhYmJlZCA9IF9ncmFiYmVkOyAvLyBjYWxsIHRvIGVuZCgpIHVuc2V0cyBfZ3JhYmJlZFxuICAgIGV2ZW50dWFsTW92ZW1lbnRzKHRydWUpO1xuICAgIG1vdmVtZW50cygpO1xuICAgIGVuZCgpO1xuICAgIHN0YXJ0KGdyYWJiZWQpO1xuXG4gICAgdmFyIG9mZnNldCA9IGdldE9mZnNldChfaXRlbSk7XG4gICAgX29mZnNldFggPSBnZXRDb29yZCgncGFnZVgnLCBlKSAtIG9mZnNldC5sZWZ0O1xuICAgIF9vZmZzZXRZID0gZ2V0Q29vcmQoJ3BhZ2VZJywgZSkgLSBvZmZzZXQudG9wO1xuXG4gICAgY2xhc3Nlcy5hZGQoX2NvcHkgfHwgX2l0ZW0sICdndS10cmFuc2l0Jyk7XG4gICAgcmVuZGVyTWlycm9ySW1hZ2UoKTtcbiAgICBkcmFnKGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuU3RhcnQgKGl0ZW0pIHtcbiAgICBpZiAoZHJha2UuZHJhZ2dpbmcgJiYgX21pcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXNDb250YWluZXIoaXRlbSkpIHtcbiAgICAgIHJldHVybjsgLy8gZG9uJ3QgZHJhZyBjb250YWluZXIgaXRzZWxmXG4gICAgfVxuICAgIHZhciBoYW5kbGUgPSBpdGVtO1xuICAgIHdoaWxlIChnZXRQYXJlbnQoaXRlbSkgJiYgaXNDb250YWluZXIoZ2V0UGFyZW50KGl0ZW0pKSA9PT0gZmFsc2UpIHtcbiAgICAgIGlmIChvLmludmFsaWQoaXRlbSwgaGFuZGxlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpdGVtID0gZ2V0UGFyZW50KGl0ZW0pOyAvLyBkcmFnIHRhcmdldCBzaG91bGQgYmUgYSB0b3AgZWxlbWVudFxuICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHNvdXJjZSA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAoIXNvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoby5pbnZhbGlkKGl0ZW0sIGhhbmRsZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbW92YWJsZSA9IG8ubW92ZXMoaXRlbSwgc291cmNlLCBoYW5kbGUsIG5leHRFbChpdGVtKSk7XG4gICAgaWYgKCFtb3ZhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICBzb3VyY2U6IHNvdXJjZVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjYW5Nb3ZlIChpdGVtKSB7XG4gICAgcmV0dXJuICEhY2FuU3RhcnQoaXRlbSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYW51YWxTdGFydCAoaXRlbSkge1xuICAgIHZhciBjb250ZXh0ID0gY2FuU3RhcnQoaXRlbSk7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHN0YXJ0KGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0IChjb250ZXh0KSB7XG4gICAgaWYgKGlzQ29weShjb250ZXh0Lml0ZW0sIGNvbnRleHQuc291cmNlKSkge1xuICAgICAgX2NvcHkgPSBjb250ZXh0Lml0ZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgICAgZHJha2UuZW1pdCgnY2xvbmVkJywgX2NvcHksIGNvbnRleHQuaXRlbSwgJ2NvcHknKTtcbiAgICB9XG5cbiAgICBfc291cmNlID0gY29udGV4dC5zb3VyY2U7XG4gICAgX2l0ZW0gPSBjb250ZXh0Lml0ZW07XG4gICAgX2luaXRpYWxTaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nID0gbmV4dEVsKGNvbnRleHQuaXRlbSk7XG5cbiAgICBkcmFrZS5kcmFnZ2luZyA9IHRydWU7XG4gICAgZHJha2UuZW1pdCgnZHJhZycsIF9pdGVtLCBfc291cmNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGludmFsaWRUYXJnZXQgKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZCAoKSB7XG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIGRyb3AoaXRlbSwgZ2V0UGFyZW50KGl0ZW0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuZ3JhYiAoKSB7XG4gICAgX2dyYWJiZWQgPSBmYWxzZTtcbiAgICBldmVudHVhbE1vdmVtZW50cyh0cnVlKTtcbiAgICBtb3ZlbWVudHModHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWxlYXNlIChlKSB7XG4gICAgdW5ncmFiKCk7XG5cbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIGNsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpO1xuICAgIHZhciBjbGllbnRZID0gZ2V0Q29vcmQoJ2NsaWVudFknLCBlKTtcbiAgICB2YXIgZWxlbWVudEJlaGluZEN1cnNvciA9IGdldEVsZW1lbnRCZWhpbmRQb2ludChfbWlycm9yLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICB2YXIgZHJvcFRhcmdldCA9IGZpbmREcm9wVGFyZ2V0KGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIGlmIChkcm9wVGFyZ2V0ICYmICgoX2NvcHkgJiYgby5jb3B5U29ydFNvdXJjZSkgfHwgKCFfY29weSB8fCBkcm9wVGFyZ2V0ICE9PSBfc291cmNlKSkpIHtcbiAgICAgIGRyb3AoaXRlbSwgZHJvcFRhcmdldCk7XG4gICAgfSBlbHNlIGlmIChvLnJlbW92ZU9uU3BpbGwpIHtcbiAgICAgIHJlbW92ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYW5jZWwoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkcm9wIChpdGVtLCB0YXJnZXQpIHtcbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmIChfY29weSAmJiBvLmNvcHlTb3J0U291cmNlICYmIHRhcmdldCA9PT0gX3NvdXJjZSkge1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKF9pdGVtKTtcbiAgICB9XG4gICAgaWYgKGlzSW5pdGlhbFBsYWNlbWVudCh0YXJnZXQpKSB7XG4gICAgICBkcmFrZS5lbWl0KCdjYW5jZWwnLCBpdGVtLCBfc291cmNlLCBfc291cmNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJha2UuZW1pdCgnZHJvcCcsIGl0ZW0sIHRhcmdldCwgX3NvdXJjZSwgX2N1cnJlbnRTaWJsaW5nKTtcbiAgICB9XG4gICAgY2xlYW51cCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlICgpIHtcbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgfVxuICAgIGRyYWtlLmVtaXQoX2NvcHkgPyAnY2FuY2VsJyA6ICdyZW1vdmUnLCBpdGVtLCBwYXJlbnQsIF9zb3VyY2UpO1xuICAgIGNsZWFudXAoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCAocmV2ZXJ0KSB7XG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcmV2ZXJ0cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwID8gcmV2ZXJ0IDogby5yZXZlcnRPblNwaWxsO1xuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcbiAgICB2YXIgaW5pdGlhbCA9IGlzSW5pdGlhbFBsYWNlbWVudChwYXJlbnQpO1xuICAgIGlmIChpbml0aWFsID09PSBmYWxzZSAmJiByZXZlcnRzKSB7XG4gICAgICBpZiAoX2NvcHkpIHtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChfY29weSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9zb3VyY2UuaW5zZXJ0QmVmb3JlKGl0ZW0sIF9pbml0aWFsU2libGluZyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpbml0aWFsIHx8IHJldmVydHMpIHtcbiAgICAgIGRyYWtlLmVtaXQoJ2NhbmNlbCcsIGl0ZW0sIF9zb3VyY2UsIF9zb3VyY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkcmFrZS5lbWl0KCdkcm9wJywgaXRlbSwgcGFyZW50LCBfc291cmNlLCBfY3VycmVudFNpYmxpbmcpO1xuICAgIH1cbiAgICBjbGVhbnVwKCk7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbnVwICgpIHtcbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHVuZ3JhYigpO1xuICAgIHJlbW92ZU1pcnJvckltYWdlKCk7XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGNsYXNzZXMucm0oaXRlbSwgJ2d1LXRyYW5zaXQnKTtcbiAgICB9XG4gICAgaWYgKF9yZW5kZXJUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KF9yZW5kZXJUaW1lcik7XG4gICAgfVxuICAgIGRyYWtlLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgaWYgKF9sYXN0RHJvcFRhcmdldCkge1xuICAgICAgZHJha2UuZW1pdCgnb3V0JywgaXRlbSwgX2xhc3REcm9wVGFyZ2V0LCBfc291cmNlKTtcbiAgICB9XG4gICAgZHJha2UuZW1pdCgnZHJhZ2VuZCcsIGl0ZW0pO1xuICAgIF9zb3VyY2UgPSBfaXRlbSA9IF9jb3B5ID0gX2luaXRpYWxTaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nID0gX3JlbmRlclRpbWVyID0gX2xhc3REcm9wVGFyZ2V0ID0gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzSW5pdGlhbFBsYWNlbWVudCAodGFyZ2V0LCBzKSB7XG4gICAgdmFyIHNpYmxpbmc7XG4gICAgaWYgKHMgIT09IHZvaWQgMCkge1xuICAgICAgc2libGluZyA9IHM7XG4gICAgfSBlbHNlIGlmIChfbWlycm9yKSB7XG4gICAgICBzaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICBzaWJsaW5nID0gbmV4dEVsKF9jb3B5IHx8IF9pdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldCA9PT0gX3NvdXJjZSAmJiBzaWJsaW5nID09PSBfaW5pdGlhbFNpYmxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kRHJvcFRhcmdldCAoZWxlbWVudEJlaGluZEN1cnNvciwgY2xpZW50WCwgY2xpZW50WSkge1xuICAgIHZhciB0YXJnZXQgPSBlbGVtZW50QmVoaW5kQ3Vyc29yO1xuICAgIHdoaWxlICh0YXJnZXQgJiYgIWFjY2VwdGVkKCkpIHtcbiAgICAgIHRhcmdldCA9IGdldFBhcmVudCh0YXJnZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuXG4gICAgZnVuY3Rpb24gYWNjZXB0ZWQgKCkge1xuICAgICAgdmFyIGRyb3BwYWJsZSA9IGlzQ29udGFpbmVyKHRhcmdldCk7XG4gICAgICBpZiAoZHJvcHBhYmxlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBpbW1lZGlhdGUgPSBnZXRJbW1lZGlhdGVDaGlsZCh0YXJnZXQsIGVsZW1lbnRCZWhpbmRDdXJzb3IpO1xuICAgICAgdmFyIHJlZmVyZW5jZSA9IGdldFJlZmVyZW5jZSh0YXJnZXQsIGltbWVkaWF0ZSwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgICB2YXIgaW5pdGlhbCA9IGlzSW5pdGlhbFBsYWNlbWVudCh0YXJnZXQsIHJlZmVyZW5jZSk7XG4gICAgICBpZiAoaW5pdGlhbCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gc2hvdWxkIGFsd2F5cyBiZSBhYmxlIHRvIGRyb3AgaXQgcmlnaHQgYmFjayB3aGVyZSBpdCB3YXNcbiAgICAgIH1cbiAgICAgIHJldHVybiBvLmFjY2VwdHMoX2l0ZW0sIHRhcmdldCwgX3NvdXJjZSwgcmVmZXJlbmNlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkcmFnIChlKSB7XG4gICAgaWYgKCFfbWlycm9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBjbGllbnRYID0gZ2V0Q29vcmQoJ2NsaWVudFgnLCBlKTtcbiAgICB2YXIgY2xpZW50WSA9IGdldENvb3JkKCdjbGllbnRZJywgZSk7XG4gICAgdmFyIHggPSBjbGllbnRYIC0gX29mZnNldFg7XG4gICAgdmFyIHkgPSBjbGllbnRZIC0gX29mZnNldFk7XG5cbiAgICBfbWlycm9yLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcbiAgICBfbWlycm9yLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuXG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB2YXIgZWxlbWVudEJlaGluZEN1cnNvciA9IGdldEVsZW1lbnRCZWhpbmRQb2ludChfbWlycm9yLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICB2YXIgZHJvcFRhcmdldCA9IGZpbmREcm9wVGFyZ2V0KGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIHZhciBjaGFuZ2VkID0gZHJvcFRhcmdldCAhPT0gbnVsbCAmJiBkcm9wVGFyZ2V0ICE9PSBfbGFzdERyb3BUYXJnZXQ7XG4gICAgaWYgKGNoYW5nZWQgfHwgZHJvcFRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgb3V0KCk7XG4gICAgICBfbGFzdERyb3BUYXJnZXQgPSBkcm9wVGFyZ2V0O1xuICAgICAgb3ZlcigpO1xuICAgIH1cbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmIChkcm9wVGFyZ2V0ID09PSBfc291cmNlICYmIF9jb3B5ICYmICFvLmNvcHlTb3J0U291cmNlKSB7XG4gICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJlZmVyZW5jZTtcbiAgICB2YXIgaW1tZWRpYXRlID0gZ2V0SW1tZWRpYXRlQ2hpbGQoZHJvcFRhcmdldCwgZWxlbWVudEJlaGluZEN1cnNvcik7XG4gICAgaWYgKGltbWVkaWF0ZSAhPT0gbnVsbCkge1xuICAgICAgcmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlKGRyb3BUYXJnZXQsIGltbWVkaWF0ZSwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgfSBlbHNlIGlmIChvLnJldmVydE9uU3BpbGwgPT09IHRydWUgJiYgIV9jb3B5KSB7XG4gICAgICByZWZlcmVuY2UgPSBfaW5pdGlhbFNpYmxpbmc7XG4gICAgICBkcm9wVGFyZ2V0ID0gX3NvdXJjZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKF9jb3B5ICYmIHBhcmVudCkge1xuICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChcbiAgICAgIChyZWZlcmVuY2UgPT09IG51bGwgJiYgY2hhbmdlZCkgfHxcbiAgICAgIHJlZmVyZW5jZSAhPT0gaXRlbSAmJlxuICAgICAgcmVmZXJlbmNlICE9PSBuZXh0RWwoaXRlbSlcbiAgICApIHtcbiAgICAgIF9jdXJyZW50U2libGluZyA9IHJlZmVyZW5jZTtcbiAgICAgIGRyb3BUYXJnZXQuaW5zZXJ0QmVmb3JlKGl0ZW0sIHJlZmVyZW5jZSk7XG4gICAgICBkcmFrZS5lbWl0KCdzaGFkb3cnLCBpdGVtLCBkcm9wVGFyZ2V0LCBfc291cmNlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbW92ZWQgKHR5cGUpIHsgZHJha2UuZW1pdCh0eXBlLCBpdGVtLCBfbGFzdERyb3BUYXJnZXQsIF9zb3VyY2UpOyB9XG4gICAgZnVuY3Rpb24gb3ZlciAoKSB7IGlmIChjaGFuZ2VkKSB7IG1vdmVkKCdvdmVyJyk7IH0gfVxuICAgIGZ1bmN0aW9uIG91dCAoKSB7IGlmIChfbGFzdERyb3BUYXJnZXQpIHsgbW92ZWQoJ291dCcpOyB9IH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNwaWxsT3ZlciAoZWwpIHtcbiAgICBjbGFzc2VzLnJtKGVsLCAnZ3UtaGlkZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3BpbGxPdXQgKGVsKSB7XG4gICAgaWYgKGRyYWtlLmRyYWdnaW5nKSB7IGNsYXNzZXMuYWRkKGVsLCAnZ3UtaGlkZScpOyB9XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJNaXJyb3JJbWFnZSAoKSB7XG4gICAgaWYgKF9taXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJlY3QgPSBfaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBfbWlycm9yID0gX2l0ZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgIF9taXJyb3Iuc3R5bGUud2lkdGggPSBnZXRSZWN0V2lkdGgocmVjdCkgKyAncHgnO1xuICAgIF9taXJyb3Iuc3R5bGUuaGVpZ2h0ID0gZ2V0UmVjdEhlaWdodChyZWN0KSArICdweCc7XG4gICAgY2xhc3Nlcy5ybShfbWlycm9yLCAnZ3UtdHJhbnNpdCcpO1xuICAgIGNsYXNzZXMuYWRkKF9taXJyb3IsICdndS1taXJyb3InKTtcbiAgICBvLm1pcnJvckNvbnRhaW5lci5hcHBlbmRDaGlsZChfbWlycm9yKTtcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCAnYWRkJywgJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgIGNsYXNzZXMuYWRkKG8ubWlycm9yQ29udGFpbmVyLCAnZ3UtdW5zZWxlY3RhYmxlJyk7XG4gICAgZHJha2UuZW1pdCgnY2xvbmVkJywgX21pcnJvciwgX2l0ZW0sICdtaXJyb3InKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZU1pcnJvckltYWdlICgpIHtcbiAgICBpZiAoX21pcnJvcikge1xuICAgICAgY2xhc3Nlcy5ybShvLm1pcnJvckNvbnRhaW5lciwgJ2d1LXVuc2VsZWN0YWJsZScpO1xuICAgICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgJ3JlbW92ZScsICdtb3VzZW1vdmUnLCBkcmFnKTtcbiAgICAgIGdldFBhcmVudChfbWlycm9yKS5yZW1vdmVDaGlsZChfbWlycm9yKTtcbiAgICAgIF9taXJyb3IgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEltbWVkaWF0ZUNoaWxkIChkcm9wVGFyZ2V0LCB0YXJnZXQpIHtcbiAgICB2YXIgaW1tZWRpYXRlID0gdGFyZ2V0O1xuICAgIHdoaWxlIChpbW1lZGlhdGUgIT09IGRyb3BUYXJnZXQgJiYgZ2V0UGFyZW50KGltbWVkaWF0ZSkgIT09IGRyb3BUYXJnZXQpIHtcbiAgICAgIGltbWVkaWF0ZSA9IGdldFBhcmVudChpbW1lZGlhdGUpO1xuICAgIH1cbiAgICBpZiAoaW1tZWRpYXRlID09PSBkb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gaW1tZWRpYXRlO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmVmZXJlbmNlIChkcm9wVGFyZ2V0LCB0YXJnZXQsIHgsIHkpIHtcbiAgICB2YXIgaG9yaXpvbnRhbCA9IG8uZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gICAgdmFyIHJlZmVyZW5jZSA9IHRhcmdldCAhPT0gZHJvcFRhcmdldCA/IGluc2lkZSgpIDogb3V0c2lkZSgpO1xuICAgIHJldHVybiByZWZlcmVuY2U7XG5cbiAgICBmdW5jdGlvbiBvdXRzaWRlICgpIHsgLy8gc2xvd2VyLCBidXQgYWJsZSB0byBmaWd1cmUgb3V0IGFueSBwb3NpdGlvblxuICAgICAgdmFyIGxlbiA9IGRyb3BUYXJnZXQuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgdmFyIGk7XG4gICAgICB2YXIgZWw7XG4gICAgICB2YXIgcmVjdDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBlbCA9IGRyb3BUYXJnZXQuY2hpbGRyZW5baV07XG4gICAgICAgIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKGhvcml6b250YWwgJiYgKHJlY3QubGVmdCArIHJlY3Qud2lkdGggLyAyKSA+IHgpIHsgcmV0dXJuIGVsOyB9XG4gICAgICAgIGlmICghaG9yaXpvbnRhbCAmJiAocmVjdC50b3AgKyByZWN0LmhlaWdodCAvIDIpID4geSkgeyByZXR1cm4gZWw7IH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc2lkZSAoKSB7IC8vIGZhc3RlciwgYnV0IG9ubHkgYXZhaWxhYmxlIGlmIGRyb3BwZWQgaW5zaWRlIGEgY2hpbGQgZWxlbWVudFxuICAgICAgdmFyIHJlY3QgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBpZiAoaG9yaXpvbnRhbCkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh4ID4gcmVjdC5sZWZ0ICsgZ2V0UmVjdFdpZHRoKHJlY3QpIC8gMik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh5ID4gcmVjdC50b3AgKyBnZXRSZWN0SGVpZ2h0KHJlY3QpIC8gMik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZSAoYWZ0ZXIpIHtcbiAgICAgIHJldHVybiBhZnRlciA/IG5leHRFbCh0YXJnZXQpIDogdGFyZ2V0O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQ29weSAoaXRlbSwgY29udGFpbmVyKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvLmNvcHkgPT09ICdib29sZWFuJyA/IG8uY29weSA6IG8uY29weShpdGVtLCBjb250YWluZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRvdWNoeSAoZWwsIG9wLCB0eXBlLCBmbikge1xuICB2YXIgdG91Y2ggPSB7XG4gICAgbW91c2V1cDogJ3RvdWNoZW5kJyxcbiAgICBtb3VzZWRvd246ICd0b3VjaHN0YXJ0JyxcbiAgICBtb3VzZW1vdmU6ICd0b3VjaG1vdmUnXG4gIH07XG4gIHZhciBwb2ludGVycyA9IHtcbiAgICBtb3VzZXVwOiAncG9pbnRlcnVwJyxcbiAgICBtb3VzZWRvd246ICdwb2ludGVyZG93bicsXG4gICAgbW91c2Vtb3ZlOiAncG9pbnRlcm1vdmUnXG4gIH07XG4gIHZhciBtaWNyb3NvZnQgPSB7XG4gICAgbW91c2V1cDogJ01TUG9pbnRlclVwJyxcbiAgICBtb3VzZWRvd246ICdNU1BvaW50ZXJEb3duJyxcbiAgICBtb3VzZW1vdmU6ICdNU1BvaW50ZXJNb3ZlJ1xuICB9O1xuICBpZiAoZ2xvYmFsLm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCkge1xuICAgIGNyb3NzdmVudFtvcF0oZWwsIHBvaW50ZXJzW3R5cGVdLCBmbik7XG4gIH0gZWxzZSBpZiAoZ2xvYmFsLm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgbWljcm9zb2Z0W3R5cGVdLCBmbik7XG4gIH0gZWxzZSB7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgdG91Y2hbdHlwZV0sIGZuKTtcbiAgICBjcm9zc3ZlbnRbb3BdKGVsLCB0eXBlLCBmbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gd2hpY2hNb3VzZUJ1dHRvbiAoZSkge1xuICBpZiAoZS50b3VjaGVzICE9PSB2b2lkIDApIHsgcmV0dXJuIGUudG91Y2hlcy5sZW5ndGg7IH1cbiAgaWYgKGUud2hpY2ggIT09IHZvaWQgMCAmJiBlLndoaWNoICE9PSAwKSB7IHJldHVybiBlLndoaWNoOyB9IC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMjYxXG4gIGlmIChlLmJ1dHRvbnMgIT09IHZvaWQgMCkgeyByZXR1cm4gZS5idXR0b25zOyB9XG4gIHZhciBidXR0b24gPSBlLmJ1dHRvbjtcbiAgaWYgKGJ1dHRvbiAhPT0gdm9pZCAwKSB7IC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iLzk5ZThmZjFiYWE3YWUzNDFlOTRiYjg5YzNlODQ1NzBjN2MzYWQ5ZWEvc3JjL2V2ZW50LmpzI0w1NzMtTDU3NVxuICAgIHJldHVybiBidXR0b24gJiAxID8gMSA6IGJ1dHRvbiAmIDIgPyAzIDogKGJ1dHRvbiAmIDQgPyAyIDogMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0T2Zmc2V0IChlbCkge1xuICB2YXIgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIGxlZnQ6IHJlY3QubGVmdCArIGdldFNjcm9sbCgnc2Nyb2xsTGVmdCcsICdwYWdlWE9mZnNldCcpLFxuICAgIHRvcDogcmVjdC50b3AgKyBnZXRTY3JvbGwoJ3Njcm9sbFRvcCcsICdwYWdlWU9mZnNldCcpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFNjcm9sbCAoc2Nyb2xsUHJvcCwgb2Zmc2V0UHJvcCkge1xuICBpZiAodHlwZW9mIGdsb2JhbFtvZmZzZXRQcm9wXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZ2xvYmFsW29mZnNldFByb3BdO1xuICB9XG4gIGlmIChkb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50RWxlbWVudFtzY3JvbGxQcm9wXTtcbiAgfVxuICByZXR1cm4gZG9jLmJvZHlbc2Nyb2xsUHJvcF07XG59XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRCZWhpbmRQb2ludCAocG9pbnQsIHgsIHkpIHtcbiAgdmFyIHAgPSBwb2ludCB8fCB7fTtcbiAgdmFyIHN0YXRlID0gcC5jbGFzc05hbWU7XG4gIHZhciBlbDtcbiAgcC5jbGFzc05hbWUgKz0gJyBndS1oaWRlJztcbiAgZWwgPSBkb2MuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgcC5jbGFzc05hbWUgPSBzdGF0ZTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiBuZXZlciAoKSB7IHJldHVybiBmYWxzZTsgfVxuZnVuY3Rpb24gYWx3YXlzICgpIHsgcmV0dXJuIHRydWU7IH1cbmZ1bmN0aW9uIGdldFJlY3RXaWR0aCAocmVjdCkgeyByZXR1cm4gcmVjdC53aWR0aCB8fCAocmVjdC5yaWdodCAtIHJlY3QubGVmdCk7IH1cbmZ1bmN0aW9uIGdldFJlY3RIZWlnaHQgKHJlY3QpIHsgcmV0dXJuIHJlY3QuaGVpZ2h0IHx8IChyZWN0LmJvdHRvbSAtIHJlY3QudG9wKTsgfVxuZnVuY3Rpb24gZ2V0UGFyZW50IChlbCkgeyByZXR1cm4gZWwucGFyZW50Tm9kZSA9PT0gZG9jID8gbnVsbCA6IGVsLnBhcmVudE5vZGU7IH1cbmZ1bmN0aW9uIGlzSW5wdXQgKGVsKSB7IHJldHVybiBlbC50YWdOYW1lID09PSAnSU5QVVQnIHx8IGVsLnRhZ05hbWUgPT09ICdURVhUQVJFQScgfHwgZWwudGFnTmFtZSA9PT0gJ1NFTEVDVCcgfHwgaXNFZGl0YWJsZShlbCk7IH1cbmZ1bmN0aW9uIGlzRWRpdGFibGUgKGVsKSB7XG4gIGlmICghZWwpIHsgcmV0dXJuIGZhbHNlOyB9IC8vIG5vIHBhcmVudHMgd2VyZSBlZGl0YWJsZVxuICBpZiAoZWwuY29udGVudEVkaXRhYmxlID09PSAnZmFsc2UnKSB7IHJldHVybiBmYWxzZTsgfSAvLyBzdG9wIHRoZSBsb29rdXBcbiAgaWYgKGVsLmNvbnRlbnRFZGl0YWJsZSA9PT0gJ3RydWUnKSB7IHJldHVybiB0cnVlOyB9IC8vIGZvdW5kIGEgY29udGVudEVkaXRhYmxlIGVsZW1lbnQgaW4gdGhlIGNoYWluXG4gIHJldHVybiBpc0VkaXRhYmxlKGdldFBhcmVudChlbCkpOyAvLyBjb250ZW50RWRpdGFibGUgaXMgc2V0IHRvICdpbmhlcml0J1xufVxuXG5mdW5jdGlvbiBuZXh0RWwgKGVsKSB7XG4gIHJldHVybiBlbC5uZXh0RWxlbWVudFNpYmxpbmcgfHwgbWFudWFsbHkoKTtcbiAgZnVuY3Rpb24gbWFudWFsbHkgKCkge1xuICAgIHZhciBzaWJsaW5nID0gZWw7XG4gICAgZG8ge1xuICAgICAgc2libGluZyA9IHNpYmxpbmcubmV4dFNpYmxpbmc7XG4gICAgfSB3aGlsZSAoc2libGluZyAmJiBzaWJsaW5nLm5vZGVUeXBlICE9PSAxKTtcbiAgICByZXR1cm4gc2libGluZztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRFdmVudEhvc3QgKGUpIHtcbiAgLy8gb24gdG91Y2hlbmQgZXZlbnQsIHdlIGhhdmUgdG8gdXNlIGBlLmNoYW5nZWRUb3VjaGVzYFxuICAvLyBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83MTkyNTYzL3RvdWNoZW5kLWV2ZW50LXByb3BlcnRpZXNcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8zNFxuICBpZiAoZS50YXJnZXRUb3VjaGVzICYmIGUudGFyZ2V0VG91Y2hlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZS50YXJnZXRUb3VjaGVzWzBdO1xuICB9XG4gIGlmIChlLmNoYW5nZWRUb3VjaGVzICYmIGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNbMF07XG4gIH1cbiAgcmV0dXJuIGU7XG59XG5cbmZ1bmN0aW9uIGdldENvb3JkIChjb29yZCwgZSkge1xuICB2YXIgaG9zdCA9IGdldEV2ZW50SG9zdChlKTtcbiAgdmFyIG1pc3NNYXAgPSB7XG4gICAgcGFnZVg6ICdjbGllbnRYJywgLy8gSUU4XG4gICAgcGFnZVk6ICdjbGllbnRZJyAvLyBJRThcbiAgfTtcbiAgaWYgKGNvb3JkIGluIG1pc3NNYXAgJiYgIShjb29yZCBpbiBob3N0KSAmJiBtaXNzTWFwW2Nvb3JkXSBpbiBob3N0KSB7XG4gICAgY29vcmQgPSBtaXNzTWFwW2Nvb3JkXTtcbiAgfVxuICByZXR1cm4gaG9zdFtjb29yZF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZHJhZ3VsYTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXRvYSAoYSwgbikgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYSwgbik7IH1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRpY2t5ID0gcmVxdWlyZSgndGlja3knKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWJvdW5jZSAoZm4sIGFyZ3MsIGN0eCkge1xuICBpZiAoIWZuKSB7IHJldHVybjsgfVxuICB0aWNreShmdW5jdGlvbiBydW4gKCkge1xuICAgIGZuLmFwcGx5KGN0eCB8fCBudWxsLCBhcmdzIHx8IFtdKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXRvYSA9IHJlcXVpcmUoJ2F0b2EnKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vZGVib3VuY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbWl0dGVyICh0aGluZywgb3B0aW9ucykge1xuICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBldnQgPSB7fTtcbiAgaWYgKHRoaW5nID09PSB1bmRlZmluZWQpIHsgdGhpbmcgPSB7fTsgfVxuICB0aGluZy5vbiA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgIGlmICghZXZ0W3R5cGVdKSB7XG4gICAgICBldnRbdHlwZV0gPSBbZm5dO1xuICAgIH0gZWxzZSB7XG4gICAgICBldnRbdHlwZV0ucHVzaChmbik7XG4gICAgfVxuICAgIHJldHVybiB0aGluZztcbiAgfTtcbiAgdGhpbmcub25jZSA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgIGZuLl9vbmNlID0gdHJ1ZTsgLy8gdGhpbmcub2ZmKGZuKSBzdGlsbCB3b3JrcyFcbiAgICB0aGluZy5vbih0eXBlLCBmbik7XG4gICAgcmV0dXJuIHRoaW5nO1xuICB9O1xuICB0aGluZy5vZmYgPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKGMgPT09IDEpIHtcbiAgICAgIGRlbGV0ZSBldnRbdHlwZV07XG4gICAgfSBlbHNlIGlmIChjID09PSAwKSB7XG4gICAgICBldnQgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGV0ID0gZXZ0W3R5cGVdO1xuICAgICAgaWYgKCFldCkgeyByZXR1cm4gdGhpbmc7IH1cbiAgICAgIGV0LnNwbGljZShldC5pbmRleE9mKGZuKSwgMSk7XG4gICAgfVxuICAgIHJldHVybiB0aGluZztcbiAgfTtcbiAgdGhpbmcuZW1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IGF0b2EoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpbmcuZW1pdHRlclNuYXBzaG90KGFyZ3Muc2hpZnQoKSkuYXBwbHkodGhpcywgYXJncyk7XG4gIH07XG4gIHRoaW5nLmVtaXR0ZXJTbmFwc2hvdCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgdmFyIGV0ID0gKGV2dFt0eXBlXSB8fCBbXSkuc2xpY2UoMCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gYXRvYShhcmd1bWVudHMpO1xuICAgICAgdmFyIGN0eCA9IHRoaXMgfHwgdGhpbmc7XG4gICAgICBpZiAodHlwZSA9PT0gJ2Vycm9yJyAmJiBvcHRzLnRocm93cyAhPT0gZmFsc2UgJiYgIWV0Lmxlbmd0aCkgeyB0aHJvdyBhcmdzLmxlbmd0aCA9PT0gMSA/IGFyZ3NbMF0gOiBhcmdzOyB9XG4gICAgICBldC5mb3JFYWNoKGZ1bmN0aW9uIGVtaXR0ZXIgKGxpc3Rlbikge1xuICAgICAgICBpZiAob3B0cy5hc3luYykgeyBkZWJvdW5jZShsaXN0ZW4sIGFyZ3MsIGN0eCk7IH0gZWxzZSB7IGxpc3Rlbi5hcHBseShjdHgsIGFyZ3MpOyB9XG4gICAgICAgIGlmIChsaXN0ZW4uX29uY2UpIHsgdGhpbmcub2ZmKHR5cGUsIGxpc3Rlbik7IH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaW5nO1xuICAgIH07XG4gIH07XG4gIHJldHVybiB0aGluZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjdXN0b21FdmVudCA9IHJlcXVpcmUoJ2N1c3RvbS1ldmVudCcpO1xudmFyIGV2ZW50bWFwID0gcmVxdWlyZSgnLi9ldmVudG1hcCcpO1xudmFyIGRvYyA9IGdsb2JhbC5kb2N1bWVudDtcbnZhciBhZGRFdmVudCA9IGFkZEV2ZW50RWFzeTtcbnZhciByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50RWFzeTtcbnZhciBoYXJkQ2FjaGUgPSBbXTtcblxuaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICBhZGRFdmVudCA9IGFkZEV2ZW50SGFyZDtcbiAgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEhhcmQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZEV2ZW50LFxuICByZW1vdmU6IHJlbW92ZUV2ZW50LFxuICBmYWJyaWNhdGU6IGZhYnJpY2F0ZUV2ZW50XG59O1xuXG5mdW5jdGlvbiBhZGRFdmVudEVhc3kgKGVsLCB0eXBlLCBmbiwgY2FwdHVyaW5nKSB7XG4gIHJldHVybiBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJpbmcpO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudEhhcmQgKGVsLCB0eXBlLCBmbikge1xuICByZXR1cm4gZWwuYXR0YWNoRXZlbnQoJ29uJyArIHR5cGUsIHdyYXAoZWwsIHR5cGUsIGZuKSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50RWFzeSAoZWwsIHR5cGUsIGZuLCBjYXB0dXJpbmcpIHtcbiAgcmV0dXJuIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmluZyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50SGFyZCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBsaXN0ZW5lciA9IHVud3JhcChlbCwgdHlwZSwgZm4pO1xuICBpZiAobGlzdGVuZXIpIHtcbiAgICByZXR1cm4gZWwuZGV0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmYWJyaWNhdGVFdmVudCAoZWwsIHR5cGUsIG1vZGVsKSB7XG4gIHZhciBlID0gZXZlbnRtYXAuaW5kZXhPZih0eXBlKSA9PT0gLTEgPyBtYWtlQ3VzdG9tRXZlbnQoKSA6IG1ha2VDbGFzc2ljRXZlbnQoKTtcbiAgaWYgKGVsLmRpc3BhdGNoRXZlbnQpIHtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KGUpO1xuICB9IGVsc2Uge1xuICAgIGVsLmZpcmVFdmVudCgnb24nICsgdHlwZSwgZSk7XG4gIH1cbiAgZnVuY3Rpb24gbWFrZUNsYXNzaWNFdmVudCAoKSB7XG4gICAgdmFyIGU7XG4gICAgaWYgKGRvYy5jcmVhdGVFdmVudCkge1xuICAgICAgZSA9IGRvYy5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgIGUuaW5pdEV2ZW50KHR5cGUsIHRydWUsIHRydWUpO1xuICAgIH0gZWxzZSBpZiAoZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KSB7XG4gICAgICBlID0gZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgfVxuICAgIHJldHVybiBlO1xuICB9XG4gIGZ1bmN0aW9uIG1ha2VDdXN0b21FdmVudCAoKSB7XG4gICAgcmV0dXJuIG5ldyBjdXN0b21FdmVudCh0eXBlLCB7IGRldGFpbDogbW9kZWwgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JhcHBlckZhY3RvcnkgKGVsLCB0eXBlLCBmbikge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcHBlciAob3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBlID0gb3JpZ2luYWxFdmVudCB8fCBnbG9iYWwuZXZlbnQ7XG4gICAgZS50YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCA9IGUucHJldmVudERlZmF1bHQgfHwgZnVuY3Rpb24gcHJldmVudERlZmF1bHQgKCkgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH07XG4gICAgZS5zdG9wUHJvcGFnYXRpb24gPSBlLnN0b3BQcm9wYWdhdGlvbiB8fCBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24gKCkgeyBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7IH07XG4gICAgZS53aGljaCA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGZuLmNhbGwoZWwsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB3cmFwIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIHdyYXBwZXIgPSB1bndyYXAoZWwsIHR5cGUsIGZuKSB8fCB3cmFwcGVyRmFjdG9yeShlbCwgdHlwZSwgZm4pO1xuICBoYXJkQ2FjaGUucHVzaCh7XG4gICAgd3JhcHBlcjogd3JhcHBlcixcbiAgICBlbGVtZW50OiBlbCxcbiAgICB0eXBlOiB0eXBlLFxuICAgIGZuOiBmblxuICB9KTtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIHVud3JhcCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBpID0gZmluZChlbCwgdHlwZSwgZm4pO1xuICBpZiAoaSkge1xuICAgIHZhciB3cmFwcGVyID0gaGFyZENhY2hlW2ldLndyYXBwZXI7XG4gICAgaGFyZENhY2hlLnNwbGljZShpLCAxKTsgLy8gZnJlZSB1cCBhIHRhZCBvZiBtZW1vcnlcbiAgICByZXR1cm4gd3JhcHBlcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIGksIGl0ZW07XG4gIGZvciAoaSA9IDA7IGkgPCBoYXJkQ2FjaGUubGVuZ3RoOyBpKyspIHtcbiAgICBpdGVtID0gaGFyZENhY2hlW2ldO1xuICAgIGlmIChpdGVtLmVsZW1lbnQgPT09IGVsICYmIGl0ZW0udHlwZSA9PT0gdHlwZSAmJiBpdGVtLmZuID09PSBmbikge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBldmVudG1hcCA9IFtdO1xudmFyIGV2ZW50bmFtZSA9ICcnO1xudmFyIHJvbiA9IC9eb24vO1xuXG5mb3IgKGV2ZW50bmFtZSBpbiBnbG9iYWwpIHtcbiAgaWYgKHJvbi50ZXN0KGV2ZW50bmFtZSkpIHtcbiAgICBldmVudG1hcC5wdXNoKGV2ZW50bmFtZS5zbGljZSgyKSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBldmVudG1hcDtcbiIsIlxudmFyIE5hdGl2ZUN1c3RvbUV2ZW50ID0gZ2xvYmFsLkN1c3RvbUV2ZW50O1xuXG5mdW5jdGlvbiB1c2VOYXRpdmUgKCkge1xuICB0cnkge1xuICAgIHZhciBwID0gbmV3IE5hdGl2ZUN1c3RvbUV2ZW50KCdjYXQnLCB7IGRldGFpbDogeyBmb286ICdiYXInIH0gfSk7XG4gICAgcmV0dXJuICAnY2F0JyA9PT0gcC50eXBlICYmICdiYXInID09PSBwLmRldGFpbC5mb287XG4gIH0gY2F0Y2ggKGUpIHtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ3Jvc3MtYnJvd3NlciBgQ3VzdG9tRXZlbnRgIGNvbnN0cnVjdG9yLlxuICpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC5DdXN0b21FdmVudFxuICpcbiAqIEBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHVzZU5hdGl2ZSgpID8gTmF0aXZlQ3VzdG9tRXZlbnQgOlxuXG4vLyBJRSA+PSA5XG4nZnVuY3Rpb24nID09PSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRXZlbnQgPyBmdW5jdGlvbiBDdXN0b21FdmVudCAodHlwZSwgcGFyYW1zKSB7XG4gIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gIGlmIChwYXJhbXMpIHtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xuICB9IGVsc2Uge1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSwgdm9pZCAwKTtcbiAgfVxuICByZXR1cm4gZTtcbn0gOlxuXG4vLyBJRSA8PSA4XG5mdW5jdGlvbiBDdXN0b21FdmVudCAodHlwZSwgcGFyYW1zKSB7XG4gIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgZS50eXBlID0gdHlwZTtcbiAgaWYgKHBhcmFtcykge1xuICAgIGUuYnViYmxlcyA9IEJvb2xlYW4ocGFyYW1zLmJ1YmJsZXMpO1xuICAgIGUuY2FuY2VsYWJsZSA9IEJvb2xlYW4ocGFyYW1zLmNhbmNlbGFibGUpO1xuICAgIGUuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcbiAgfSBlbHNlIHtcbiAgICBlLmJ1YmJsZXMgPSBmYWxzZTtcbiAgICBlLmNhbmNlbGFibGUgPSBmYWxzZTtcbiAgICBlLmRldGFpbCA9IHZvaWQgMDtcbiAgfVxuICByZXR1cm4gZTtcbn1cbiIsInZhciBzaSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicsIHRpY2s7XG5pZiAoc2kpIHtcbiAgdGljayA9IGZ1bmN0aW9uIChmbikgeyBzZXRJbW1lZGlhdGUoZm4pOyB9O1xufSBlbHNlIHtcbiAgdGljayA9IGZ1bmN0aW9uIChmbikgeyBzZXRUaW1lb3V0KGZuLCAwKTsgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aWNrOyJdfQ==

window.PainlessUtils = class PainlessUtils {
  constructor() {
    this.a = 0;
  }

  generate_style() {
    /** EDGES */
    return new cytoscape.stylesheet().selector('edge').style({
      'curve-style': 'bezier',
      'width': 3,
      'source-endpoint': 'outside-to-node',
      'target-endpoint': 'outside-to-node',
      'arrow-scale': 1.5,
      'line-color': '#839496',
      'font-family': "Courier New",
      'font-size': '10',
      'text-outline-color': '#fdf6e3',
      'text-outline-width': '2px',
      'color': '#002b36'
    }).selector('.source-edge').style({
      'target-arrow-shape': 'square',
      'target-arrow-fill': 'hollow',
      'target-arrow-color': '#002b36'
    }).selector('.target-edge').style({
      'target-arrow-shape': 'square',
      'target-arrow-color': '#002b36'
    }).selector('.edge-datatype').style({
      'line-style': 'dotted'
    }).selector('.edge-concept').style({
      'content': 'rdf:type'
    /** NODES */
    }).selector('node').style({
      'background-color': 'black',
      'shape': 'rectangle'
    }).selector('.node-domain').style({
      'background-color': '#002b36',
      'border-color': '#002b36',
      'border-style': 'solid',
      'border-width': '0.5px',
      'width': 15,
      'height': 15
    }).selector('.node-range').style({
      'background-color': '#fdf6e3',
      'border-color': '#002b36',
      'border-style': 'solid',
      'border-width': '2px',
      'width': 15,
      'height': 15
    }).selector('.node-datatype').style({
      'shape': 'ellipse',
      'background-color': '#93a1a1',
      'content': 'data(label)',
      'text-valign': 'center',
      'font-family': "Courier New",
      'font-size': '12',
      'width': 15,
      'height': 15
    }).selector('.node-role').style({
      'shape': 'diamond',
      'background-color': '#fdf6e3',
      'border-style': 'solid',
      'border-color': '#002b36',
      'color': '#002b36',
      'border-width': '4px',
      'content': 'data(label)',
      'text-valign': 'center',
      'font-family': "Courier New",
      'text-outline-color': '#fdf6e3',
      'text-outline-width': '3px',
      'width': 90,
      'height': 60
    }).selector('.node-attribute').style({
      'shape': 'ellipse',
      'background-color': '#fdf6e3',
      'border-style': 'solid',
      'border-color': '#002b36',
      'color': '#002b36',
      'border-width': '4px',
      'content': 'data(label)',
      'text-valign': 'center',
      'font-family': "Courier New",
      'text-outline-color': '#fdf6e3',
      'text-outline-width': '3px',
      'width': 30,
      'height': 30
    }).selector('.node-variable').style({
      'shape': 'ellipse',
      'background-color': function(ele) {
        return ele.data('color');
      },
      'width': function(ele) {
        return 100;
      },
      'height': function(ele) {
        return 100;
      },
      'text-valign': 'center',
      'font-size': '30',
      'font-family': "Courier New",
      'color': '#fdf6e3',
      'text-outline-color': function(ele) {
        return ele.data('color');
      },
      'text-outline-width': '5px',
      'content': 'data(label)'
    }).selector('.node-constant-value').style({
      'shape': 'ellipse',
      'background-color': function(ele) {
        return ele.data('color');
      },
      'width': function(ele) {
        return 100;
      },
      'height': function(ele) {
        return 100;
      },
      'text-valign': 'center',
      'font-size': '20',
      'font-family': "Courier New",
      'color': '#fdf6e3',
      'text-outline-color': '#fdf6e3',
      'text-outline-width': '0px',
      'content': 'data(label)'
    }).selector('.node-constant-object').style({
      'shape': 'ellipse',
      'background-color': function(ele) {
        return ele.data('color');
      },
      'width': function(ele) {
        return 100;
      },
      'height': function(ele) {
        return 100;
      },
      'text-valign': 'center',
      'font-size': '20',
      'font-family': "Courier New",
      'color': '#fdf6e3',
      'text-outline-color': '#fdf6e3',
      'text-outline-width': '0px',
      'content': 'data(label)'
    }).selector('.node-concept').style({
      'shape': 'rectangle',
      'background-color': '#073642',
      'content': 'data(label)',
      'text-valign': 'center',
      'width': function(ele) {
        return ele.data('label').length * 10 + 50; //compute text length?
      },
      'height': '80',
      'border-color': '#073642',
      'border-width': '2px',
      'font-family': "Courier New",
      'font-size': '20',
      'color': '#fdf6e3',
      'border-style': 'solid'
    }).selector('node.highlight').style({
      'border-color': '#333',
      'border-opacity': '0.5',
      'border-width': '20px',
      'border-style': 'solid'
    }).selector('node:selected').style({
      'border-color': '#daa',
      'border-opacity': '0.5',
      'border-width': '20px',
      'border-style': 'solid'
    });
  }

};

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeCoseBilkent"] = factory();
	else
		root["cytoscapeCoseBilkent"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 32);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function LayoutConstants() {}

/**
 * Layout Quality
 */
LayoutConstants.PROOF_QUALITY = 0;
LayoutConstants.DEFAULT_QUALITY = 1;
LayoutConstants.DRAFT_QUALITY = 2;

/**
 * Default parameters
 */
LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED = false;
//LayoutConstants.DEFAULT_INCREMENTAL = true;
LayoutConstants.DEFAULT_INCREMENTAL = false;
LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT = true;
LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT = false;
LayoutConstants.DEFAULT_ANIMATION_PERIOD = 50;
LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES = false;

// -----------------------------------------------------------------------------
// Section: General other constants
// -----------------------------------------------------------------------------
/*
 * Margins of a graph to be applied on bouding rectangle of its contents. We
 * assume margins on all four sides to be uniform.
 */
LayoutConstants.DEFAULT_GRAPH_MARGIN = 15;

/*
 * Whether to consider labels in node dimensions or not
 */
LayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS = false;

/*
 * Default dimension of a non-compound node.
 */
LayoutConstants.SIMPLE_NODE_SIZE = 40;

/*
 * Default dimension of a non-compound node.
 */
LayoutConstants.SIMPLE_NODE_HALF_SIZE = LayoutConstants.SIMPLE_NODE_SIZE / 2;

/*
 * Empty compound node size. When a compound node is empty, its both
 * dimensions should be of this value.
 */
LayoutConstants.EMPTY_COMPOUND_NODE_SIZE = 40;

/*
 * Minimum length that an edge should take during layout
 */
LayoutConstants.MIN_EDGE_LENGTH = 1;

/*
 * World boundaries that layout operates on
 */
LayoutConstants.WORLD_BOUNDARY = 1000000;

/*
 * World boundaries that random positioning can be performed with
 */
LayoutConstants.INITIAL_WORLD_BOUNDARY = LayoutConstants.WORLD_BOUNDARY / 1000;

/*
 * Coordinates of the world center
 */
LayoutConstants.WORLD_CENTER_X = 1200;
LayoutConstants.WORLD_CENTER_Y = 900;

module.exports = LayoutConstants;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LayoutConstants = __webpack_require__(0);

function FDLayoutConstants() {}

//FDLayoutConstants inherits static props in LayoutConstants
for (var prop in LayoutConstants) {
  FDLayoutConstants[prop] = LayoutConstants[prop];
}

FDLayoutConstants.MAX_ITERATIONS = 2500;

FDLayoutConstants.DEFAULT_EDGE_LENGTH = 50;
FDLayoutConstants.DEFAULT_SPRING_STRENGTH = 0.45;
FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = 4500.0;
FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = 0.4;
FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = 1.0;
FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = 3.8;
FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = 1.5;
FDLayoutConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION = true;
FDLayoutConstants.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION = true;
FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = 0.5;
FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL = 100.0;
FDLayoutConstants.MAX_NODE_DISPLACEMENT = FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL * 3;
FDLayoutConstants.MIN_REPULSION_DIST = FDLayoutConstants.DEFAULT_EDGE_LENGTH / 10.0;
FDLayoutConstants.CONVERGENCE_CHECK_PERIOD = 100;
FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = 0.1;
FDLayoutConstants.MIN_EDGE_LENGTH = 1;
FDLayoutConstants.GRID_CALCULATION_CHECK_PERIOD = 10;

module.exports = FDLayoutConstants;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function Integer() {}

Integer.MAX_VALUE = 2147483647;
Integer.MIN_VALUE = -2147483648;

module.exports = Integer;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LGraphObject = __webpack_require__(10);
var IGeometry = __webpack_require__(7);
var IMath = __webpack_require__(8);

function LEdge(source, target, vEdge) {
  LGraphObject.call(this, vEdge);

  this.isOverlapingSourceAndTarget = false;
  this.vGraphObject = vEdge;
  this.bendpoints = [];
  this.source = source;
  this.target = target;
}

LEdge.prototype = Object.create(LGraphObject.prototype);

for (var prop in LGraphObject) {
  LEdge[prop] = LGraphObject[prop];
}

LEdge.prototype.getSource = function () {
  return this.source;
};

LEdge.prototype.getTarget = function () {
  return this.target;
};

LEdge.prototype.isInterGraph = function () {
  return this.isInterGraph;
};

LEdge.prototype.getLength = function () {
  return this.length;
};

LEdge.prototype.isOverlapingSourceAndTarget = function () {
  return this.isOverlapingSourceAndTarget;
};

LEdge.prototype.getBendpoints = function () {
  return this.bendpoints;
};

LEdge.prototype.getLca = function () {
  return this.lca;
};

LEdge.prototype.getSourceInLca = function () {
  return this.sourceInLca;
};

LEdge.prototype.getTargetInLca = function () {
  return this.targetInLca;
};

LEdge.prototype.getOtherEnd = function (node) {
  if (this.source === node) {
    return this.target;
  } else if (this.target === node) {
    return this.source;
  } else {
    throw "Node is not incident with this edge";
  }
};

LEdge.prototype.getOtherEndInGraph = function (node, graph) {
  var otherEnd = this.getOtherEnd(node);
  var root = graph.getGraphManager().getRoot();

  while (true) {
    if (otherEnd.getOwner() == graph) {
      return otherEnd;
    }

    if (otherEnd.getOwner() == root) {
      break;
    }

    otherEnd = otherEnd.getOwner().getParent();
  }

  return null;
};

LEdge.prototype.updateLength = function () {
  var clipPointCoordinates = new Array(4);

  this.isOverlapingSourceAndTarget = IGeometry.getIntersection(this.target.getRect(), this.source.getRect(), clipPointCoordinates);

  if (!this.isOverlapingSourceAndTarget) {
    this.lengthX = clipPointCoordinates[0] - clipPointCoordinates[2];
    this.lengthY = clipPointCoordinates[1] - clipPointCoordinates[3];

    if (Math.abs(this.lengthX) < 1.0) {
      this.lengthX = IMath.sign(this.lengthX);
    }

    if (Math.abs(this.lengthY) < 1.0) {
      this.lengthY = IMath.sign(this.lengthY);
    }

    this.length = Math.sqrt(this.lengthX * this.lengthX + this.lengthY * this.lengthY);
  }
};

LEdge.prototype.updateLengthSimple = function () {
  this.lengthX = this.target.getCenterX() - this.source.getCenterX();
  this.lengthY = this.target.getCenterY() - this.source.getCenterY();

  if (Math.abs(this.lengthX) < 1.0) {
    this.lengthX = IMath.sign(this.lengthX);
  }

  if (Math.abs(this.lengthY) < 1.0) {
    this.lengthY = IMath.sign(this.lengthY);
  }

  this.length = Math.sqrt(this.lengthX * this.lengthX + this.lengthY * this.lengthY);
};

module.exports = LEdge;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LGraphObject = __webpack_require__(10);
var Integer = __webpack_require__(2);
var LayoutConstants = __webpack_require__(0);
var LGraphManager = __webpack_require__(9);
var LNode = __webpack_require__(11);
var LEdge = __webpack_require__(3);
var HashSet = __webpack_require__(6);
var RectangleD = __webpack_require__(14);
var Point = __webpack_require__(13);
var LinkedList = __webpack_require__(31);

function LGraph(parent, obj2, vGraph) {
  LGraphObject.call(this, vGraph);
  this.estimatedSize = Integer.MIN_VALUE;
  this.margin = LayoutConstants.DEFAULT_GRAPH_MARGIN;
  this.edges = [];
  this.nodes = [];
  this.isConnected = false;
  this.parent = parent;

  if (obj2 != null && obj2 instanceof LGraphManager) {
    this.graphManager = obj2;
  } else if (obj2 != null && obj2 instanceof Layout) {
    this.graphManager = obj2.graphManager;
  }
}

LGraph.prototype = Object.create(LGraphObject.prototype);
for (var prop in LGraphObject) {
  LGraph[prop] = LGraphObject[prop];
}

LGraph.prototype.getNodes = function () {
  return this.nodes;
};

LGraph.prototype.getEdges = function () {
  return this.edges;
};

LGraph.prototype.getGraphManager = function () {
  return this.graphManager;
};

LGraph.prototype.getParent = function () {
  return this.parent;
};

LGraph.prototype.getLeft = function () {
  return this.left;
};

LGraph.prototype.getRight = function () {
  return this.right;
};

LGraph.prototype.getTop = function () {
  return this.top;
};

LGraph.prototype.getBottom = function () {
  return this.bottom;
};

LGraph.prototype.isConnected = function () {
  return this.isConnected;
};

LGraph.prototype.add = function (obj1, sourceNode, targetNode) {
  if (sourceNode == null && targetNode == null) {
    var newNode = obj1;
    if (this.graphManager == null) {
      throw "Graph has no graph mgr!";
    }
    if (this.getNodes().indexOf(newNode) > -1) {
      throw "Node already in graph!";
    }
    newNode.owner = this;
    this.getNodes().push(newNode);

    return newNode;
  } else {
    var newEdge = obj1;
    if (!(this.getNodes().indexOf(sourceNode) > -1 && this.getNodes().indexOf(targetNode) > -1)) {
      throw "Source or target not in graph!";
    }

    if (!(sourceNode.owner == targetNode.owner && sourceNode.owner == this)) {
      throw "Both owners must be this graph!";
    }

    if (sourceNode.owner != targetNode.owner) {
      return null;
    }

    // set source and target
    newEdge.source = sourceNode;
    newEdge.target = targetNode;

    // set as intra-graph edge
    newEdge.isInterGraph = false;

    // add to graph edge list
    this.getEdges().push(newEdge);

    // add to incidency lists
    sourceNode.edges.push(newEdge);

    if (targetNode != sourceNode) {
      targetNode.edges.push(newEdge);
    }

    return newEdge;
  }
};

LGraph.prototype.remove = function (obj) {
  var node = obj;
  if (obj instanceof LNode) {
    if (node == null) {
      throw "Node is null!";
    }
    if (!(node.owner != null && node.owner == this)) {
      throw "Owner graph is invalid!";
    }
    if (this.graphManager == null) {
      throw "Owner graph manager is invalid!";
    }
    // remove incident edges first (make a copy to do it safely)
    var edgesToBeRemoved = node.edges.slice();
    var edge;
    var s = edgesToBeRemoved.length;
    for (var i = 0; i < s; i++) {
      edge = edgesToBeRemoved[i];

      if (edge.isInterGraph) {
        this.graphManager.remove(edge);
      } else {
        edge.source.owner.remove(edge);
      }
    }

    // now the node itself
    var index = this.nodes.indexOf(node);
    if (index == -1) {
      throw "Node not in owner node list!";
    }

    this.nodes.splice(index, 1);
  } else if (obj instanceof LEdge) {
    var edge = obj;
    if (edge == null) {
      throw "Edge is null!";
    }
    if (!(edge.source != null && edge.target != null)) {
      throw "Source and/or target is null!";
    }
    if (!(edge.source.owner != null && edge.target.owner != null && edge.source.owner == this && edge.target.owner == this)) {
      throw "Source and/or target owner is invalid!";
    }

    var sourceIndex = edge.source.edges.indexOf(edge);
    var targetIndex = edge.target.edges.indexOf(edge);
    if (!(sourceIndex > -1 && targetIndex > -1)) {
      throw "Source and/or target doesn't know this edge!";
    }

    edge.source.edges.splice(sourceIndex, 1);

    if (edge.target != edge.source) {
      edge.target.edges.splice(targetIndex, 1);
    }

    var index = edge.source.owner.getEdges().indexOf(edge);
    if (index == -1) {
      throw "Not in owner's edge list!";
    }

    edge.source.owner.getEdges().splice(index, 1);
  }
};

LGraph.prototype.updateLeftTop = function () {
  var top = Integer.MAX_VALUE;
  var left = Integer.MAX_VALUE;
  var nodeTop;
  var nodeLeft;
  var margin;

  var nodes = this.getNodes();
  var s = nodes.length;

  for (var i = 0; i < s; i++) {
    var lNode = nodes[i];
    nodeTop = lNode.getTop();
    nodeLeft = lNode.getLeft();

    if (top > nodeTop) {
      top = nodeTop;
    }

    if (left > nodeLeft) {
      left = nodeLeft;
    }
  }

  // Do we have any nodes in this graph?
  if (top == Integer.MAX_VALUE) {
    return null;
  }

  if (nodes[0].getParent().paddingLeft != undefined) {
    margin = nodes[0].getParent().paddingLeft;
  } else {
    margin = this.margin;
  }

  this.left = left - margin;
  this.top = top - margin;

  // Apply the margins and return the result
  return new Point(this.left, this.top);
};

LGraph.prototype.updateBounds = function (recursive) {
  // calculate bounds
  var left = Integer.MAX_VALUE;
  var right = -Integer.MAX_VALUE;
  var top = Integer.MAX_VALUE;
  var bottom = -Integer.MAX_VALUE;
  var nodeLeft;
  var nodeRight;
  var nodeTop;
  var nodeBottom;
  var margin;

  var nodes = this.nodes;
  var s = nodes.length;
  for (var i = 0; i < s; i++) {
    var lNode = nodes[i];

    if (recursive && lNode.child != null) {
      lNode.updateBounds();
    }
    nodeLeft = lNode.getLeft();
    nodeRight = lNode.getRight();
    nodeTop = lNode.getTop();
    nodeBottom = lNode.getBottom();

    if (left > nodeLeft) {
      left = nodeLeft;
    }

    if (right < nodeRight) {
      right = nodeRight;
    }

    if (top > nodeTop) {
      top = nodeTop;
    }

    if (bottom < nodeBottom) {
      bottom = nodeBottom;
    }
  }

  var boundingRect = new RectangleD(left, top, right - left, bottom - top);
  if (left == Integer.MAX_VALUE) {
    this.left = this.parent.getLeft();
    this.right = this.parent.getRight();
    this.top = this.parent.getTop();
    this.bottom = this.parent.getBottom();
  }

  if (nodes[0].getParent().paddingLeft != undefined) {
    margin = nodes[0].getParent().paddingLeft;
  } else {
    margin = this.margin;
  }

  this.left = boundingRect.x - margin;
  this.right = boundingRect.x + boundingRect.width + margin;
  this.top = boundingRect.y - margin;
  this.bottom = boundingRect.y + boundingRect.height + margin;
};

LGraph.calculateBounds = function (nodes) {
  var left = Integer.MAX_VALUE;
  var right = -Integer.MAX_VALUE;
  var top = Integer.MAX_VALUE;
  var bottom = -Integer.MAX_VALUE;
  var nodeLeft;
  var nodeRight;
  var nodeTop;
  var nodeBottom;

  var s = nodes.length;

  for (var i = 0; i < s; i++) {
    var lNode = nodes[i];
    nodeLeft = lNode.getLeft();
    nodeRight = lNode.getRight();
    nodeTop = lNode.getTop();
    nodeBottom = lNode.getBottom();

    if (left > nodeLeft) {
      left = nodeLeft;
    }

    if (right < nodeRight) {
      right = nodeRight;
    }

    if (top > nodeTop) {
      top = nodeTop;
    }

    if (bottom < nodeBottom) {
      bottom = nodeBottom;
    }
  }

  var boundingRect = new RectangleD(left, top, right - left, bottom - top);

  return boundingRect;
};

LGraph.prototype.getInclusionTreeDepth = function () {
  if (this == this.graphManager.getRoot()) {
    return 1;
  } else {
    return this.parent.getInclusionTreeDepth();
  }
};

LGraph.prototype.getEstimatedSize = function () {
  if (this.estimatedSize == Integer.MIN_VALUE) {
    throw "assert failed";
  }
  return this.estimatedSize;
};

LGraph.prototype.calcEstimatedSize = function () {
  var size = 0;
  var nodes = this.nodes;
  var s = nodes.length;

  for (var i = 0; i < s; i++) {
    var lNode = nodes[i];
    size += lNode.calcEstimatedSize();
  }

  if (size == 0) {
    this.estimatedSize = LayoutConstants.EMPTY_COMPOUND_NODE_SIZE;
  } else {
    this.estimatedSize = size / Math.sqrt(this.nodes.length);
  }

  return this.estimatedSize;
};

LGraph.prototype.updateConnected = function () {
  var self = this;
  if (this.nodes.length == 0) {
    this.isConnected = true;
    return;
  }

  var toBeVisited = new LinkedList();
  var visited = new HashSet();
  var currentNode = this.nodes[0];
  var neighborEdges;
  var currentNeighbor;
  var childrenOfNode = currentNode.withChildren();
  childrenOfNode.forEach(function (node) {
    toBeVisited.push(node);
  });

  while (toBeVisited.length !== 0) {
    currentNode = toBeVisited.shift();
    visited.add(currentNode);

    // Traverse all neighbors of this node
    neighborEdges = currentNode.getEdges();
    var s = neighborEdges.length;
    for (var i = 0; i < s; i++) {
      var neighborEdge = neighborEdges[i];
      currentNeighbor = neighborEdge.getOtherEndInGraph(currentNode, this);

      // Add unvisited neighbors to the list to visit
      if (currentNeighbor != null && !visited.contains(currentNeighbor)) {
        var childrenOfNeighbor = currentNeighbor.withChildren();

        childrenOfNeighbor.forEach(function (node) {
          toBeVisited.push(node);
        });
      }
    }
  }

  this.isConnected = false;

  if (visited.size() >= this.nodes.length) {
    var noOfVisitedInThisGraph = 0;

    var s = visited.size();
    Object.keys(visited.set).forEach(function (visitedId) {
      var visitedNode = visited.set[visitedId];
      if (visitedNode.owner == self) {
        noOfVisitedInThisGraph++;
      }
    });

    if (noOfVisitedInThisGraph == this.nodes.length) {
      this.isConnected = true;
    }
  }
};

module.exports = LGraph;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function PointD(x, y) {
  if (x == null && y == null) {
    this.x = 0;
    this.y = 0;
  } else {
    this.x = x;
    this.y = y;
  }
}

PointD.prototype.getX = function () {
  return this.x;
};

PointD.prototype.getY = function () {
  return this.y;
};

PointD.prototype.setX = function (x) {
  this.x = x;
};

PointD.prototype.setY = function (y) {
  this.y = y;
};

PointD.prototype.getDifference = function (pt) {
  return new DimensionD(this.x - pt.x, this.y - pt.y);
};

PointD.prototype.getCopy = function () {
  return new PointD(this.x, this.y);
};

PointD.prototype.translate = function (dim) {
  this.x += dim.width;
  this.y += dim.height;
  return this;
};

module.exports = PointD;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var UniqueIDGeneretor = __webpack_require__(16);

function HashSet() {
  this.set = {};
}
;

HashSet.prototype.add = function (obj) {
  var theId = UniqueIDGeneretor.createID(obj);
  if (!this.contains(theId)) this.set[theId] = obj;
};

HashSet.prototype.remove = function (obj) {
  delete this.set[UniqueIDGeneretor.createID(obj)];
};

HashSet.prototype.clear = function () {
  this.set = {};
};

HashSet.prototype.contains = function (obj) {
  return this.set[UniqueIDGeneretor.createID(obj)] == obj;
};

HashSet.prototype.isEmpty = function () {
  return this.size() === 0;
};

HashSet.prototype.size = function () {
  return Object.keys(this.set).length;
};

//concats this.set to the given list
HashSet.prototype.addAllTo = function (list) {
  var keys = Object.keys(this.set);
  var length = keys.length;
  for (var i = 0; i < length; i++) {
    list.push(this.set[keys[i]]);
  }
};

HashSet.prototype.size = function () {
  return Object.keys(this.set).length;
};

HashSet.prototype.addAll = function (list) {
  var s = list.length;
  for (var i = 0; i < s; i++) {
    var v = list[i];
    this.add(v);
  }
};

module.exports = HashSet;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function IGeometry() {}

IGeometry.calcSeparationAmount = function (rectA, rectB, overlapAmount, separationBuffer) {
  if (!rectA.intersects(rectB)) {
    throw "assert failed";
  }
  var directions = new Array(2);
  IGeometry.decideDirectionsForOverlappingNodes(rectA, rectB, directions);
  overlapAmount[0] = Math.min(rectA.getRight(), rectB.getRight()) - Math.max(rectA.x, rectB.x);
  overlapAmount[1] = Math.min(rectA.getBottom(), rectB.getBottom()) - Math.max(rectA.y, rectB.y);
  // update the overlapping amounts for the following cases:
  if (rectA.getX() <= rectB.getX() && rectA.getRight() >= rectB.getRight()) {
    overlapAmount[0] += Math.min(rectB.getX() - rectA.getX(), rectA.getRight() - rectB.getRight());
  } else if (rectB.getX() <= rectA.getX() && rectB.getRight() >= rectA.getRight()) {
    overlapAmount[0] += Math.min(rectA.getX() - rectB.getX(), rectB.getRight() - rectA.getRight());
  }
  if (rectA.getY() <= rectB.getY() && rectA.getBottom() >= rectB.getBottom()) {
    overlapAmount[1] += Math.min(rectB.getY() - rectA.getY(), rectA.getBottom() - rectB.getBottom());
  } else if (rectB.getY() <= rectA.getY() && rectB.getBottom() >= rectA.getBottom()) {
    overlapAmount[1] += Math.min(rectA.getY() - rectB.getY(), rectB.getBottom() - rectA.getBottom());
  }

  // find slope of the line passes two centers
  var slope = Math.abs((rectB.getCenterY() - rectA.getCenterY()) / (rectB.getCenterX() - rectA.getCenterX()));
  // if centers are overlapped
  if (rectB.getCenterY() == rectA.getCenterY() && rectB.getCenterX() == rectA.getCenterX()) {
    // assume the slope is 1 (45 degree)
    slope = 1.0;
  }

  var moveByY = slope * overlapAmount[0];
  var moveByX = overlapAmount[1] / slope;
  if (overlapAmount[0] < moveByX) {
    moveByX = overlapAmount[0];
  } else {
    moveByY = overlapAmount[1];
  }
  // return half the amount so that if each rectangle is moved by these
  // amounts in opposite directions, overlap will be resolved
  overlapAmount[0] = -1 * directions[0] * (moveByX / 2 + separationBuffer);
  overlapAmount[1] = -1 * directions[1] * (moveByY / 2 + separationBuffer);
};

IGeometry.decideDirectionsForOverlappingNodes = function (rectA, rectB, directions) {
  if (rectA.getCenterX() < rectB.getCenterX()) {
    directions[0] = -1;
  } else {
    directions[0] = 1;
  }

  if (rectA.getCenterY() < rectB.getCenterY()) {
    directions[1] = -1;
  } else {
    directions[1] = 1;
  }
};

IGeometry.getIntersection2 = function (rectA, rectB, result) {
  //result[0-1] will contain clipPoint of rectA, result[2-3] will contain clipPoint of rectB
  var p1x = rectA.getCenterX();
  var p1y = rectA.getCenterY();
  var p2x = rectB.getCenterX();
  var p2y = rectB.getCenterY();

  //if two rectangles intersect, then clipping points are centers
  if (rectA.intersects(rectB)) {
    result[0] = p1x;
    result[1] = p1y;
    result[2] = p2x;
    result[3] = p2y;
    return true;
  }
  //variables for rectA
  var topLeftAx = rectA.getX();
  var topLeftAy = rectA.getY();
  var topRightAx = rectA.getRight();
  var bottomLeftAx = rectA.getX();
  var bottomLeftAy = rectA.getBottom();
  var bottomRightAx = rectA.getRight();
  var halfWidthA = rectA.getWidthHalf();
  var halfHeightA = rectA.getHeightHalf();
  //variables for rectB
  var topLeftBx = rectB.getX();
  var topLeftBy = rectB.getY();
  var topRightBx = rectB.getRight();
  var bottomLeftBx = rectB.getX();
  var bottomLeftBy = rectB.getBottom();
  var bottomRightBx = rectB.getRight();
  var halfWidthB = rectB.getWidthHalf();
  var halfHeightB = rectB.getHeightHalf();
  //flag whether clipping points are found
  var clipPointAFound = false;
  var clipPointBFound = false;

  // line is vertical
  if (p1x == p2x) {
    if (p1y > p2y) {
      result[0] = p1x;
      result[1] = topLeftAy;
      result[2] = p2x;
      result[3] = bottomLeftBy;
      return false;
    } else if (p1y < p2y) {
      result[0] = p1x;
      result[1] = bottomLeftAy;
      result[2] = p2x;
      result[3] = topLeftBy;
      return false;
    } else {
      //not line, return null;
    }
  }
  // line is horizontal
  else if (p1y == p2y) {
      if (p1x > p2x) {
        result[0] = topLeftAx;
        result[1] = p1y;
        result[2] = topRightBx;
        result[3] = p2y;
        return false;
      } else if (p1x < p2x) {
        result[0] = topRightAx;
        result[1] = p1y;
        result[2] = topLeftBx;
        result[3] = p2y;
        return false;
      } else {
        //not valid line, return null;
      }
    } else {
      //slopes of rectA's and rectB's diagonals
      var slopeA = rectA.height / rectA.width;
      var slopeB = rectB.height / rectB.width;

      //slope of line between center of rectA and center of rectB
      var slopePrime = (p2y - p1y) / (p2x - p1x);
      var cardinalDirectionA;
      var cardinalDirectionB;
      var tempPointAx;
      var tempPointAy;
      var tempPointBx;
      var tempPointBy;

      //determine whether clipping point is the corner of nodeA
      if (-slopeA == slopePrime) {
        if (p1x > p2x) {
          result[0] = bottomLeftAx;
          result[1] = bottomLeftAy;
          clipPointAFound = true;
        } else {
          result[0] = topRightAx;
          result[1] = topLeftAy;
          clipPointAFound = true;
        }
      } else if (slopeA == slopePrime) {
        if (p1x > p2x) {
          result[0] = topLeftAx;
          result[1] = topLeftAy;
          clipPointAFound = true;
        } else {
          result[0] = bottomRightAx;
          result[1] = bottomLeftAy;
          clipPointAFound = true;
        }
      }

      //determine whether clipping point is the corner of nodeB
      if (-slopeB == slopePrime) {
        if (p2x > p1x) {
          result[2] = bottomLeftBx;
          result[3] = bottomLeftBy;
          clipPointBFound = true;
        } else {
          result[2] = topRightBx;
          result[3] = topLeftBy;
          clipPointBFound = true;
        }
      } else if (slopeB == slopePrime) {
        if (p2x > p1x) {
          result[2] = topLeftBx;
          result[3] = topLeftBy;
          clipPointBFound = true;
        } else {
          result[2] = bottomRightBx;
          result[3] = bottomLeftBy;
          clipPointBFound = true;
        }
      }

      //if both clipping points are corners
      if (clipPointAFound && clipPointBFound) {
        return false;
      }

      //determine Cardinal Direction of rectangles
      if (p1x > p2x) {
        if (p1y > p2y) {
          cardinalDirectionA = IGeometry.getCardinalDirection(slopeA, slopePrime, 4);
          cardinalDirectionB = IGeometry.getCardinalDirection(slopeB, slopePrime, 2);
        } else {
          cardinalDirectionA = IGeometry.getCardinalDirection(-slopeA, slopePrime, 3);
          cardinalDirectionB = IGeometry.getCardinalDirection(-slopeB, slopePrime, 1);
        }
      } else {
        if (p1y > p2y) {
          cardinalDirectionA = IGeometry.getCardinalDirection(-slopeA, slopePrime, 1);
          cardinalDirectionB = IGeometry.getCardinalDirection(-slopeB, slopePrime, 3);
        } else {
          cardinalDirectionA = IGeometry.getCardinalDirection(slopeA, slopePrime, 2);
          cardinalDirectionB = IGeometry.getCardinalDirection(slopeB, slopePrime, 4);
        }
      }
      //calculate clipping Point if it is not found before
      if (!clipPointAFound) {
        switch (cardinalDirectionA) {
          case 1:
            tempPointAy = topLeftAy;
            tempPointAx = p1x + -halfHeightA / slopePrime;
            result[0] = tempPointAx;
            result[1] = tempPointAy;
            break;
          case 2:
            tempPointAx = bottomRightAx;
            tempPointAy = p1y + halfWidthA * slopePrime;
            result[0] = tempPointAx;
            result[1] = tempPointAy;
            break;
          case 3:
            tempPointAy = bottomLeftAy;
            tempPointAx = p1x + halfHeightA / slopePrime;
            result[0] = tempPointAx;
            result[1] = tempPointAy;
            break;
          case 4:
            tempPointAx = bottomLeftAx;
            tempPointAy = p1y + -halfWidthA * slopePrime;
            result[0] = tempPointAx;
            result[1] = tempPointAy;
            break;
        }
      }
      if (!clipPointBFound) {
        switch (cardinalDirectionB) {
          case 1:
            tempPointBy = topLeftBy;
            tempPointBx = p2x + -halfHeightB / slopePrime;
            result[2] = tempPointBx;
            result[3] = tempPointBy;
            break;
          case 2:
            tempPointBx = bottomRightBx;
            tempPointBy = p2y + halfWidthB * slopePrime;
            result[2] = tempPointBx;
            result[3] = tempPointBy;
            break;
          case 3:
            tempPointBy = bottomLeftBy;
            tempPointBx = p2x + halfHeightB / slopePrime;
            result[2] = tempPointBx;
            result[3] = tempPointBy;
            break;
          case 4:
            tempPointBx = bottomLeftBx;
            tempPointBy = p2y + -halfWidthB * slopePrime;
            result[2] = tempPointBx;
            result[3] = tempPointBy;
            break;
        }
      }
    }
  return false;
};

IGeometry.getCardinalDirection = function (slope, slopePrime, line) {
  if (slope > slopePrime) {
    return line;
  } else {
    return 1 + line % 4;
  }
};

IGeometry.getIntersection = function (s1, s2, f1, f2) {
  if (f2 == null) {
    return IGeometry.getIntersection2(s1, s2, f1);
  }
  var x1 = s1.x;
  var y1 = s1.y;
  var x2 = s2.x;
  var y2 = s2.y;
  var x3 = f1.x;
  var y3 = f1.y;
  var x4 = f2.x;
  var y4 = f2.y;
  var x, y; // intersection point
  var a1, a2, b1, b2, c1, c2; // coefficients of line eqns.
  var denom;

  a1 = y2 - y1;
  b1 = x1 - x2;
  c1 = x2 * y1 - x1 * y2; // { a1*x + b1*y + c1 = 0 is line 1 }

  a2 = y4 - y3;
  b2 = x3 - x4;
  c2 = x4 * y3 - x3 * y4; // { a2*x + b2*y + c2 = 0 is line 2 }

  denom = a1 * b2 - a2 * b1;

  if (denom == 0) {
    return null;
  }

  x = (b1 * c2 - b2 * c1) / denom;
  y = (a2 * c1 - a1 * c2) / denom;

  return new Point(x, y);
};

// -----------------------------------------------------------------------------
// Section: Class Constants
// -----------------------------------------------------------------------------
/**
 * Some useful pre-calculated constants
 */
IGeometry.HALF_PI = 0.5 * Math.PI;
IGeometry.ONE_AND_HALF_PI = 1.5 * Math.PI;
IGeometry.TWO_PI = 2.0 * Math.PI;
IGeometry.THREE_PI = 3.0 * Math.PI;

module.exports = IGeometry;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function IMath() {}

/**
 * This method returns the sign of the input value.
 */
IMath.sign = function (value) {
  if (value > 0) {
    return 1;
  } else if (value < 0) {
    return -1;
  } else {
    return 0;
  }
};

IMath.floor = function (value) {
  return value < 0 ? Math.ceil(value) : Math.floor(value);
};

IMath.ceil = function (value) {
  return value < 0 ? Math.floor(value) : Math.ceil(value);
};

module.exports = IMath;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LGraph;
var LEdge = __webpack_require__(3);

function LGraphManager(layout) {
  LGraph = __webpack_require__(4); // It may be better to initilize this out of this function but it gives an error (Right-hand side of 'instanceof' is not callable) now.
  this.layout = layout;

  this.graphs = [];
  this.edges = [];
}

LGraphManager.prototype.addRoot = function () {
  var ngraph = this.layout.newGraph();
  var nnode = this.layout.newNode(null);
  var root = this.add(ngraph, nnode);
  this.setRootGraph(root);
  return this.rootGraph;
};

LGraphManager.prototype.add = function (newGraph, parentNode, newEdge, sourceNode, targetNode) {
  //there are just 2 parameters are passed then it adds an LGraph else it adds an LEdge
  if (newEdge == null && sourceNode == null && targetNode == null) {
    if (newGraph == null) {
      throw "Graph is null!";
    }
    if (parentNode == null) {
      throw "Parent node is null!";
    }
    if (this.graphs.indexOf(newGraph) > -1) {
      throw "Graph already in this graph mgr!";
    }

    this.graphs.push(newGraph);

    if (newGraph.parent != null) {
      throw "Already has a parent!";
    }
    if (parentNode.child != null) {
      throw "Already has a child!";
    }

    newGraph.parent = parentNode;
    parentNode.child = newGraph;

    return newGraph;
  } else {
    //change the order of the parameters
    targetNode = newEdge;
    sourceNode = parentNode;
    newEdge = newGraph;
    var sourceGraph = sourceNode.getOwner();
    var targetGraph = targetNode.getOwner();

    if (!(sourceGraph != null && sourceGraph.getGraphManager() == this)) {
      throw "Source not in this graph mgr!";
    }
    if (!(targetGraph != null && targetGraph.getGraphManager() == this)) {
      throw "Target not in this graph mgr!";
    }

    if (sourceGraph == targetGraph) {
      newEdge.isInterGraph = false;
      return sourceGraph.add(newEdge, sourceNode, targetNode);
    } else {
      newEdge.isInterGraph = true;

      // set source and target
      newEdge.source = sourceNode;
      newEdge.target = targetNode;

      // add edge to inter-graph edge list
      if (this.edges.indexOf(newEdge) > -1) {
        throw "Edge already in inter-graph edge list!";
      }

      this.edges.push(newEdge);

      // add edge to source and target incidency lists
      if (!(newEdge.source != null && newEdge.target != null)) {
        throw "Edge source and/or target is null!";
      }

      if (!(newEdge.source.edges.indexOf(newEdge) == -1 && newEdge.target.edges.indexOf(newEdge) == -1)) {
        throw "Edge already in source and/or target incidency list!";
      }

      newEdge.source.edges.push(newEdge);
      newEdge.target.edges.push(newEdge);

      return newEdge;
    }
  }
};

LGraphManager.prototype.remove = function (lObj) {
  if (lObj instanceof LGraph) {
    var graph = lObj;
    if (graph.getGraphManager() != this) {
      throw "Graph not in this graph mgr";
    }
    if (!(graph == this.rootGraph || graph.parent != null && graph.parent.graphManager == this)) {
      throw "Invalid parent node!";
    }

    // first the edges (make a copy to do it safely)
    var edgesToBeRemoved = [];

    edgesToBeRemoved = edgesToBeRemoved.concat(graph.getEdges());

    var edge;
    var s = edgesToBeRemoved.length;
    for (var i = 0; i < s; i++) {
      edge = edgesToBeRemoved[i];
      graph.remove(edge);
    }

    // then the nodes (make a copy to do it safely)
    var nodesToBeRemoved = [];

    nodesToBeRemoved = nodesToBeRemoved.concat(graph.getNodes());

    var node;
    s = nodesToBeRemoved.length;
    for (var i = 0; i < s; i++) {
      node = nodesToBeRemoved[i];
      graph.remove(node);
    }

    // check if graph is the root
    if (graph == this.rootGraph) {
      this.setRootGraph(null);
    }

    // now remove the graph itself
    var index = this.graphs.indexOf(graph);
    this.graphs.splice(index, 1);

    // also reset the parent of the graph
    graph.parent = null;
  } else if (lObj instanceof LEdge) {
    edge = lObj;
    if (edge == null) {
      throw "Edge is null!";
    }
    if (!edge.isInterGraph) {
      throw "Not an inter-graph edge!";
    }
    if (!(edge.source != null && edge.target != null)) {
      throw "Source and/or target is null!";
    }

    // remove edge from source and target nodes' incidency lists

    if (!(edge.source.edges.indexOf(edge) != -1 && edge.target.edges.indexOf(edge) != -1)) {
      throw "Source and/or target doesn't know this edge!";
    }

    var index = edge.source.edges.indexOf(edge);
    edge.source.edges.splice(index, 1);
    index = edge.target.edges.indexOf(edge);
    edge.target.edges.splice(index, 1);

    // remove edge from owner graph manager's inter-graph edge list

    if (!(edge.source.owner != null && edge.source.owner.getGraphManager() != null)) {
      throw "Edge owner graph or owner graph manager is null!";
    }
    if (edge.source.owner.getGraphManager().edges.indexOf(edge) == -1) {
      throw "Not in owner graph manager's edge list!";
    }

    var index = edge.source.owner.getGraphManager().edges.indexOf(edge);
    edge.source.owner.getGraphManager().edges.splice(index, 1);
  }
};

LGraphManager.prototype.updateBounds = function () {
  this.rootGraph.updateBounds(true);
};

LGraphManager.prototype.getGraphs = function () {
  return this.graphs;
};

LGraphManager.prototype.getAllNodes = function () {
  if (this.allNodes == null) {
    var nodeList = [];
    var graphs = this.getGraphs();
    var s = graphs.length;
    for (var i = 0; i < s; i++) {
      nodeList = nodeList.concat(graphs[i].getNodes());
    }
    this.allNodes = nodeList;
  }
  return this.allNodes;
};

LGraphManager.prototype.resetAllNodes = function () {
  this.allNodes = null;
};

LGraphManager.prototype.resetAllEdges = function () {
  this.allEdges = null;
};

LGraphManager.prototype.resetAllNodesToApplyGravitation = function () {
  this.allNodesToApplyGravitation = null;
};

LGraphManager.prototype.getAllEdges = function () {
  if (this.allEdges == null) {
    var edgeList = [];
    var graphs = this.getGraphs();
    var s = graphs.length;
    for (var i = 0; i < graphs.length; i++) {
      edgeList = edgeList.concat(graphs[i].getEdges());
    }

    edgeList = edgeList.concat(this.edges);

    this.allEdges = edgeList;
  }
  return this.allEdges;
};

LGraphManager.prototype.getAllNodesToApplyGravitation = function () {
  return this.allNodesToApplyGravitation;
};

LGraphManager.prototype.setAllNodesToApplyGravitation = function (nodeList) {
  if (this.allNodesToApplyGravitation != null) {
    throw "assert failed";
  }

  this.allNodesToApplyGravitation = nodeList;
};

LGraphManager.prototype.getRoot = function () {
  return this.rootGraph;
};

LGraphManager.prototype.setRootGraph = function (graph) {
  if (graph.getGraphManager() != this) {
    throw "Root not in this graph mgr!";
  }

  this.rootGraph = graph;
  // root graph must have a root node associated with it for convenience
  if (graph.parent == null) {
    graph.parent = this.layout.newNode("Root node");
  }
};

LGraphManager.prototype.getLayout = function () {
  return this.layout;
};

LGraphManager.prototype.isOneAncestorOfOther = function (firstNode, secondNode) {
  if (!(firstNode != null && secondNode != null)) {
    throw "assert failed";
  }

  if (firstNode == secondNode) {
    return true;
  }
  // Is second node an ancestor of the first one?
  var ownerGraph = firstNode.getOwner();
  var parentNode;

  do {
    parentNode = ownerGraph.getParent();

    if (parentNode == null) {
      break;
    }

    if (parentNode == secondNode) {
      return true;
    }

    ownerGraph = parentNode.getOwner();
    if (ownerGraph == null) {
      break;
    }
  } while (true);
  // Is first node an ancestor of the second one?
  ownerGraph = secondNode.getOwner();

  do {
    parentNode = ownerGraph.getParent();

    if (parentNode == null) {
      break;
    }

    if (parentNode == firstNode) {
      return true;
    }

    ownerGraph = parentNode.getOwner();
    if (ownerGraph == null) {
      break;
    }
  } while (true);

  return false;
};

LGraphManager.prototype.calcLowestCommonAncestors = function () {
  var edge;
  var sourceNode;
  var targetNode;
  var sourceAncestorGraph;
  var targetAncestorGraph;

  var edges = this.getAllEdges();
  var s = edges.length;
  for (var i = 0; i < s; i++) {
    edge = edges[i];

    sourceNode = edge.source;
    targetNode = edge.target;
    edge.lca = null;
    edge.sourceInLca = sourceNode;
    edge.targetInLca = targetNode;

    if (sourceNode == targetNode) {
      edge.lca = sourceNode.getOwner();
      continue;
    }

    sourceAncestorGraph = sourceNode.getOwner();

    while (edge.lca == null) {
      edge.targetInLca = targetNode;
      targetAncestorGraph = targetNode.getOwner();

      while (edge.lca == null) {
        if (targetAncestorGraph == sourceAncestorGraph) {
          edge.lca = targetAncestorGraph;
          break;
        }

        if (targetAncestorGraph == this.rootGraph) {
          break;
        }

        if (edge.lca != null) {
          throw "assert failed";
        }
        edge.targetInLca = targetAncestorGraph.getParent();
        targetAncestorGraph = edge.targetInLca.getOwner();
      }

      if (sourceAncestorGraph == this.rootGraph) {
        break;
      }

      if (edge.lca == null) {
        edge.sourceInLca = sourceAncestorGraph.getParent();
        sourceAncestorGraph = edge.sourceInLca.getOwner();
      }
    }

    if (edge.lca == null) {
      throw "assert failed";
    }
  }
};

LGraphManager.prototype.calcLowestCommonAncestor = function (firstNode, secondNode) {
  if (firstNode == secondNode) {
    return firstNode.getOwner();
  }
  var firstOwnerGraph = firstNode.getOwner();

  do {
    if (firstOwnerGraph == null) {
      break;
    }
    var secondOwnerGraph = secondNode.getOwner();

    do {
      if (secondOwnerGraph == null) {
        break;
      }

      if (secondOwnerGraph == firstOwnerGraph) {
        return secondOwnerGraph;
      }
      secondOwnerGraph = secondOwnerGraph.getParent().getOwner();
    } while (true);

    firstOwnerGraph = firstOwnerGraph.getParent().getOwner();
  } while (true);

  return firstOwnerGraph;
};

LGraphManager.prototype.calcInclusionTreeDepths = function (graph, depth) {
  if (graph == null && depth == null) {
    graph = this.rootGraph;
    depth = 1;
  }
  var node;

  var nodes = graph.getNodes();
  var s = nodes.length;
  for (var i = 0; i < s; i++) {
    node = nodes[i];
    node.inclusionTreeDepth = depth;

    if (node.child != null) {
      this.calcInclusionTreeDepths(node.child, depth + 1);
    }
  }
};

LGraphManager.prototype.includesInvalidEdge = function () {
  var edge;

  var s = this.edges.length;
  for (var i = 0; i < s; i++) {
    edge = this.edges[i];

    if (this.isOneAncestorOfOther(edge.source, edge.target)) {
      return true;
    }
  }
  return false;
};

module.exports = LGraphManager;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function LGraphObject(vGraphObject) {
  this.vGraphObject = vGraphObject;
}

module.exports = LGraphObject;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LGraphObject = __webpack_require__(10);
var Integer = __webpack_require__(2);
var RectangleD = __webpack_require__(14);
var LayoutConstants = __webpack_require__(0);
var RandomSeed = __webpack_require__(26);
var PointD = __webpack_require__(5);
var HashSet = __webpack_require__(6);

function LNode(gm, loc, size, vNode) {
  //Alternative constructor 1 : LNode(LGraphManager gm, Point loc, Dimension size, Object vNode)
  if (size == null && vNode == null) {
    vNode = loc;
  }

  LGraphObject.call(this, vNode);

  //Alternative constructor 2 : LNode(Layout layout, Object vNode)
  if (gm.graphManager != null) gm = gm.graphManager;

  this.estimatedSize = Integer.MIN_VALUE;
  this.inclusionTreeDepth = Integer.MAX_VALUE;
  this.vGraphObject = vNode;
  this.edges = [];
  this.graphManager = gm;

  if (size != null && loc != null) this.rect = new RectangleD(loc.x, loc.y, size.width, size.height);else this.rect = new RectangleD();
}

LNode.prototype = Object.create(LGraphObject.prototype);
for (var prop in LGraphObject) {
  LNode[prop] = LGraphObject[prop];
}

LNode.prototype.getEdges = function () {
  return this.edges;
};

LNode.prototype.getChild = function () {
  return this.child;
};

LNode.prototype.getOwner = function () {
  //  if (this.owner != null) {
  //    if (!(this.owner == null || this.owner.getNodes().indexOf(this) > -1)) {
  //      throw "assert failed";
  //    }
  //  }

  return this.owner;
};

LNode.prototype.getWidth = function () {
  return this.rect.width;
};

LNode.prototype.setWidth = function (width) {
  this.rect.width = width;
};

LNode.prototype.getHeight = function () {
  return this.rect.height;
};

LNode.prototype.setHeight = function (height) {
  this.rect.height = height;
};

LNode.prototype.getCenterX = function () {
  return this.rect.x + this.rect.width / 2;
};

LNode.prototype.getCenterY = function () {
  return this.rect.y + this.rect.height / 2;
};

LNode.prototype.getCenter = function () {
  return new PointD(this.rect.x + this.rect.width / 2, this.rect.y + this.rect.height / 2);
};

LNode.prototype.getLocation = function () {
  return new PointD(this.rect.x, this.rect.y);
};

LNode.prototype.getRect = function () {
  return this.rect;
};

LNode.prototype.getDiagonal = function () {
  return Math.sqrt(this.rect.width * this.rect.width + this.rect.height * this.rect.height);
};

LNode.prototype.setRect = function (upperLeft, dimension) {
  this.rect.x = upperLeft.x;
  this.rect.y = upperLeft.y;
  this.rect.width = dimension.width;
  this.rect.height = dimension.height;
};

LNode.prototype.setCenter = function (cx, cy) {
  this.rect.x = cx - this.rect.width / 2;
  this.rect.y = cy - this.rect.height / 2;
};

LNode.prototype.setLocation = function (x, y) {
  this.rect.x = x;
  this.rect.y = y;
};

LNode.prototype.moveBy = function (dx, dy) {
  this.rect.x += dx;
  this.rect.y += dy;
};

LNode.prototype.getEdgeListToNode = function (to) {
  var edgeList = [];
  var edge;
  var self = this;

  self.edges.forEach(function (edge) {

    if (edge.target == to) {
      if (edge.source != self) throw "Incorrect edge source!";

      edgeList.push(edge);
    }
  });

  return edgeList;
};

LNode.prototype.getEdgesBetween = function (other) {
  var edgeList = [];
  var edge;

  var self = this;
  self.edges.forEach(function (edge) {

    if (!(edge.source == self || edge.target == self)) throw "Incorrect edge source and/or target";

    if (edge.target == other || edge.source == other) {
      edgeList.push(edge);
    }
  });

  return edgeList;
};

LNode.prototype.getNeighborsList = function () {
  var neighbors = new HashSet();
  var edge;

  var self = this;
  self.edges.forEach(function (edge) {

    if (edge.source == self) {
      neighbors.add(edge.target);
    } else {
      if (edge.target != self) {
        throw "Incorrect incidency!";
      }

      neighbors.add(edge.source);
    }
  });

  return neighbors;
};

LNode.prototype.withChildren = function () {
  var withNeighborsList = new Set();
  var childNode;
  var children;

  withNeighborsList.add(this);

  if (this.child != null) {
    var nodes = this.child.getNodes();
    for (var i = 0; i < nodes.length; i++) {
      childNode = nodes[i];
      children = childNode.withChildren();
      children.forEach(function (node) {
        withNeighborsList.add(node);
      });
    }
  }

  return withNeighborsList;
};

LNode.prototype.getNoOfChildren = function () {
  var noOfChildren = 0;
  var childNode;

  if (this.child == null) {
    noOfChildren = 1;
  } else {
    var nodes = this.child.getNodes();
    for (var i = 0; i < nodes.length; i++) {
      childNode = nodes[i];

      noOfChildren += childNode.getNoOfChildren();
    }
  }

  if (noOfChildren == 0) {
    noOfChildren = 1;
  }
  return noOfChildren;
};

LNode.prototype.getEstimatedSize = function () {
  if (this.estimatedSize == Integer.MIN_VALUE) {
    throw "assert failed";
  }
  return this.estimatedSize;
};

LNode.prototype.calcEstimatedSize = function () {
  if (this.child == null) {
    return this.estimatedSize = (this.rect.width + this.rect.height) / 2;
  } else {
    this.estimatedSize = this.child.calcEstimatedSize();
    this.rect.width = this.estimatedSize;
    this.rect.height = this.estimatedSize;

    return this.estimatedSize;
  }
};

LNode.prototype.scatter = function () {
  var randomCenterX;
  var randomCenterY;

  var minX = -LayoutConstants.INITIAL_WORLD_BOUNDARY;
  var maxX = LayoutConstants.INITIAL_WORLD_BOUNDARY;
  randomCenterX = LayoutConstants.WORLD_CENTER_X + RandomSeed.nextDouble() * (maxX - minX) + minX;

  var minY = -LayoutConstants.INITIAL_WORLD_BOUNDARY;
  var maxY = LayoutConstants.INITIAL_WORLD_BOUNDARY;
  randomCenterY = LayoutConstants.WORLD_CENTER_Y + RandomSeed.nextDouble() * (maxY - minY) + minY;

  this.rect.x = randomCenterX;
  this.rect.y = randomCenterY;
};

LNode.prototype.updateBounds = function () {
  if (this.getChild() == null) {
    throw "assert failed";
  }
  if (this.getChild().getNodes().length != 0) {
    // wrap the children nodes by re-arranging the boundaries
    var childGraph = this.getChild();
    childGraph.updateBounds(true);

    this.rect.x = childGraph.getLeft();
    this.rect.y = childGraph.getTop();

    this.setWidth(childGraph.getRight() - childGraph.getLeft());
    this.setHeight(childGraph.getBottom() - childGraph.getTop());

    // Update compound bounds considering its label properties    
    if (LayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS) {

      var width = childGraph.getRight() - childGraph.getLeft();
      var height = childGraph.getBottom() - childGraph.getTop();

      if (this.labelWidth > width) {
        this.rect.x -= (this.labelWidth - width) / 2;
        this.setWidth(this.labelWidth);
      }

      if (this.labelHeight > height) {
        if (this.labelPos == "center") {
          this.rect.y -= (this.labelHeight - height) / 2;
        } else if (this.labelPos == "top") {
          this.rect.y -= this.labelHeight - height;
        }
        this.setHeight(this.labelHeight);
      }
    }
  }
};

LNode.prototype.getInclusionTreeDepth = function () {
  if (this.inclusionTreeDepth == Integer.MAX_VALUE) {
    throw "assert failed";
  }
  return this.inclusionTreeDepth;
};

LNode.prototype.transform = function (trans) {
  var left = this.rect.x;

  if (left > LayoutConstants.WORLD_BOUNDARY) {
    left = LayoutConstants.WORLD_BOUNDARY;
  } else if (left < -LayoutConstants.WORLD_BOUNDARY) {
    left = -LayoutConstants.WORLD_BOUNDARY;
  }

  var top = this.rect.y;

  if (top > LayoutConstants.WORLD_BOUNDARY) {
    top = LayoutConstants.WORLD_BOUNDARY;
  } else if (top < -LayoutConstants.WORLD_BOUNDARY) {
    top = -LayoutConstants.WORLD_BOUNDARY;
  }

  var leftTop = new PointD(left, top);
  var vLeftTop = trans.inverseTransformPoint(leftTop);

  this.setLocation(vLeftTop.x, vLeftTop.y);
};

LNode.prototype.getLeft = function () {
  return this.rect.x;
};

LNode.prototype.getRight = function () {
  return this.rect.x + this.rect.width;
};

LNode.prototype.getTop = function () {
  return this.rect.y;
};

LNode.prototype.getBottom = function () {
  return this.rect.y + this.rect.height;
};

LNode.prototype.getParent = function () {
  if (this.owner == null) {
    return null;
  }

  return this.owner.getParent();
};

module.exports = LNode;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LayoutConstants = __webpack_require__(0);
var HashMap = __webpack_require__(25);
var LGraphManager = __webpack_require__(9);
var LNode = __webpack_require__(11);
var LEdge = __webpack_require__(3);
var LGraph = __webpack_require__(4);
var PointD = __webpack_require__(5);
var Transform = __webpack_require__(15);
var Emitter = __webpack_require__(30);
var HashSet = __webpack_require__(6);

function Layout(isRemoteUse) {
  Emitter.call(this);

  //Layout Quality: 0:proof, 1:default, 2:draft
  this.layoutQuality = LayoutConstants.DEFAULT_QUALITY;
  //Whether layout should create bendpoints as needed or not
  this.createBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
  //Whether layout should be incremental or not
  this.incremental = LayoutConstants.DEFAULT_INCREMENTAL;
  //Whether we animate from before to after layout node positions
  this.animationOnLayout = LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT;
  //Whether we animate the layout process or not
  this.animationDuringLayout = LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT;
  //Number iterations that should be done between two successive animations
  this.animationPeriod = LayoutConstants.DEFAULT_ANIMATION_PERIOD;
  /**
   * Whether or not leaf nodes (non-compound nodes) are of uniform sizes. When
   * they are, both spring and repulsion forces between two leaf nodes can be
   * calculated without the expensive clipping point calculations, resulting
   * in major speed-up.
   */
  this.uniformLeafNodeSizes = LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
  /**
   * This is used for creation of bendpoints by using dummy nodes and edges.
   * Maps an LEdge to its dummy bendpoint path.
   */
  this.edgeToDummyNodes = new HashMap();
  this.graphManager = new LGraphManager(this);
  this.isLayoutFinished = false;
  this.isSubLayout = false;
  this.isRemoteUse = false;

  if (isRemoteUse != null) {
    this.isRemoteUse = isRemoteUse;
  }
}

Layout.RANDOM_SEED = 1;

Layout.prototype = Object.create(Emitter.prototype);

Layout.prototype.getGraphManager = function () {
  return this.graphManager;
};

Layout.prototype.getAllNodes = function () {
  return this.graphManager.getAllNodes();
};

Layout.prototype.getAllEdges = function () {
  return this.graphManager.getAllEdges();
};

Layout.prototype.getAllNodesToApplyGravitation = function () {
  return this.graphManager.getAllNodesToApplyGravitation();
};

Layout.prototype.newGraphManager = function () {
  var gm = new LGraphManager(this);
  this.graphManager = gm;
  return gm;
};

Layout.prototype.newGraph = function (vGraph) {
  return new LGraph(null, this.graphManager, vGraph);
};

Layout.prototype.newNode = function (vNode) {
  return new LNode(this.graphManager, vNode);
};

Layout.prototype.newEdge = function (vEdge) {
  return new LEdge(null, null, vEdge);
};

Layout.prototype.checkLayoutSuccess = function () {
  return this.graphManager.getRoot() == null || this.graphManager.getRoot().getNodes().length == 0 || this.graphManager.includesInvalidEdge();
};

Layout.prototype.runLayout = function () {
  this.isLayoutFinished = false;

  if (this.tilingPreLayout) {
    this.tilingPreLayout();
  }

  this.initParameters();
  var isLayoutSuccessfull;

  if (this.checkLayoutSuccess()) {
    isLayoutSuccessfull = false;
  } else {
    isLayoutSuccessfull = this.layout();
  }

  if (LayoutConstants.ANIMATE === 'during') {
    // If this is a 'during' layout animation. Layout is not finished yet. 
    // We need to perform these in index.js when layout is really finished.
    return false;
  }

  if (isLayoutSuccessfull) {
    if (!this.isSubLayout) {
      this.doPostLayout();
    }
  }

  if (this.tilingPostLayout) {
    this.tilingPostLayout();
  }

  this.isLayoutFinished = true;

  return isLayoutSuccessfull;
};

/**
 * This method performs the operations required after layout.
 */
Layout.prototype.doPostLayout = function () {
  //assert !isSubLayout : "Should not be called on sub-layout!";
  // Propagate geometric changes to v-level objects
  if (!this.incremental) {
    this.transform();
  }
  this.update();
};

/**
 * This method updates the geometry of the target graph according to
 * calculated layout.
 */
Layout.prototype.update2 = function () {
  // update bend points
  if (this.createBendsAsNeeded) {
    this.createBendpointsFromDummyNodes();

    // reset all edges, since the topology has changed
    this.graphManager.resetAllEdges();
  }

  // perform edge, node and root updates if layout is not called
  // remotely
  if (!this.isRemoteUse) {
    // update all edges
    var edge;
    var allEdges = this.graphManager.getAllEdges();
    for (var i = 0; i < allEdges.length; i++) {
      edge = allEdges[i];
      //      this.update(edge);
    }

    // recursively update nodes
    var node;
    var nodes = this.graphManager.getRoot().getNodes();
    for (var i = 0; i < nodes.length; i++) {
      node = nodes[i];
      //      this.update(node);
    }

    // update root graph
    this.update(this.graphManager.getRoot());
  }
};

Layout.prototype.update = function (obj) {
  if (obj == null) {
    this.update2();
  } else if (obj instanceof LNode) {
    var node = obj;
    if (node.getChild() != null) {
      // since node is compound, recursively update child nodes
      var nodes = node.getChild().getNodes();
      for (var i = 0; i < nodes.length; i++) {
        update(nodes[i]);
      }
    }

    // if the l-level node is associated with a v-level graph object,
    // then it is assumed that the v-level node implements the
    // interface Updatable.
    if (node.vGraphObject != null) {
      // cast to Updatable without any type check
      var vNode = node.vGraphObject;

      // call the update method of the interface
      vNode.update(node);
    }
  } else if (obj instanceof LEdge) {
    var edge = obj;
    // if the l-level edge is associated with a v-level graph object,
    // then it is assumed that the v-level edge implements the
    // interface Updatable.

    if (edge.vGraphObject != null) {
      // cast to Updatable without any type check
      var vEdge = edge.vGraphObject;

      // call the update method of the interface
      vEdge.update(edge);
    }
  } else if (obj instanceof LGraph) {
    var graph = obj;
    // if the l-level graph is associated with a v-level graph object,
    // then it is assumed that the v-level object implements the
    // interface Updatable.

    if (graph.vGraphObject != null) {
      // cast to Updatable without any type check
      var vGraph = graph.vGraphObject;

      // call the update method of the interface
      vGraph.update(graph);
    }
  }
};

/**
 * This method is used to set all layout parameters to default values
 * determined at compile time.
 */
Layout.prototype.initParameters = function () {
  if (!this.isSubLayout) {
    this.layoutQuality = LayoutConstants.DEFAULT_QUALITY;
    this.animationDuringLayout = LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT;
    this.animationPeriod = LayoutConstants.DEFAULT_ANIMATION_PERIOD;
    this.animationOnLayout = LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT;
    this.incremental = LayoutConstants.DEFAULT_INCREMENTAL;
    this.createBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
    this.uniformLeafNodeSizes = LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
  }

  if (this.animationDuringLayout) {
    this.animationOnLayout = false;
  }
};

Layout.prototype.transform = function (newLeftTop) {
  if (newLeftTop == undefined) {
    this.transform(new PointD(0, 0));
  } else {
    // create a transformation object (from Eclipse to layout). When an
    // inverse transform is applied, we get upper-left coordinate of the
    // drawing or the root graph at given input coordinate (some margins
    // already included in calculation of left-top).

    var trans = new Transform();
    var leftTop = this.graphManager.getRoot().updateLeftTop();

    if (leftTop != null) {
      trans.setWorldOrgX(newLeftTop.x);
      trans.setWorldOrgY(newLeftTop.y);

      trans.setDeviceOrgX(leftTop.x);
      trans.setDeviceOrgY(leftTop.y);

      var nodes = this.getAllNodes();
      var node;

      for (var i = 0; i < nodes.length; i++) {
        node = nodes[i];
        node.transform(trans);
      }
    }
  }
};

Layout.prototype.positionNodesRandomly = function (graph) {

  if (graph == undefined) {
    //assert !this.incremental;
    this.positionNodesRandomly(this.getGraphManager().getRoot());
    this.getGraphManager().getRoot().updateBounds(true);
  } else {
    var lNode;
    var childGraph;

    var nodes = graph.getNodes();
    for (var i = 0; i < nodes.length; i++) {
      lNode = nodes[i];
      childGraph = lNode.getChild();

      if (childGraph == null) {
        lNode.scatter();
      } else if (childGraph.getNodes().length == 0) {
        lNode.scatter();
      } else {
        this.positionNodesRandomly(childGraph);
        lNode.updateBounds();
      }
    }
  }
};

/**
 * This method returns a list of trees where each tree is represented as a
 * list of l-nodes. The method returns a list of size 0 when:
 * - The graph is not flat or
 * - One of the component(s) of the graph is not a tree.
 */
Layout.prototype.getFlatForest = function () {
  var flatForest = [];
  var isForest = true;

  // Quick reference for all nodes in the graph manager associated with
  // this layout. The list should not be changed.
  var allNodes = this.graphManager.getRoot().getNodes();

  // First be sure that the graph is flat
  var isFlat = true;

  for (var i = 0; i < allNodes.length; i++) {
    if (allNodes[i].getChild() != null) {
      isFlat = false;
    }
  }

  // Return empty forest if the graph is not flat.
  if (!isFlat) {
    return flatForest;
  }

  // Run BFS for each component of the graph.

  var visited = new HashSet();
  var toBeVisited = [];
  var parents = new HashMap();
  var unProcessedNodes = [];

  unProcessedNodes = unProcessedNodes.concat(allNodes);

  // Each iteration of this loop finds a component of the graph and
  // decides whether it is a tree or not. If it is a tree, adds it to the
  // forest and continued with the next component.

  while (unProcessedNodes.length > 0 && isForest) {
    toBeVisited.push(unProcessedNodes[0]);

    // Start the BFS. Each iteration of this loop visits a node in a
    // BFS manner.
    while (toBeVisited.length > 0 && isForest) {
      //pool operation
      var currentNode = toBeVisited[0];
      toBeVisited.splice(0, 1);
      visited.add(currentNode);

      // Traverse all neighbors of this node
      var neighborEdges = currentNode.getEdges();

      for (var i = 0; i < neighborEdges.length; i++) {
        var currentNeighbor = neighborEdges[i].getOtherEnd(currentNode);

        // If BFS is not growing from this neighbor.
        if (parents.get(currentNode) != currentNeighbor) {
          // We haven't previously visited this neighbor.
          if (!visited.contains(currentNeighbor)) {
            toBeVisited.push(currentNeighbor);
            parents.put(currentNeighbor, currentNode);
          }
          // Since we have previously visited this neighbor and
          // this neighbor is not parent of currentNode, given
          // graph contains a component that is not tree, hence
          // it is not a forest.
          else {
              isForest = false;
              break;
            }
        }
      }
    }

    // The graph contains a component that is not a tree. Empty
    // previously found trees. The method will end.
    if (!isForest) {
      flatForest = [];
    }
    // Save currently visited nodes as a tree in our forest. Reset
    // visited and parents lists. Continue with the next component of
    // the graph, if any.
    else {
        var temp = [];
        visited.addAllTo(temp);
        flatForest.push(temp);
        //flatForest = flatForest.concat(temp);
        //unProcessedNodes.removeAll(visited);
        for (var i = 0; i < temp.length; i++) {
          var value = temp[i];
          var index = unProcessedNodes.indexOf(value);
          if (index > -1) {
            unProcessedNodes.splice(index, 1);
          }
        }
        visited = new HashSet();
        parents = new HashMap();
      }
  }

  return flatForest;
};

/**
 * This method creates dummy nodes (an l-level node with minimal dimensions)
 * for the given edge (one per bendpoint). The existing l-level structure
 * is updated accordingly.
 */
Layout.prototype.createDummyNodesForBendpoints = function (edge) {
  var dummyNodes = [];
  var prev = edge.source;

  var graph = this.graphManager.calcLowestCommonAncestor(edge.source, edge.target);

  for (var i = 0; i < edge.bendpoints.length; i++) {
    // create new dummy node
    var dummyNode = this.newNode(null);
    dummyNode.setRect(new Point(0, 0), new Dimension(1, 1));

    graph.add(dummyNode);

    // create new dummy edge between prev and dummy node
    var dummyEdge = this.newEdge(null);
    this.graphManager.add(dummyEdge, prev, dummyNode);

    dummyNodes.add(dummyNode);
    prev = dummyNode;
  }

  var dummyEdge = this.newEdge(null);
  this.graphManager.add(dummyEdge, prev, edge.target);

  this.edgeToDummyNodes.put(edge, dummyNodes);

  // remove real edge from graph manager if it is inter-graph
  if (edge.isInterGraph()) {
    this.graphManager.remove(edge);
  }
  // else, remove the edge from the current graph
  else {
      graph.remove(edge);
    }

  return dummyNodes;
};

/**
 * This method creates bendpoints for edges from the dummy nodes
 * at l-level.
 */
Layout.prototype.createBendpointsFromDummyNodes = function () {
  var edges = [];
  edges = edges.concat(this.graphManager.getAllEdges());
  edges = this.edgeToDummyNodes.keySet().concat(edges);

  for (var k = 0; k < edges.length; k++) {
    var lEdge = edges[k];

    if (lEdge.bendpoints.length > 0) {
      var path = this.edgeToDummyNodes.get(lEdge);

      for (var i = 0; i < path.length; i++) {
        var dummyNode = path[i];
        var p = new PointD(dummyNode.getCenterX(), dummyNode.getCenterY());

        // update bendpoint's location according to dummy node
        var ebp = lEdge.bendpoints.get(i);
        ebp.x = p.x;
        ebp.y = p.y;

        // remove the dummy node, dummy edges incident with this
        // dummy node is also removed (within the remove method)
        dummyNode.getOwner().remove(dummyNode);
      }

      // add the real edge to graph
      this.graphManager.add(lEdge, lEdge.source, lEdge.target);
    }
  }
};

Layout.transform = function (sliderValue, defaultValue, minDiv, maxMul) {
  if (minDiv != undefined && maxMul != undefined) {
    var value = defaultValue;

    if (sliderValue <= 50) {
      var minValue = defaultValue / minDiv;
      value -= (defaultValue - minValue) / 50 * (50 - sliderValue);
    } else {
      var maxValue = defaultValue * maxMul;
      value += (maxValue - defaultValue) / 50 * (sliderValue - 50);
    }

    return value;
  } else {
    var a, b;

    if (sliderValue <= 50) {
      a = 9.0 * defaultValue / 500.0;
      b = defaultValue / 10.0;
    } else {
      a = 9.0 * defaultValue / 50.0;
      b = -8 * defaultValue;
    }

    return a * sliderValue + b;
  }
};

/**
 * This method finds and returns the center of the given nodes, assuming
 * that the given nodes form a tree in themselves.
 */
Layout.findCenterOfTree = function (nodes) {
  var list = [];
  list = list.concat(nodes);

  var removedNodes = [];
  var remainingDegrees = new HashMap();
  var foundCenter = false;
  var centerNode = null;

  if (list.length == 1 || list.length == 2) {
    foundCenter = true;
    centerNode = list[0];
  }

  for (var i = 0; i < list.length; i++) {
    var node = list[i];
    var degree = node.getNeighborsList().size();
    remainingDegrees.put(node, node.getNeighborsList().size());

    if (degree == 1) {
      removedNodes.push(node);
    }
  }

  var tempList = [];
  tempList = tempList.concat(removedNodes);

  while (!foundCenter) {
    var tempList2 = [];
    tempList2 = tempList2.concat(tempList);
    tempList = [];

    for (var i = 0; i < list.length; i++) {
      var node = list[i];

      var index = list.indexOf(node);
      if (index >= 0) {
        list.splice(index, 1);
      }

      var neighbours = node.getNeighborsList();

      Object.keys(neighbours.set).forEach(function (j) {
        var neighbour = neighbours.set[j];
        if (removedNodes.indexOf(neighbour) < 0) {
          var otherDegree = remainingDegrees.get(neighbour);
          var newDegree = otherDegree - 1;

          if (newDegree == 1) {
            tempList.push(neighbour);
          }

          remainingDegrees.put(neighbour, newDegree);
        }
      });
    }

    removedNodes = removedNodes.concat(tempList);

    if (list.length == 1 || list.length == 2) {
      foundCenter = true;
      centerNode = list[0];
    }
  }

  return centerNode;
};

/**
 * During the coarsening process, this layout may be referenced by two graph managers
 * this setter function grants access to change the currently being used graph manager
 */
Layout.prototype.setGraphManager = function (gm) {
  this.graphManager = gm;
};

module.exports = Layout;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
 *This class is the javascript implementation of the Point.java class in jdk
 */
function Point(x, y, p) {
  this.x = null;
  this.y = null;
  if (x == null && y == null && p == null) {
    this.x = 0;
    this.y = 0;
  } else if (typeof x == 'number' && typeof y == 'number' && p == null) {
    this.x = x;
    this.y = y;
  } else if (x.constructor.name == 'Point' && y == null && p == null) {
    p = x;
    this.x = p.x;
    this.y = p.y;
  }
}

Point.prototype.getX = function () {
  return this.x;
};

Point.prototype.getY = function () {
  return this.y;
};

Point.prototype.getLocation = function () {
  return new Point(this.x, this.y);
};

Point.prototype.setLocation = function (x, y, p) {
  if (x.constructor.name == 'Point' && y == null && p == null) {
    p = x;
    this.setLocation(p.x, p.y);
  } else if (typeof x == 'number' && typeof y == 'number' && p == null) {
    //if both parameters are integer just move (x,y) location
    if (parseInt(x) == x && parseInt(y) == y) {
      this.move(x, y);
    } else {
      this.x = Math.floor(x + 0.5);
      this.y = Math.floor(y + 0.5);
    }
  }
};

Point.prototype.move = function (x, y) {
  this.x = x;
  this.y = y;
};

Point.prototype.translate = function (dx, dy) {
  this.x += dx;
  this.y += dy;
};

Point.prototype.equals = function (obj) {
  if (obj.constructor.name == "Point") {
    var pt = obj;
    return this.x == pt.x && this.y == pt.y;
  }
  return this == obj;
};

Point.prototype.toString = function () {
  return new Point().constructor.name + "[x=" + this.x + ",y=" + this.y + "]";
};

module.exports = Point;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function RectangleD(x, y, width, height) {
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;

  if (x != null && y != null && width != null && height != null) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

RectangleD.prototype.getX = function () {
  return this.x;
};

RectangleD.prototype.setX = function (x) {
  this.x = x;
};

RectangleD.prototype.getY = function () {
  return this.y;
};

RectangleD.prototype.setY = function (y) {
  this.y = y;
};

RectangleD.prototype.getWidth = function () {
  return this.width;
};

RectangleD.prototype.setWidth = function (width) {
  this.width = width;
};

RectangleD.prototype.getHeight = function () {
  return this.height;
};

RectangleD.prototype.setHeight = function (height) {
  this.height = height;
};

RectangleD.prototype.getRight = function () {
  return this.x + this.width;
};

RectangleD.prototype.getBottom = function () {
  return this.y + this.height;
};

RectangleD.prototype.intersects = function (a) {
  if (this.getRight() < a.x) {
    return false;
  }

  if (this.getBottom() < a.y) {
    return false;
  }

  if (a.getRight() < this.x) {
    return false;
  }

  if (a.getBottom() < this.y) {
    return false;
  }

  return true;
};

RectangleD.prototype.getCenterX = function () {
  return this.x + this.width / 2;
};

RectangleD.prototype.getMinX = function () {
  return this.getX();
};

RectangleD.prototype.getMaxX = function () {
  return this.getX() + this.width;
};

RectangleD.prototype.getCenterY = function () {
  return this.y + this.height / 2;
};

RectangleD.prototype.getMinY = function () {
  return this.getY();
};

RectangleD.prototype.getMaxY = function () {
  return this.getY() + this.height;
};

RectangleD.prototype.getWidthHalf = function () {
  return this.width / 2;
};

RectangleD.prototype.getHeightHalf = function () {
  return this.height / 2;
};

module.exports = RectangleD;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var PointD = __webpack_require__(5);

function Transform(x, y) {
  this.lworldOrgX = 0.0;
  this.lworldOrgY = 0.0;
  this.ldeviceOrgX = 0.0;
  this.ldeviceOrgY = 0.0;
  this.lworldExtX = 1.0;
  this.lworldExtY = 1.0;
  this.ldeviceExtX = 1.0;
  this.ldeviceExtY = 1.0;
}

Transform.prototype.getWorldOrgX = function () {
  return this.lworldOrgX;
};

Transform.prototype.setWorldOrgX = function (wox) {
  this.lworldOrgX = wox;
};

Transform.prototype.getWorldOrgY = function () {
  return this.lworldOrgY;
};

Transform.prototype.setWorldOrgY = function (woy) {
  this.lworldOrgY = woy;
};

Transform.prototype.getWorldExtX = function () {
  return this.lworldExtX;
};

Transform.prototype.setWorldExtX = function (wex) {
  this.lworldExtX = wex;
};

Transform.prototype.getWorldExtY = function () {
  return this.lworldExtY;
};

Transform.prototype.setWorldExtY = function (wey) {
  this.lworldExtY = wey;
};

/* Device related */

Transform.prototype.getDeviceOrgX = function () {
  return this.ldeviceOrgX;
};

Transform.prototype.setDeviceOrgX = function (dox) {
  this.ldeviceOrgX = dox;
};

Transform.prototype.getDeviceOrgY = function () {
  return this.ldeviceOrgY;
};

Transform.prototype.setDeviceOrgY = function (doy) {
  this.ldeviceOrgY = doy;
};

Transform.prototype.getDeviceExtX = function () {
  return this.ldeviceExtX;
};

Transform.prototype.setDeviceExtX = function (dex) {
  this.ldeviceExtX = dex;
};

Transform.prototype.getDeviceExtY = function () {
  return this.ldeviceExtY;
};

Transform.prototype.setDeviceExtY = function (dey) {
  this.ldeviceExtY = dey;
};

Transform.prototype.transformX = function (x) {
  var xDevice = 0.0;
  var worldExtX = this.lworldExtX;
  if (worldExtX != 0.0) {
    xDevice = this.ldeviceOrgX + (x - this.lworldOrgX) * this.ldeviceExtX / worldExtX;
  }

  return xDevice;
};

Transform.prototype.transformY = function (y) {
  var yDevice = 0.0;
  var worldExtY = this.lworldExtY;
  if (worldExtY != 0.0) {
    yDevice = this.ldeviceOrgY + (y - this.lworldOrgY) * this.ldeviceExtY / worldExtY;
  }

  return yDevice;
};

Transform.prototype.inverseTransformX = function (x) {
  var xWorld = 0.0;
  var deviceExtX = this.ldeviceExtX;
  if (deviceExtX != 0.0) {
    xWorld = this.lworldOrgX + (x - this.ldeviceOrgX) * this.lworldExtX / deviceExtX;
  }

  return xWorld;
};

Transform.prototype.inverseTransformY = function (y) {
  var yWorld = 0.0;
  var deviceExtY = this.ldeviceExtY;
  if (deviceExtY != 0.0) {
    yWorld = this.lworldOrgY + (y - this.ldeviceOrgY) * this.lworldExtY / deviceExtY;
  }
  return yWorld;
};

Transform.prototype.inverseTransformPoint = function (inPoint) {
  var outPoint = new PointD(this.inverseTransformX(inPoint.x), this.inverseTransformY(inPoint.y));
  return outPoint;
};

module.exports = Transform;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function UniqueIDGeneretor() {}

UniqueIDGeneretor.lastID = 0;

UniqueIDGeneretor.createID = function (obj) {
  if (UniqueIDGeneretor.isPrimitive(obj)) {
    return obj;
  }
  if (obj.uniqueID != null) {
    return obj.uniqueID;
  }
  obj.uniqueID = UniqueIDGeneretor.getString();
  UniqueIDGeneretor.lastID++;
  return obj.uniqueID;
};

UniqueIDGeneretor.getString = function (id) {
  if (id == null) id = UniqueIDGeneretor.lastID;
  return "Object#" + id + "";
};

UniqueIDGeneretor.isPrimitive = function (arg) {
  var type = typeof arg === "undefined" ? "undefined" : _typeof(arg);
  return arg == null || type != "object" && type != "function";
};

module.exports = UniqueIDGeneretor;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var FDLayoutConstants = __webpack_require__(1);

function CoSEConstants() {}

//CoSEConstants inherits static props in FDLayoutConstants
for (var prop in FDLayoutConstants) {
  CoSEConstants[prop] = FDLayoutConstants[prop];
}

CoSEConstants.DEFAULT_USE_MULTI_LEVEL_SCALING = false;
CoSEConstants.DEFAULT_RADIAL_SEPARATION = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
CoSEConstants.DEFAULT_COMPONENT_SEPERATION = 60;
CoSEConstants.TILE = true;
CoSEConstants.TILING_PADDING_VERTICAL = 10;
CoSEConstants.TILING_PADDING_HORIZONTAL = 10;

module.exports = CoSEConstants;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var FDLayoutEdge = __webpack_require__(23);

function CoSEEdge(source, target, vEdge) {
  FDLayoutEdge.call(this, source, target, vEdge);
}

CoSEEdge.prototype = Object.create(FDLayoutEdge.prototype);
for (var prop in FDLayoutEdge) {
  CoSEEdge[prop] = FDLayoutEdge[prop];
}

module.exports = CoSEEdge;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LGraph = __webpack_require__(4);

function CoSEGraph(parent, graphMgr, vGraph) {
  LGraph.call(this, parent, graphMgr, vGraph);
}

CoSEGraph.prototype = Object.create(LGraph.prototype);
for (var prop in LGraph) {
  CoSEGraph[prop] = LGraph[prop];
}

module.exports = CoSEGraph;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LGraphManager = __webpack_require__(9);

function CoSEGraphManager(layout) {
  LGraphManager.call(this, layout);
}

CoSEGraphManager.prototype = Object.create(LGraphManager.prototype);
for (var prop in LGraphManager) {
  CoSEGraphManager[prop] = LGraphManager[prop];
}

module.exports = CoSEGraphManager;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var FDLayoutNode = __webpack_require__(24);
var IMath = __webpack_require__(8);

function CoSENode(gm, loc, size, vNode) {
  FDLayoutNode.call(this, gm, loc, size, vNode);
}

CoSENode.prototype = Object.create(FDLayoutNode.prototype);
for (var prop in FDLayoutNode) {
  CoSENode[prop] = FDLayoutNode[prop];
}

CoSENode.prototype.move = function () {
  var layout = this.graphManager.getLayout();
  this.displacementX = layout.coolingFactor * (this.springForceX + this.repulsionForceX + this.gravitationForceX) / this.noOfChildren;
  this.displacementY = layout.coolingFactor * (this.springForceY + this.repulsionForceY + this.gravitationForceY) / this.noOfChildren;

  if (Math.abs(this.displacementX) > layout.coolingFactor * layout.maxNodeDisplacement) {
    this.displacementX = layout.coolingFactor * layout.maxNodeDisplacement * IMath.sign(this.displacementX);
  }

  if (Math.abs(this.displacementY) > layout.coolingFactor * layout.maxNodeDisplacement) {
    this.displacementY = layout.coolingFactor * layout.maxNodeDisplacement * IMath.sign(this.displacementY);
  }

  // a simple node, just move it
  if (this.child == null) {
    this.moveBy(this.displacementX, this.displacementY);
  }
  // an empty compound node, again just move it
  else if (this.child.getNodes().length == 0) {
      this.moveBy(this.displacementX, this.displacementY);
    }
    // non-empty compound node, propogate movement to children as well
    else {
        this.propogateDisplacementToChildren(this.displacementX, this.displacementY);
      }

  layout.totalDisplacement += Math.abs(this.displacementX) + Math.abs(this.displacementY);

  this.springForceX = 0;
  this.springForceY = 0;
  this.repulsionForceX = 0;
  this.repulsionForceY = 0;
  this.gravitationForceX = 0;
  this.gravitationForceY = 0;
  this.displacementX = 0;
  this.displacementY = 0;
};

CoSENode.prototype.propogateDisplacementToChildren = function (dX, dY) {
  var nodes = this.getChild().getNodes();
  var node;
  for (var i = 0; i < nodes.length; i++) {
    node = nodes[i];
    if (node.getChild() == null) {
      node.moveBy(dX, dY);
      node.displacementX += dX;
      node.displacementY += dY;
    } else {
      node.propogateDisplacementToChildren(dX, dY);
    }
  }
};

CoSENode.prototype.setPred1 = function (pred1) {
  this.pred1 = pred1;
};

CoSENode.prototype.getPred1 = function () {
  return pred1;
};

CoSENode.prototype.getPred2 = function () {
  return pred2;
};

CoSENode.prototype.setNext = function (next) {
  this.next = next;
};

CoSENode.prototype.getNext = function () {
  return next;
};

CoSENode.prototype.setProcessed = function (processed) {
  this.processed = processed;
};

CoSENode.prototype.isProcessed = function () {
  return processed;
};

module.exports = CoSENode;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Layout = __webpack_require__(12);
var FDLayoutConstants = __webpack_require__(1);
var LayoutConstants = __webpack_require__(0);
var IGeometry = __webpack_require__(7);
var IMath = __webpack_require__(8);
var Integer = __webpack_require__(2);

function FDLayout() {
  Layout.call(this);

  this.useSmartIdealEdgeLengthCalculation = FDLayoutConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
  this.idealEdgeLength = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
  this.springConstant = FDLayoutConstants.DEFAULT_SPRING_STRENGTH;
  this.repulsionConstant = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH;
  this.gravityConstant = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH;
  this.compoundGravityConstant = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
  this.gravityRangeFactor = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR;
  this.compoundGravityRangeFactor = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
  this.displacementThresholdPerNode = 3.0 * FDLayoutConstants.DEFAULT_EDGE_LENGTH / 100;
  this.coolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL;
  this.initialCoolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL;
  this.totalDisplacement = 0.0;
  this.oldTotalDisplacement = 0.0;
  this.maxIterations = FDLayoutConstants.MAX_ITERATIONS;
}

FDLayout.prototype = Object.create(Layout.prototype);

for (var prop in Layout) {
  FDLayout[prop] = Layout[prop];
}

FDLayout.prototype.initParameters = function () {
  Layout.prototype.initParameters.call(this, arguments);

  if (this.layoutQuality == LayoutConstants.DRAFT_QUALITY) {
    this.displacementThresholdPerNode += 0.30;
    this.maxIterations *= 0.8;
  } else if (this.layoutQuality == LayoutConstants.PROOF_QUALITY) {
    this.displacementThresholdPerNode -= 0.30;
    this.maxIterations *= 1.2;
  }

  this.totalIterations = 0;
  this.notAnimatedIterations = 0;

  this.useFRGridVariant = FDLayoutConstants.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION;

  this.grid = [];
  // variables for tree reduction support
  this.prunedNodesAll = [];
  this.growTreeIterations = 0;
  this.afterGrowthIterations = 0;
  this.isTreeGrowing = false;
  this.isGrowthFinished = false;
};

FDLayout.prototype.calcIdealEdgeLengths = function () {
  var edge;
  var lcaDepth;
  var source;
  var target;
  var sizeOfSourceInLca;
  var sizeOfTargetInLca;

  var allEdges = this.getGraphManager().getAllEdges();
  for (var i = 0; i < allEdges.length; i++) {
    edge = allEdges[i];

    edge.idealLength = this.idealEdgeLength;

    if (edge.isInterGraph) {
      source = edge.getSource();
      target = edge.getTarget();

      sizeOfSourceInLca = edge.getSourceInLca().getEstimatedSize();
      sizeOfTargetInLca = edge.getTargetInLca().getEstimatedSize();

      if (this.useSmartIdealEdgeLengthCalculation) {
        edge.idealLength += sizeOfSourceInLca + sizeOfTargetInLca - 2 * LayoutConstants.SIMPLE_NODE_SIZE;
      }

      lcaDepth = edge.getLca().getInclusionTreeDepth();

      edge.idealLength += FDLayoutConstants.DEFAULT_EDGE_LENGTH * FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR * (source.getInclusionTreeDepth() + target.getInclusionTreeDepth() - 2 * lcaDepth);
    }
  }
};

FDLayout.prototype.initSpringEmbedder = function () {

  if (this.incremental) {
    this.maxNodeDisplacement = FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL;
  } else {
    this.coolingFactor = 1.0;
    this.initialCoolingFactor = 1.0;
    this.maxNodeDisplacement = FDLayoutConstants.MAX_NODE_DISPLACEMENT;
  }

  this.maxIterations = Math.max(this.getAllNodes().length * 5, this.maxIterations);

  this.totalDisplacementThreshold = this.displacementThresholdPerNode * this.getAllNodes().length;

  this.repulsionRange = this.calcRepulsionRange();
};

FDLayout.prototype.calcSpringForces = function () {
  var lEdges = this.getAllEdges();
  var edge;

  for (var i = 0; i < lEdges.length; i++) {
    edge = lEdges[i];

    this.calcSpringForce(edge, edge.idealLength);
  }
};

FDLayout.prototype.calcRepulsionForces = function () {
  var i, j;
  var nodeA, nodeB;
  var lNodes = this.getAllNodes();
  var processedNodeSet;

  if (this.useFRGridVariant) {
    if (this.totalIterations % FDLayoutConstants.GRID_CALCULATION_CHECK_PERIOD == 1 && !this.isTreeGrowing && !this.isGrowthFinished) {
      this.updateGrid();
    }

    processedNodeSet = new Set();

    // calculate repulsion forces between each nodes and its surrounding
    for (i = 0; i < lNodes.length; i++) {
      nodeA = lNodes[i];
      this.calculateRepulsionForceOfANode(nodeA, processedNodeSet);
      processedNodeSet.add(nodeA);
    }
  } else {
    for (i = 0; i < lNodes.length; i++) {
      nodeA = lNodes[i];

      for (j = i + 1; j < lNodes.length; j++) {
        nodeB = lNodes[j];

        // If both nodes are not members of the same graph, skip.
        if (nodeA.getOwner() != nodeB.getOwner()) {
          continue;
        }

        this.calcRepulsionForce(nodeA, nodeB);
      }
    }
  }
};

FDLayout.prototype.calcGravitationalForces = function () {
  var node;
  var lNodes = this.getAllNodesToApplyGravitation();

  for (var i = 0; i < lNodes.length; i++) {
    node = lNodes[i];
    this.calcGravitationalForce(node);
  }
};

FDLayout.prototype.moveNodes = function () {
  var lNodes = this.getAllNodes();
  var node;

  for (var i = 0; i < lNodes.length; i++) {
    node = lNodes[i];
    node.move();
  }
};

FDLayout.prototype.calcSpringForce = function (edge, idealLength) {
  var sourceNode = edge.getSource();
  var targetNode = edge.getTarget();

  var length;
  var springForce;
  var springForceX;
  var springForceY;

  // Update edge length
  if (this.uniformLeafNodeSizes && sourceNode.getChild() == null && targetNode.getChild() == null) {
    edge.updateLengthSimple();
  } else {
    edge.updateLength();

    if (edge.isOverlapingSourceAndTarget) {
      return;
    }
  }

  length = edge.getLength();

  // Calculate spring forces
  springForce = this.springConstant * (length - idealLength);

  // Project force onto x and y axes
  springForceX = springForce * (edge.lengthX / length);
  springForceY = springForce * (edge.lengthY / length);

  // Apply forces on the end nodes
  sourceNode.springForceX += springForceX;
  sourceNode.springForceY += springForceY;
  targetNode.springForceX -= springForceX;
  targetNode.springForceY -= springForceY;
};

FDLayout.prototype.calcRepulsionForce = function (nodeA, nodeB) {
  var rectA = nodeA.getRect();
  var rectB = nodeB.getRect();
  var overlapAmount = new Array(2);
  var clipPoints = new Array(4);
  var distanceX;
  var distanceY;
  var distanceSquared;
  var distance;
  var repulsionForce;
  var repulsionForceX;
  var repulsionForceY;

  if (rectA.intersects(rectB)) // two nodes overlap
    {
      // calculate separation amount in x and y directions
      IGeometry.calcSeparationAmount(rectA, rectB, overlapAmount, FDLayoutConstants.DEFAULT_EDGE_LENGTH / 2.0);

      repulsionForceX = 2 * overlapAmount[0];
      repulsionForceY = 2 * overlapAmount[1];

      var childrenConstant = nodeA.noOfChildren * nodeB.noOfChildren / (nodeA.noOfChildren + nodeB.noOfChildren);

      // Apply forces on the two nodes
      nodeA.repulsionForceX -= childrenConstant * repulsionForceX;
      nodeA.repulsionForceY -= childrenConstant * repulsionForceY;
      nodeB.repulsionForceX += childrenConstant * repulsionForceX;
      nodeB.repulsionForceY += childrenConstant * repulsionForceY;
    } else // no overlap
    {
      // calculate distance

      if (this.uniformLeafNodeSizes && nodeA.getChild() == null && nodeB.getChild() == null) // simply base repulsion on distance of node centers
        {
          distanceX = rectB.getCenterX() - rectA.getCenterX();
          distanceY = rectB.getCenterY() - rectA.getCenterY();
        } else // use clipping points
        {
          IGeometry.getIntersection(rectA, rectB, clipPoints);

          distanceX = clipPoints[2] - clipPoints[0];
          distanceY = clipPoints[3] - clipPoints[1];
        }

      // No repulsion range. FR grid variant should take care of this.
      if (Math.abs(distanceX) < FDLayoutConstants.MIN_REPULSION_DIST) {
        distanceX = IMath.sign(distanceX) * FDLayoutConstants.MIN_REPULSION_DIST;
      }

      if (Math.abs(distanceY) < FDLayoutConstants.MIN_REPULSION_DIST) {
        distanceY = IMath.sign(distanceY) * FDLayoutConstants.MIN_REPULSION_DIST;
      }

      distanceSquared = distanceX * distanceX + distanceY * distanceY;
      distance = Math.sqrt(distanceSquared);

      repulsionForce = this.repulsionConstant * nodeA.noOfChildren * nodeB.noOfChildren / distanceSquared;

      // Project force onto x and y axes
      repulsionForceX = repulsionForce * distanceX / distance;
      repulsionForceY = repulsionForce * distanceY / distance;

      // Apply forces on the two nodes    
      nodeA.repulsionForceX -= repulsionForceX;
      nodeA.repulsionForceY -= repulsionForceY;
      nodeB.repulsionForceX += repulsionForceX;
      nodeB.repulsionForceY += repulsionForceY;
    }
};

FDLayout.prototype.calcGravitationalForce = function (node) {
  var ownerGraph;
  var ownerCenterX;
  var ownerCenterY;
  var distanceX;
  var distanceY;
  var absDistanceX;
  var absDistanceY;
  var estimatedSize;
  ownerGraph = node.getOwner();

  ownerCenterX = (ownerGraph.getRight() + ownerGraph.getLeft()) / 2;
  ownerCenterY = (ownerGraph.getTop() + ownerGraph.getBottom()) / 2;
  distanceX = node.getCenterX() - ownerCenterX;
  distanceY = node.getCenterY() - ownerCenterY;
  absDistanceX = Math.abs(distanceX) + node.getWidth() / 2;
  absDistanceY = Math.abs(distanceY) + node.getHeight() / 2;

  if (node.getOwner() == this.graphManager.getRoot()) // in the root graph
    {
      estimatedSize = ownerGraph.getEstimatedSize() * this.gravityRangeFactor;

      if (absDistanceX > estimatedSize || absDistanceY > estimatedSize) {
        node.gravitationForceX = -this.gravityConstant * distanceX;
        node.gravitationForceY = -this.gravityConstant * distanceY;
      }
    } else // inside a compound
    {
      estimatedSize = ownerGraph.getEstimatedSize() * this.compoundGravityRangeFactor;

      if (absDistanceX > estimatedSize || absDistanceY > estimatedSize) {
        node.gravitationForceX = -this.gravityConstant * distanceX * this.compoundGravityConstant;
        node.gravitationForceY = -this.gravityConstant * distanceY * this.compoundGravityConstant;
      }
    }
};

FDLayout.prototype.isConverged = function () {
  var converged;
  var oscilating = false;

  if (this.totalIterations > this.maxIterations / 3) {
    oscilating = Math.abs(this.totalDisplacement - this.oldTotalDisplacement) < 2;
  }

  converged = this.totalDisplacement < this.totalDisplacementThreshold;

  this.oldTotalDisplacement = this.totalDisplacement;

  return converged || oscilating;
};

FDLayout.prototype.animate = function () {
  if (this.animationDuringLayout && !this.isSubLayout) {
    if (this.notAnimatedIterations == this.animationPeriod) {
      this.update();
      this.notAnimatedIterations = 0;
    } else {
      this.notAnimatedIterations++;
    }
  }
};

// -----------------------------------------------------------------------------
// Section: FR-Grid Variant Repulsion Force Calculation
// -----------------------------------------------------------------------------

FDLayout.prototype.calcGrid = function (graph) {

  var sizeX = 0;
  var sizeY = 0;

  sizeX = parseInt(Math.ceil((graph.getRight() - graph.getLeft()) / this.repulsionRange));
  sizeY = parseInt(Math.ceil((graph.getBottom() - graph.getTop()) / this.repulsionRange));

  var grid = new Array(sizeX);

  for (var i = 0; i < sizeX; i++) {
    grid[i] = new Array(sizeY);
  }

  for (var i = 0; i < sizeX; i++) {
    for (var j = 0; j < sizeY; j++) {
      grid[i][j] = new Array();
    }
  }

  return grid;
};

FDLayout.prototype.addNodeToGrid = function (v, left, top) {

  var startX = 0;
  var finishX = 0;
  var startY = 0;
  var finishY = 0;

  startX = parseInt(Math.floor((v.getRect().x - left) / this.repulsionRange));
  finishX = parseInt(Math.floor((v.getRect().width + v.getRect().x - left) / this.repulsionRange));
  startY = parseInt(Math.floor((v.getRect().y - top) / this.repulsionRange));
  finishY = parseInt(Math.floor((v.getRect().height + v.getRect().y - top) / this.repulsionRange));

  for (var i = startX; i <= finishX; i++) {
    for (var j = startY; j <= finishY; j++) {
      this.grid[i][j].push(v);
      v.setGridCoordinates(startX, finishX, startY, finishY);
    }
  }
};

FDLayout.prototype.updateGrid = function () {
  var i;
  var nodeA;
  var lNodes = this.getAllNodes();

  this.grid = this.calcGrid(this.graphManager.getRoot());

  // put all nodes to proper grid cells
  for (i = 0; i < lNodes.length; i++) {
    nodeA = lNodes[i];
    this.addNodeToGrid(nodeA, this.graphManager.getRoot().getLeft(), this.graphManager.getRoot().getTop());
  }
};

FDLayout.prototype.calculateRepulsionForceOfANode = function (nodeA, processedNodeSet) {

  if (this.totalIterations % FDLayoutConstants.GRID_CALCULATION_CHECK_PERIOD == 1 && !this.isTreeGrowing && !this.isGrowthFinished || this.growTreeIterations % 10 == 1 && this.isTreeGrowing || this.afterGrowthIterations % 10 == 1 && this.isGrowthFinished) {
    var surrounding = new Set();
    nodeA.surrounding = new Array();
    var nodeB;
    var grid = this.grid;

    for (var i = nodeA.startX - 1; i < nodeA.finishX + 2; i++) {
      for (var j = nodeA.startY - 1; j < nodeA.finishY + 2; j++) {
        if (!(i < 0 || j < 0 || i >= grid.length || j >= grid[0].length)) {
          for (var k = 0; k < grid[i][j].length; k++) {
            nodeB = grid[i][j][k];

            // If both nodes are not members of the same graph, 
            // or both nodes are the same, skip.
            if (nodeA.getOwner() != nodeB.getOwner() || nodeA == nodeB) {
              continue;
            }

            // check if the repulsion force between
            // nodeA and nodeB has already been calculated
            if (!processedNodeSet.has(nodeB) && !surrounding.has(nodeB)) {
              var distanceX = Math.abs(nodeA.getCenterX() - nodeB.getCenterX()) - (nodeA.getWidth() / 2 + nodeB.getWidth() / 2);
              var distanceY = Math.abs(nodeA.getCenterY() - nodeB.getCenterY()) - (nodeA.getHeight() / 2 + nodeB.getHeight() / 2);

              // if the distance between nodeA and nodeB 
              // is less then calculation range
              if (distanceX <= this.repulsionRange && distanceY <= this.repulsionRange) {
                //then add nodeB to surrounding of nodeA
                surrounding.add(nodeB);
              }
            }
          }
        }
      }
    }

    nodeA.surrounding = [].concat(_toConsumableArray(surrounding));
  }
  for (i = 0; i < nodeA.surrounding.length; i++) {
    this.calcRepulsionForce(nodeA, nodeA.surrounding[i]);
  }
};

FDLayout.prototype.calcRepulsionRange = function () {
  return 0.0;
};

// -----------------------------------------------------------------------------
// Section: Tree Reduction methods
// -----------------------------------------------------------------------------
// Reduce trees 
FDLayout.prototype.reduceTrees = function () {
  var prunedNodesAll = [];
  var containsLeaf = true;
  var node;

  while (containsLeaf) {
    var allNodes = this.graphManager.getAllNodes();
    var prunedNodesInStepTemp = [];
    containsLeaf = false;

    for (var i = 0; i < allNodes.length; i++) {
      node = allNodes[i];
      if (node.getEdges().length == 1 && !node.getEdges()[0].isInterGraph && node.getChild() == null) {
        prunedNodesInStepTemp.push([node, node.getEdges()[0], node.getOwner()]);
        containsLeaf = true;
      }
    }
    if (containsLeaf == true) {
      var prunedNodesInStep = [];
      for (var j = 0; j < prunedNodesInStepTemp.length; j++) {
        if (prunedNodesInStepTemp[j][0].getEdges().length == 1) {
          prunedNodesInStep.push(prunedNodesInStepTemp[j]);
          prunedNodesInStepTemp[j][0].getOwner().remove(prunedNodesInStepTemp[j][0]);
        }
      }
      prunedNodesAll.push(prunedNodesInStep);
      this.graphManager.resetAllNodes();
      this.graphManager.resetAllEdges();
    }
  }
  this.prunedNodesAll = prunedNodesAll;
};

// Grow tree one step 
FDLayout.prototype.growTree = function (prunedNodesAll) {
  var lengthOfPrunedNodesInStep = prunedNodesAll.length;
  var prunedNodesInStep = prunedNodesAll[lengthOfPrunedNodesInStep - 1];

  var nodeData;
  for (var i = 0; i < prunedNodesInStep.length; i++) {
    nodeData = prunedNodesInStep[i];

    this.findPlaceforPrunedNode(nodeData);

    nodeData[2].add(nodeData[0]);
    nodeData[2].add(nodeData[1], nodeData[1].source, nodeData[1].target);
  }

  prunedNodesAll.splice(prunedNodesAll.length - 1, 1);
  this.graphManager.resetAllNodes();
  this.graphManager.resetAllEdges();
};

// Find an appropriate position to replace pruned node, this method can be improved
FDLayout.prototype.findPlaceforPrunedNode = function (nodeData) {

  var gridForPrunedNode;
  var nodeToConnect;
  var prunedNode = nodeData[0];
  if (prunedNode == nodeData[1].source) {
    nodeToConnect = nodeData[1].target;
  } else {
    nodeToConnect = nodeData[1].source;
  }
  var startGridX = nodeToConnect.startX;
  var finishGridX = nodeToConnect.finishX;
  var startGridY = nodeToConnect.startY;
  var finishGridY = nodeToConnect.finishY;

  var upNodeCount = 0;
  var downNodeCount = 0;
  var rightNodeCount = 0;
  var leftNodeCount = 0;
  var controlRegions = [upNodeCount, rightNodeCount, downNodeCount, leftNodeCount];

  if (startGridY > 0) {
    for (var i = startGridX; i <= finishGridX; i++) {
      controlRegions[0] += this.grid[i][startGridY - 1].length + this.grid[i][startGridY].length - 1;
    }
  }
  if (finishGridX < this.grid.length - 1) {
    for (var i = startGridY; i <= finishGridY; i++) {
      controlRegions[1] += this.grid[finishGridX + 1][i].length + this.grid[finishGridX][i].length - 1;
    }
  }
  if (finishGridY < this.grid[0].length - 1) {
    for (var i = startGridX; i <= finishGridX; i++) {
      controlRegions[2] += this.grid[i][finishGridY + 1].length + this.grid[i][finishGridY].length - 1;
    }
  }
  if (startGridX > 0) {
    for (var i = startGridY; i <= finishGridY; i++) {
      controlRegions[3] += this.grid[startGridX - 1][i].length + this.grid[startGridX][i].length - 1;
    }
  }
  var min = Integer.MAX_VALUE;
  var minCount;
  var minIndex;
  for (var j = 0; j < controlRegions.length; j++) {
    if (controlRegions[j] < min) {
      min = controlRegions[j];
      minCount = 1;
      minIndex = j;
    } else if (controlRegions[j] == min) {
      minCount++;
    }
  }

  if (minCount == 3 && min == 0) {
    if (controlRegions[0] == 0 && controlRegions[1] == 0 && controlRegions[2] == 0) {
      gridForPrunedNode = 1;
    } else if (controlRegions[0] == 0 && controlRegions[1] == 0 && controlRegions[3] == 0) {
      gridForPrunedNode = 0;
    } else if (controlRegions[0] == 0 && controlRegions[2] == 0 && controlRegions[3] == 0) {
      gridForPrunedNode = 3;
    } else if (controlRegions[1] == 0 && controlRegions[2] == 0 && controlRegions[3] == 0) {
      gridForPrunedNode = 2;
    }
  } else if (minCount == 2 && min == 0) {
    var random = Math.floor(Math.random() * 2);
    if (controlRegions[0] == 0 && controlRegions[1] == 0) {
      ;
      if (random == 0) {
        gridForPrunedNode = 0;
      } else {
        gridForPrunedNode = 1;
      }
    } else if (controlRegions[0] == 0 && controlRegions[2] == 0) {
      if (random == 0) {
        gridForPrunedNode = 0;
      } else {
        gridForPrunedNode = 2;
      }
    } else if (controlRegions[0] == 0 && controlRegions[3] == 0) {
      if (random == 0) {
        gridForPrunedNode = 0;
      } else {
        gridForPrunedNode = 3;
      }
    } else if (controlRegions[1] == 0 && controlRegions[2] == 0) {
      if (random == 0) {
        gridForPrunedNode = 1;
      } else {
        gridForPrunedNode = 2;
      }
    } else if (controlRegions[1] == 0 && controlRegions[3] == 0) {
      if (random == 0) {
        gridForPrunedNode = 1;
      } else {
        gridForPrunedNode = 3;
      }
    } else {
      if (random == 0) {
        gridForPrunedNode = 2;
      } else {
        gridForPrunedNode = 3;
      }
    }
  } else if (minCount == 4 && min == 0) {
    var random = Math.floor(Math.random() * 4);
    gridForPrunedNode = random;
  } else {
    gridForPrunedNode = minIndex;
  }

  if (gridForPrunedNode == 0) {
    prunedNode.setCenter(nodeToConnect.getCenterX(), nodeToConnect.getCenterY() - nodeToConnect.getHeight() / 2 - FDLayoutConstants.DEFAULT_EDGE_LENGTH - prunedNode.getHeight() / 2);
  } else if (gridForPrunedNode == 1) {
    prunedNode.setCenter(nodeToConnect.getCenterX() + nodeToConnect.getWidth() / 2 + FDLayoutConstants.DEFAULT_EDGE_LENGTH + prunedNode.getWidth() / 2, nodeToConnect.getCenterY());
  } else if (gridForPrunedNode == 2) {
    prunedNode.setCenter(nodeToConnect.getCenterX(), nodeToConnect.getCenterY() + nodeToConnect.getHeight() / 2 + FDLayoutConstants.DEFAULT_EDGE_LENGTH + prunedNode.getHeight() / 2);
  } else {
    prunedNode.setCenter(nodeToConnect.getCenterX() - nodeToConnect.getWidth() / 2 - FDLayoutConstants.DEFAULT_EDGE_LENGTH - prunedNode.getWidth() / 2, nodeToConnect.getCenterY());
  }
};

module.exports = FDLayout;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LEdge = __webpack_require__(3);
var FDLayoutConstants = __webpack_require__(1);

function FDLayoutEdge(source, target, vEdge) {
  LEdge.call(this, source, target, vEdge);
  this.idealLength = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
}

FDLayoutEdge.prototype = Object.create(LEdge.prototype);

for (var prop in LEdge) {
  FDLayoutEdge[prop] = LEdge[prop];
}

module.exports = FDLayoutEdge;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LNode = __webpack_require__(11);

function FDLayoutNode(gm, loc, size, vNode) {
  // alternative constructor is handled inside LNode
  LNode.call(this, gm, loc, size, vNode);
  //Spring, repulsion and gravitational forces acting on this node
  this.springForceX = 0;
  this.springForceY = 0;
  this.repulsionForceX = 0;
  this.repulsionForceY = 0;
  this.gravitationForceX = 0;
  this.gravitationForceY = 0;
  //Amount by which this node is to be moved in this iteration
  this.displacementX = 0;
  this.displacementY = 0;

  //Start and finish grid coordinates that this node is fallen into
  this.startX = 0;
  this.finishX = 0;
  this.startY = 0;
  this.finishY = 0;

  //Geometric neighbors of this node
  this.surrounding = [];
}

FDLayoutNode.prototype = Object.create(LNode.prototype);

for (var prop in LNode) {
  FDLayoutNode[prop] = LNode[prop];
}

FDLayoutNode.prototype.setGridCoordinates = function (_startX, _finishX, _startY, _finishY) {
  this.startX = _startX;
  this.finishX = _finishX;
  this.startY = _startY;
  this.finishY = _finishY;
};

module.exports = FDLayoutNode;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var UniqueIDGeneretor = __webpack_require__(16);

function HashMap() {
  this.map = {};
  this.keys = [];
}

HashMap.prototype.put = function (key, value) {
  var theId = UniqueIDGeneretor.createID(key);
  if (!this.contains(theId)) {
    this.map[theId] = value;
    this.keys.push(key);
  }
};

HashMap.prototype.contains = function (key) {
  var theId = UniqueIDGeneretor.createID(key);
  return this.map[key] != null;
};

HashMap.prototype.get = function (key) {
  var theId = UniqueIDGeneretor.createID(key);
  return this.map[theId];
};

HashMap.prototype.keySet = function () {
  return this.keys;
};

module.exports = HashMap;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function RandomSeed() {}
RandomSeed.seed = 1;
RandomSeed.x = 0;

RandomSeed.nextDouble = function () {
  RandomSeed.x = Math.sin(RandomSeed.seed++) * 10000;
  return RandomSeed.x - Math.floor(RandomSeed.x);
};

module.exports = RandomSeed;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var DimensionD = __webpack_require__(29);
var HashMap = __webpack_require__(25);
var HashSet = __webpack_require__(6);
var IGeometry = __webpack_require__(7);
var IMath = __webpack_require__(8);
var Integer = __webpack_require__(2);
var Point = __webpack_require__(13);
var PointD = __webpack_require__(5);
var RandomSeed = __webpack_require__(26);
var RectangleD = __webpack_require__(14);
var Transform = __webpack_require__(15);
var UniqueIDGeneretor = __webpack_require__(16);
var LGraphObject = __webpack_require__(10);
var LGraph = __webpack_require__(4);
var LEdge = __webpack_require__(3);
var LGraphManager = __webpack_require__(9);
var LNode = __webpack_require__(11);
var Layout = __webpack_require__(12);
var LayoutConstants = __webpack_require__(0);
var FDLayout = __webpack_require__(22);
var FDLayoutConstants = __webpack_require__(1);
var FDLayoutEdge = __webpack_require__(23);
var FDLayoutNode = __webpack_require__(24);
var CoSEConstants = __webpack_require__(17);
var CoSEEdge = __webpack_require__(18);
var CoSEGraph = __webpack_require__(19);
var CoSEGraphManager = __webpack_require__(20);
var CoSELayout = __webpack_require__(28);
var CoSENode = __webpack_require__(21);

var defaults = {
  // Called on `layoutready`
  ready: function ready() {},
  // Called on `layoutstop`
  stop: function stop() {},
  // include labels in node dimensions
  nodeDimensionsIncludeLabels: false,
  // number of ticks per frame; higher is faster but more jerky
  refresh: 30,
  // Whether to fit the network view after when done
  fit: true,
  // Padding on fit
  padding: 10,
  // Whether to enable incremental mode
  randomize: true,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Gravity force (constant)
  gravity: 0.25,
  // Maximum number of iterations to perform
  numIter: 2500,
  // For enabling tiling
  tile: true,
  // Type of layout animation. The option set is {'during', 'end', false}
  animate: 'end',
  // Duration for animate:end
  animationDuration: 500,
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.5
};

function extend(defaults, options) {
  var obj = {};

  for (var i in defaults) {
    obj[i] = defaults[i];
  }

  for (var i in options) {
    obj[i] = options[i];
  }

  return obj;
};

function _CoSELayout(_options) {
  this.options = extend(defaults, _options);
  getUserOptions(this.options);
}

var getUserOptions = function getUserOptions(options) {
  if (options.nodeRepulsion != null) CoSEConstants.DEFAULT_REPULSION_STRENGTH = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = options.nodeRepulsion;
  if (options.idealEdgeLength != null) CoSEConstants.DEFAULT_EDGE_LENGTH = FDLayoutConstants.DEFAULT_EDGE_LENGTH = options.idealEdgeLength;
  if (options.edgeElasticity != null) CoSEConstants.DEFAULT_SPRING_STRENGTH = FDLayoutConstants.DEFAULT_SPRING_STRENGTH = options.edgeElasticity;
  if (options.nestingFactor != null) CoSEConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = options.nestingFactor;
  if (options.gravity != null) CoSEConstants.DEFAULT_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = options.gravity;
  if (options.numIter != null) CoSEConstants.MAX_ITERATIONS = FDLayoutConstants.MAX_ITERATIONS = options.numIter;
  if (options.gravityRange != null) CoSEConstants.DEFAULT_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = options.gravityRange;
  if (options.gravityCompound != null) CoSEConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = options.gravityCompound;
  if (options.gravityRangeCompound != null) CoSEConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = options.gravityRangeCompound;
  if (options.initialEnergyOnIncremental != null) CoSEConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = options.initialEnergyOnIncremental;

  CoSEConstants.NODE_DIMENSIONS_INCLUDE_LABELS = FDLayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS = LayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS = options.nodeDimensionsIncludeLabels;
  CoSEConstants.DEFAULT_INCREMENTAL = FDLayoutConstants.DEFAULT_INCREMENTAL = LayoutConstants.DEFAULT_INCREMENTAL = !options.randomize;
  CoSEConstants.ANIMATE = FDLayoutConstants.ANIMATE = LayoutConstants.ANIMATE = options.animate;
  CoSEConstants.TILE = options.tile;
  CoSEConstants.TILING_PADDING_VERTICAL = typeof options.tilingPaddingVertical === 'function' ? options.tilingPaddingVertical.call() : options.tilingPaddingVertical;
  CoSEConstants.TILING_PADDING_HORIZONTAL = typeof options.tilingPaddingHorizontal === 'function' ? options.tilingPaddingHorizontal.call() : options.tilingPaddingHorizontal;
};

_CoSELayout.prototype.run = function () {
  var ready;
  var frameId;
  var options = this.options;
  var idToLNode = this.idToLNode = {};
  var layout = this.layout = new CoSELayout();
  var self = this;

  self.stopped = false;

  this.cy = this.options.cy;

  this.cy.trigger({ type: 'layoutstart', layout: this });

  var gm = layout.newGraphManager();
  this.gm = gm;

  var nodes = this.options.eles.nodes();
  var edges = this.options.eles.edges();

  this.root = gm.addRoot();
  this.processChildrenList(this.root, this.getTopMostNodes(nodes), layout);

  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    var sourceNode = this.idToLNode[edge.data("source")];
    var targetNode = this.idToLNode[edge.data("target")];
    if (sourceNode.getEdgesBetween(targetNode).length == 0) {
      var e1 = gm.add(layout.newEdge(), sourceNode, targetNode);
      e1.id = edge.id();
    }
  }

  var getPositions = function getPositions(ele, i) {
    if (typeof ele === "number") {
      ele = i;
    }
    var theId = ele.data('id');
    var lNode = self.idToLNode[theId];

    return {
      x: lNode.getRect().getCenterX(),
      y: lNode.getRect().getCenterY()
    };
  };

  /*
   * Reposition nodes in iterations animatedly
   */
  var iterateAnimated = function iterateAnimated() {
    // Thigs to perform after nodes are repositioned on screen
    var afterReposition = function afterReposition() {
      if (options.fit) {
        options.cy.fit(options.eles.nodes(), options.padding);
      }

      if (!ready) {
        ready = true;
        self.cy.one('layoutready', options.ready);
        self.cy.trigger({ type: 'layoutready', layout: self });
      }
    };

    var ticksPerFrame = self.options.refresh;
    var isDone;

    for (var i = 0; i < ticksPerFrame && !isDone; i++) {
      isDone = self.stopped || self.layout.tick();
    }

    // If layout is done
    if (isDone) {
      // If the layout is not a sublayout and it is successful perform post layout.
      if (layout.checkLayoutSuccess() && !layout.isSubLayout) {
        layout.doPostLayout();
      }

      // If layout has a tilingPostLayout function property call it.
      if (layout.tilingPostLayout) {
        layout.tilingPostLayout();
      }

      layout.isLayoutFinished = true;

      self.options.eles.nodes().positions(getPositions);

      afterReposition();

      // trigger layoutstop when the layout stops (e.g. finishes)
      self.cy.one('layoutstop', self.options.stop);
      self.cy.trigger({ type: 'layoutstop', layout: self });

      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      ready = false;
      return;
    }

    var animationData = self.layout.getPositionsData(); // Get positions of layout nodes note that all nodes may not be layout nodes because of tiling

    // Position nodes, for the nodes whose id does not included in data (because they are removed from their parents and included in dummy compounds)
    // use position of their ancestors or dummy ancestors
    options.eles.nodes().positions(function (ele, i) {
      if (typeof ele === "number") {
        ele = i;
      }
      var theId = ele.id();
      var pNode = animationData[theId];
      var temp = ele;
      // If pNode is undefined search until finding position data of its first ancestor (It may be dummy as well)
      while (pNode == null) {
        pNode = animationData[temp.data('parent')] || animationData['DummyCompound_' + temp.data('parent')];
        animationData[theId] = pNode;
        temp = temp.parent()[0];
        if (temp == undefined) {
          break;
        }
      }
      if (pNode != null) {
        return {
          x: pNode.x,
          y: pNode.y
        };
      } else {
        return {
          x: ele.x,
          y: ele.y
        };
      }
    });

    afterReposition();

    frameId = requestAnimationFrame(iterateAnimated);
  };

  /*
  * Listen 'layoutstarted' event and start animated iteration if animate option is 'during'
  */
  layout.addListener('layoutstarted', function () {
    if (self.options.animate === 'during') {
      frameId = requestAnimationFrame(iterateAnimated);
    }
  });

  layout.runLayout(); // Run cose layout

  /*
   * If animate option is not 'during' ('end' or false) perform these here (If it is 'during' similar things are already performed)
   */
  if (this.options.animate !== "during") {
    self.options.eles.nodes().not(":parent").layoutPositions(self, self.options, getPositions); // Use layout positions to reposition the nodes it considers the options parameter
    ready = false;
  }

  return this; // chaining
};

//Get the top most ones of a list of nodes
_CoSELayout.prototype.getTopMostNodes = function (nodes) {
  var nodesMap = {};
  for (var i = 0; i < nodes.length; i++) {
    nodesMap[nodes[i].id()] = true;
  }
  var roots = nodes.filter(function (ele, i) {
    if (typeof ele === "number") {
      ele = i;
    }
    var parent = ele.parent()[0];
    while (parent != null) {
      if (nodesMap[parent.id()]) {
        return false;
      }
      parent = parent.parent()[0];
    }
    return true;
  });

  return roots;
};

_CoSELayout.prototype.processChildrenList = function (parent, children, layout) {
  var size = children.length;
  for (var i = 0; i < size; i++) {
    var theChild = children[i];
    var children_of_children = theChild.children();
    var theNode;

    var dimensions = theChild.layoutDimensions({
      nodeDimensionsIncludeLabels: this.options.nodeDimensionsIncludeLabels
    });

    if (theChild.outerWidth() != null && theChild.outerHeight() != null) {
      theNode = parent.add(new CoSENode(layout.graphManager, new PointD(theChild.position('x') - dimensions.w / 2, theChild.position('y') - dimensions.h / 2), new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h))));
    } else {
      theNode = parent.add(new CoSENode(this.graphManager));
    }
    // Attach id to the layout node
    theNode.id = theChild.data("id");
    // Attach the paddings of cy node to layout node
    theNode.paddingLeft = parseInt(theChild.css('padding'));
    theNode.paddingTop = parseInt(theChild.css('padding'));
    theNode.paddingRight = parseInt(theChild.css('padding'));
    theNode.paddingBottom = parseInt(theChild.css('padding'));

    //Attach the label properties to compound if labels will be included in node dimensions  
    if (this.options.nodeDimensionsIncludeLabels) {
      if (theChild.isParent()) {
        var labelWidth = theChild.boundingBox({ includeLabels: true, includeNodes: false }).w;
        var labelHeight = theChild.boundingBox({ includeLabels: true, includeNodes: false }).h;
        var labelPos = theChild.css("text-halign");
        theNode.labelWidth = labelWidth;
        theNode.labelHeight = labelHeight;
        theNode.labelPos = labelPos;
      }
    }

    // Map the layout node
    this.idToLNode[theChild.data("id")] = theNode;

    if (isNaN(theNode.rect.x)) {
      theNode.rect.x = 0;
    }

    if (isNaN(theNode.rect.y)) {
      theNode.rect.y = 0;
    }

    if (children_of_children != null && children_of_children.length > 0) {
      var theNewGraph;
      theNewGraph = layout.getGraphManager().add(layout.newGraph(), theNode);
      this.processChildrenList(theNewGraph, children_of_children, layout);
    }
  }
};

/**
 * @brief : called on continuous layouts to stop them before they finish
 */
_CoSELayout.prototype.stop = function () {
  this.stopped = true;

  return this; // chaining
};

module.exports = function get(cytoscape) {
  return _CoSELayout;
};

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var FDLayout = __webpack_require__(22);
var CoSEGraphManager = __webpack_require__(20);
var CoSEGraph = __webpack_require__(19);
var CoSENode = __webpack_require__(21);
var CoSEEdge = __webpack_require__(18);
var CoSEConstants = __webpack_require__(17);
var FDLayoutConstants = __webpack_require__(1);
var LayoutConstants = __webpack_require__(0);
var Point = __webpack_require__(13);
var PointD = __webpack_require__(5);
var Layout = __webpack_require__(12);
var Integer = __webpack_require__(2);
var IGeometry = __webpack_require__(7);
var LGraph = __webpack_require__(4);
var Transform = __webpack_require__(15);

function CoSELayout() {
  FDLayout.call(this);

  this.toBeTiled = {}; // Memorize if a node is to be tiled or is tiled
}

CoSELayout.prototype = Object.create(FDLayout.prototype);

for (var prop in FDLayout) {
  CoSELayout[prop] = FDLayout[prop];
}

CoSELayout.prototype.newGraphManager = function () {
  var gm = new CoSEGraphManager(this);
  this.graphManager = gm;
  return gm;
};

CoSELayout.prototype.newGraph = function (vGraph) {
  return new CoSEGraph(null, this.graphManager, vGraph);
};

CoSELayout.prototype.newNode = function (vNode) {
  return new CoSENode(this.graphManager, vNode);
};

CoSELayout.prototype.newEdge = function (vEdge) {
  return new CoSEEdge(null, null, vEdge);
};

CoSELayout.prototype.initParameters = function () {
  FDLayout.prototype.initParameters.call(this, arguments);
  if (!this.isSubLayout) {
    if (CoSEConstants.DEFAULT_EDGE_LENGTH < 10) {
      this.idealEdgeLength = 10;
    } else {
      this.idealEdgeLength = CoSEConstants.DEFAULT_EDGE_LENGTH;
    }

    this.useSmartIdealEdgeLengthCalculation = CoSEConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
    this.springConstant = FDLayoutConstants.DEFAULT_SPRING_STRENGTH;
    this.repulsionConstant = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH;
    this.gravityConstant = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH;
    this.compoundGravityConstant = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
    this.gravityRangeFactor = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR;
    this.compoundGravityRangeFactor = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
  }
};

CoSELayout.prototype.layout = function () {
  var createBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
  if (createBendsAsNeeded) {
    this.createBendpoints();
    this.graphManager.resetAllEdges();
  }

  this.level = 0;
  return this.classicLayout();
};

CoSELayout.prototype.classicLayout = function () {
  this.nodesWithGravity = this.calculateNodesToApplyGravitationTo();
  this.graphManager.setAllNodesToApplyGravitation(this.nodesWithGravity);
  this.calcNoOfChildrenForAllNodes();
  this.graphManager.calcLowestCommonAncestors();
  this.graphManager.calcInclusionTreeDepths();
  this.graphManager.getRoot().calcEstimatedSize();
  this.calcIdealEdgeLengths();

  if (!this.incremental) {
    var forest = this.getFlatForest();

    // The graph associated with this layout is flat and a forest
    if (forest.length > 0) {
      this.positionNodesRadially(forest);
    }
    // The graph associated with this layout is not flat or a forest
    else {
        // Reduce the trees when incremental mode is not enabled and graph is not a forest 
        this.reduceTrees();
        // Update nodes that gravity will be applied
        this.graphManager.resetAllNodesToApplyGravitation();
        var allNodes = new Set(this.getAllNodes());
        var intersection = this.nodesWithGravity.filter(function (x) {
          return allNodes.has(x);
        });
        this.graphManager.setAllNodesToApplyGravitation(intersection);

        this.positionNodesRandomly();
      }
  }

  this.initSpringEmbedder();
  this.runSpringEmbedder();

  return true;
};

CoSELayout.prototype.tick = function () {
  this.totalIterations++;

  if (this.totalIterations === this.maxIterations && !this.isTreeGrowing && !this.isGrowthFinished) {
    if (this.prunedNodesAll.length > 0) {
      this.isTreeGrowing = true;
    } else {
      return true;
    }
  }

  if (this.totalIterations % FDLayoutConstants.CONVERGENCE_CHECK_PERIOD == 0 && !this.isTreeGrowing && !this.isGrowthFinished) {
    if (this.isConverged()) {
      if (this.prunedNodesAll.length > 0) {
        this.isTreeGrowing = true;
      } else {
        return true;
      }
    }

    this.coolingFactor = this.initialCoolingFactor * ((this.maxIterations - this.totalIterations) / this.maxIterations);
    this.animationPeriod = Math.ceil(this.initialAnimationPeriod * Math.sqrt(this.coolingFactor));
  }
  // Operations while tree is growing again 
  if (this.isTreeGrowing) {
    if (this.growTreeIterations % 10 == 0) {
      if (this.prunedNodesAll.length > 0) {
        this.graphManager.updateBounds();
        this.updateGrid();
        this.growTree(this.prunedNodesAll);
        // Update nodes that gravity will be applied
        this.graphManager.resetAllNodesToApplyGravitation();
        var allNodes = new Set(this.getAllNodes());
        var intersection = this.nodesWithGravity.filter(function (x) {
          return allNodes.has(x);
        });
        this.graphManager.setAllNodesToApplyGravitation(intersection);

        this.graphManager.updateBounds();
        this.updateGrid();
        this.coolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL;
      } else {
        this.isTreeGrowing = false;
        this.isGrowthFinished = true;
      }
    }
    this.growTreeIterations++;
  }
  // Operations after growth is finished
  if (this.isGrowthFinished) {
    if (this.isConverged()) {
      return true;
    }
    if (this.afterGrowthIterations % 10 == 0) {
      this.graphManager.updateBounds();
      this.updateGrid();
    }
    this.coolingFactor = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL * ((100 - this.afterGrowthIterations) / 100);
    this.afterGrowthIterations++;
  }

  this.totalDisplacement = 0;
  this.graphManager.updateBounds();
  this.calcSpringForces();
  this.calcRepulsionForces();
  this.calcGravitationalForces();
  this.moveNodes();
  this.animate();

  return false; // Layout is not ended yet return false
};

CoSELayout.prototype.getPositionsData = function () {
  var allNodes = this.graphManager.getAllNodes();
  var pData = {};
  for (var i = 0; i < allNodes.length; i++) {
    var rect = allNodes[i].rect;
    var id = allNodes[i].id;
    pData[id] = {
      id: id,
      x: rect.getCenterX(),
      y: rect.getCenterY(),
      w: rect.width,
      h: rect.height
    };
  }

  return pData;
};

CoSELayout.prototype.runSpringEmbedder = function () {
  this.initialAnimationPeriod = 25;
  this.animationPeriod = this.initialAnimationPeriod;
  var layoutEnded = false;

  // If aminate option is 'during' signal that layout is supposed to start iterating
  if (FDLayoutConstants.ANIMATE === 'during') {
    this.emit('layoutstarted');
  } else {
    // If aminate option is 'during' tick() function will be called on index.js
    while (!layoutEnded) {
      layoutEnded = this.tick();
    }

    this.graphManager.updateBounds();
  }
};

CoSELayout.prototype.calculateNodesToApplyGravitationTo = function () {
  var nodeList = [];
  var graph;

  var graphs = this.graphManager.getGraphs();
  var size = graphs.length;
  var i;
  for (i = 0; i < size; i++) {
    graph = graphs[i];

    graph.updateConnected();

    if (!graph.isConnected) {
      nodeList = nodeList.concat(graph.getNodes());
    }
  }

  return nodeList;
};

CoSELayout.prototype.calcNoOfChildrenForAllNodes = function () {
  var node;
  var allNodes = this.graphManager.getAllNodes();

  for (var i = 0; i < allNodes.length; i++) {
    node = allNodes[i];
    node.noOfChildren = node.getNoOfChildren();
  }
};

CoSELayout.prototype.createBendpoints = function () {
  var edges = [];
  edges = edges.concat(this.graphManager.getAllEdges());
  var visited = new HashSet();
  var i;
  for (i = 0; i < edges.length; i++) {
    var edge = edges[i];

    if (!visited.contains(edge)) {
      var source = edge.getSource();
      var target = edge.getTarget();

      if (source == target) {
        edge.getBendpoints().push(new PointD());
        edge.getBendpoints().push(new PointD());
        this.createDummyNodesForBendpoints(edge);
        visited.add(edge);
      } else {
        var edgeList = [];

        edgeList = edgeList.concat(source.getEdgeListToNode(target));
        edgeList = edgeList.concat(target.getEdgeListToNode(source));

        if (!visited.contains(edgeList[0])) {
          if (edgeList.length > 1) {
            var k;
            for (k = 0; k < edgeList.length; k++) {
              var multiEdge = edgeList[k];
              multiEdge.getBendpoints().push(new PointD());
              this.createDummyNodesForBendpoints(multiEdge);
            }
          }
          visited.addAll(list);
        }
      }
    }

    if (visited.size() == edges.length) {
      break;
    }
  }
};

CoSELayout.prototype.positionNodesRadially = function (forest) {
  // We tile the trees to a grid row by row; first tree starts at (0,0)
  var currentStartingPoint = new Point(0, 0);
  var numberOfColumns = Math.ceil(Math.sqrt(forest.length));
  var height = 0;
  var currentY = 0;
  var currentX = 0;
  var point = new PointD(0, 0);

  for (var i = 0; i < forest.length; i++) {
    if (i % numberOfColumns == 0) {
      // Start of a new row, make the x coordinate 0, increment the
      // y coordinate with the max height of the previous row
      currentX = 0;
      currentY = height;

      if (i != 0) {
        currentY += CoSEConstants.DEFAULT_COMPONENT_SEPERATION;
      }

      height = 0;
    }

    var tree = forest[i];

    // Find the center of the tree
    var centerNode = Layout.findCenterOfTree(tree);

    // Set the staring point of the next tree
    currentStartingPoint.x = currentX;
    currentStartingPoint.y = currentY;

    // Do a radial layout starting with the center
    point = CoSELayout.radialLayout(tree, centerNode, currentStartingPoint);

    if (point.y > height) {
      height = Math.floor(point.y);
    }

    currentX = Math.floor(point.x + CoSEConstants.DEFAULT_COMPONENT_SEPERATION);
  }

  this.transform(new PointD(LayoutConstants.WORLD_CENTER_X - point.x / 2, LayoutConstants.WORLD_CENTER_Y - point.y / 2));
};

CoSELayout.radialLayout = function (tree, centerNode, startingPoint) {
  var radialSep = Math.max(this.maxDiagonalInTree(tree), CoSEConstants.DEFAULT_RADIAL_SEPARATION);
  CoSELayout.branchRadialLayout(centerNode, null, 0, 359, 0, radialSep);
  var bounds = LGraph.calculateBounds(tree);

  var transform = new Transform();
  transform.setDeviceOrgX(bounds.getMinX());
  transform.setDeviceOrgY(bounds.getMinY());
  transform.setWorldOrgX(startingPoint.x);
  transform.setWorldOrgY(startingPoint.y);

  for (var i = 0; i < tree.length; i++) {
    var node = tree[i];
    node.transform(transform);
  }

  var bottomRight = new PointD(bounds.getMaxX(), bounds.getMaxY());

  return transform.inverseTransformPoint(bottomRight);
};

CoSELayout.branchRadialLayout = function (node, parentOfNode, startAngle, endAngle, distance, radialSeparation) {
  // First, position this node by finding its angle.
  var halfInterval = (endAngle - startAngle + 1) / 2;

  if (halfInterval < 0) {
    halfInterval += 180;
  }

  var nodeAngle = (halfInterval + startAngle) % 360;
  var teta = nodeAngle * IGeometry.TWO_PI / 360;

  // Make polar to java cordinate conversion.
  var cos_teta = Math.cos(teta);
  var x_ = distance * Math.cos(teta);
  var y_ = distance * Math.sin(teta);

  node.setCenter(x_, y_);

  // Traverse all neighbors of this node and recursively call this
  // function.
  var neighborEdges = [];
  neighborEdges = neighborEdges.concat(node.getEdges());
  var childCount = neighborEdges.length;

  if (parentOfNode != null) {
    childCount--;
  }

  var branchCount = 0;

  var incEdgesCount = neighborEdges.length;
  var startIndex;

  var edges = node.getEdgesBetween(parentOfNode);

  // If there are multiple edges, prune them until there remains only one
  // edge.
  while (edges.length > 1) {
    //neighborEdges.remove(edges.remove(0));
    var temp = edges[0];
    edges.splice(0, 1);
    var index = neighborEdges.indexOf(temp);
    if (index >= 0) {
      neighborEdges.splice(index, 1);
    }
    incEdgesCount--;
    childCount--;
  }

  if (parentOfNode != null) {
    //assert edges.length == 1;
    startIndex = (neighborEdges.indexOf(edges[0]) + 1) % incEdgesCount;
  } else {
    startIndex = 0;
  }

  var stepAngle = Math.abs(endAngle - startAngle) / childCount;

  for (var i = startIndex; branchCount != childCount; i = ++i % incEdgesCount) {
    var currentNeighbor = neighborEdges[i].getOtherEnd(node);

    // Don't back traverse to root node in current tree.
    if (currentNeighbor == parentOfNode) {
      continue;
    }

    var childStartAngle = (startAngle + branchCount * stepAngle) % 360;
    var childEndAngle = (childStartAngle + stepAngle) % 360;

    CoSELayout.branchRadialLayout(currentNeighbor, node, childStartAngle, childEndAngle, distance + radialSeparation, radialSeparation);

    branchCount++;
  }
};

CoSELayout.maxDiagonalInTree = function (tree) {
  var maxDiagonal = Integer.MIN_VALUE;

  for (var i = 0; i < tree.length; i++) {
    var node = tree[i];
    var diagonal = node.getDiagonal();

    if (diagonal > maxDiagonal) {
      maxDiagonal = diagonal;
    }
  }

  return maxDiagonal;
};

CoSELayout.prototype.calcRepulsionRange = function () {
  // formula is 2 x (level + 1) x idealEdgeLength
  return 2 * (this.level + 1) * this.idealEdgeLength;
};

// Tiling methods

// Group zero degree members whose parents are not to be tiled, create dummy parents where needed and fill memberGroups by their dummp parent id's
CoSELayout.prototype.groupZeroDegreeMembers = function () {
  var self = this;
  // array of [parent_id x oneDegreeNode_id]
  var tempMemberGroups = {}; // A temporary map of parent node and its zero degree members
  this.memberGroups = {}; // A map of dummy parent node and its zero degree members whose parents are not to be tiled
  this.idToDummyNode = {}; // A map of id to dummy node 

  var zeroDegree = []; // List of zero degree nodes whose parents are not to be tiled
  var allNodes = this.graphManager.getAllNodes();

  // Fill zero degree list
  for (var i = 0; i < allNodes.length; i++) {
    var node = allNodes[i];
    var parent = node.getParent();
    // If a node has zero degree and its parent is not to be tiled if exists add that node to zeroDegres list
    if (this.getNodeDegreeWithChildren(node) === 0 && (parent.id == undefined || !this.getToBeTiled(parent))) {
      zeroDegree.push(node);
    }
  }

  // Create a map of parent node and its zero degree members
  for (var i = 0; i < zeroDegree.length; i++) {
    var node = zeroDegree[i]; // Zero degree node itself
    var p_id = node.getParent().id; // Parent id

    if (typeof tempMemberGroups[p_id] === "undefined") tempMemberGroups[p_id] = [];

    tempMemberGroups[p_id] = tempMemberGroups[p_id].concat(node); // Push node to the list belongs to its parent in tempMemberGroups
  }

  // If there are at least two nodes at a level, create a dummy compound for them
  Object.keys(tempMemberGroups).forEach(function (p_id) {
    if (tempMemberGroups[p_id].length > 1) {
      var dummyCompoundId = "DummyCompound_" + p_id; // The id of dummy compound which will be created soon
      self.memberGroups[dummyCompoundId] = tempMemberGroups[p_id]; // Add dummy compound to memberGroups

      var parent = tempMemberGroups[p_id][0].getParent(); // The parent of zero degree nodes will be the parent of new dummy compound

      // Create a dummy compound with calculated id
      var dummyCompound = new CoSENode(self.graphManager);
      dummyCompound.id = dummyCompoundId;
      dummyCompound.paddingLeft = parent.paddingLeft || 0;
      dummyCompound.paddingRight = parent.paddingRight || 0;
      dummyCompound.paddingBottom = parent.paddingBottom || 0;
      dummyCompound.paddingTop = parent.paddingTop || 0;

      self.idToDummyNode[dummyCompoundId] = dummyCompound;

      var dummyParentGraph = self.getGraphManager().add(self.newGraph(), dummyCompound);
      var parentGraph = parent.getChild();

      // Add dummy compound to parent the graph
      parentGraph.add(dummyCompound);

      // For each zero degree node in this level remove it from its parent graph and add it to the graph of dummy parent
      for (var i = 0; i < tempMemberGroups[p_id].length; i++) {
        var node = tempMemberGroups[p_id][i];

        parentGraph.remove(node);
        dummyParentGraph.add(node);
      }
    }
  });
};

CoSELayout.prototype.clearCompounds = function () {
  var childGraphMap = {};
  var idToNode = {};

  // Get compound ordering by finding the inner one first
  this.performDFSOnCompounds();

  for (var i = 0; i < this.compoundOrder.length; i++) {

    idToNode[this.compoundOrder[i].id] = this.compoundOrder[i];
    childGraphMap[this.compoundOrder[i].id] = [].concat(this.compoundOrder[i].getChild().getNodes());

    // Remove children of compounds
    this.graphManager.remove(this.compoundOrder[i].getChild());
    this.compoundOrder[i].child = null;
  }

  this.graphManager.resetAllNodes();

  // Tile the removed children
  this.tileCompoundMembers(childGraphMap, idToNode);
};

CoSELayout.prototype.clearZeroDegreeMembers = function () {
  var self = this;
  var tiledZeroDegreePack = this.tiledZeroDegreePack = [];

  Object.keys(this.memberGroups).forEach(function (id) {
    var compoundNode = self.idToDummyNode[id]; // Get the dummy compound

    tiledZeroDegreePack[id] = self.tileNodes(self.memberGroups[id], compoundNode.paddingLeft + compoundNode.paddingRight);

    // Set the width and height of the dummy compound as calculated
    compoundNode.rect.width = tiledZeroDegreePack[id].width;
    compoundNode.rect.height = tiledZeroDegreePack[id].height;
  });
};

CoSELayout.prototype.repopulateCompounds = function () {
  for (var i = this.compoundOrder.length - 1; i >= 0; i--) {
    var lCompoundNode = this.compoundOrder[i];
    var id = lCompoundNode.id;
    var horizontalMargin = lCompoundNode.paddingLeft;
    var verticalMargin = lCompoundNode.paddingTop;

    this.adjustLocations(this.tiledMemberPack[id], lCompoundNode.rect.x, lCompoundNode.rect.y, horizontalMargin, verticalMargin);
  }
};

CoSELayout.prototype.repopulateZeroDegreeMembers = function () {
  var self = this;
  var tiledPack = this.tiledZeroDegreePack;

  Object.keys(tiledPack).forEach(function (id) {
    var compoundNode = self.idToDummyNode[id]; // Get the dummy compound by its id
    var horizontalMargin = compoundNode.paddingLeft;
    var verticalMargin = compoundNode.paddingTop;

    // Adjust the positions of nodes wrt its compound
    self.adjustLocations(tiledPack[id], compoundNode.rect.x, compoundNode.rect.y, horizontalMargin, verticalMargin);
  });
};

CoSELayout.prototype.getToBeTiled = function (node) {
  var id = node.id;
  //firstly check the previous results
  if (this.toBeTiled[id] != null) {
    return this.toBeTiled[id];
  }

  //only compound nodes are to be tiled
  var childGraph = node.getChild();
  if (childGraph == null) {
    this.toBeTiled[id] = false;
    return false;
  }

  var children = childGraph.getNodes(); // Get the children nodes

  //a compound node is not to be tiled if all of its compound children are not to be tiled
  for (var i = 0; i < children.length; i++) {
    var theChild = children[i];

    if (this.getNodeDegree(theChild) > 0) {
      this.toBeTiled[id] = false;
      return false;
    }

    //pass the children not having the compound structure
    if (theChild.getChild() == null) {
      this.toBeTiled[theChild.id] = false;
      continue;
    }

    if (!this.getToBeTiled(theChild)) {
      this.toBeTiled[id] = false;
      return false;
    }
  }
  this.toBeTiled[id] = true;
  return true;
};

// Get degree of a node depending of its edges and independent of its children
CoSELayout.prototype.getNodeDegree = function (node) {
  var id = node.id;
  var edges = node.getEdges();
  var degree = 0;

  // For the edges connected
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    if (edge.getSource().id !== edge.getTarget().id) {
      degree = degree + 1;
    }
  }
  return degree;
};

// Get degree of a node with its children
CoSELayout.prototype.getNodeDegreeWithChildren = function (node) {
  var degree = this.getNodeDegree(node);
  if (node.getChild() == null) {
    return degree;
  }
  var children = node.getChild().getNodes();
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    degree += this.getNodeDegreeWithChildren(child);
  }
  return degree;
};

CoSELayout.prototype.performDFSOnCompounds = function () {
  this.compoundOrder = [];
  this.fillCompexOrderByDFS(this.graphManager.getRoot().getNodes());
};

CoSELayout.prototype.fillCompexOrderByDFS = function (children) {
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.getChild() != null) {
      this.fillCompexOrderByDFS(child.getChild().getNodes());
    }
    if (this.getToBeTiled(child)) {
      this.compoundOrder.push(child);
    }
  }
};

/**
* This method places each zero degree member wrt given (x,y) coordinates (top left).
*/
CoSELayout.prototype.adjustLocations = function (organization, x, y, compoundHorizontalMargin, compoundVerticalMargin) {
  x += compoundHorizontalMargin;
  y += compoundVerticalMargin;

  var left = x;

  for (var i = 0; i < organization.rows.length; i++) {
    var row = organization.rows[i];
    x = left;
    var maxHeight = 0;

    for (var j = 0; j < row.length; j++) {
      var lnode = row[j];

      lnode.rect.x = x; // + lnode.rect.width / 2;
      lnode.rect.y = y; // + lnode.rect.height / 2;

      x += lnode.rect.width + organization.horizontalPadding;

      if (lnode.rect.height > maxHeight) maxHeight = lnode.rect.height;
    }

    y += maxHeight + organization.verticalPadding;
  }
};

CoSELayout.prototype.tileCompoundMembers = function (childGraphMap, idToNode) {
  var self = this;
  this.tiledMemberPack = [];

  Object.keys(childGraphMap).forEach(function (id) {
    // Get the compound node
    var compoundNode = idToNode[id];

    self.tiledMemberPack[id] = self.tileNodes(childGraphMap[id], compoundNode.paddingLeft + compoundNode.paddingRight);

    compoundNode.rect.width = self.tiledMemberPack[id].width + 20;
    compoundNode.rect.height = self.tiledMemberPack[id].height + 20;
  });
};

CoSELayout.prototype.tileNodes = function (nodes, minWidth) {
  var verticalPadding = CoSEConstants.TILING_PADDING_VERTICAL;
  var horizontalPadding = CoSEConstants.TILING_PADDING_HORIZONTAL;
  var organization = {
    rows: [],
    rowWidth: [],
    rowHeight: [],
    width: 20,
    height: 20,
    verticalPadding: verticalPadding,
    horizontalPadding: horizontalPadding
  };

  // Sort the nodes in ascending order of their areas
  nodes.sort(function (n1, n2) {
    if (n1.rect.width * n1.rect.height > n2.rect.width * n2.rect.height) return -1;
    if (n1.rect.width * n1.rect.height < n2.rect.width * n2.rect.height) return 1;
    return 0;
  });

  // Create the organization -> tile members
  for (var i = 0; i < nodes.length; i++) {
    var lNode = nodes[i];

    if (organization.rows.length == 0) {
      this.insertNodeToRow(organization, lNode, 0, minWidth);
    } else if (this.canAddHorizontal(organization, lNode.rect.width, lNode.rect.height)) {
      this.insertNodeToRow(organization, lNode, this.getShortestRowIndex(organization), minWidth);
    } else {
      this.insertNodeToRow(organization, lNode, organization.rows.length, minWidth);
    }

    this.shiftToLastRow(organization);
  }

  return organization;
};

CoSELayout.prototype.insertNodeToRow = function (organization, node, rowIndex, minWidth) {
  var minCompoundSize = minWidth;

  // Add new row if needed
  if (rowIndex == organization.rows.length) {
    var secondDimension = [];

    organization.rows.push(secondDimension);
    organization.rowWidth.push(minCompoundSize);
    organization.rowHeight.push(0);
  }

  // Update row width
  var w = organization.rowWidth[rowIndex] + node.rect.width;

  if (organization.rows[rowIndex].length > 0) {
    w += organization.horizontalPadding;
  }

  organization.rowWidth[rowIndex] = w;
  // Update compound width
  if (organization.width < w) {
    organization.width = w;
  }

  // Update height
  var h = node.rect.height;
  if (rowIndex > 0) h += organization.verticalPadding;

  var extraHeight = 0;
  if (h > organization.rowHeight[rowIndex]) {
    extraHeight = organization.rowHeight[rowIndex];
    organization.rowHeight[rowIndex] = h;
    extraHeight = organization.rowHeight[rowIndex] - extraHeight;
  }

  organization.height += extraHeight;

  // Insert node
  organization.rows[rowIndex].push(node);
};

//Scans the rows of an organization and returns the one with the min width
CoSELayout.prototype.getShortestRowIndex = function (organization) {
  var r = -1;
  var min = Number.MAX_VALUE;

  for (var i = 0; i < organization.rows.length; i++) {
    if (organization.rowWidth[i] < min) {
      r = i;
      min = organization.rowWidth[i];
    }
  }
  return r;
};

//Scans the rows of an organization and returns the one with the max width
CoSELayout.prototype.getLongestRowIndex = function (organization) {
  var r = -1;
  var max = Number.MIN_VALUE;

  for (var i = 0; i < organization.rows.length; i++) {

    if (organization.rowWidth[i] > max) {
      r = i;
      max = organization.rowWidth[i];
    }
  }

  return r;
};

/**
* This method checks whether adding extra width to the organization violates
* the aspect ratio(1) or not.
*/
CoSELayout.prototype.canAddHorizontal = function (organization, extraWidth, extraHeight) {

  var sri = this.getShortestRowIndex(organization);

  if (sri < 0) {
    return true;
  }

  var min = organization.rowWidth[sri];

  if (min + organization.horizontalPadding + extraWidth <= organization.width) return true;

  var hDiff = 0;

  // Adding to an existing row
  if (organization.rowHeight[sri] < extraHeight) {
    if (sri > 0) hDiff = extraHeight + organization.verticalPadding - organization.rowHeight[sri];
  }

  var add_to_row_ratio;
  if (organization.width - min >= extraWidth + organization.horizontalPadding) {
    add_to_row_ratio = (organization.height + hDiff) / (min + extraWidth + organization.horizontalPadding);
  } else {
    add_to_row_ratio = (organization.height + hDiff) / organization.width;
  }

  // Adding a new row for this node
  hDiff = extraHeight + organization.verticalPadding;
  var add_new_row_ratio;
  if (organization.width < extraWidth) {
    add_new_row_ratio = (organization.height + hDiff) / extraWidth;
  } else {
    add_new_row_ratio = (organization.height + hDiff) / organization.width;
  }

  if (add_new_row_ratio < 1) add_new_row_ratio = 1 / add_new_row_ratio;

  if (add_to_row_ratio < 1) add_to_row_ratio = 1 / add_to_row_ratio;

  return add_to_row_ratio < add_new_row_ratio;
};

//If moving the last node from the longest row and adding it to the last
//row makes the bounding box smaller, do it.
CoSELayout.prototype.shiftToLastRow = function (organization) {
  var longest = this.getLongestRowIndex(organization);
  var last = organization.rowWidth.length - 1;
  var row = organization.rows[longest];
  var node = row[row.length - 1];

  var diff = node.width + organization.horizontalPadding;

  // Check if there is enough space on the last row
  if (organization.width - organization.rowWidth[last] > diff && longest != last) {
    // Remove the last element of the longest row
    row.splice(-1, 1);

    // Push it to the last row
    organization.rows[last].push(node);

    organization.rowWidth[longest] = organization.rowWidth[longest] - diff;
    organization.rowWidth[last] = organization.rowWidth[last] + diff;
    organization.width = organization.rowWidth[instance.getLongestRowIndex(organization)];

    // Update heights of the organization
    var maxHeight = Number.MIN_VALUE;
    for (var i = 0; i < row.length; i++) {
      if (row[i].height > maxHeight) maxHeight = row[i].height;
    }
    if (longest > 0) maxHeight += organization.verticalPadding;

    var prevTotal = organization.rowHeight[longest] + organization.rowHeight[last];

    organization.rowHeight[longest] = maxHeight;
    if (organization.rowHeight[last] < node.height + organization.verticalPadding) organization.rowHeight[last] = node.height + organization.verticalPadding;

    var finalTotal = organization.rowHeight[longest] + organization.rowHeight[last];
    organization.height += finalTotal - prevTotal;

    this.shiftToLastRow(organization);
  }
};

CoSELayout.prototype.tilingPreLayout = function () {
  if (CoSEConstants.TILE) {
    // Find zero degree nodes and create a compound for each level
    this.groupZeroDegreeMembers();
    // Tile and clear children of each compound
    this.clearCompounds();
    // Separately tile and clear zero degree nodes for each level
    this.clearZeroDegreeMembers();
  }
};

CoSELayout.prototype.tilingPostLayout = function () {
  if (CoSEConstants.TILE) {
    this.repopulateZeroDegreeMembers();
    this.repopulateCompounds();
  }
};

module.exports = CoSELayout;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function DimensionD(width, height) {
  this.width = 0;
  this.height = 0;
  if (width !== null && height !== null) {
    this.height = height;
    this.width = width;
  }
}

DimensionD.prototype.getWidth = function () {
  return this.width;
};

DimensionD.prototype.setWidth = function (width) {
  this.width = width;
};

DimensionD.prototype.getHeight = function () {
  return this.height;
};

DimensionD.prototype.setHeight = function (height) {
  this.height = height;
};

module.exports = DimensionD;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function Emitter() {
  this.listeners = [];
}

var p = Emitter.prototype;

p.addListener = function (event, callback) {
  this.listeners.push({
    event: event,
    callback: callback
  });
};

p.removeListener = function (event, callback) {
  for (var i = this.listeners.length; i >= 0; i--) {
    var l = this.listeners[i];

    if (l.event === event && l.callback === callback) {
      this.listeners.splice(i, 1);
    }
  }
};

p.emit = function (event, data) {
  for (var i = 0; i < this.listeners.length; i++) {
    var l = this.listeners[i];

    if (event === l.event) {
      l.callback(data);
    }
  }
};

module.exports = Emitter;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nodeFrom = function nodeFrom(value) {
  return { value: value, next: null, prev: null };
};

var add = function add(prev, node, next, list) {
  if (prev !== null) {
    prev.next = node;
  } else {
    list.head = node;
  }

  if (next !== null) {
    next.prev = node;
  } else {
    list.tail = node;
  }

  node.prev = prev;
  node.next = next;

  list.length++;

  return node;
};

var _remove = function _remove(node, list) {
  var prev = node.prev,
      next = node.next;


  if (prev !== null) {
    prev.next = next;
  } else {
    list.head = next;
  }

  if (next !== null) {
    next.prev = prev;
  } else {
    list.tail = prev;
  }

  node.prev = node.next = null;

  list.length--;

  return node;
};

var LinkedList = function () {
  function LinkedList(vals) {
    var _this = this;

    _classCallCheck(this, LinkedList);

    this.length = 0;
    this.head = null;
    this.tail = null;

    if (vals != null) {
      vals.forEach(function (v) {
        return _this.push(v);
      });
    }
  }

  _createClass(LinkedList, [{
    key: "size",
    value: function size() {
      return this.length;
    }
  }, {
    key: "insertBefore",
    value: function insertBefore(val, otherNode) {
      return add(otherNode.prev, nodeFrom(val), otherNode, this);
    }
  }, {
    key: "insertAfter",
    value: function insertAfter(val, otherNode) {
      return add(otherNode, nodeFrom(val), otherNode.next, this);
    }
  }, {
    key: "insertNodeBefore",
    value: function insertNodeBefore(newNode, otherNode) {
      return add(otherNode.prev, newNode, otherNode, this);
    }
  }, {
    key: "insertNodeAfter",
    value: function insertNodeAfter(newNode, otherNode) {
      return add(otherNode, newNode, otherNode.next, this);
    }
  }, {
    key: "push",
    value: function push(val) {
      return add(this.tail, nodeFrom(val), null, this);
    }
  }, {
    key: "unshift",
    value: function unshift(val) {
      return add(null, nodeFrom(val), this.head, this);
    }
  }, {
    key: "remove",
    value: function remove(node) {
      return _remove(node, this);
    }
  }, {
    key: "pop",
    value: function pop() {
      return _remove(this.tail, this).value;
    }
  }, {
    key: "popNode",
    value: function popNode() {
      return _remove(this.tail, this);
    }
  }, {
    key: "shift",
    value: function shift() {
      return _remove(this.head, this).value;
    }
  }, {
    key: "shiftNode",
    value: function shiftNode() {
      return _remove(this.head, this);
    }
  }]);

  return LinkedList;
}();

module.exports = LinkedList;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// registers the extension on a cytoscape lib ref

var getLayout = __webpack_require__(27);

var register = function register(cytoscape) {
  var Layout = getLayout(cytoscape);

  cytoscape('layout', 'cose-bilkent', Layout);
};

// auto reg for globals
if (typeof cytoscape !== 'undefined') {
  register(cytoscape);
}

module.exports = register;

/***/ })
/******/ ]);
});
window.PainlessContextMenu = class PainlessContextMenu {
  constructor(cy, context) {
    this.init = this.init.bind(this);
    this.rename_const = this.rename_const.bind(this);
    this.rename_var = this.rename_var.bind(this);
    this.context = context;
    this.cy = cy;
    this.init();
  }

  init() {
    var node_attr_range_menu, node_concept_menu, node_constant_object_menu, node_constant_value_menu, node_link_attr_context_menu, node_link_context_menu, node_variable_context_menu;
    node_variable_context_menu = {
      selector: '.node-variable-full-options',
      commands: [
        {
          content: 'delete node',
          select: (ele) => {
            var i,
        j,
        len,
        len1,
        link,
        ref,
        to_remove;
            to_remove = [];
            ref = ele.data('links');
            for (i = 0, len = ref.length; i < len; i++) {
              link = ref[i];
              if (link !== null && link !== void 0) {
                to_remove.push(link);
              }
            }
            for (j = 0, len1 = to_remove.length; j < len1; j++) {
              link = to_remove[j];
              link.delete();
            }
            return this.cy.remove(ele);
          }
        },
        {
          content: 'center view',
          select: (ele) => {
            return this.context.center_view(ele);
          }
        },
        {
          content: 'add node to select statement',
          select: (ele) => {
            return this.context.add_to_select(ele.id());
          }
        },
        {
          content: 'rename node',
          select: (ele) => {
            return this.rename_var(ele);
          }
        },
        {
          content: 'filter',
          select: (ele) => {
            return this.context.sparql_text.add_filter(ele.id());
          }
        }
      ]
    };
    node_link_context_menu = {
      selector: '.node-role',
      commands: [
        {
          content: 'reverse',
          select: (ele) => {
            console.log(ele.data('links'));
            return ele.data('links')[0].reverse();
          }
        },
        {
          content: 'delete',
          select: (ele) => {
            return ele.data('links')[0].delete();
          }
        }
      ]
    };
    node_link_attr_context_menu = {
      selector: '.node-attribute',
      commands: [
        {
          content: 'delete',
          select: (ele) => {
            return ele.data('links')[0].delete();
          }
        }
      ]
    };
    node_attr_range_menu = {
      selector: '.attr-range',
      commands: [
        {
          content: 'delete',
          select: (ele) => {
            return ele.data('links')[0].delete();
          }
        },
        {
          content: 'transform into constant [object]',
          select: (ele) => {
            ele.data('color',
        tinycolor(ele.data('color')).desaturate(50).toString());
            ele.data('label',
        'const[o]');
            return ele.classes('node-constant-object');
          }
        },
        {
          content: 'transform into constant [value]',
          select: (ele) => {
            ele.data('color',
        tinycolor(ele.data('color')).desaturate(50).toString());
            ele.data('label',
        'const[v]');
            return ele.classes('node-constant-value');
          }
        }
      ]
    };
    node_concept_menu = {
      selector: '.node-concept',
      commands: [
        {
          content: 'delete',
          select: (ele) => {
            return ele.data('links')[0].delete();
          }
        }
      ]
    };
    node_constant_value_menu = {
      selector: '.node-constant-value',
      commands: [
        {
          content: 'define value',
          select: (ele) => {
            return this.rename_const(ele);
          }
        },
        {
          content: 'delete',
          select: (ele) => {
            return ele.data('links')[0].delete();
          }
        }
      ]
    };
    node_constant_object_menu = {
      selector: '.node-constant-object',
      commands: [
        {
          content: 'define value',
          select: (ele) => {
            return this.rename_const(ele);
          }
        },
        {
          content: 'delete',
          select: (ele) => {
            return ele.data('links')[0].delete();
          }
        }
      ]
    };
    this.cy.cxtmenu(node_variable_context_menu);
    this.cy.cxtmenu(node_link_context_menu);
    this.cy.cxtmenu(node_link_attr_context_menu);
    this.cy.cxtmenu(node_concept_menu);
    this.cy.cxtmenu(node_constant_value_menu);
    return this.cy.cxtmenu(node_attr_range_menu);
  }

  rename_const(ele) {
    var container, div, keypresshandler, outclickhandler, prevlabel;
    prevlabel = ele.data('label');
    ele.data('label', '');
    container = document.createElement(div);
    div = document.createElement('div');
    div.innerHTML = ele.data('label').slice(1);
    div.style.display = 'inline-block';
    outclickhandler = (event) => {
      if (event.target !== div) {
        if (div.innerHTML === '') {
          div.innerHTML = prevlabel;
        }
        ele.data('label', div.innerHTML);
        container.parentNode.removeChild(container);
        document.removeEventListener('click', outclickhandler);
        return document.removeEventListener('keypress', keypresshandler);
      }
    };
    keypresshandler = (event) => {
      if (event.key === 'Enter') {
        if (div.innerHTML === '') {
          div.innerHTML = prevlabel;
        }
        ele.data('label', div.innerHTML);
        container.parentNode.removeChild(container);
        document.removeEventListener('click', outclickhandler);
        return document.removeEventListener('keypress', keypresshandler);
      }
    };
    document.addEventListener('click', outclickhandler);
    document.addEventListener('keypress', keypresshandler);
    div.setAttribute('contenteditable', true);
    container.appendChild(div);
    container.style.position = "absolute";
    container.id = "rename_div";
    container.style.top = document.getElementById('query_canvas').getBoundingClientRect()['y'] + ele.renderedPosition('y') - ele.renderedWidth() / 4 + 'px';
    container.style.left = document.getElementById('query_canvas').getBoundingClientRect()['x'] + ele.renderedPosition('x') - ele.renderedWidth() / 4 + 'px';
    container.style.backgroundColor = ele.data('color');
    container.style.fontSize = 'xx-large';
    container.style.color = '#fdf6e3';
    container.style.borderRadius = '100px';
    container.style.fontFamily = 'Courier New';
    container.style.padding = '2px';
    container.style.textAlign = 'center';
    document.body.appendChild(container);
    return div.focus();
  }

  rename_var(ele) {
    var container, div, keypresshandler, outclickhandler, prevlabel, question_mark;
    prevlabel = ele.data('label').slice(1);
    ele.data('label', '');
    container = document.createElement(div);
    question_mark = document.createElement('div');
    question_mark.innerHTML = '?';
    question_mark.style.display = 'inline-block';
    container.appendChild(question_mark);
    div = document.createElement('div');
    div.innerHTML = ele.data('label').slice(1);
    div.style.display = 'inline-block';
    outclickhandler = (event) => {
      if (event.target !== div) {
        if (div.innerHTML === '') {
          div.innerHTML = prevlabel;
        }
        ele.data('label', '?' + div.innerHTML);
        container.parentNode.removeChild(container);
        document.removeEventListener('click', outclickhandler);
        return document.removeEventListener('keypress', keypresshandler);
      }
    };
    keypresshandler = (event) => {
      if (event.key === 'Enter') {
        if (div.innerHTML === '') {
          div.innerHTML = prevlabel;
        }
        ele.data('label', '?' + div.innerHTML);
        container.parentNode.removeChild(container);
        document.removeEventListener('click', outclickhandler);
        return document.removeEventListener('keypress', keypresshandler);
      }
    };
    document.addEventListener('click', outclickhandler);
    document.addEventListener('keypress', keypresshandler);
    div.setAttribute('contenteditable', true);
    container.appendChild(div);
    container.style.position = "absolute";
    container.id = "rename_div";
    container.style.top = document.getElementById('query_canvas').getBoundingClientRect()['y'] + ele.renderedPosition('y') - ele.renderedWidth() / 4 + 'px';
    container.style.left = document.getElementById('query_canvas').getBoundingClientRect()['x'] + ele.renderedPosition('x') - ele.renderedWidth() / 4 + 'px';
    container.style.backgroundColor = ele.data('color');
    container.style.fontSize = 'xx-large';
    container.style.color = '#fdf6e3';
    container.style.borderRadius = '100px';
    container.style.fontFamily = 'Courier New';
    container.style.padding = '2px';
    container.style.textAlign = 'center';
    document.body.appendChild(container);
    return div.focus();
  }

};

;(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(window, document)
  } else {
    root.SimpleScrollbar = factory(window, document)
  }
})(this, function(w, d) {
  var raf = w.requestAnimationFrame || w.setImmediate || function(c) { return setTimeout(c, 0); };

  function initEl(el) {
    if (Object.prototype.hasOwnProperty.call(el, 'data-simple-scrollbar')) return;
    Object.defineProperty(el, 'data-simple-scrollbar', { value: new SimpleScrollbar(el) });
  }

  // Mouse drag handler
  function dragDealer(el, context) {
    var lastPageY;

    el.addEventListener('mousedown', function(e) {
      lastPageY = e.pageY;
      el.classList.add('ss-grabbed');
      d.body.classList.add('ss-grabbed');

      d.addEventListener('mousemove', drag);
      d.addEventListener('mouseup', stop);

      return false;
    });

    function drag(e) {
      var delta = e.pageY - lastPageY;
      lastPageY = e.pageY;

      raf(function() {
        context.el.scrollTop += delta / context.scrollRatio;
      });
    }

    function stop() {
      el.classList.remove('ss-grabbed');
      d.body.classList.remove('ss-grabbed');
      d.removeEventListener('mousemove', drag);
      d.removeEventListener('mouseup', stop);
    }
  }

  // Constructor
  function ss(el) {
    this.target = el;

    this.direction = w.getComputedStyle(this.target).direction;

    this.bar = '<div class="ss-scroll">';

    this.wrapper = d.createElement('div');
    this.wrapper.setAttribute('class', 'ss-wrapper');

    this.el = d.createElement('div');
    this.el.setAttribute('class', 'ss-content');

    if (this.direction === 'rtl') {
      this.el.classList.add('rtl');
    }

    this.wrapper.appendChild(this.el);

    while (this.target.firstChild) {
      this.el.appendChild(this.target.firstChild);
    }
    this.target.appendChild(this.wrapper);

    this.target.insertAdjacentHTML('beforeend', this.bar);
    this.bar = this.target.lastChild;

    dragDealer(this.bar, this);
    this.moveBar();

    w.addEventListener('resize', this.moveBar.bind(this));
    this.el.addEventListener('scroll', this.moveBar.bind(this));
    this.el.addEventListener('mouseenter', this.moveBar.bind(this));

    this.target.classList.add('ss-container');

    var css = w.getComputedStyle(el);
  	if (css['height'] === '0px' && css['max-height'] !== '0px') {
    	el.style.height = css['max-height'];
    }
  }

  ss.prototype = {
    moveBar: function(e) {
      var totalHeight = this.el.scrollHeight,
          ownHeight = this.el.clientHeight,
          _this = this;

      this.scrollRatio = ownHeight / totalHeight;

      var isRtl = _this.direction === 'rtl';
      var right = isRtl ?
        (_this.target.clientWidth - _this.bar.clientWidth + 18) :
        (_this.target.clientWidth - _this.bar.clientWidth) * -1;

      raf(function() {
        // Hide scrollbar if no scrolling is possible
        if(_this.scrollRatio >= 1) {
          _this.bar.classList.add('ss-hidden')
        } else {
          _this.bar.classList.remove('ss-hidden')
          _this.bar.style.cssText = 'height:' + Math.max(_this.scrollRatio * 100, 10) + '%; top:' + (_this.el.scrollTop / totalHeight ) * 100 + '%;right:' + right + 'px;';
        }
      });
    }
  }

  function initAll() {
    var nodes = d.querySelectorAll('*[ss-container]');

    for (var i = 0; i < nodes.length; i++) {
      initEl(nodes[i]);
    }
  }

  d.addEventListener('DOMContentLoaded', initAll);
  ss.initEl = initEl;
  ss.initAll = initAll;

  var SimpleScrollbar = ss;
  return SimpleScrollbar;
});

//_require cyto_style.coffee
//_require sparql_text.coffee
//_require painless_link.coffee 
window.PainlessGraph = (function() {
  /** manages the graph visualization
      TODO: hardcoded collision distance should be in constants
  */
  var links, state_buffer;

  class PainlessGraph {
    constructor(context) {
      this.reshape = this.reshape.bind(this);
      this.center_view = this.center_view.bind(this);
      this.add_to_select = this.add_to_select.bind(this);
      this.reverse_relationship = this.reverse_relationship.bind(this);
      this.add_link = this.add_link.bind(this);
      this.check_collisions = this.check_collisions.bind(this);
      this.init = this.init.bind(this);
      /**
      TODO: sparql_text should be managed by painless_sparql.coffee
      */
      this.utils = new window.PainlessUtils();
      this.context = context;
      this.links = links;
      this.init();
      this.reshape();
      this.sparql_text = new SparqlText(this.cy, links);
      this.sparql_text.update();
      new window.PainlessContextMenu(this.cy, this);
    }

    reshape() {
      /** resets node positions in the graph view */
      //for node in @cy.nodes('.node-role')
      //    node.neighborhood().layout({name: 'circle'}).run()
      /**
      @cy.layout({
          name:'cola'
          fit: false
          refresh: 2
          maxSimulationTime: 2000
          #nodeDimensionsIncludeLabels: true
          edgeLength: 100
          #flow: { axis: 'x', minSeparation: 30 }
          avoidOverlap: true
          nodeSpacing: 30
      }).run()
       */
      return this.cy.layout({
        name: 'cose-bilkent',
        fit: false
      }).run();
    }

    center_view(ele = null) {
      /** 
      TODO: pan and center should actually be two different buttons!
      */
      if (ele === null) {
        if (this.cy.nodes(':selected').length > 0) {
          return this.cy.center(this.cy.nodes(':selected'));
        } else {
          return this.cy.fit();
        }
      } else {
        return this.cy.center(ele);
      }
    }

    add_to_select(node_id) {
      return this.sparql_text.add_to_select(node_id);
    }

    copy_to_clipboard() {
      return this.sparql_text.copy_to_clipboard();
    }

    save_state() {
      if (state_buffer === null) {
        state_buffer = [];
      }
      if (this.cy.json() !== state_buffer[state_buffer.length - 1]) {
        state_buffer.push(this.cy.json());
      }
      if (state_buffer.length >= state_buffer_max_length) {
        return state_buffer.shift();
      }
    }

    undo() {
      if (state_buffer === null || state_buffer.length < 1) {
        return console.warn("no saved states");
      } else {
        this.cy.json(state_buffer[state_buffer.length - 1]);
        this.cy.style(this.utils.generate_style());
        state_buffer.pop();
        return this.reshape();
      }
    }

    reverse_relationship() {
      var s_node;
      s_node = this.cy.nodes(":selected");
      if (s_node === null) {
        return console.warn('please select a node in the sparql graph');
      } else if (s_node.hasClass("node-variable")) {
        return console.warn('please select a role and not a variable');
      } else if (s_node.data('links').link_type === 'attribute') {
        return console.warn('attributes cannot be reversed');
      } else if (s_node.hasClass("node-role") || s_node.hasClass("node-domain") || s_node.hasClass("node-range")) {
        return this.cy.nodes(":selected").data('links').reverse();
      } else {
        return console.warn('this action cannot be performed on the selected node');
      }
    }

    merge(node1, node2) {
      var i, len, link, node_var1, node_var2, ref;
      /** merges node1 and node2, repositioning all node2's edges into node1 */
      this.save_state();
      ref = node2.data('links');
      for (i = 0, len = ref.length; i < len; i++) {
        link = ref[i];
        if (link.link_type === 'concept') {
          links.push(new PainlessLink(this, this.cy, link.link_name, link.link_type, node_var1 = node1));
        } else {
          if (link.node_var1 === node2 && link.node_var2 === node2) {
            links.push(new PainlessLink(this, this.cy, link.link_name, link.link_type, node_var1 = node1, node_var2 = node1));
          } else if (link.node_var1 === node2) {
            links.push(new PainlessLink(this, this.cy, link.link_name, link.link_type, node_var1 = node1, node_var2 = link.node_var2));
          } else {
            links.push(new PainlessLink(this, this.cy, link.link_name, link.link_type, node_var1 = link.node_var1, node_var2 = node1));
          }
        }
        link.delete();
      }
      return this.cy.remove(node2);
    }

    add_link(link_name, link_type, datatype) {
      /** if a var node is selected, the link is added to the var node and one new var node is created*/
      var link;
      /** adds a new link in the graph. 
          links that are not concepts (roles and attributes) add a new variable into the graph.
          links are always added to the selected variable in the graph, if there are no selected variables,   
              two new variables are created.

          links can be:
          - concepts   
          - roles
          - attributes

          TODO: use an enum to represent link types instead of hardcoded strings
      */
      this.save_state();
      if (link_type === 'concept') {
        if (this.cy.nodes(":selected").length > 0 && this.cy.nodes(":selected").hasClass('node-variable')) {
          link = new PainlessLink(this, this.cy, link_name, link_type, this.cy.nodes(":selected"));
        } else {
          link = new PainlessLink(this, this.cy, link_name, link_type);
          this.sparql_text.add_to_select(link.node_var1.id());
        }
      } else {
        if (this.cy.nodes(":selected").length > 0 && this.cy.nodes(":selected").hasClass('node-variable')) {
          link = new PainlessLink(this, this.cy, link_name, link_type, this.cy.nodes(":selected"), null, datatype);
          this.sparql_text.add_to_select(link.node_var2.id());
        } else {
          /** otherwise, two new var nodes are created */
          link = new PainlessLink(this, this.cy, link_name, link_type, null, null, datatype);
          this.sparql_text.add_to_select(link.node_var1.id());
          this.sparql_text.add_to_select(link.node_var2.id());
        }
      }
      links.push(link);
      this.sparql_text.update();
      return this.reshape();
    }

    compute_distance(node1, node2) {
      /** computes distance between two node positions */
      var a, b;
      a = Math.abs(node1.position('x') - node2.position('x'));
      b = Math.abs(node1.position('y') - node2.position('y'));
      return Math.sqrt(a * a + b * b);
    }

    check_collisions() {
      var i, j, len, len1, node, node2, ref, ref1;
      ref = this.cy.nodes(".node-variable");
      /** check if there are any collisions in all the node variables
      returns the colliding nodes if there are any.

      TODO: collision highlight is broken!
      TODO: remove hardcoded collision distance threshold
      */
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        ref1 = this.cy.nodes(".node-variable");
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          node2 = ref1[j];
          if (node !== node2) {
            if (this.compute_distance(node, node2) < 100) {
              node.addClass('highlight');
              node2.addClass('highlight');
              return [node, node2];
            } else {
              node.removeClass('highlight');
            }
          }
        }
      }
    }

    init() {
      this.cy = new cytoscape({
        container: document.getElementById("query_canvas"),
        style: this.utils.generate_style(),
        wheelSensitivity: 0.5
      });
      this.cy.on('click', '.node-variable', (event) => {
        event.target.select();
        return this.reshape();
      });
      this.cy.on('mouseup', ($) => {
        var node_tmp_arr;
        if (this.check_collisions() !== void 0) {
          node_tmp_arr = this.check_collisions();
          this.merge(node_tmp_arr[0], node_tmp_arr[1]);
        }
        return this.reshape();
      });
      return this.cy.resize();
    }

  };

  state_buffer = null;

  links = [];

  return PainlessGraph;

}).call(this);

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeCxtmenu"] = factory();
	else
		root["cytoscapeCxtmenu"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = __webpack_require__(2);
var assign = __webpack_require__(1);

var _require = __webpack_require__(3),
    removeEles = _require.removeEles,
    setStyles = _require.setStyles,
    createElement = _require.createElement,
    getPixelRatio = _require.getPixelRatio,
    getOffset = _require.getOffset;

var cxtmenu = function cxtmenu(params) {
  var options = assign({}, defaults, params);
  var cy = this;
  var container = cy.container();
  var target = void 0;

  var data = {
    options: options,
    handlers: [],
    container: createElement({ class: 'cxtmenu' })
  };

  var wrapper = data.container;
  var parent = createElement();
  var canvas = createElement({ tag: 'canvas' });
  var commands = [];
  var c2d = canvas.getContext('2d');
  var r = options.menuRadius;
  var containerSize = (r + options.activePadding) * 2;
  var activeCommandI = void 0;
  var offset = void 0;

  container.insertBefore(wrapper, container.firstChild);
  wrapper.appendChild(parent);
  parent.appendChild(canvas);

  setStyles(wrapper, {
    position: 'absolute',
    zIndex: options.zIndex,
    userSelect: 'none'
  });

  setStyles(parent, {
    display: 'none',
    width: containerSize + 'px',
    height: containerSize + 'px',
    position: 'absolute',
    zIndex: 1,
    marginLeft: -options.activePadding + 'px',
    marginTop: -options.activePadding + 'px',
    userSelect: 'none'
  });

  canvas.width = containerSize;
  canvas.height = containerSize;

  function createMenuItems() {
    removeEles('.cxtmenu-item', parent);
    var dtheta = 2 * Math.PI / commands.length;
    var theta1 = Math.PI / 2;
    var theta2 = theta1 + dtheta;

    for (var i = 0; i < commands.length; i++) {
      var command = commands[i];

      var midtheta = (theta1 + theta2) / 2;
      var rx1 = 0.66 * r * Math.cos(midtheta);
      var ry1 = 0.66 * r * Math.sin(midtheta);

      var item = createElement({ class: 'cxtmenu-item' });
      setStyles(item, {
        color: options.itemColor,
        cursor: 'default',
        display: 'table',
        'text-align': 'center',
        //background: 'red',
        position: 'absolute',
        'text-shadow': '-1px -1px 2px ' + options.itemTextShadowColor + ', 1px -1px 2px ' + options.itemTextShadowColor + ', -1px 1px 2px ' + options.itemTextShadowColor + ', 1px 1px 1px ' + options.itemTextShadowColor,
        left: '50%',
        top: '50%',
        'min-height': r * 0.66 + 'px',
        width: r * 0.66 + 'px',
        height: r * 0.66 + 'px',
        marginLeft: rx1 - r * 0.33 + 'px',
        marginTop: -ry1 - r * 0.33 + 'px'
      });

      var content = createElement({ class: 'cxtmenu-content' });

      if (command.content instanceof HTMLElement) {
        content.appendChild(command.content);
      } else {
        content.innerHTML = command.content;
      }

      setStyles(content, {
        'width': r * 0.66 + 'px',
        'height': r * 0.66 + 'px',
        'vertical-align': 'middle',
        'display': 'table-cell'
      });

      setStyles(content, command.contentStyle || {});

      if (command.disabled === true || command.enabled === false) {
        content.classList.add('cxtmenu-disabled');
      }

      parent.appendChild(item);
      item.appendChild(content);

      theta1 += dtheta;
      theta2 += dtheta;
    }
  }

  function queueDrawBg(rspotlight) {
    redrawQueue.drawBg = [rspotlight];
  }

  function drawBg(rspotlight) {
    rspotlight = rspotlight !== undefined ? rspotlight : rs;

    c2d.globalCompositeOperation = 'source-over';

    c2d.clearRect(0, 0, containerSize, containerSize);

    // draw background items
    c2d.fillStyle = options.fillColor;
    var dtheta = 2 * Math.PI / commands.length;
    var theta1 = Math.PI / 2;
    var theta2 = theta1 + dtheta;

    for (var index = 0; index < commands.length; index++) {
      var command = commands[index];

      if (command.fillColor) {
        c2d.fillStyle = command.fillColor;
      }
      c2d.beginPath();
      c2d.moveTo(r + options.activePadding, r + options.activePadding);
      c2d.arc(r + options.activePadding, r + options.activePadding, r, 2 * Math.PI - theta1, 2 * Math.PI - theta2, true);
      c2d.closePath();
      c2d.fill();

      theta1 += dtheta;
      theta2 += dtheta;

      c2d.fillStyle = options.fillColor;
    }

    // draw separators between items
    c2d.globalCompositeOperation = 'destination-out';
    c2d.strokeStyle = 'white';
    c2d.lineWidth = options.separatorWidth;
    theta1 = Math.PI / 2;
    theta2 = theta1 + dtheta;

    for (var i = 0; i < commands.length; i++) {
      var rx1 = r * Math.cos(theta1);
      var ry1 = r * Math.sin(theta1);
      c2d.beginPath();
      c2d.moveTo(r + options.activePadding, r + options.activePadding);
      c2d.lineTo(r + options.activePadding + rx1, r + options.activePadding - ry1);
      c2d.closePath();
      c2d.stroke();

      theta1 += dtheta;
      theta2 += dtheta;
    }

    c2d.fillStyle = 'white';
    c2d.globalCompositeOperation = 'destination-out';
    c2d.beginPath();
    c2d.arc(r + options.activePadding, r + options.activePadding, rspotlight + options.spotlightPadding, 0, Math.PI * 2, true);
    c2d.closePath();
    c2d.fill();

    c2d.globalCompositeOperation = 'source-over';
  }

  function queueDrawCommands(rx, ry, theta) {
    redrawQueue.drawCommands = [rx, ry, theta];
  }

  function drawCommands(rx, ry, theta) {
    var dtheta = 2 * Math.PI / commands.length;
    var theta1 = Math.PI / 2;
    var theta2 = theta1 + dtheta;

    theta1 += dtheta * activeCommandI;
    theta2 += dtheta * activeCommandI;

    c2d.fillStyle = options.activeFillColor;
    c2d.strokeStyle = 'black';
    c2d.lineWidth = 1;
    c2d.beginPath();
    c2d.moveTo(r + options.activePadding, r + options.activePadding);
    c2d.arc(r + options.activePadding, r + options.activePadding, r + options.activePadding, 2 * Math.PI - theta1, 2 * Math.PI - theta2, true);
    c2d.closePath();
    c2d.fill();

    c2d.fillStyle = 'white';
    c2d.globalCompositeOperation = 'destination-out';

    var tx = r + options.activePadding + rx / r * (rs + options.spotlightPadding - options.indicatorSize / 4);
    var ty = r + options.activePadding + ry / r * (rs + options.spotlightPadding - options.indicatorSize / 4);
    var rot = Math.PI / 4 - theta;

    c2d.translate(tx, ty);
    c2d.rotate(rot);

    // clear the indicator
    c2d.beginPath();
    c2d.fillRect(-options.indicatorSize / 2, -options.indicatorSize / 2, options.indicatorSize, options.indicatorSize);
    c2d.closePath();
    c2d.fill();

    c2d.rotate(-rot);
    c2d.translate(-tx, -ty);

    // c2d.setTransform( 1, 0, 0, 1, 0, 0 );

    // clear the spotlight
    c2d.beginPath();
    c2d.arc(r + options.activePadding, r + options.activePadding, rs + options.spotlightPadding, 0, Math.PI * 2, true);
    c2d.closePath();
    c2d.fill();

    c2d.globalCompositeOperation = 'source-over';
  }

  function updatePixelRatio() {
    var pxr = getPixelRatio();
    var w = container.clientWidth;
    var h = container.clientHeight;

    canvas.width = w * pxr;
    canvas.height = h * pxr;

    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    c2d.setTransform(1, 0, 0, 1, 0, 0);
    c2d.scale(pxr, pxr);
  }

  var redrawing = true;
  var redrawQueue = {};
  var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
  var redraw = function redraw() {
    if (redrawQueue.drawBg) {
      drawBg.apply(null, redrawQueue.drawBg);
    }

    if (redrawQueue.drawCommands) {
      drawCommands.apply(null, redrawQueue.drawCommands);
    }

    redrawQueue = {};

    if (redrawing) {
      raf(redraw);
    }
  };

  // kick off
  updatePixelRatio();
  redraw();

  var ctrx = void 0,
      ctry = void 0,
      rs = void 0;

  var bindings = {
    on: function on(events, selector, fn) {

      var _fn = fn;
      if (selector === 'core') {
        _fn = function _fn(e) {
          if (e.cyTarget === cy || e.target === cy) {
            // only if event target is directly core
            return fn.apply(this, [e]);
          }
        };
      }

      data.handlers.push({
        events: events,
        selector: selector,
        fn: _fn
      });

      if (selector === 'core') {
        cy.on(events, _fn);
      } else {
        cy.on(events, selector, _fn);
      }

      return this;
    }
  };

  function addEventListeners() {
    var grabbable = void 0;
    var inGesture = false;
    var dragHandler = void 0;
    var zoomEnabled = void 0;
    var panEnabled = void 0;
    var boxEnabled = void 0;
    var gestureStartEvent = void 0;

    var restoreZoom = function restoreZoom() {
      if (zoomEnabled) {
        cy.userZoomingEnabled(true);
      }
    };

    var restoreGrab = function restoreGrab() {
      if (grabbable) {
        target.grabify();
      }
    };

    var restorePan = function restorePan() {
      if (panEnabled) {
        cy.userPanningEnabled(true);
      }
    };

    var restoreBoxSeln = function restoreBoxSeln() {
      if (boxEnabled) {
        cy.boxSelectionEnabled(true);
      }
    };

    var restoreGestures = function restoreGestures() {
      restoreGrab();
      restoreZoom();
      restorePan();
      restoreBoxSeln();
    };

    window.addEventListener('resize', updatePixelRatio);

    bindings.on('resize', function () {
      updatePixelRatio();
    }).on(options.openMenuEvents, options.selector, function (e) {
      target = this; // Remember which node the context menu is for
      var ele = this;
      var isCy = this === cy;

      if (inGesture) {
        parent.style.display = 'none';

        inGesture = false;

        restoreGestures();
      }

      if (typeof options.commands === 'function') {
        commands = options.commands(target);
      } else {
        commands = options.commands;
      }

      if (!commands || commands.length === 0) {
        return;
      }

      zoomEnabled = cy.userZoomingEnabled();
      cy.userZoomingEnabled(false);

      panEnabled = cy.userPanningEnabled();
      cy.userPanningEnabled(false);

      boxEnabled = cy.boxSelectionEnabled();
      cy.boxSelectionEnabled(false);

      grabbable = target.grabbable && target.grabbable();
      if (grabbable) {
        target.ungrabify();
      }

      var rp = void 0,
          rw = void 0,
          rh = void 0;
      if (!isCy && ele.isNode() && !ele.isParent() && !options.atMouse) {
        rp = ele.renderedPosition();
        rw = ele.renderedWidth();
        rh = ele.renderedHeight();
      } else {
        rp = e.renderedPosition || e.cyRenderedPosition;
        rw = 1;
        rh = 1;
      }

      offset = getOffset(container);

      ctrx = rp.x;
      ctry = rp.y;

      createMenuItems();

      setStyles(parent, {
        display: 'block',
        left: rp.x - r + 'px',
        top: rp.y - r + 'px'
      });

      rs = Math.max(rw, rh) / 2;
      rs = Math.max(rs, options.minSpotlightRadius);
      rs = Math.min(rs, options.maxSpotlightRadius);

      queueDrawBg();

      activeCommandI = undefined;

      inGesture = true;
      gestureStartEvent = e;
    }).on('cxtdrag tapdrag', options.selector, dragHandler = function dragHandler(e) {

      if (!inGesture) {
        return;
      }

      var origE = e.originalEvent;
      var isTouch = origE.touches && origE.touches.length > 0;

      var pageX = isTouch ? origE.touches[0].pageX : origE.pageX;
      var pageY = isTouch ? origE.touches[0].pageY : origE.pageY;

      activeCommandI = undefined;

      var dx = pageX - offset.left - ctrx;
      var dy = pageY - offset.top - ctry;

      if (dx === 0) {
        dx = 0.01;
      }

      var d = Math.sqrt(dx * dx + dy * dy);
      var cosTheta = (dy * dy - d * d - dx * dx) / (-2 * d * dx);
      var theta = Math.acos(cosTheta);

      if (d < rs + options.spotlightPadding) {
        queueDrawBg();
        return;
      }

      queueDrawBg();

      var rx = dx * r / d;
      var ry = dy * r / d;

      if (dy > 0) {
        theta = Math.PI + Math.abs(theta - Math.PI);
      }

      var dtheta = 2 * Math.PI / commands.length;
      var theta1 = Math.PI / 2;
      var theta2 = theta1 + dtheta;

      for (var i = 0; i < commands.length; i++) {
        var command = commands[i];

        var inThisCommand = theta1 <= theta && theta <= theta2 || theta1 <= theta + 2 * Math.PI && theta + 2 * Math.PI <= theta2;

        if (command.disabled) {
          inThisCommand = false;
        }

        if (inThisCommand) {
          activeCommandI = i;
          break;
        }

        theta1 += dtheta;
        theta2 += dtheta;
      }

      queueDrawCommands(rx, ry, theta);
    }).on('tapdrag', dragHandler).on('cxttapend tapend', function () {
      parent.style.display = 'none';

      if (activeCommandI !== undefined) {
        var select = commands[activeCommandI].select;

        if (select) {
          select.apply(target, [target, gestureStartEvent]);
          activeCommandI = undefined;
        }
      }

      inGesture = false;

      restoreGestures();
    });
  }

  function removeEventListeners() {
    var handlers = data.handlers;

    for (var i = 0; i < handlers.length; i++) {
      var h = handlers[i];

      if (h.selector === 'core') {
        cy.off(h.events, h.fn);
      } else {
        cy.off(h.events, h.selector, h.fn);
      }
    }

    window.removeEventListener('resize', updatePixelRatio);
  }

  function destroyInstance() {
    redrawing = false;

    removeEventListeners();

    wrapper.remove();
  }

  addEventListeners();

  return {
    destroy: function destroy() {
      destroyInstance();
    }
  };
};

module.exports = cxtmenu;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Simple, internal Object.assign() polyfill for options objects etc.

module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });

  return tgt;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = {
  menuRadius: 100, // the radius of the circular menu in pixels
  selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
  commands: [// an array of commands to list in the menu or a function that returns the array
    /*
    { // example command
      fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
      content: 'a command name' // html/text content to be displayed in the menu
      contentStyle: {}, // css key:value pairs to set the command's css in js if you want
      select: function(ele){ // a function to execute when the command is selected
        console.log( ele.id() ) // `ele` holds the reference to the active element
      },
      enabled: true // whether the command is selectable
    }
    */
  ], // function( ele ){ return [ /*...*/ ] }, // example function for commands
  fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
  activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
  activePadding: 20, // additional size in pixels for the active command
  indicatorSize: 24, // the size in pixels of the pointer to the active command
  separatorWidth: 3, // the empty spacing in pixels between successive commands
  spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
  minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
  maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
  openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
  itemColor: 'white', // the colour of text in the command's content
  itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
  zIndex: 9999, // the z-index of the ui div
  atMouse: false // draw menu at mouse position
};

module.exports = defaults;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var removeEles = function removeEles(query) {
  var ancestor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  ancestor.querySelectorAll(query).forEach(function (el) {
    return el.parentNode.removeChild(el);
  });
};

var setStyles = function setStyles(el, style) {
  var props = Object.keys(style);

  for (var i = 0, l = props.length; i < l; i++) {
    el.style[props[i]] = style[props[i]];
  }
};

var createElement = function createElement(options) {
  options = options || {};

  var el = document.createElement(options.tag || 'div');

  el.className = options.class || '';

  if (options.style) {
    setStyles(el, options.style);
  }

  return el;
};

var getPixelRatio = function getPixelRatio() {
  return window.devicePixelRatio || 1;
};

var getOffset = function getOffset(el) {
  var offset = el.getBoundingClientRect();

  return {
    left: offset.left + document.body.scrollLeft + parseFloat(getComputedStyle(document.body)['padding-left']) + parseFloat(getComputedStyle(document.body)['border-left-width']),
    top: offset.top + document.body.scrollTop + parseFloat(getComputedStyle(document.body)['padding-top']) + parseFloat(getComputedStyle(document.body)['border-top-width'])
  };
};

module.exports = { removeEles: removeEles, setStyles: setStyles, createElement: createElement, getPixelRatio: getPixelRatio, getOffset: getOffset };

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var cxtmenu = __webpack_require__(0);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('core', 'cxtmenu', cxtmenu); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ })
/******/ ]);
});
//_require constants.coffee
window.PainlessLink = (function() {
  var color_index;

  class PainlessLink {
    constructor(context, cy, link_name, link_type, node_var1 = null, node_var2 = null, datatype) {
      this.create_edge = this.create_edge.bind(this);
      this.reverse = this.reverse.bind(this);
      this.add_datatype = this.add_datatype.bind(this);
      this.create_node = this.create_node.bind(this);
      this.delete = this.delete.bind(this);
      this.create_link = this.create_link.bind(this);
      this.create_concept = this.create_concept.bind(this);
      this.cy = cy;
      this.context = context;
      console.log(this.context);
      this.link_name = link_name;
      this.link_type = link_type;
      this.node_var1 = node_var1;
      this.node_var2 = node_var2;
      this.edge_source = null;
      this.edge_target = null;
      this.datatype = datatype;
      this.datatype_node = null;
      if (link_type === 'concept') {
        this.create_concept();
      } else {
        this.create_link();
      }
    }

    find_new_name(base_name = null) {
      var i;
      if (base_name === null) {
        base_name = "x";
      }
      i = 0;
      while (this.cy.getElementById(base_name + i).length !== 0) {
        i += 1;
      }
      return base_name + i;
    }

    create_edge(node1, node2, classes = null) {
      return this.cy.add({
        group: 'edges',
        data: {
          source: node1.id(),
          target: node2.id()
        },
        classes: classes
      });
    }

    reverse() {
      /** can only be applied to non-concept relationships */
      if (this.source === this.node_var1) {
        this.edge_source.classes('target-edge');
        this.edge_target.classes('source-edge');
        this.source = this.node_var2;
        return this.target = this.node_var1;
      } else {
        this.edge_source.classes('source-edge');
        this.edge_target.classes('target-edge');
        this.source = this.node_var1;
        return this.target = this.node_var2;
      }
    }

    add_datatype(node, datatype) {
      this.datatype_node = this.cy.add({
        group: 'nodes',
        data: {
          label: datatype
        },
        classes: 'node-datatype'
      });
      return this.edge_datatype = this.cy.add({
        group: 'edges',
        data: {
          source: node.id(),
          target: this.datatype_node.id(),
          weight: 99
        },
        classes: 'edge-datatype'
      });
    }

    create_node(type, label = null) {
      var data;
      data = {};
      if (type === 'node-variable') {
        label = this.find_new_name(label);
        data['id'] = label;
        data['color'] = '#' + palette[color_index % palette.length];
        color_index += 1;
      }
      if (type === 'node-concept') {
        data['label'] = this.link_name;
      } else if (type === 'node-attribute' || type === 'node-role') {
        data['label'] = label;
      } else {
        data['label'] = '?' + label;
      }
      data['links'] = [this];
      return this.cy.add({
        group: 'nodes',
        data: data,
        classes: type
      });
    }

    delete() {
      var i, index, j, k, len, node_var, ref, ref1;
      index = this.context.links.indexOf(this);
      this.context.links.splice(index, 1);
      this.context.sparql_text.update();
      if (this.node_link !== null && this.node_link !== void 0) {
        this.cy.remove(this.node_link);
      }
      if (this.node_concept !== null && this.node_concept !== void 0) {
        this.cy.remove(this.node_concept);
      }
      if (this.datatype_node !== null && this.datatype_node !== void 0) {
        this.cy.remove(this.datatype_node);
      }
      ref = [this.node_var1, this.node_var2];
      for (j = 0, len = ref.length; j < len; j++) {
        node_var = ref[j];
        if (node_var !== null && node_var !== void 0) {
          index = node_var.data('links').indexOf(this);
          node_var.data('links').splice(index, 1);
          if (node_var.data('links').length === 0) {
            console.log(this.context.sparql_text.select_boxes);
            for (i = k = 0, ref1 = this.context.sparql_text.select_boxes.length; (0 <= ref1 ? k < ref1 : k > ref1); i = 0 <= ref1 ? ++k : --k) {
              if (this.context.sparql_text.select_boxes[i] === node_var.id()) {
                this.context.sparql_text.select_boxes.splice(i, 1);
              }
            }
            this.cy.remove(node_var);
          }
        }
      }
      return this.context.sparql_text.update();
    }

    create_link() {
      if (this.node_var1 === null || this.node_var1 === void 0) {
        this.node_var1 = this.create_node('node-variable');
        this.node_var1.classes('node-variable node-variable-full-options');
      } else if (this.node_var1.hasClass('attr-range')) {
        console.warn('properties can\'t be added to the range of an attribute');
        return;
      } else {
        this.node_var1.data('links').push(this);
      }
      if (this.node_var2 === null || this.node_var2 === void 0) {
        if (this.link_type === 'attribute') {
          this.node_var2 = this.create_node('node-variable', this.link_name);
          this.node_var2.classes('node-variable attr-range');
          if (this.datatype !== null && this.datatype !== void 0) {
            this.add_datatype(this.node_var2, this.datatype);
          }
        } else {
          this.node_var2 = this.create_node('node-variable');
          this.node_var2.classes('node-variable node-variable-full-options');
        }
      } else {
        this.node_var2.data('links').push(this);
      }
      this.source = this.node_var1;
      this.target = this.node_var2;
      if (this.link_type === 'role') {
        this.node_link = this.create_node('node-role', this.link_name);
      } else {
        this.node_link = this.create_node('node-attribute', this.link_name);
      }
      this.edge_source = this.create_edge(this.node_link, this.source, "source-edge");
      return this.edge_target = this.create_edge(this.node_link, this.target, "target-edge");
    }

    create_concept() {
      if (this.node_var1 === null || this.node_var1 === void 0) {
        this.node_var1 = this.create_node('node-variable');
        this.node_var1.classes('node-variable node-variable-full-options');
      }
      this.node_var1.data('links').push(this);
      this.node_concept = this.create_node('node-concept');
      return this.create_edge(this.node_var1, this.node_concept, 'edge-concept');
    }

  };

  color_index = 0;

  return PainlessLink;

}).call(this);

// TinyColor v1.4.1
// https://github.com/bgrins/TinyColor
// 2016-07-07, Brian Grinstead, MIT License
!function(a){function b(a,d){if(a=a?a:"",d=d||{},a instanceof b)return a;if(!(this instanceof b))return new b(a,d);var e=c(a);this._originalInput=a,this._r=e.r,this._g=e.g,this._b=e.b,this._a=e.a,this._roundA=P(100*this._a)/100,this._format=d.format||e.format,this._gradientType=d.gradientType,this._r<1&&(this._r=P(this._r)),this._g<1&&(this._g=P(this._g)),this._b<1&&(this._b=P(this._b)),this._ok=e.ok,this._tc_id=O++}function c(a){var b={r:0,g:0,b:0},c=1,e=null,g=null,i=null,j=!1,k=!1;return"string"==typeof a&&(a=K(a)),"object"==typeof a&&(J(a.r)&&J(a.g)&&J(a.b)?(b=d(a.r,a.g,a.b),j=!0,k="%"===String(a.r).substr(-1)?"prgb":"rgb"):J(a.h)&&J(a.s)&&J(a.v)?(e=G(a.s),g=G(a.v),b=h(a.h,e,g),j=!0,k="hsv"):J(a.h)&&J(a.s)&&J(a.l)&&(e=G(a.s),i=G(a.l),b=f(a.h,e,i),j=!0,k="hsl"),a.hasOwnProperty("a")&&(c=a.a)),c=z(c),{ok:j,format:a.format||k,r:Q(255,R(b.r,0)),g:Q(255,R(b.g,0)),b:Q(255,R(b.b,0)),a:c}}function d(a,b,c){return{r:255*A(a,255),g:255*A(b,255),b:255*A(c,255)}}function e(a,b,c){a=A(a,255),b=A(b,255),c=A(c,255);var d,e,f=R(a,b,c),g=Q(a,b,c),h=(f+g)/2;if(f==g)d=e=0;else{var i=f-g;switch(e=h>.5?i/(2-f-g):i/(f+g),f){case a:d=(b-c)/i+(c>b?6:0);break;case b:d=(c-a)/i+2;break;case c:d=(a-b)/i+4}d/=6}return{h:d,s:e,l:h}}function f(a,b,c){function d(a,b,c){return 0>c&&(c+=1),c>1&&(c-=1),1/6>c?a+6*(b-a)*c:.5>c?b:2/3>c?a+6*(b-a)*(2/3-c):a}var e,f,g;if(a=A(a,360),b=A(b,100),c=A(c,100),0===b)e=f=g=c;else{var h=.5>c?c*(1+b):c+b-c*b,i=2*c-h;e=d(i,h,a+1/3),f=d(i,h,a),g=d(i,h,a-1/3)}return{r:255*e,g:255*f,b:255*g}}function g(a,b,c){a=A(a,255),b=A(b,255),c=A(c,255);var d,e,f=R(a,b,c),g=Q(a,b,c),h=f,i=f-g;if(e=0===f?0:i/f,f==g)d=0;else{switch(f){case a:d=(b-c)/i+(c>b?6:0);break;case b:d=(c-a)/i+2;break;case c:d=(a-b)/i+4}d/=6}return{h:d,s:e,v:h}}function h(b,c,d){b=6*A(b,360),c=A(c,100),d=A(d,100);var e=a.floor(b),f=b-e,g=d*(1-c),h=d*(1-f*c),i=d*(1-(1-f)*c),j=e%6,k=[d,h,g,g,i,d][j],l=[i,d,d,h,g,g][j],m=[g,g,i,d,d,h][j];return{r:255*k,g:255*l,b:255*m}}function i(a,b,c,d){var e=[F(P(a).toString(16)),F(P(b).toString(16)),F(P(c).toString(16))];return d&&e[0].charAt(0)==e[0].charAt(1)&&e[1].charAt(0)==e[1].charAt(1)&&e[2].charAt(0)==e[2].charAt(1)?e[0].charAt(0)+e[1].charAt(0)+e[2].charAt(0):e.join("")}function j(a,b,c,d,e){var f=[F(P(a).toString(16)),F(P(b).toString(16)),F(P(c).toString(16)),F(H(d))];return e&&f[0].charAt(0)==f[0].charAt(1)&&f[1].charAt(0)==f[1].charAt(1)&&f[2].charAt(0)==f[2].charAt(1)&&f[3].charAt(0)==f[3].charAt(1)?f[0].charAt(0)+f[1].charAt(0)+f[2].charAt(0)+f[3].charAt(0):f.join("")}function k(a,b,c,d){var e=[F(H(d)),F(P(a).toString(16)),F(P(b).toString(16)),F(P(c).toString(16))];return e.join("")}function l(a,c){c=0===c?0:c||10;var d=b(a).toHsl();return d.s-=c/100,d.s=B(d.s),b(d)}function m(a,c){c=0===c?0:c||10;var d=b(a).toHsl();return d.s+=c/100,d.s=B(d.s),b(d)}function n(a){return b(a).desaturate(100)}function o(a,c){c=0===c?0:c||10;var d=b(a).toHsl();return d.l+=c/100,d.l=B(d.l),b(d)}function p(a,c){c=0===c?0:c||10;var d=b(a).toRgb();return d.r=R(0,Q(255,d.r-P(255*-(c/100)))),d.g=R(0,Q(255,d.g-P(255*-(c/100)))),d.b=R(0,Q(255,d.b-P(255*-(c/100)))),b(d)}function q(a,c){c=0===c?0:c||10;var d=b(a).toHsl();return d.l-=c/100,d.l=B(d.l),b(d)}function r(a,c){var d=b(a).toHsl(),e=(d.h+c)%360;return d.h=0>e?360+e:e,b(d)}function s(a){var c=b(a).toHsl();return c.h=(c.h+180)%360,b(c)}function t(a){var c=b(a).toHsl(),d=c.h;return[b(a),b({h:(d+120)%360,s:c.s,l:c.l}),b({h:(d+240)%360,s:c.s,l:c.l})]}function u(a){var c=b(a).toHsl(),d=c.h;return[b(a),b({h:(d+90)%360,s:c.s,l:c.l}),b({h:(d+180)%360,s:c.s,l:c.l}),b({h:(d+270)%360,s:c.s,l:c.l})]}function v(a){var c=b(a).toHsl(),d=c.h;return[b(a),b({h:(d+72)%360,s:c.s,l:c.l}),b({h:(d+216)%360,s:c.s,l:c.l})]}function w(a,c,d){c=c||6,d=d||30;var e=b(a).toHsl(),f=360/d,g=[b(a)];for(e.h=(e.h-(f*c>>1)+720)%360;--c;)e.h=(e.h+f)%360,g.push(b(e));return g}function x(a,c){c=c||6;for(var d=b(a).toHsv(),e=d.h,f=d.s,g=d.v,h=[],i=1/c;c--;)h.push(b({h:e,s:f,v:g})),g=(g+i)%1;return h}function y(a){var b={};for(var c in a)a.hasOwnProperty(c)&&(b[a[c]]=c);return b}function z(a){return a=parseFloat(a),(isNaN(a)||0>a||a>1)&&(a=1),a}function A(b,c){D(b)&&(b="100%");var d=E(b);return b=Q(c,R(0,parseFloat(b))),d&&(b=parseInt(b*c,10)/100),a.abs(b-c)<1e-6?1:b%c/parseFloat(c)}function B(a){return Q(1,R(0,a))}function C(a){return parseInt(a,16)}function D(a){return"string"==typeof a&&-1!=a.indexOf(".")&&1===parseFloat(a)}function E(a){return"string"==typeof a&&-1!=a.indexOf("%")}function F(a){return 1==a.length?"0"+a:""+a}function G(a){return 1>=a&&(a=100*a+"%"),a}function H(b){return a.round(255*parseFloat(b)).toString(16)}function I(a){return C(a)/255}function J(a){return!!V.CSS_UNIT.exec(a)}function K(a){a=a.replace(M,"").replace(N,"").toLowerCase();var b=!1;if(T[a])a=T[a],b=!0;else if("transparent"==a)return{r:0,g:0,b:0,a:0,format:"name"};var c;return(c=V.rgb.exec(a))?{r:c[1],g:c[2],b:c[3]}:(c=V.rgba.exec(a))?{r:c[1],g:c[2],b:c[3],a:c[4]}:(c=V.hsl.exec(a))?{h:c[1],s:c[2],l:c[3]}:(c=V.hsla.exec(a))?{h:c[1],s:c[2],l:c[3],a:c[4]}:(c=V.hsv.exec(a))?{h:c[1],s:c[2],v:c[3]}:(c=V.hsva.exec(a))?{h:c[1],s:c[2],v:c[3],a:c[4]}:(c=V.hex8.exec(a))?{r:C(c[1]),g:C(c[2]),b:C(c[3]),a:I(c[4]),format:b?"name":"hex8"}:(c=V.hex6.exec(a))?{r:C(c[1]),g:C(c[2]),b:C(c[3]),format:b?"name":"hex"}:(c=V.hex4.exec(a))?{r:C(c[1]+""+c[1]),g:C(c[2]+""+c[2]),b:C(c[3]+""+c[3]),a:I(c[4]+""+c[4]),format:b?"name":"hex8"}:(c=V.hex3.exec(a))?{r:C(c[1]+""+c[1]),g:C(c[2]+""+c[2]),b:C(c[3]+""+c[3]),format:b?"name":"hex"}:!1}function L(a){var b,c;return a=a||{level:"AA",size:"small"},b=(a.level||"AA").toUpperCase(),c=(a.size||"small").toLowerCase(),"AA"!==b&&"AAA"!==b&&(b="AA"),"small"!==c&&"large"!==c&&(c="small"),{level:b,size:c}}var M=/^\s+/,N=/\s+$/,O=0,P=a.round,Q=a.min,R=a.max,S=a.random;b.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getOriginalInput:function(){return this._originalInput},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var a=this.toRgb();return(299*a.r+587*a.g+114*a.b)/1e3},getLuminance:function(){var b,c,d,e,f,g,h=this.toRgb();return b=h.r/255,c=h.g/255,d=h.b/255,e=.03928>=b?b/12.92:a.pow((b+.055)/1.055,2.4),f=.03928>=c?c/12.92:a.pow((c+.055)/1.055,2.4),g=.03928>=d?d/12.92:a.pow((d+.055)/1.055,2.4),.2126*e+.7152*f+.0722*g},setAlpha:function(a){return this._a=z(a),this._roundA=P(100*this._a)/100,this},toHsv:function(){var a=g(this._r,this._g,this._b);return{h:360*a.h,s:a.s,v:a.v,a:this._a}},toHsvString:function(){var a=g(this._r,this._g,this._b),b=P(360*a.h),c=P(100*a.s),d=P(100*a.v);return 1==this._a?"hsv("+b+", "+c+"%, "+d+"%)":"hsva("+b+", "+c+"%, "+d+"%, "+this._roundA+")"},toHsl:function(){var a=e(this._r,this._g,this._b);return{h:360*a.h,s:a.s,l:a.l,a:this._a}},toHslString:function(){var a=e(this._r,this._g,this._b),b=P(360*a.h),c=P(100*a.s),d=P(100*a.l);return 1==this._a?"hsl("+b+", "+c+"%, "+d+"%)":"hsla("+b+", "+c+"%, "+d+"%, "+this._roundA+")"},toHex:function(a){return i(this._r,this._g,this._b,a)},toHexString:function(a){return"#"+this.toHex(a)},toHex8:function(a){return j(this._r,this._g,this._b,this._a,a)},toHex8String:function(a){return"#"+this.toHex8(a)},toRgb:function(){return{r:P(this._r),g:P(this._g),b:P(this._b),a:this._a}},toRgbString:function(){return 1==this._a?"rgb("+P(this._r)+", "+P(this._g)+", "+P(this._b)+")":"rgba("+P(this._r)+", "+P(this._g)+", "+P(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:P(100*A(this._r,255))+"%",g:P(100*A(this._g,255))+"%",b:P(100*A(this._b,255))+"%",a:this._a}},toPercentageRgbString:function(){return 1==this._a?"rgb("+P(100*A(this._r,255))+"%, "+P(100*A(this._g,255))+"%, "+P(100*A(this._b,255))+"%)":"rgba("+P(100*A(this._r,255))+"%, "+P(100*A(this._g,255))+"%, "+P(100*A(this._b,255))+"%, "+this._roundA+")"},toName:function(){return 0===this._a?"transparent":this._a<1?!1:U[i(this._r,this._g,this._b,!0)]||!1},toFilter:function(a){var c="#"+k(this._r,this._g,this._b,this._a),d=c,e=this._gradientType?"GradientType = 1, ":"";if(a){var f=b(a);d="#"+k(f._r,f._g,f._b,f._a)}return"progid:DXImageTransform.Microsoft.gradient("+e+"startColorstr="+c+",endColorstr="+d+")"},toString:function(a){var b=!!a;a=a||this._format;var c=!1,d=this._a<1&&this._a>=0,e=!b&&d&&("hex"===a||"hex6"===a||"hex3"===a||"hex4"===a||"hex8"===a||"name"===a);return e?"name"===a&&0===this._a?this.toName():this.toRgbString():("rgb"===a&&(c=this.toRgbString()),"prgb"===a&&(c=this.toPercentageRgbString()),("hex"===a||"hex6"===a)&&(c=this.toHexString()),"hex3"===a&&(c=this.toHexString(!0)),"hex4"===a&&(c=this.toHex8String(!0)),"hex8"===a&&(c=this.toHex8String()),"name"===a&&(c=this.toName()),"hsl"===a&&(c=this.toHslString()),"hsv"===a&&(c=this.toHsvString()),c||this.toHexString())},clone:function(){return b(this.toString())},_applyModification:function(a,b){var c=a.apply(null,[this].concat([].slice.call(b)));return this._r=c._r,this._g=c._g,this._b=c._b,this.setAlpha(c._a),this},lighten:function(){return this._applyModification(o,arguments)},brighten:function(){return this._applyModification(p,arguments)},darken:function(){return this._applyModification(q,arguments)},desaturate:function(){return this._applyModification(l,arguments)},saturate:function(){return this._applyModification(m,arguments)},greyscale:function(){return this._applyModification(n,arguments)},spin:function(){return this._applyModification(r,arguments)},_applyCombination:function(a,b){return a.apply(null,[this].concat([].slice.call(b)))},analogous:function(){return this._applyCombination(w,arguments)},complement:function(){return this._applyCombination(s,arguments)},monochromatic:function(){return this._applyCombination(x,arguments)},splitcomplement:function(){return this._applyCombination(v,arguments)},triad:function(){return this._applyCombination(t,arguments)},tetrad:function(){return this._applyCombination(u,arguments)}},b.fromRatio=function(a,c){if("object"==typeof a){var d={};for(var e in a)a.hasOwnProperty(e)&&(d[e]="a"===e?a[e]:G(a[e]));a=d}return b(a,c)},b.equals=function(a,c){return a&&c?b(a).toRgbString()==b(c).toRgbString():!1},b.random=function(){return b.fromRatio({r:S(),g:S(),b:S()})},b.mix=function(a,c,d){d=0===d?0:d||50;var e=b(a).toRgb(),f=b(c).toRgb(),g=d/100,h={r:(f.r-e.r)*g+e.r,g:(f.g-e.g)*g+e.g,b:(f.b-e.b)*g+e.b,a:(f.a-e.a)*g+e.a};return b(h)},b.readability=function(c,d){var e=b(c),f=b(d);return(a.max(e.getLuminance(),f.getLuminance())+.05)/(a.min(e.getLuminance(),f.getLuminance())+.05)},b.isReadable=function(a,c,d){var e,f,g=b.readability(a,c);switch(f=!1,e=L(d),e.level+e.size){case"AAsmall":case"AAAlarge":f=g>=4.5;break;case"AAlarge":f=g>=3;break;case"AAAsmall":f=g>=7}return f},b.mostReadable=function(a,c,d){var e,f,g,h,i=null,j=0;d=d||{},f=d.includeFallbackColors,g=d.level,h=d.size;for(var k=0;k<c.length;k++)e=b.readability(a,c[k]),e>j&&(j=e,i=b(c[k]));return b.isReadable(a,i,{level:g,size:h})||!f?i:(d.includeFallbackColors=!1,b.mostReadable(a,["#fff","#000"],d))};var T=b.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},U=b.hexNames=y(T),V=function(){var a="[-\\+]?\\d+%?",b="[-\\+]?\\d*\\.\\d+%?",c="(?:"+b+")|(?:"+a+")",d="[\\s|\\(]+("+c+")[,|\\s]+("+c+")[,|\\s]+("+c+")\\s*\\)?",e="[\\s|\\(]+("+c+")[,|\\s]+("+c+")[,|\\s]+("+c+")[,|\\s]+("+c+")\\s*\\)?";return{CSS_UNIT:new RegExp(c),rgb:new RegExp("rgb"+d),rgba:new RegExp("rgba"+e),hsl:new RegExp("hsl"+d),hsla:new RegExp("hsla"+e),hsv:new RegExp("hsv"+d),hsva:new RegExp("hsva"+e),hex3:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex4:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex8:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/}}();"undefined"!=typeof module&&module.exports?module.exports=b:"function"==typeof define&&define.amd?define(function(){return b}):window.tinycolor=b}(Math);
window.PainlessMenu = class PainlessMenu {
  constructor(context) {
    this.change_size = this.change_size.bind(this);
    this.create_navigation_div = this.create_navigation_div.bind(this);
    this.init = this.init.bind(this);
    this.context = context;
    this.init();
  }

  change_size(query_canvas_size) {
    this.context.query_canvas.style.height = query_canvas_size + "%";
    sparql_textbox.style.height = (100 - 10 - query_canvas_size) + "%";
    return setTimeout(() => {
      return this.context.graph.cy.resize();
    }, 550);
  }

  create_div(innerHTML = null, className = null, id = null, onclick = null) {
    var div;
    div = document.createElement('div');
    div.innerHTML = innerHTML;
    div.className = className;
    div.id = id;
    div.onclick = onclick;
    return div;
  }

  create_navigation_div() {
    var nav_div;
    nav_div = this.create_div(null, null, 'nav_div');
    nav_div.append(this.create_div('▲', 'resize_button', null, () => {
      return this.change_size(90);
    }));
    nav_div.append(this.create_div('≡', 'resize_button', null, () => {
      return this.change_size(60);
    }));
    nav_div.append(this.create_div('▼', 'resize_button', null, () => {
      return this.change_size(0);
    }));
    return nav_div;
  }

  init() {
    var menu;
    menu = this.create_div(null, null, 'painless_menu');
    document.getElementById('sidenav').append(menu);
    menu.append(this.create_navigation_div());
    menu.append(this.create_div('undo', 'menu_button', null, () => {
      return this.context.graph.undo();
    }));
    menu.append(this.create_div('center view', 'menu_button', null, () => {
      return this.context.graph.center_view();
    }));
    return menu.append(this.create_div('copy to clipboard', 'menu_button', null, () => {
      return this.context.graph.copy_to_clipboard();
    }));
  }

};

window.PainlessSparql = (function() {
  class PainlessSparql {
    constructor(graph) {
      this.add_to_query = this.add_to_query.bind(this);
      this.extract_datatype = this.extract_datatype.bind(this);
      this.create_sidenav = this.create_sidenav.bind(this);
      this.onkeypress_handler = this.onkeypress_handler.bind(this);
      this.graph = graph;
      this.cy = graph.cy;
      this.init();
    }

    init() {
      this.create_sidenav();
      this.sparql_text = this.graph.sparql_text;
      this.menu = new window.PainlessMenu(this);
      return this.add_event_listener();
    }

    add_to_query() {
      var selected_node;
      selected_node = this.cy.nodes(":selected");
      if (selected_node.length === 0) {
        console.warn("please, select a node in the main graph");
      }
      switch (selected_node.data('type')) {
        case "role":
          return this.graph.add_link(selected_node.data('label'), 'role');
        case "attribute":
          return this.graph.add_link(selected_node.data('label'), 'attribute', this.extract_datatype(selected_node));
        case "concept":
          return this.graph.add_link(selected_node.data('label'), 'concept');
      }
    }

    extract_datatype(inode) {
      var i, j, len, len1, neighbor, node, ref, ref1;
      ref = inode.neighborhood('node');
      for (i = 0, len = ref.length; i < len; i++) {
        neighbor = ref[i];
        if (neighbor.data('type') === "range-restriction") {
          ref1 = neighbor.neighborhood('node');
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            node = ref1[j];
            if (node.data('type') === "value-domain") {
              return node.data('label');
            }
          }
        }
      }
    }

    create_sidenav() {
      var button, side_nav, side_nav_container, slider, slider_range, slider_val, sparql_textbox;
      side_nav_container = document.createElement("div");
      side_nav_container.id = "sidenav_container";
      document.body.appendChild(side_nav_container);
      side_nav = document.createElement("div");
      side_nav.id = "sidenav";
      side_nav.className = "sidenav";
      side_nav_container.appendChild(side_nav);
      button = document.createElement("button");
      button.innerHTML = "add to \n\r query";
      button.id = "add_to_query_button";
      button.onclick = () => {
        return this.add_to_query();
      };
      side_nav.appendChild(button);
      sparql_textbox = document.createElement("div");
      sparql_textbox.id = "sparql_textbox";
      sparql_textbox.innerHTML = "sparql_query_here";
      side_nav.appendChild(sparql_textbox);
      this.query_canvas = document.createElement("div");
      this.query_canvas.id = "query_canvas";
      side_nav.appendChild(this.query_canvas);
      this.graph = new PainlessGraph(this.query_canvas);
      slider = document.createElement("div");
      slider.className = "slidecontainer";
      slider_range = document.createElement("input");
      slider_range.type = "range";
      slider_range.min = 1;
      slider_range.max = 100;
      slider_range.value = 48;
      slider_range.step = 0.5;
      slider_range.className = 'slider';
      slider.appendChild(slider_range);
      slider_val = 50;
      slider_range.oninput = function(s) {
        slider_val = this.value;
        return console.log(slider_val);
      };
      slider_range.onmousemove = slider_range.onmouseup = () => {
        side_nav.style.width = (document.documentElement.clientWidth * (100 - slider_val)) / 100 + "px";
        return setTimeout(() => {
          return this.graph.cy.resize();
        }, 550);
      };
      return document.body.appendChild(slider);
    }

    open_nav() {
      return document.getElementById("sidenav").style.width = "50%";
    }

    close_nav() {
      return document.getElementById("sidenav").style.width = "0px";
    }

    onkeypress_handler(event) {
      if (event.key === "a") {

      
      //@open_nav()
      } else if (event.key === "b") {

      //@close_nav()
      } else if (event.key === "d") {
        return console.log(this.graph.cy.nodes(":selected").data('links'));
      }
    }

    add_event_listener() {
      return document.onkeypress = this.onkeypress_handler;
    }

  };

  PainlessSparql.graph = null;

  return PainlessSparql;

}).call(this);

window.QueryFilter = class QueryFilter {
  constructor(node_id) {
    this.new_condition = this.new_condition.bind(this);
    this.to_html = this.to_html.bind(this);
    this.node_id = node_id;
    this.conditions = [];
  }

  new_condition() {
    var d, member1, operator, v, value;
    d = document.createElement('div');
    if (this.node_id !== "undefined") {
      member1 = document.createElement('div');
      member1.innerHTML = this.node_id;
      d.appendChild(member1);
    } else {
      v = new window.Void;
      d.appendChild(v);
    }
    operator = document.createElement('div');
    operator.innerHTML = ">=";
    d.appendChild(operator);
    value = document.createElement('div');
    value.innerHTML = "100 ^^xsd:string";
    d.appendChild(value);
    return d;
  }

  to_html() {
    var condition, conditions_container, i, len, ref, result_div, start;
    result_div = document.createElement('div');
    start = document.createElement('div');
    start.innerHTML = "filter ";
    start.style.display = "inline";
    result_div.append(start);
    this.conditions.push(this.new_condition());
    conditions_container = document.createElement('div');
    conditions_container.className = "filter_condition_container";
    ref = this.conditions;
    for (i = 0, len = ref.length; i < len; i++) {
      condition = ref[i];
      conditions_container.appendChild(condition);
    }
    result_div.append(conditions_container);
    return result_div;
  }

};

window.QueryLine = class QueryLine {
  constructor(link, sparql_text) {
    this.to_html = this.to_html.bind(this);
    this.create_highlighting_box = this.create_highlighting_box.bind(this);
    this.link = link;
    this.sparql_text = sparql_text;
  }

  to_html() {
    var button_div, f, link_div, q_line, remove_button, reverse_button;
    q_line = document.createElement('div');
    if (this.link.link_type === 'concept') {
      q_line.append(this.create_highlighting_box(this.link.node_var1));
      f = document.createElement("div");
      f.innerHTML = "&nbsp;rdf:type " + this.link.node_concept.data('label') + " .";
      q_line.append(f);
    } else {
      q_line.append(this.create_highlighting_box(this.link.source));
      link_div = document.createElement('div');
      link_div.innerHTML = this.link.node_link.data('label') + "&nbsp;";
      q_line.append(link_div);
      q_line.append(this.create_highlighting_box(this.link.target));
      f = document.createElement("div");
      f.innerHTML = " .";
      q_line.append(f);
    }
    button_div = document.createElement('div');
    button_div.style.visibility = 'hidden';
    if (this.link.link_type !== 'concept') {
      reverse_button = document.createElement('div');
      reverse_button.innerHTML = '🔄';
      reverse_button.style.color = '#ADD8E6';
      reverse_button.style.fontSize = 'large';
      reverse_button.style.marginLeft = '8px';
      reverse_button.style.display = 'inline-block';
      reverse_button.onclick = () => {
        this.link.reverse();
        return this.sparql_text.update();
      };
      button_div.append(reverse_button);
    }
    remove_button = document.createElement('div');
    remove_button.innerHTML = '❎';
    remove_button.style.color = '#F08080';
    remove_button.style.fontSize = 'large';
    remove_button.style.marginLeft = '8px';
    remove_button.style.display = 'inline-block';
    remove_button.onclick = () => {
      this.link.delete();
      return this.sparql_text.update();
    };
    button_div.append(remove_button);
    q_line.append(button_div);
    q_line.onmouseover = () => {
      return button_div.style.visibility = 'visible';
    };
    q_line.onmouseout = () => {
      return button_div.style.visibility = 'hidden';
    };
    q_line.className = 'q_line';
    return q_line;
  }

  create_highlighting_box(node) {
    /** creates a box in the sparql text that helps locate in the graph where the node is */
    var container, st;
    container = document.createElement('div');
    container.className = 'highlighting_box_container';
    st = document.createElement('div');
    st.className = "highlighting_box";
    st.id = node.id() + Math.round(Math.random() * 1000);
    st.dataset.prevname = node.id();
    st.dataset.node_id = node.id();
    st.setAttribute('draggable', true);
    st.setAttribute('contenteditable', 'true');
    st.addEventListener('dragstart', function(ev) {
      return ev.dataTransfer.setData("text", ev.target.id);
    });
    st.onkeyup = () => {
      return this.rename(st);
    };
    st.onmouseover = function($) {
      return node.addClass("highlight");
    };
    st.onmouseout = function($) {
      return node.removeClass("highlight");
    };
    st.onclick = ($) => {
      this.cy.nodes().unselect();
      return node.select();
    };
    st.innerHTML = node.data('label');
    st.style.backgroundColor = node.data('color');
    container.append(st);
    return container;
  }

};

//_require query_filter.coffee
window.SparqlText = (function() {
  var cy, div_sparql_text, links, select_boxes;

  class SparqlText {
    constructor(cy, links) {
      this.create_highlighting_box = this.create_highlighting_box.bind(this);
      this.remove_from_select_boxes = this.remove_from_select_boxes.bind(this);
      this.generate_plaintext_query = this.generate_plaintext_query.bind(this);
      this.copy_to_clipboard = this.copy_to_clipboard.bind(this);
      this.add_filter = this.add_filter.bind(this);
      this.update = this.update.bind(this);
      div_sparql_text = document.getElementById('sparql_textbox');
      div_sparql_text.className = "unselectable";
      this.select_boxes = select_boxes;
      this.cy = cy;
      this.links = links;
      this.filters = [];
    }

    add_to_select(id) {
      select_boxes.push(id);
      return this.update();
    }

    create_tab() {
      var nbsp;
      nbsp = document.createElement('div');
      nbsp.innerHTML = '&nbsp;';
      return nbsp;
    }

    rename(st) {
      var i, j, node, ref;
      node = this.cy.getElementById(st.dataset.node_id);
      for (i = j = 0, ref = select_boxes.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        if (select_boxes[i] === st.dataset.prevname) {
          select_boxes[i] = st.innerHTML.substr(i);
        }
      }
      return node.data('label', st.innerHTML.substr(1));
    }

    create_highlighting_box(node) {
      /** creates a box in the sparql text that helps locate in the graph where the node is */
      var container, minicross, st;
      container = document.createElement('div');
      container.className = 'highlighting_box_container';
      st = document.createElement('div');
      st.className = "highlighting_box";
      st.id = node.id() + Math.round(Math.random() * 1000);
      st.dataset.prevname = node.id();
      st.dataset.node_id = node.id();
      st.setAttribute('draggable', true);
      st.setAttribute('contenteditable', 'true');
      st.addEventListener('dragstart', function(ev) {
        return ev.dataTransfer.setData("text", ev.target.id);
      });
      st.onkeyup = () => {
        return this.rename(st);
      };
      st.onmouseover = function($) {
        return node.addClass("highlight");
      };
      st.onmouseout = function($) {
        return node.removeClass("highlight");
      };
      st.onclick = ($) => {
        this.cy.nodes().unselect();
        return node.select();
      };
      st.innerHTML = node.data('label');
      st.style.backgroundColor = node.data('color');
      container.append(st);
      minicross = document.createElement('div');
      minicross.innerHTML = ' x ';
      minicross.className = 'minicross';
      minicross.dataset.linkedhbox = st.id;
      minicross.dataset.node_id = st.dataset.node_id;
      minicross.style.visibility = 'hidden';
      minicross.onclick = ($) => {
        return this.remove_from_select_boxes(minicross.dataset.node_id);
      };
      container.append(minicross);
      container.onmouseover = function($) {
        return minicross.style.visibility = 'visible';
      };
      container.onmouseout = function($) {
        return minicross.style.visibility = 'hidden';
      };
      return container;
    }

    remove_from_select_boxes(node_id) {
      select_boxes = select_boxes.filter(function(elem) {
        return elem !== node_id;
      });
      return this.update();
    }

    generate_plaintext_query() {
      /** warning: VERY HACKY */
      var count, d, elem, j, k, l, len, len1, len2, ref, ref1, result;
      result = "Select ";
      if (select_boxes.length === 0) {
        result += '*';
      } else {
        for (j = 0, len = select_boxes.length; j < len; j++) {
          elem = select_boxes[j];
          result += '?' + elem + ' ';
        }
      }
      result += '\r\nwhere {';
      ref = document.getElementsByClassName('q_line');
      for (k = 0, len1 = ref.length; k < len1; k++) {
        elem = ref[k];
        result += '\r\n';
        count = 0;
        ref1 = elem.getElementsByClassName('highlighting_box');
        for (l = 0, len2 = ref1.length; l < len2; l++) {
          d = ref1[l];
          result += d.innerHTML + ' ';
          count += 1;
          if (count % 3 === 0) {
            result += ' .\r\n';
          }
        }
      }
      result += '}';
      console.log(result);
      return result;
    }

    copy_to_clipboard() {
      /** ugly hack to make you able to copy text to clipboard.
      */
      var thing, tmp_div;
      tmp_div = document.createElement('textarea');
      tmp_div.value = this.generate_plaintext_query();
      tmp_div.id = "tmp_div";
      document.body.appendChild(tmp_div);
      thing = document.getElementById('tmp_div');
      thing.select();
      document.execCommand('Copy');
      tmp_div.style.display = 'none';
      return document.body.removeChild(tmp_div);
    }

    add_filter(node_id) {
      this.filters.push(new window.QueryFilter(node_id));
      return this.update();
    }

    update() {
      var count, elem, f_string, filter, init_string, j, k, l, len, len1, len2, link, query_line, ref, ref1, s_line, select_div, select_div_f;
      div_sparql_text.innerHTML = "";
      init_string = document.createElement('div');
      init_string.className = "init_string";
      s_line = document.createElement('div');
      s_line.className = "s_line";
      if (select_boxes.length === 0) {
        s_line.innerHTML = "&nbsp;*";
      } else {
        s_line.append(this.create_tab());
        count = 0;
        for (j = 0, len = select_boxes.length; j < len; j++) {
          elem = select_boxes[j];
          if (this.cy.getElementById(elem).id() !== void 0) {
            s_line.append(this.create_highlighting_box(this.cy.getElementById(elem)));
            count += 1;
          }
        }
      }
      select_div = document.createElement('div');
      select_div.innerHTML = "Select ";
      init_string.append(select_div);
      init_string.append(s_line);
      init_string.append(document.createElement('br'));
      select_div_f = document.createElement('div');
      select_div_f.innerHTML = " where {";
      init_string.append(select_div_f);
      div_sparql_text.append(init_string);
      ref = this.links;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        link = ref[k];
        query_line = new window.QueryLine(link, this);
        div_sparql_text.append(query_line.to_html());
      }
      ref1 = this.filters;
      for (l = 0, len2 = ref1.length; l < len2; l++) {
        filter = ref1[l];
        div_sparql_text.append(filter.to_html());
      }
      f_string = document.createElement('div');
      f_string.innerHTML = '}';
      div_sparql_text.append(f_string);
      return dragula([s_line]);
    }

  };

  select_boxes = [];

  div_sparql_text = null;

  cy = null;

  links = null;

  return SparqlText;

}).call(this);

window.Void = class Void {
  constructor() {
    this.to_html = this.to_html.bind(this);
    this.div = document.createElement('div');
    this.div.innerHTML = "&nbsp;void";
  }

  to_html() {
    return this.div;
  }

};
