/**
 * Unit tests for blogController (Refactored with Service Layer)
 * File: tests/blogController.test.ts
 */

// --- 1. Setup Mocks ---
const createBlogMock = jest.fn();
const getBlogsMock = jest.fn();
const getBlogByIdMock = jest.fn();
const updateBlogMock = jest.fn();
const deleteBlogMock = jest.fn();

// Mock module 
jest.mock('../src/services/blogService', () => ({
  BlogService: jest.fn().mockImplementation(() => ({
    createBlog: createBlogMock,
    getBlogs: getBlogsMock,
    getBlogById: getBlogByIdMock,
    updateBlog: updateBlogMock,
    deleteBlog: deleteBlogMock,
  })),
}));

// --- 2. Import Module  ---
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../src/controllers/blogController';

import { NotFoundError, ForbiddenError, ValidationError } from '../src/utils/customErrors';

// --- 3. Mock Response Express Helper ---
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// --- 4. Test Suites ---
describe('blogController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBlog', () => {
    it('should return 400 on validation error', async () => {
      // Arrange: Service melempar ValidationError
      createBlogMock.mockRejectedValue(new ValidationError('Missing fields'));
      const req: any = { body: {} };
      const res = mockResponse();

      // Act
      await createBlog(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 201 on success', async () => {
      // Arrange: Service berhasil membuat blog
      const createdBlog = { _id: 'b1', title: 'Title', content: 'Content', author: 'u1' };
      createBlogMock.mockResolvedValue(createdBlog);
      const req: any = { body: { title: 'Title', content: 'Content' }, userId: 'u1' };
      const res = mockResponse();

      // Act
      await createBlog(req, res);

      // Assert
      expect(createBlogMock).toHaveBeenCalledWith('u1', req.body, undefined); // Verifikasi argumen service
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: createdBlog }));
    });
  });

  describe('getBlogs', () => {
    it('should return 200 and list of blogs with meta', async () => {
      const mockResult = {
        blogs: [{ _id: 'b1', title: 'Blog 1' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 }
      };
      getBlogsMock.mockResolvedValue(mockResult);
      const req: any = { query: { page: '1', limit: '10' } };
      const res = mockResponse();

      await getBlogs(req, res);

      expect(getBlogsMock).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockResult.blogs,
        meta: mockResult.meta
      }));
    });
  });

  describe('getBlogById', () => {
    it('should return 404 when blog not found', async () => {
      getBlogByIdMock.mockRejectedValue(new NotFoundError('Blog not found'));
      const req: any = { params: { id: 'invalid-id' } };
      const res = mockResponse();

      await getBlogById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 200 and blog details on success', async () => {
      const mockBlog = { _id: 'b1', title: 'My Blog' };
      getBlogByIdMock.mockResolvedValue(mockBlog);
      const req: any = { params: { id: 'b1' } };
      const res = mockResponse();

      await getBlogById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockBlog }));
    });
  });

  describe('updateBlog', () => {
    it('should return 404 when blog not found', async () => {
      updateBlogMock.mockRejectedValue(new NotFoundError('Blog not found'));
      const req: any = { params: { id: 'no' }, body: {}, userId: 'u1' };
      const res = mockResponse();

      await updateBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 when user is not author', async () => {
      updateBlogMock.mockRejectedValue(new ForbiddenError('Unauthorized'));
      const req: any = { params: { id: 'b1' }, body: {}, userId: 'u2' };
      const res = mockResponse();

      await updateBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 200 on successful update', async () => {
      const updatedBlog = { _id: 'b1', title: 'New Title' };
      updateBlogMock.mockResolvedValue(updatedBlog);
      const req: any = { params: { id: 'b1' }, body: { title: 'New Title' }, userId: 'u1' };
      const res = mockResponse();

      await updateBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: updatedBlog }));
    });
  });

  describe('deleteBlog', () => {
    it('should return 404 when blog not found', async () => {
      deleteBlogMock.mockRejectedValue(new NotFoundError('Blog not found'));
      const req: any = { params: { id: 'no' }, userId: 'u1' };
      const res = mockResponse();

      await deleteBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 when forbidden', async () => {
      deleteBlogMock.mockRejectedValue(new ForbiddenError('Forbidden'));
      const req: any = { params: { id: 'b1' }, userId: 'u2' };
      const res = mockResponse();

      await deleteBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 200 on successful deletion', async () => {
      deleteBlogMock.mockResolvedValue(undefined); // Delete biasanya tidak mengembalikan data
      const req: any = { params: { id: 'b1' }, userId: 'u1' };
      const res = mockResponse();

      await deleteBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });
  
  // Optional: Test generic 500 error
  describe('General Error Handling', () => {
      it('should return 500 on unexpected errors', async () => {
          const unexpectedError = new Error('Database exploded');
          getBlogsMock.mockRejectedValue(unexpectedError);
          const req: any = { query: {} };
          const res = mockResponse();

          await getBlogs(req, res);

          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
              success: false, 
              message: 'Failed to list blogs' // Sesuai dengan pesan default di handleServiceError controller Anda
          }));
      });
  });
});