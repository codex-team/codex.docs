var Docs=function(t){function e(e){for(var n,o,i=e[0],u=e[1],a=0,s=[];a<i.length;a++)o=i[a],r[o]&&s.push(r[o][0]),r[o]=0;for(n in u)Object.prototype.hasOwnProperty.call(u,n)&&(t[n]=u[n]);for(c&&c(e);s.length;)s.shift()()}var n={},r={0:0};function o(e){if(n[e])return n[e].exports;var r=n[e]={i:e,l:!1,exports:{}};return t[e].call(r.exports,r,r.exports,o),r.l=!0,r.exports}o.e=function(t){var e=[],n=r[t];if(0!==n)if(n)e.push(n[2]);else{var i=new Promise(function(e,o){n=r[t]=[e,o]});e.push(n[2]=i);var u,a=document.getElementsByTagName("head")[0],c=document.createElement("script");c.charset="utf-8",c.timeout=120,o.nc&&c.setAttribute("nonce",o.nc),c.src=function(t){return o.p+""+({1:"editor"}[t]||t)+".bundle.js"}(t),u=function(e){c.onerror=c.onload=null,clearTimeout(s);var n=r[t];if(0!==n){if(n){var o=e&&("load"===e.type?"missing":e.type),i=e&&e.target&&e.target.src,u=new Error("Loading chunk "+t+" failed.\n("+o+": "+i+")");u.type=o,u.request=i,n[1](u)}r[t]=void 0}};var s=setTimeout(function(){u({type:"timeout",target:c})},12e4);c.onerror=c.onload=u,a.appendChild(c)}return Promise.all(e)},o.m=t,o.c=n,o.d=function(t,e,n){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)o.d(n,r,function(e){return t[e]}.bind(null,r));return n},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="/dist/",o.oe=function(t){throw console.error(t),t};var i=window.webpackJsonpDocs=window.webpackJsonpDocs||[],u=i.push.bind(i);i.push=e,i=i.slice();for(var a=0;a<i.length;a++)e(i[a]);var c=u;return o(o.s=50)}([function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e,n){var r=n(30)("wks"),o=n(17),i=n(0).Symbol,u="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=u&&i[t]||(u?i:o)("Symbol."+t))}).store=r},function(t,e){var n=t.exports={version:"2.5.7"};"number"==typeof __e&&(__e=n)},function(t,e,n){var r=n(4);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e,n){t.exports=!n(13)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e,n){var r=n(3),o=n(24),i=n(25),u=Object.defineProperty;e.f=n(5)?Object.defineProperty:function(t,e,n){if(r(t),e=i(e,!0),r(n),o)try{return u(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e,n){var r=n(8);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,o){return t.call(e,n,r,o)}}return function(){return t.apply(e,arguments)}}},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,e,n){var r=n(11);r(r.S+r.F*!n(5),"Object",{defineProperty:n(6).f})},function(t,e,n){var r=n(0),o=n(2),i=n(12),u=n(15),a=n(7),c=function(t,e,n){var s,f,l,h,p=t&c.F,d=t&c.G,v=t&c.S,y=t&c.P,m=t&c.B,g=d?r:v?r[e]||(r[e]={}):(r[e]||{}).prototype,w=d?o:o[e]||(o[e]={}),x=w.prototype||(w.prototype={});for(s in d&&(n=e),n)l=((f=!p&&g&&void 0!==g[s])?g:n)[s],h=m&&f?a(l,r):y&&"function"==typeof l?a(Function.call,l):l,g&&u(g,s,l,t&c.U),w[s]!=l&&i(w,s,h),y&&x[s]!=l&&(x[s]=l)};r.core=o,c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,t.exports=c},function(t,e,n){var r=n(6),o=n(26);t.exports=n(5)?function(t,e,n){return r.f(t,e,o(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e,n){var r=n(4),o=n(0).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,e,n){var r=n(0),o=n(12),i=n(16),u=n(17)("src"),a=Function.toString,c=(""+a).split("toString");n(2).inspectSource=function(t){return a.call(t)},(t.exports=function(t,e,n,a){var s="function"==typeof n;s&&(i(n,"name")||o(n,"name",e)),t[e]!==n&&(s&&(i(n,u)||o(n,u,t[e]?""+t[e]:c.join(String(e)))),t===r?t[e]=n:a?t[e]?t[e]=n:o(t,e,n):(delete t[e],o(t,e,n)))})(Function.prototype,"toString",function(){return"function"==typeof this&&this[u]||a.call(this)})},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},function(t,e){t.exports=!1},function(t,e,n){var r=n(9),o=n(1)("toStringTag"),i="Arguments"==r(function(){return arguments}());t.exports=function(t){var e,n,u;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=function(t,e){try{return t[e]}catch(t){}}(e=Object(t),o))?n:i?r(e):"Object"==(u=r(e))&&"function"==typeof e.callee?"Arguments":u}},function(t,e){t.exports={}},function(t,e,n){var r,o,i,u=n(7),a=n(39),c=n(40),s=n(14),f=n(0),l=f.process,h=f.setImmediate,p=f.clearImmediate,d=f.MessageChannel,v=f.Dispatch,y=0,m={},g=function(){var t=+this;if(m.hasOwnProperty(t)){var e=m[t];delete m[t],e()}},w=function(t){g.call(t.data)};h&&p||(h=function(t){for(var e=[],n=1;arguments.length>n;)e.push(arguments[n++]);return m[++y]=function(){a("function"==typeof t?t:Function(t),e)},r(y),y},p=function(t){delete m[t]},"process"==n(9)(l)?r=function(t){l.nextTick(u(g,t,1))}:v&&v.now?r=function(t){v.now(u(g,t,1))}:d?(i=(o=new d).port2,o.port1.onmessage=w,r=u(i.postMessage,i,1)):f.addEventListener&&"function"==typeof postMessage&&!f.importScripts?(r=function(t){f.postMessage(t+"","*")},f.addEventListener("message",w,!1)):r="onreadystatechange"in s("script")?function(t){c.appendChild(s("script")).onreadystatechange=function(){c.removeChild(this),g.call(t)}}:function(t){setTimeout(u(g,t,1),0)}),t.exports={set:h,clear:p}},function(t,e,n){"use strict";var r=n(8);t.exports.f=function(t){return new function(t){var e,n;this.promise=new t(function(t,r){if(void 0!==e||void 0!==n)throw TypeError("Bad Promise constructor");e=t,n=r}),this.resolve=r(e),this.reject=r(n)}(t)}},function(t,e,n){
/*!
 * CodeX Module Dispatcher — Initialize frontend Modules from the DOM without inline scripts
 * 
 * @copyright CodeX Team <team@ifmo.su>
 * @license MIT https://github.com/codex-team/dispatcher/LICENSE
 * @author @polinashneider https://github.com/polinashneider
 * @version 0.0.1
 */
"undefined"!=typeof self&&self,t.exports=function(t){function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=0)}([function(t,e,n){"use strict";function r(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=function(){function t(e){var n=e.name,r=e.element,i=e.settings,u=e.moduleClass;o(this,t),this.name=n,this.element=r,this.settings=i,this.moduleClass=u}return i(t,[{key:"init",value:function(){try{console.assert(this.moduleClass.init instanceof Function,"Module «"+this.name+"» should implement init method"),this.moduleClass.init instanceof Function&&(this.moduleClass.init(this.settings,this.element),console.log("Module «"+this.name+"» initialized"))}catch(t){console.warn("Module «"+this.name+"» was not initialized because of ",t)}}},{key:"destroy",value:function(){this.moduleClass.destroy instanceof Function&&(this.moduleClass.destroy(),console.log("Module «"+this.name+"» destroyed."))}}]),t}(),a=function(){function t(e){o(this,t),this.Library=e.Library||window,this.modules=this.findModules(document),this.initModules()}return i(t,[{key:"findModules",value:function(t){for(var e=[],n=t.querySelectorAll("[data-module]"),o=n.length-1;o>=0;o--)e.push.apply(e,r(this.extractModulesData(n[o])));return e}},{key:"extractModulesData",value:function(t){var e=this,n=[],r=t.dataset.module;return(r=r.replace(/\s+/," ")).split(" ").forEach(function(r,o){var i=new u({name:r,element:t,settings:e.getModuleSettings(t,o,r),moduleClass:e.Library[r]});n.push(i)}),n}},{key:"getModuleSettings",value:function(t,e,n){var r=t.querySelector("module-settings"),o=void 0;if(!r)return null;try{o=r.textContent.trim(),o=JSON.parse(o)}catch(t){return console.warn("Can not parse Module «"+n+"» settings bacause of: "+t),console.groupCollapsed(n+" settings"),console.log(o),console.groupEnd(),null}return Array.isArray(o)?o[e]?o[e]:null:0===e?o:(console.warn("Wrong settings format. For several Modules use an array instead of object."),null)}},{key:"initModules",value:function(){console.groupCollapsed("ModuleDispatcher"),this.modules.forEach(function(t){t.init()}),console.groupEnd()}}]),t}();e.default=a}])},function(t,e,n){t.exports=!n(5)&&!n(13)(function(){return 7!=Object.defineProperty(n(14)("div"),"a",{get:function(){return 7}}).a})},function(t,e,n){var r=n(4);t.exports=function(t,e){if(!r(t))return t;var n,o;if(e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!r(o=n.call(t)))return o;if(!e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e,n){},,function(t,e,n){"use strict";var r,o,i,u,a=n(18),c=n(0),s=n(7),f=n(19),l=n(11),h=n(4),p=n(8),d=n(31),v=n(32),y=n(38),m=n(21).set,g=n(41)(),w=n(22),x=n(42),b=n(43),_=n(44),j=c.TypeError,E=c.process,P=E&&E.versions,O=P&&P.v8||"",S=c.Promise,k="process"==f(E),L=function(){},M=o=w.f,T=!!function(){try{var t=S.resolve(1),e=(t.constructor={})[n(1)("species")]=function(t){t(L,L)};return(k||"function"==typeof PromiseRejectionEvent)&&t.then(L)instanceof e&&0!==O.indexOf("6.6")&&-1===b.indexOf("Chrome/66")}catch(t){}}(),C=function(t){var e;return!(!h(t)||"function"!=typeof(e=t.then))&&e},F=function(t,e){if(!t._n){t._n=!0;var n=t._c;g(function(){for(var r=t._v,o=1==t._s,i=0,u=function(e){var n,i,u,a=o?e.ok:e.fail,c=e.resolve,s=e.reject,f=e.domain;try{a?(o||(2==t._h&&N(t),t._h=1),!0===a?n=r:(f&&f.enter(),n=a(r),f&&(f.exit(),u=!0)),n===e.promise?s(j("Promise-chain cycle")):(i=C(n))?i.call(n,c,s):c(n)):s(r)}catch(t){f&&!u&&f.exit(),s(t)}};n.length>i;)u(n[i++]);t._c=[],t._n=!1,e&&!t._h&&A(t)})}},A=function(t){m.call(c,function(){var e,n,r,o=t._v,i=D(t);if(i&&(e=x(function(){k?E.emit("unhandledRejection",o,t):(n=c.onunhandledrejection)?n({promise:t,reason:o}):(r=c.console)&&r.error&&r.error("Unhandled promise rejection",o)}),t._h=k||D(t)?2:1),t._a=void 0,i&&e.e)throw e.v})},D=function(t){return 1!==t._h&&0===(t._a||t._c).length},N=function(t){m.call(c,function(){var e;k?E.emit("rejectionHandled",t):(e=c.onrejectionhandled)&&e({promise:t,reason:t._v})})},R=function(t){var e=this;e._d||(e._d=!0,(e=e._w||e)._v=t,e._s=2,e._a||(e._a=e._c.slice()),F(e,!0))},G=function(t){var e,n=this;if(!n._d){n._d=!0,n=n._w||n;try{if(n===t)throw j("Promise can't be resolved itself");(e=C(t))?g(function(){var r={_w:n,_d:!1};try{e.call(t,s(G,r,1),s(R,r,1))}catch(t){R.call(r,t)}}):(n._v=t,n._s=1,F(n,!1))}catch(t){R.call({_w:n,_d:!1},t)}}};T||(S=function(t){d(this,S,"Promise","_h"),p(t),r.call(this);try{t(s(G,this,1),s(R,this,1))}catch(t){R.call(this,t)}},(r=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1}).prototype=n(45)(S.prototype,{then:function(t,e){var n=M(y(this,S));return n.ok="function"!=typeof t||t,n.fail="function"==typeof e&&e,n.domain=k?E.domain:void 0,this._c.push(n),this._a&&this._a.push(n),this._s&&F(this,!1),n.promise},catch:function(t){return this.then(void 0,t)}}),i=function(){var t=new r;this.promise=t,this.resolve=s(G,t,1),this.reject=s(R,t,1)},w.f=M=function(t){return t===S||t===u?new i(t):o(t)}),l(l.G+l.W+l.F*!T,{Promise:S}),n(46)(S,"Promise"),n(47)("Promise"),u=n(2).Promise,l(l.S+l.F*!T,"Promise",{reject:function(t){var e=M(this);return(0,e.reject)(t),e.promise}}),l(l.S+l.F*(a||!T),"Promise",{resolve:function(t){return _(a&&this===u?S:this,t)}}),l(l.S+l.F*!(T&&n(48)(function(t){S.all(t).catch(L)})),"Promise",{all:function(t){var e=this,n=M(e),r=n.resolve,o=n.reject,i=x(function(){var n=[],i=0,u=1;v(t,!1,function(t){var a=i++,c=!1;n.push(void 0),u++,e.resolve(t).then(function(t){c||(c=!0,n[a]=t,--u||r(n))},o)}),--u||r(n)});return i.e&&o(i.v),n.promise},race:function(t){var e=this,n=M(e),r=n.reject,o=x(function(){v(t,!1,function(t){e.resolve(t).then(n.resolve,r)})});return o.e&&r(o.v),n.promise}})},function(t,e,n){var r=n(2),o=n(0),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(t.exports=function(t,e){return i[t]||(i[t]=void 0!==e?e:{})})("versions",[]).push({version:r.version,mode:n(18)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},function(t,e){t.exports=function(t,e,n,r){if(!(t instanceof e)||void 0!==r&&r in t)throw TypeError(n+": incorrect invocation!");return t}},function(t,e,n){var r=n(7),o=n(33),i=n(34),u=n(3),a=n(35),c=n(37),s={},f={};(e=t.exports=function(t,e,n,l,h){var p,d,v,y,m=h?function(){return t}:c(t),g=r(n,l,e?2:1),w=0;if("function"!=typeof m)throw TypeError(t+" is not iterable!");if(i(m)){for(p=a(t.length);p>w;w++)if((y=e?g(u(d=t[w])[0],d[1]):g(t[w]))===s||y===f)return y}else for(v=m.call(t);!(d=v.next()).done;)if((y=o(v,g,d.value,e))===s||y===f)return y}).BREAK=s,e.RETURN=f},function(t,e,n){var r=n(3);t.exports=function(t,e,n,o){try{return o?e(r(n)[0],n[1]):e(n)}catch(e){var i=t.return;throw void 0!==i&&r(i.call(t)),e}}},function(t,e,n){var r=n(20),o=n(1)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(r.Array===t||i[o]===t)}},function(t,e,n){var r=n(36),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},function(t,e,n){var r=n(19),o=n(1)("iterator"),i=n(20);t.exports=n(2).getIteratorMethod=function(t){if(void 0!=t)return t[o]||t["@@iterator"]||i[r(t)]}},function(t,e,n){var r=n(3),o=n(8),i=n(1)("species");t.exports=function(t,e){var n,u=r(t).constructor;return void 0===u||void 0==(n=r(u)[i])?e:o(n)}},function(t,e){t.exports=function(t,e,n){var r=void 0===n;switch(e.length){case 0:return r?t():t.call(n);case 1:return r?t(e[0]):t.call(n,e[0]);case 2:return r?t(e[0],e[1]):t.call(n,e[0],e[1]);case 3:return r?t(e[0],e[1],e[2]):t.call(n,e[0],e[1],e[2]);case 4:return r?t(e[0],e[1],e[2],e[3]):t.call(n,e[0],e[1],e[2],e[3])}return t.apply(n,e)}},function(t,e,n){var r=n(0).document;t.exports=r&&r.documentElement},function(t,e,n){var r=n(0),o=n(21).set,i=r.MutationObserver||r.WebKitMutationObserver,u=r.process,a=r.Promise,c="process"==n(9)(u);t.exports=function(){var t,e,n,s=function(){var r,o;for(c&&(r=u.domain)&&r.exit();t;){o=t.fn,t=t.next;try{o()}catch(r){throw t?n():e=void 0,r}}e=void 0,r&&r.enter()};if(c)n=function(){u.nextTick(s)};else if(!i||r.navigator&&r.navigator.standalone)if(a&&a.resolve){var f=a.resolve(void 0);n=function(){f.then(s)}}else n=function(){o.call(r,s)};else{var l=!0,h=document.createTextNode("");new i(s).observe(h,{characterData:!0}),n=function(){h.data=l=!l}}return function(r){var o={fn:r,next:void 0};e&&(e.next=o),t||(t=o,n()),e=o}}},function(t,e){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},function(t,e,n){var r=n(0).navigator;t.exports=r&&r.userAgent||""},function(t,e,n){var r=n(3),o=n(4),i=n(22);t.exports=function(t,e){if(r(t),o(e)&&e.constructor===t)return e;var n=i.f(t);return(0,n.resolve)(e),n.promise}},function(t,e,n){var r=n(15);t.exports=function(t,e,n){for(var o in e)r(t,o,e[o],n);return t}},function(t,e,n){var r=n(6).f,o=n(16),i=n(1)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},function(t,e,n){"use strict";var r=n(0),o=n(6),i=n(5),u=n(1)("species");t.exports=function(t){var e=r[t];i&&e&&!e[u]&&o.f(e,u,{configurable:!0,get:function(){return this}})}},function(t,e,n){var r=n(1)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0},Array.from(i,function(){throw 2})}catch(t){}t.exports=function(t,e){if(!e&&!o)return!1;var n=!1;try{var i=[7],u=i[r]();u.next=function(){return{done:n=!0}},i[r]=function(){return u},t(i)}catch(t){}return n}},function(t,e){!function(e){"use strict";var n,r=Object.prototype,o=r.hasOwnProperty,i="function"==typeof Symbol?Symbol:{},u=i.iterator||"@@iterator",a=i.asyncIterator||"@@asyncIterator",c=i.toStringTag||"@@toStringTag",s="object"==typeof t,f=e.regeneratorRuntime;if(f)s&&(t.exports=f);else{(f=e.regeneratorRuntime=s?t.exports:{}).wrap=x;var l="suspendedStart",h="suspendedYield",p="executing",d="completed",v={},y={};y[u]=function(){return this};var m=Object.getPrototypeOf,g=m&&m(m(T([])));g&&g!==r&&o.call(g,u)&&(y=g);var w=E.prototype=_.prototype=Object.create(y);j.prototype=w.constructor=E,E.constructor=j,E[c]=j.displayName="GeneratorFunction",f.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===j||"GeneratorFunction"===(e.displayName||e.name))},f.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,E):(t.__proto__=E,c in t||(t[c]="GeneratorFunction")),t.prototype=Object.create(w),t},f.awrap=function(t){return{__await:t}},P(O.prototype),O.prototype[a]=function(){return this},f.AsyncIterator=O,f.async=function(t,e,n,r){var o=new O(x(t,e,n,r));return f.isGeneratorFunction(e)?o:o.next().then(function(t){return t.done?t.value:o.next()})},P(w),w[c]="Generator",w[u]=function(){return this},w.toString=function(){return"[object Generator]"},f.keys=function(t){var e=[];for(var n in t)e.push(n);return e.reverse(),function n(){for(;e.length;){var r=e.pop();if(r in t)return n.value=r,n.done=!1,n}return n.done=!0,n}},f.values=T,M.prototype={constructor:M,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=n,this.done=!1,this.delegate=null,this.method="next",this.arg=n,this.tryEntries.forEach(L),!t)for(var e in this)"t"===e.charAt(0)&&o.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=n)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function r(r,o){return a.type="throw",a.arg=t,e.next=r,o&&(e.method="next",e.arg=n),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var u=this.tryEntries[i],a=u.completion;if("root"===u.tryLoc)return r("end");if(u.tryLoc<=this.prev){var c=o.call(u,"catchLoc"),s=o.call(u,"finallyLoc");if(c&&s){if(this.prev<u.catchLoc)return r(u.catchLoc,!0);if(this.prev<u.finallyLoc)return r(u.finallyLoc)}else if(c){if(this.prev<u.catchLoc)return r(u.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<u.finallyLoc)return r(u.finallyLoc)}}}},abrupt:function(t,e){for(var n=this.tryEntries.length-1;n>=0;--n){var r=this.tryEntries[n];if(r.tryLoc<=this.prev&&o.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var i=r;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var u=i?i.completion:{};return u.type=t,u.arg=e,i?(this.method="next",this.next=i.finallyLoc,v):this.complete(u)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),v},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),L(n),v}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var r=n.completion;if("throw"===r.type){var o=r.arg;L(n)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,r){return this.delegate={iterator:T(t),resultName:e,nextLoc:r},"next"===this.method&&(this.arg=n),v}}}function x(t,e,n,r){var o=e&&e.prototype instanceof _?e:_,i=Object.create(o.prototype),u=new M(r||[]);return i._invoke=function(t,e,n){var r=l;return function(o,i){if(r===p)throw new Error("Generator is already running");if(r===d){if("throw"===o)throw i;return C()}for(n.method=o,n.arg=i;;){var u=n.delegate;if(u){var a=S(u,n);if(a){if(a===v)continue;return a}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(r===l)throw r=d,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);r=p;var c=b(t,e,n);if("normal"===c.type){if(r=n.done?d:h,c.arg===v)continue;return{value:c.arg,done:n.done}}"throw"===c.type&&(r=d,n.method="throw",n.arg=c.arg)}}}(t,n,u),i}function b(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}function _(){}function j(){}function E(){}function P(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function O(t){var e;this._invoke=function(n,r){function i(){return new Promise(function(e,i){!function e(n,r,i,u){var a=b(t[n],t,r);if("throw"!==a.type){var c=a.arg,s=c.value;return s&&"object"==typeof s&&o.call(s,"__await")?Promise.resolve(s.__await).then(function(t){e("next",t,i,u)},function(t){e("throw",t,i,u)}):Promise.resolve(s).then(function(t){c.value=t,i(c)},u)}u(a.arg)}(n,r,e,i)})}return e=e?e.then(i,i):i()}}function S(t,e){var r=t.iterator[e.method];if(r===n){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=n,S(t,e),"throw"===e.method))return v;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return v}var o=b(r,t.iterator,e.arg);if("throw"===o.type)return e.method="throw",e.arg=o.arg,e.delegate=null,v;var i=o.arg;return i?i.done?(e[t.resultName]=i.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=n),e.delegate=null,v):i:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,v)}function k(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function L(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function M(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(k,this),this.reset(!0)}function T(t){if(t){var e=t[u];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,i=function e(){for(;++r<t.length;)if(o.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=n,e.done=!0,e};return i.next=i}}return{next:C}}function C(){return{value:n,done:!0}}}(function(){return this}()||Function("return this")())},function(t,e,n){"use strict";n.r(e);n(10),n(27);var r=n(23),o=n.n(r);n(29),n(49);function i(t,e,n,r,o,i,u){try{var a=t[i](u),c=a.value}catch(t){return void n(t)}a.done?e(c):Promise.resolve(c).then(r,o)}function u(t){return function(){var e=this,n=arguments;return new Promise(function(r,o){var u=t.apply(e,n);function a(t){i(u,r,o,a,c,"next",t)}function c(t){i(u,r,o,a,c,"throw",t)}a(void 0)})}}function a(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}var c=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.editor=null,this.nodes={editorWrapper:null,saveButton:null,parentIdSelector:null}}return function(t,e,n){e&&a(t.prototype,e),n&&a(t,n)}(t,[{key:"init",value:function(t,e){var n=this;this.nodes.editorWrapper=document.createElement("div"),this.nodes.editorWrapper.id="codex-editor",e.appendChild(this.nodes.editorWrapper),this.loadEditor().then(function(t){n.editor=t}),this.nodes.saveButton=e.querySelector('[name="js-submit"]'),this.nodes.saveButton.addEventListener("click",function(){n.saveButtonClicked()}),this.nodes.parentIdSelector=e.querySelector('[name="parent"]')}},{key:"loadEditor",value:function(){var t=u(regeneratorRuntime.mark(function t(){var e,r;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n.e(1).then(n.bind(null,53));case 2:return e=t.sent,r=e.default,t.abrupt("return",new r);case 5:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"getData",value:function(){var t=u(regeneratorRuntime.mark(function t(){var e=this;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",this.editor.save().then(function(t){var n={};return n.parent=e.nodes.parentIdSelector.value,n.body=t,n}));case 1:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"saveButtonClicked",value:function(){var t=u(regeneratorRuntime.mark(function t(){var e,n,r;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this.getData();case 2:for(r in e=t.sent,n=new FormData,e)e.hasOwnProperty(r)||n.append(r,e[r]);fetch("/page",{method:"PUT",headers:{"Content-Type":"application/json; charset=utf-8"},body:JSON.stringify(e)}).then(function(t){return t.json()}).then(function(t){console.log("resp",t),t.success&&(document.location="/page/"+t.result._id)}).catch(console.log);case 6:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()}]),t}();function s(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}var f=function(){function t(){var e=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),console.log("CodeX Docs initialized"),this.writing=new c,document.addEventListener("DOMContentLoaded",function(t){e.docReady()})}return function(t,e,n){e&&s(t.prototype,e),n&&s(t,n)}(t,[{key:"docReady",value:function(){this.moduleDispatcher=new o.a({Library:window.Docs})}}]),t}();e.default=new f}]).default;