/**
 * Unit tests for blogController
 */

jest.mock('../src/models/Blog', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
    findById: jest.fn()
  }
}));

jest.mock('../src/middlewares/uploader', () => ({
  removeImage: jest.fn()
}));

import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../src/controllers/blogController';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('blogController - createBlog', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 400 when missing fields', async () => {
    const req: any = { body: {} };
    const res = mockResponse();
    await createBlog(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should create blog and return 201', async () => {
    const Blog = require('../src/models/Blog').default;
    const mockBlog = { _id: 'b1', title: 't', content: 'c', author: 'u1' };
    (Blog.create as jest.Mock).mockResolvedValue(mockBlog);

    const req: any = { body: { title: 't', content: 'c' }, userId: 'u1' };
    const res = mockResponse();
    await createBlog(req, res);
    expect(Blog.create).toHaveBeenCalledWith(expect.objectContaining({ title: 't', content: 'c', author: 'u1' }));
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('blogController - getBlogs', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return list with meta', async () => {
    const Blog = require('../src/models/Blog').default;
    (Blog.countDocuments as jest.Mock).mockResolvedValue(1);
    const fakeFind = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue([{ _id: 'b1' }]) };
    (Blog.find as jest.Mock).mockReturnValue(fakeFind);

    const req: any = { query: {} };
    const res = mockResponse();
    await getBlogs(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});

describe('blogController - getBlogById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 404 when not found', async () => {
    const Blog = require('../src/models/Blog').default;
    (Blog.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null) 
    });

    const req: any = { params: { id: 'no' } };
    const res = mockResponse();
    await getBlogById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return blog details on success', async () => {
    const Blog = require('../src/models/Blog').default;
    const mockBlog = { _id: 'b1', title: 'Test Blog' };
    (Blog.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockBlog)
    });

    const req: any = { params: { id: 'b1' } };
    const res = mockResponse();
    await getBlogById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockBlog
    }));
  });
});

describe('blogController - updateBlog', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 404 when not found', async () => {
    const Blog = require('../src/models/Blog').default;
    (Blog.findById as jest.Mock).mockResolvedValue(null);

    const req: any = { params: { id: 'no' }, body: {}, userId: 'u1' };
    const res = mockResponse();
    await updateBlog(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 403 when not author', async () => {
    const Blog = require('../src/models/Blog').default;
    const mockBlog: any = { _id: 'b1', author: 'other' };
    (Blog.findById as jest.Mock).mockResolvedValue(mockBlog);

    const req: any = { params: { id: 'b1' }, body: { title: 'new' }, userId: 'u1' };
    const res = mockResponse();
    await updateBlog(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should update fields and save on success', async () => {
    const Blog = require('../src/models/Blog').default;
    const mockBlog: any = { _id: 'b1', author: 'u1', title: 'old', content: 'old', save: jest.fn().mockResolvedValue(true) };
    (Blog.findById as jest.Mock).mockResolvedValue(mockBlog);

    const req: any = { params: { id: 'b1' }, body: { title: 'new', content: 'new' }, userId: 'u1' };
    const res = mockResponse();
    await updateBlog(req, res);

    expect(mockBlog.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should replace image and call removeImage when file provided', async () => {
    const Blog = require('../src/models/Blog').default;
    const mockBlog: any = { _id: 'b1', author: 'u1', imageUrl: '/uploads/old.jpg', save: jest.fn().mockResolvedValue(true) };
    (Blog.findById as jest.Mock).mockResolvedValue(mockBlog);

    const removeImage = require('../src/middlewares/uploader').removeImage as jest.Mock;

    const req: any = { params: { id: 'b1' }, body: {}, userId: 'u1', file: { filename: 'new.jpg' } };
    const res = mockResponse();
    await updateBlog(req, res);

    expect(removeImage).toHaveBeenCalledWith('/uploads/old.jpg');
    expect(mockBlog.imageUrl).toEqual('/uploads/new.jpg');
    expect(mockBlog.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('blogController - deleteBlog', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 404 when not found', async () => {
    const Blog = require('../src/models/Blog').default;
    (Blog.findById as jest.Mock).mockResolvedValue(null);

    const req: any = { params: { id: 'no' }, userId: 'u1' };
    const res = mockResponse();
    await deleteBlog(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 403 when not author', async () => {
    const Blog = require('../src/models/Blog').default;
    const mockBlog: any = { _id: 'b1', author: 'other' };
    (Blog.findById as jest.Mock).mockResolvedValue(mockBlog);

    const req: any = { params: { id: 'b1' }, userId: 'u1' };
    const res = mockResponse();
    await deleteBlog(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should delete blog and remove image when present', async () => {
    const Blog = require('../src/models/Blog').default;
    const mockBlog: any = { _id: 'b1', author: 'u1', imageUrl: '/uploads/img.jpg', deleteOne: jest.fn().mockResolvedValue(true) };
    (Blog.findById as jest.Mock).mockResolvedValue(mockBlog);

    const removeImage = require('../src/middlewares/uploader').removeImage as jest.Mock;

    const req: any = { params: { id: 'b1' }, userId: 'u1' };
    const res = mockResponse();
    await deleteBlog(req, res);

    expect(removeImage).toHaveBeenCalledWith('/uploads/img.jpg');
    expect(mockBlog.deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('blogController - error handling (CastError)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getBlogById returns 404 for CastError', async () => {
    const Blog = require('../src/models/Blog').default;
    (Blog.findById as jest.Mock).mockRejectedValue({ name: 'CastError' });

    const req: any = { params: { id: 'invalid' } };
    const res = mockResponse();
    await getBlogById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
