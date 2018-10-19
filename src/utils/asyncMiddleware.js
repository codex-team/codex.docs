/**
 * Helper for making async middlewares for express router
 * @param fn
 * @return {function(*=, *=, *=)}
 */
module.exports = function asyncMiddlware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
};
