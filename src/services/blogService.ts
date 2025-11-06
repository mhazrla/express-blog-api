import { BlogRepository } from "../repositories/blogRepository";
import { removeImage } from "../middlewares/uploader";
import { ValidationError, NotFoundError, ForbiddenError } from "../utils/customErrors";

export class BlogService {
  private blogRepo: BlogRepository;

  constructor() {
    this.blogRepo = new BlogRepository();
  }

  async createBlog(userId: string, data: { title: string; content: string }, file?: Express.Multer.File) {
    if (!data.title || !data.content) throw new ValidationError("Missing fields");

    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    return await this.blogRepo.create({
      ...data,
      imageUrl,
      author: userId as any 
    });
  }

  async getBlogs(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
        this.blogRepo.findAll(skip, limit),
        this.blogRepo.count()
    ]);

    return {
      blogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getBlogById(id: string) {
      const blog = await this.blogRepo.findById(id);
      if (!blog) throw new NotFoundError("Blog not found");
      return blog;
  }

  async updateBlog(id: string, userId: string, data: { title?: string; content?: string }, file?: Express.Multer.File) {
    const blog = await this.blogRepo.findById(id);
    if (!blog) throw new NotFoundError("Blog not found");
    if (blog.author._id.toString() !== userId) throw new ForbiddenError("Unauthorized"); 

    if (data.title) blog.title = data.title;
    if (data.content) blog.content = data.content;

    if (file) {
      if (blog.imageUrl) removeImage(blog.imageUrl);
      blog.imageUrl = `/uploads/${file.filename}`;
    }

    return await this.blogRepo.save(blog);
  }

  async deleteBlog(id: string, userId: string) {
      const blog = await this.blogRepo.findById(id);
      if (!blog) throw new NotFoundError("Blog not found");
      if (blog.author._id.toString() !== userId) throw new ForbiddenError("Unauthorized");

      if (blog.imageUrl) removeImage(blog.imageUrl);
      await this.blogRepo.deleteById(id);
  }
}