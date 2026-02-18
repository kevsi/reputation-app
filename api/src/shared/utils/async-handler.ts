import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper pour gérer automatiquement les erreurs asynchrones
 * Évite les try/catch répétitifs dans les controllers
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Type helper pour les controllers avec typage
 */
export type AsyncRequestHandler<
  ReqBody = any,
  ReqParams = any,
  ReqQuery = any
> = (
  req: Request<ReqParams, any, ReqBody, ReqQuery>,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wrapper typé pour les controllers
 */
export const typedAsyncHandler = <
  ReqBody = any,
  ReqParams = any,
  ReqQuery = any
>(
  fn: AsyncRequestHandler<ReqBody, ReqParams, ReqQuery>
): RequestHandler => {
  return asyncHandler(fn as any);
};