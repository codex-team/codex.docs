"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Helper for making async middlewares for express router
 *
 * @param fn
 * @returns {function(*=, *=, *=)}
 */
function asyncMiddleware(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };
}
exports.default = asyncMiddleware;
;
