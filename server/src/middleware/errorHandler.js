export function notFoundHandler(req, res) {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message = status === 500 ? 'Internal server error.' : err.message;

  if (status === 500) {
    console.error(err);
  }

  return res.status(status).json({
    message,
  });
}

