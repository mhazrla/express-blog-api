import type { Request, Response } from "express";
import { AuthService } from "../services/authService";
import {
    successResponse,
    errorResponse,
    createdResponse,
    badRequestResponse
} from "../utils/response";
import { ValidationError, AuthenticationError } from "../utils/customErrors";

const authService = new AuthService();

const handleAuthError = (res: Response, error: any, defaultMsg: string) => {
    if (error instanceof ValidationError) {
        return badRequestResponse(res, error.message);
    }
    if (error instanceof AuthenticationError) {
        return badRequestResponse(res, error.message); 
    }
    return errorResponse(res, defaultMsg, 500, error);
};

export async function register(req: Request, res: Response) {
    try {
        const result = await authService.register(req.body);
        return createdResponse(res, result, "User registered successfully");
    } catch (error) {
        return handleAuthError(res, error, "Registration failed");
    }
}

export async function login(req: Request, res: Response) {
    try {
        const result = await authService.login(req.body);
        return successResponse(res, result, "Login successful");
    } catch (error) {
        return handleAuthError(res, error, "Login failed");
    }
}

export default { register, login };