"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
class HttpException extends Error {
    /**
     * @param status
     * @param message
     */
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
exports.default = HttpException;
