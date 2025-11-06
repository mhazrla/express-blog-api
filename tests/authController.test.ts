/**
 * Unit tests for authController
 */

jest.mock('../src/models/User', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

import { register, login } from '../src/controllers/authController';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController - register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 400 when missing fields', async () => {
    const req: any = { body: {} };
    const res = mockResponse();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'All fields are required' }));
  });

  it('should return 400 when email already registered', async () => {
    const User = require('../src/models/User').default;
    (User.findOne as jest.Mock).mockResolvedValue({ _id: 'existing' });

    const req: any = { body: { name: 'a', email: 'a@a.com', password: 'p' } };
    const res = mockResponse();
    await register(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'a@a.com' });
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should create user and return token on success', async () => {
    const User = require('../src/models/User').default;
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue({ _id: 'id', name: 'n', email: 'e' });

    const bcrypt = require('bcrypt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpw');

    const jwt = require('jsonwebtoken');
    (jwt.sign as jest.Mock).mockReturnValue('TOKEN123');

    const req: any = { body: { name: 'n', email: 'e', password: 'p' } };
    const res = mockResponse();
    await register(req, res);

    expect(User.create).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'TOKEN123' }));
  });
});

describe('authController - login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 400 when missing fields', async () => {
    const req: any = { body: {} };
    const res = mockResponse();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 when user not found', async () => {
    const User = require('../src/models/User').default;
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const req: any = { body: { email: 'x@x.com', password: 'p' } };
    const res = mockResponse();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 401 when password invalid', async () => {
    const User = require('../src/models/User').default;
    (User.findOne as jest.Mock).mockResolvedValue({ _id: 'id', passwordHash: 'h' });

    const bcrypt = require('bcrypt');
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req: any = { body: { email: 'x@x.com', password: 'p' } };
    const res = mockResponse();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return token and user on success', async () => {
    const User = require('../src/models/User').default;
    (User.findOne as jest.Mock).mockResolvedValue({ _id: 'id', name: 'n', email: 'e', passwordHash: 'h' });

    const bcrypt = require('bcrypt');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const jwt = require('jsonwebtoken');
    (jwt.sign as jest.Mock).mockReturnValue('TOKEN_LOGIN');

    const req: any = { body: { email: 'e', password: 'p' } };
    const res = mockResponse();
    await login(req, res);

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'TOKEN_LOGIN' }));
  });
});
