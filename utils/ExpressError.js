class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message;
    this.statusCode;
  }
}

module.exports = ExpressError;
