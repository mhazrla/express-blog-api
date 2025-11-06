import { Response } from 'express';

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    meta?: any; // pagination / metadata 
};

export const successResponse = <T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: any
) => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
        meta,
    };
    return res.status(statusCode).json(response);
};

export const errorResponse = (
    res: Response,
    message: string = 'Internal Server Error',
    statusCode: number = 500,
    error?: any
) => {
    const response: ApiResponse<null> = {
        success: false,
        message,
        error,
    };

    if (statusCode === 500) {
        console.error(`[ERROR 500] ${message}:`, error);
    }

    return res.status(statusCode).json(response);
};

export const notFoundResponse = (res: Response, message: string = 'Resource not found') => {
    return errorResponse(res, message, 404);
};

export const unauthorizedResponse = (res: Response, message: string = 'Unauthorized') => {
    return errorResponse(res, message, 401);
};

export const forbiddenResponse = (res: Response, message: string = 'Forbidden') => {
    return errorResponse(res, message, 403);
};

export const badRequestResponse = (res: Response, message: string = 'Bad Request', errors?: any) => {
    return errorResponse(res, message, 400, errors);
};

export const createdResponse = <T>(res: Response, data: T, message: string = 'Created successfully') => {
    return successResponse(res, data, message, 201);
};