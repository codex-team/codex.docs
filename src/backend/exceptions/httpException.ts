/**
 * HttpException class for middleware
 *
 * @property {number} status - exception status code
 * @property {string} message - detail about the exception
 */
class HttpException extends Error {
  public status: number;
  public message: string;
  /**
   * @param status - status of the exception
   * @param message - message about the exception
   */
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export default HttpException;