import {
  ACCESS_TOKEN,
  addHeaders,
  addAuthHeaders,
  mockUserFindById,
  mockJwtValidate,
  getAccessTokenSpy,
} from '../../mock';

import app from '../../../src/app';
import supertest from 'supertest';

describe('authentication validation', () => {
  const endpoint = '/v1/profile/';
  const request = supertest(app);

  beforeEach(() => {
    getAccessTokenSpy.mockClear();
    mockJwtValidate.mockClear();
    mockUserFindById.mockClear();
  });

  it('when authorization header is not passed, then it should response with 400', async () => {
    const response = await addHeaders(request.get(endpoint));
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/authorization/);
    expect(getAccessTokenSpy).not.toBeCalled();
  });

  it('When authorization header do not have Bearer, then it should response with 400', async () => {
    const response = await addHeaders(request.get(endpoint)).set('Authorization', '123');
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/authorization/);
    expect(getAccessTokenSpy).not.toBeCalled();
  });

  it('When wrong authorization header is provided, then it should response with 401', async () => {
    const response = await addHeaders(request.get(endpoint)).set('Authorization', 'Bearer 123');
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/token/i);
    expect(getAccessTokenSpy).toBeCalledTimes(1);
    expect(getAccessTokenSpy).toBeCalledWith('Bearer 123');
    expect(getAccessTokenSpy).toReturnWith('123');
    expect(mockJwtValidate).toBeCalledTimes(1);
    expect(mockJwtValidate).toBeCalledWith('123');
    expect(mockUserFindById).not.toBeCalled();
  });

  it('When correct Authorization header is provided, then it should response with 404', async () => {
    const response = await addAuthHeaders(request.get(endpoint));
    expect(response.body.message).not.toMatch(/not registered/);
    expect(response.body.message).not.toMatch(/token/i);
    expect(response.status).toBe(404);
    expect(getAccessTokenSpy).toBeCalledTimes(1);
    expect(getAccessTokenSpy).toBeCalledWith(`Bearer ${ACCESS_TOKEN}`);
    expect(getAccessTokenSpy).toReturnWith(ACCESS_TOKEN);
    expect(mockJwtValidate).toBeCalledTimes(1);
    expect(mockJwtValidate).toBeCalledWith(ACCESS_TOKEN);
    expect(mockUserFindById).toBeCalledTimes(1);
  });
});
