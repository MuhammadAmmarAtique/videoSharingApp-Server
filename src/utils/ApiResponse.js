class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; //its Automatically set to true if the statusCode is less than 400 (indicating a successful response), otherwise false.
  }
}
export { ApiResponse };
