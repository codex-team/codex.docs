import * as dotenv from "dotenv";
import config from "config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Users from "../../controllers/users";

dotenv.config();

/**
 * Middleware for checking jwt token
 * @param req
 * @param res
 * @param next
 */
export default async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.authToken;
  const userDoc = await Users.get();

  if (!userDoc || userDoc instanceof Error) {
    res.locals.isAuthorized = false;
    next();
    return;
  }

  try{
    const decodedToken = jwt.verify(token, userDoc.passHash + config.get('secret'));
    res.locals.isAuthorized = !! decodedToken;
  } catch (e) {
    res.locals.isAuthorized = false;
  }
  next();
}
