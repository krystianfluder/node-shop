exports.catchAsync = (fn) => {
  return (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      // next(err)
      routePromise.catch((err) => next(err));
    }
  };
};
