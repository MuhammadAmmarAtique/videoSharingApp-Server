//By extending error class of "Node.js", making our own ApiError Class to handle errors in our Application
class ApiError extends Error {
  constructor(
    message = "Something went wrong",
    statusCode,
    errors = [],
    stack = "" //stack trace is a string that provides detailed information about where the error occurred in the code
  ) {
    super(message); // super() Calls the constructor of the Error class with the provided message
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = null; //A placeholder for any additional data. It's currently set to null.
    this.success = false;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
