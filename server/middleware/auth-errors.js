const authErrors = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    console.log(err)
    res.status(err.status).json({ errors: [{ message: err.message }] })
    res.end()
  }
}

module.exports = { authErrors }
