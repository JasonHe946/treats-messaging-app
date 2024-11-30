import request from 'sync-request';
import config from './config.json';
import { postUserPermChange } from './testingHelper';
import { postAuthReg } from './testingHelper';
const OK = 200;
const port = config.port;
const url = config.url;

afterEach(() => {
  request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {
      qs: {}
    }
  );
});

describe('admin/userpermission/change/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  beforeEach(() => { // before each test, there are 3 users that are defined
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );
    user1 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password1',
      nameFirst: 'Jason',
      nameLast: 'He',
    });
    user2 = postAuthReg({
      email: 'daniel@hotmail.com',
      password: 'password2',
      nameFirst: 'Daniel',
      nameLast: 'Huynh',
    });
    user3 = postAuthReg({
      email: 'vincent@hotmail.com',
      password: 'password3',
      nameFirst: 'Vincent',
      nameLast: 'Nguyen',
    });
  });

  test('Test 1: token is invalid', () => {
    const ret = postUserPermChange({
      token: user1.bodyObj.token + 'a',
      uId: user2.bodyObj.authUserId,
      permissionId: 1,
    });
    expect(ret.res.statusCode).toBe(403);
  });

  test('Test 2: uId is invalid', () => {
    const ret = postUserPermChange({
      token: user1.bodyObj.token,
      uId: -2,
      permissionId: 1,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 3: permissionId is invalid', () => { // permissionId can only be 1 or 2
    const ret = postUserPermChange({
      token: user1.bodyObj.token,
      uId: user2.bodyObj.authUserId,
      permissionId: 3,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 4: user already has permission levels of permissionId (member)', () => { // user2 already member
    const ret = postUserPermChange({
      token: user1.bodyObj.token,
      uId: user2.bodyObj.authUserId,
      permissionId: 2,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 5: user already has permission levels of permissionId (owner)', () => { // user1 already owner
    const ret = postUserPermChange({
      token: user1.bodyObj.token,
      uId: user1.bodyObj.authUserId,
      permissionId: 1,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 6: authUser is not a global owner', () => { // user2 is not a global owner
    const ret = postUserPermChange({
      token: user2.bodyObj.token,
      uId: user3.bodyObj.authUserId,
      permissionId: 1,
    });
    expect(ret.res.statusCode).toBe(403);
  });

  test('Test 7: uId refers to only global user and is being demoted to member', () => { // user1 is lone global owner
    const ret = postUserPermChange({
      token: user1.bodyObj.token,
      uId: user1.bodyObj.authUserId,
      permissionId: 2,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 8: success case for promoting to owner', () => { // user1 promotes user 2 to global owner
    const ret = postUserPermChange({
      token: user1.bodyObj.token,
      uId: user2.bodyObj.authUserId,
      permissionId: 1,
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});
  });

  test('Test 9: success case for demoting to member', () => { //
    const ret1 = postUserPermChange({ // promote user2 to owner
      token: user1.bodyObj.token,
      uId: user2.bodyObj.authUserId,
      permissionId: 1,
    });
    expect(ret1.res.statusCode).toBe(OK);
    const ret = postUserPermChange({ // demote user2 to member
      token: user1.bodyObj.token,
      uId: user2.bodyObj.authUserId,
      permissionId: 2,
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});
  });

  test('Test 8: success case for promoting to owner', () => { // user1 promotes user 2 to global owner
    const ret = postUserPermChange({
      token: user1.bodyObj.token,
      uId: user2.bodyObj.authUserId,
      permissionId: 1,
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});
  });
});
