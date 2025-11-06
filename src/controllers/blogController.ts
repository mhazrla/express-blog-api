import type { Request, Response } from 'express';
import type { AuthRequest } from "../middlewares/auth";
import { BlogService} from "../services/blogService";
import {
    successResponse,
    errorResponse,
    createdResponse,
    notFoundResponse,
    forbiddenResponse,
    badRequestResponse
} from "../utils/response";
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/customErrors';

const blogService = new BlogService();

const handleServiceError = (res: Response, error: any, defaultMsg: string) => {
    if (error instanceof NotFoundError) return notFoundResponse(res, error.message);
    if (error instanceof ForbiddenError) return forbiddenResponse(res, error.message);
    if (error instanceof ValidationError) return badRequestResponse(res, error.message);
    if (error.name === 'CastError') return notFoundResponse(res, "Resource not found (invalid ID)");

    return errorResponse(res, defaultMsg, 500, error);
};

export async function createBlog(req: AuthRequest, res: Response) {
    try {
        const blog = await blogService.createBlog(req.userId!, req.body, req.file);
        return createdResponse(res, blog, "Blog created successfully");
    } catch (error) {
        return handleServiceError(res, error, "Failed to create blog");
    }
}

export async function getBlogs(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await blogService.getBlogs(page, limit);
        return successResponse(res, result.blogs, "List of blogs", 200, result.meta);
    } catch (error) {
        return handleServiceError(res, error, "Failed to list blogs");
    }
}

export async function getBlogById(req: Request, res: Response) {
    try {
        const blog = await blogService.getBlogById(req.params.id);
        return successResponse(res, blog, "Blog details");
    } catch (error) {
        return handleServiceError(res, error, "Failed to get blog");
    }
}

export async function updateBlog(req: AuthRequest, res: Response) {
    try {
        const blog = await blogService.updateBlog(req.params.id, req.userId!, req.body, req.file);
        return successResponse(res, blog, "Blog updated successfully");
    } catch (error) {
        return handleServiceError(res, error, "Failed to update blog");
    }
}

export async function deleteBlog(req: AuthRequest, res: Response) {
    try {
        await blogService.deleteBlog(req.params.id, req.userId!);
        return successResponse(res, null, "Blog deleted successfully");
    } catch (error) {
        return handleServiceError(res, error, "Failed to delete blog");
    }
}