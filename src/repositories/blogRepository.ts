import Blog, { IBlog } from "../models/Blog";

export class BlogRepository {
  async create(data: Partial<IBlog>): Promise<IBlog> {
    return await Blog.create(data);
  }

  async findAll(skip: number, limit: number): Promise<IBlog[]> {
    return await Blog.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async count(): Promise<number> {
    return await Blog.countDocuments();
  }

  async findById(id: string): Promise<IBlog | null> {
    return await Blog.findById(id).populate('author', 'name email');
  }

  async save(blog: IBlog): Promise<IBlog> {
    return await blog.save();
  }

  async deleteById(id: string): Promise<void> {
    await Blog.deleteOne({ _id: id });
  }
}