export function errorHandler(err, req, res, next) {
  if (!err) return next()

  const status = Number(err.status || 500)
  const message = err.message || 'Internal Server Error'
  res.status(status).json({ error: message })
}

