/**
 *
 */
class HttpException extends Error {
    status: number;
    message: string;
    /**
     * @param status
     * @param message
     */
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
      this.message = message;
    }
}

export default HttpException;