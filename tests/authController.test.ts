/**
 * Updated unit tests for authController after refactor to AuthService + response wrappers
 */

const registerMock = jest.fn();
const loginMock = jest.fn();

jest.mock('../src/services/authService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    register: registerMock,
    login: loginMock,
  })),
}));

import { register, login } from '../src/controllers/authController';

const { ValidationError, AuthenticationError } = require('../src/utils/customErrors');

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController (refactored) - register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when AuthService.register throws ValidationError', async () => {
  registerMock.mockRejectedValue(new ValidationError('All fields are required'));

    const req: any = { body: {} };
    const res = mockResponse();
    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 201 and created payload on success', async () => {
  const payload = { token: 'TOKEN123', user: { id: 'id', name: 'n', email: 'e' } };
  registerMock.mockResolvedValue(payload);

    const req: any = { body: { name: 'n', email: 'e', password: 'p' } };
    const res = mockResponse();
    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: payload }));
  });
});

describe('authController (refactored) - login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when missing fields (ValidationError)', async () => {
  loginMock.mockRejectedValue(new ValidationError('All fields are required'));

    const req: any = { body: {} };
    const res = mockResponse();
    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when credentials invalid (AuthenticationError)', async () => {
  loginMock.mockRejectedValue(new AuthenticationError());

    const req: any = { body: { email: 'x@x.com', password: 'p' } };
    const res = mockResponse();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 and token/user on success', async () => {
  const payload = { token: 'TOKEN_LOGIN', user: { id: 'id', name: 'n', email: 'e' } };
  loginMock.mockResolvedValue(payload);

    const req: any = { body: { email: 'e', password: 'p' } };
    const res = mockResponse();
    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: payload }));
  });
});

