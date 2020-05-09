/**
 * Helper for making async middlewares for express router
 *
 * @param fn
 * @returns {function(*=, *=, *=)}
 */
module.exports = function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
};
