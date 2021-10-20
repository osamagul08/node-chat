const AppError = require('../utils/appError');

const handleCastErro = (err) => {
  const message = `Invalide ${err.path} : ${err.value}.`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    mesaage: err.message,
    stack: err.stack,
  });
};

const sendErrorPro = (err, res) => {
  //send message to client which invalide like operation error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      mesaage: err.message,
    });
  } else {
    //some unknow error my be third party error like
    res.status(500).json({
      status: 'error',
      mesaage: '500 internal server  error',
    });
  }
};
// eslint-disable-next-line no-unused-vars
const handleTokenExpire = (err) =>
  new AppError('Login expire again Login', 401);
// eslint-disable-next-line no-unused-vars
const handleInvalideToken = (err) =>
  new AppError('Invalide user name and password', 401);
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // eslint-disable-next-line 
  if (process.env.NODE_ENV == 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErro(error);
    if (err.name === 'TokenExpiredError') error = handleTokenExpire(error);
    if (err.name === 'JsonWebTokenError') error = handleInvalideToken(error);
    sendErrorPro(error, res);
  } else {
    sendErrorDev(err, res);
  }
};
