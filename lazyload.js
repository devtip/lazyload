/*!
 * Lazy Load 2.0.0-beta.2
 * MIT license
 * https://github.com/tuupola/jquery_lazyload
 */
(function (root, factory) {
    if (typeof exports === "object") {
        module.exports = factory(root);
    } else if (typeof define === "function" && define.amd) {
        define([], factory(root));
    } else {
        root.LazyLoad = factory(root);
    }
}) (typeof global !== "undefined" ? global : this.window || this.global, function (root) {
    "use strict";

    const defaults = {
        src: "data-src",
        srcset: "data-srcset",
        selector: ".lazyload" // 默认类名
    };

    let objProto = Object.prototype;
    let toString = objProto.toString;
    let hasOwn = objProto.hasOwnProperty;

    let isBool = function(obj) {
      return toString.call(obj) === "[object Boolean]";
    }

    let isObject = function(obj) {
      return toString.call(obj) === "[object Object]";
    }

    /**
     * 处理每一张图片
     */
    let handleImage = function(image){
      let src = image.getAttribute(this.settings.src);
      let srcset = image.getAttribute(this.settings.srcset);
      if ("img" === image.tagName.toLowerCase()) {
        if (src) {
          image.src = src;
        }
        if (srcset) {
          image.srcset = srcset;
        }
      } else {
        image.style.backgroundImage = "url(" + src + ")";
      }
    }

    /**
    * Merge two or more objects. Returns a new object.
    * @private
    * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
    * @param {Object}   objects  The objects to merge together
    * @returns {Object}          Merged values of defaults and options
    */
    const extend = function ()  {

        let extended = {};
        let deep = false;
        let i = 0;
        let length = arguments.length;

        /* Check if a deep merge */
        if (isBool(arguments[0])) {
            deep = arguments[0];
            i++;
        }

        /* Merge the object into the extended object */
        let merge = function (obj) {
            for (let prop in obj) {
                if (hasOwn.call(obj, prop)) {
                    /* If deep merge and property is an object, merge properties */
                    if (deep && isObject(obj[prop])) {
                        extended[prop] = extend(true, extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        /* Loop through each object and conduct a merge */
        for (; i < length; i++) {
            let obj = arguments[i];
            merge(obj);
        }

        return extended;
    };

    function LazyLoad(images, options) {
        this.settings = extend(defaults, options || {});
        this.images = images || document.querySelectorAll(this.settings.selector);
        this.observer = null;
        this.init();
    }

    LazyLoad.prototype = {
        // 修正重写原型导致构造器类名丢失的问题
        constructor: LazyLoad,

        init: function() {
            /* Without observers load everything and bail out early. */
            if (!root.IntersectionObserver) {
                this.loadImages();
                return;
            }

            let self = this;
            let observerConfig = {
                root: null,
                rootMargin: "0px",
                threshold: [0]
            };

            this.observer = new IntersectionObserver(function(entries) {
                entries.forEach(function (entry) {
                    if (entry.intersectionRatio > 0) {
                        // 当前发生交互的DOM对象
                        let image = entry.target
                        self.observer.unobserve(image);
                        handleImage.call(self, image)
                    }
                });
            }, observerConfig);

            this.images.forEach(function (image) {
                self.observer.observe(image);
            });
        },

        loadAndDestroy: function () {
            if (!this.settings) { return; }
            this.loadImages();
            this.destroy();
        },

        loadImages: function () {
            if (!this.settings) { return; }

            let self = this;
            this.images.forEach(handleImage.bind(self));
        },

        destroy: function () {
            if (!this.settings) { return; }
            this.observer.disconnect();
            this.settings = null;
        }
    };

    root.lazyload = function(images, options) {
        return new LazyLoad(images, options);
    };

    return LazyLoad;
});
