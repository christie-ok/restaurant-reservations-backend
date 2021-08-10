//ERROR HANDLER FOR ANY METHOD REQUESTED TO A ROUTE THAT DOES NOT ALLOW IT.

function methodNotAllowed(req, res, next) {
    next({
      status: 405,
      message: `${req.method} not allowed for ${req.originalUrl}`,
    });
  };
  
  module.exports = methodNotAllowed;