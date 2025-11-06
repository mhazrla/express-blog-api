import type { Response } from "express";
import Blog from "../models/Blog";
import type { AuthRequest } from "../middlewares/auth";
import { removeImage } from "../middlewares/uploader";
import {
    successResponse,
    errorResponse,
    createdResponse,
    notFoundResponse,
    forbiddenResponse,
    badRequestResponse
} from "../utils/response";

export async function createBlog(req: AuthRequest, res: Response){
    try{
        const {title, content} = req.body as {title: string, content: string};
        
        if (!title || !content) return res.status(400).json({message: "Missing fields"})
        
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        const blog = await Blog.create({
            title, 
            content,
            imageUrl,
            author: req.userId
        });

        return createdResponse(res, blog, "Blog created successfully");

    } catch (error) {
        return errorResponse(res, "Failed to create blog", 500, error);
    }
}

export async function getBlogs(req: AuthRequest, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const total = await Blog.countDocuments();
        const blogs = await Blog.find()
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const meta = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        };

        return successResponse(res, blogs, "List of blogs", 200, meta);
    
    } catch (error) {
        return errorResponse(res, "Failed to list blogs", 500, error);
    }
}

export async function getBlogById(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params as {id: string};
        const blog = await Blog.findById(id).populate('author', 'name email');

        if (!blog) return notFoundResponse(res, "Blog not found");

        return successResponse(res, blog, "Blog details");

    } catch (error) {
        if ((error as any).name === 'CastError') return notFoundResponse(res, "Blog not found (invalid ID)");

        return errorResponse(res, "Failed to get blog", 500, error);
    }
}

export async function updateBlog(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params as {id: string};
        const blog = await Blog.findById(id);

        if (!blog) return notFoundResponse(res, "Blog not found");

        if (blog.author.toString() !== req.userId) {
            return forbiddenResponse(res, "You are not authorized to update this blog");
        }

        const {title, content} = req.body as {title:string, content: string};
        if (typeof title === 'string') blog.title = title;
        if (typeof content === 'string') blog.content = content;

        if (req.file){
            if (blog.imageUrl) {
                removeImage(blog.imageUrl);
            }
            blog.imageUrl = `/uploads/${req.file.filename}`;
        }

        await blog.save();
        return successResponse(res, blog, "Blog updated successfully");

    } catch (error) {
        if ((error as any).name === 'CastError') return notFoundResponse(res, "Blog not found");
        return errorResponse(res, "Failed to update blog", 500, error);
    }
}

export async function deleteBlog(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params as {id:string};

        const blog = await Blog.findById(id);
        
        if (!blog) return notFoundResponse(res, "Blog not found");
        if (blog.author.toString() !== req.userId) return forbiddenResponse(res, "You are not authorized to delete this blog");
        if (blog.imageUrl) removeImage(blog.imageUrl);

        await blog.deleteOne();
        
        return successResponse(res, null, "Blog deleted successfully");

    } catch (error) {
        if ((error as any).name === 'CastError') return notFoundResponse(res, "Blog not found");
        return errorResponse(res, "Failed to delete blog", 500, error);
    }
}