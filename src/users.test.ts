import request from 'sync-request';
import config from './config.json';
import { postAuthReg, getUserProfile, putUsersSetname, getUsersAll, putUserSetemail, putUserSetHandle } from './testingHelper';

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

// userProfileV1//

describe('Testing userProfileV2', () => {
  let user1: any;
  let user2: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password',
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });

    user2 = postAuthReg({
      email: 'ganesh@gmail.com',
      password: 'password1',
      nameFirst: 'ganesh',
      nameLast: 'siva',
    });
  });

  test('Test 1: successfully outputting user details', () => {
    const user1Profile = getUserProfile({
      token: user1.bodyObj.token,
      uId: user2.bodyObj.authUserId,
    });
    expect(user1Profile.res.statusCode).toBe(OK);
    expect(user1Profile.bodyObj).toStrictEqual({
      user: {
        uId: user2.bodyObj.authUserId,
        email: 'ganesh@gmail.com',
        nameFirst: 'ganesh',
        nameLast: 'siva',
        handleStr: 'ganeshsiva'
      }
    });
  });

  test('Test 2: uId is not valid', () => {
    const user1Profile = getUserProfile({
      token: user1.bodyObj.token,
      uId: -2,
    });
    expect(user1Profile.res.statusCode).toBe(400);
  });

  test('Test 3: token is not valid', () => {
    const user1Profile = getUserProfile({
      token: 'a',
      uId: user2.bodyObj.authUserId,
    });
    expect(user1Profile.res.statusCode).toBe(403);
  });

  test('Test 4: authUser looking up themselves', () => {
    const user1Profile = getUserProfile({
      token: user1.bodyObj.token,
      uId: user1.bodyObj.authUserId,
    });
    expect(user1Profile.bodyObj).toStrictEqual({
      user: {
        uId: user1.bodyObj.authUserId,
        email: 'daniel@gmail.com',
        nameFirst: 'daniel',
        nameLast: 'huynh',
        handleStr: 'danielhuynh',
      }
    });
  });
});

describe('Testing usersProfileSetnameV2', () => {
  let user1: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password',
      nameFirst: 'ethan',
      nameLast: 'lam',
    });
  });

  test('Test 1: return error when token invalid', () => {
    const changeUsername = putUsersSetname({
      token: '',
      nameFirst: 'bob',
      nameLast: 'builder',
    });

    expect(changeUsername.res.statusCode).toBe(403);
  });

  test('Test 2: return error when nameFirst is empty', () => {
    const changeUsername = putUsersSetname({
      token: user1.bodyObj.token,
      nameFirst: '',
      nameLast: 'builder',
    });

    expect(changeUsername.res.statusCode).toBe(400);
  });

  test('Test 3: return error when lastFirst is empty', () => {
    const changeUsername = putUsersSetname({
      token: user1.bodyObj.token,
      nameFirst: 'bob',
      nameLast: '',
    });

    expect(changeUsername.res.statusCode).toBe(400);
  });

  test('Test 4: return eror when firstName has more than 50 characters', () => {
    const changeUsername = putUsersSetname({
      token: user1.bodyObj.token,
      nameFirst: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
      nameLast: 'builder',
    });

    expect(changeUsername.res.statusCode).toBe(400);
  });

  test('Test 5: return eror when firstName has more than 50 characters', () => {
    const changeUsername = putUsersSetname({
      token: user1.bodyObj.token,
      nameFirst: 'bob',
      nameLast: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
    });

    expect(changeUsername.res.statusCode).toBe(400);
  });

  test('Test 6: valid input', () => {
    const changeUsername = putUsersSetname({
      token: user1.bodyObj.token,
      nameFirst: 'bob',
      nameLast: 'builder',
    });

    const userProfile = getUserProfile({
      token: user1.bodyObj.token,
      uId: user1.bodyObj.authUserId,
    });

    expect(changeUsername.res.statusCode).toBe(OK);
    expect(changeUsername.bodyObj).toStrictEqual({});

    expect(userProfile.bodyObj).toStrictEqual({
      user: {
        uId: user1.bodyObj.authUserId,
        email: 'ethan@gmail.com',
        nameFirst: 'bob',
        nameLast: 'builder',
        handleStr: 'ethanlam',
      }
    });
  });

  test("Test 7: changing the user's name two times", () => {
    const changeUsername = putUsersSetname({
      token: user1.bodyObj.token,
      nameFirst: 'bob',
      nameLast: 'builder',
    });

    const userProfile = getUserProfile({
      token: user1.bodyObj.token,
      uId: user1.bodyObj.authUserId,
    });

    expect(changeUsername.res.statusCode).toBe(OK);
    expect(changeUsername.bodyObj).toStrictEqual({});

    expect(userProfile.bodyObj).toStrictEqual({
      user: {
        uId: user1.bodyObj.authUserId,
        email: 'ethan@gmail.com',
        nameFirst: 'bob',
        nameLast: 'builder',
        handleStr: 'ethanlam',
      }
    });

    const changeUsername2 = putUsersSetname({
      token: user1.bodyObj.token,
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });

    const userProfile2 = getUserProfile({
      token: user1.bodyObj.token,
      uId: user1.bodyObj.authUserId,
    });

    expect(changeUsername2.res.statusCode).toBe(OK);
    expect(changeUsername2.bodyObj).toStrictEqual({});

    expect(userProfile2.bodyObj).toStrictEqual({
      user: {
        uId: user1.bodyObj.authUserId,
        email: 'ethan@gmail.com',
        nameFirst: 'daniel',
        nameLast: 'huynh',
        handleStr: 'ethanlam',
      }
    });
    expect(userProfile2.res.statusCode).toBe(OK);
  });
});

describe('Testing userProfileSetemail', () => {
  let user1: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password',
      nameFirst: 'ethan',
      nameLast: 'lam',
    });
  });

  test('Test 1: return error when given an invalid token', () => {
    const changeEmail = putUserSetemail({
      token: 'a',
      email: 'bob@gmail.com'
    });
    expect(changeEmail.res.statusCode).toBe(403);
  });

  test('Test 2: return error when given an invalid email', () => {
    const changeEmail = putUserSetemail({
      token: user1.bodyObj.token,
      email: 'bobgmail.com'
    });
    expect(changeEmail.res.statusCode).toBe(400);
  });

  test('Test 3: return error when given an email already in use', () => {
    const changeEmail = putUserSetemail({
      token: user1.bodyObj.token,
      email: 'ethan@gmail.com'
    });
    expect(changeEmail.res.statusCode).toBe(400);
  });

  test("Test 4: successfully changed a user's email", () => {
    const changeEmail = putUserSetemail({
      token: user1.bodyObj.token,
      email: 'daniel@gmail.com'
    });

    expect(changeEmail.bodyObj).toStrictEqual({});
    expect(changeEmail.res.statusCode).toBe(OK);

    const userProfile = getUserProfile({
      token: user1.bodyObj.token,
      uId: user1.bodyObj.authUserId,
    });

    expect(userProfile.bodyObj).toStrictEqual({
      user: {
        uId: user1.bodyObj.authUserId,
        email: 'daniel@gmail.com',
        nameFirst: 'ethan',
        nameLast: 'lam',
        handleStr: 'ethanlam',
      }
    });
    expect(userProfile.res.statusCode).toBe(OK);
  });

  test('Test 5: trying to give a user a new email twice', () => {
    const changeEmail = putUserSetemail({
      token: user1.bodyObj.token,
      email: 'daniel@gmail.com',
    });

    expect(changeEmail.bodyObj).toStrictEqual({});
    expect(changeEmail.res.statusCode).toBe(OK);

    const userProfile = getUserProfile({
      token: user1.bodyObj.token,
      uId: user1.bodyObj.authUserId,
    });

    expect(userProfile.bodyObj).toStrictEqual({
      user: {
        uId: user1.bodyObj.authUserId,
        email: 'daniel@gmail.com',
        nameFirst: 'ethan',
        nameLast: 'lam',
        handleStr: 'ethanlam',
      }
    });
    expect(changeEmail.res.statusCode).toBe(OK);

    const changeEmail2 = putUserSetemail({
      token: user1.bodyObj.token,
      email: 'daniel@gmail.com'
    });

    expect(changeEmail2.res.statusCode).toBe(400);
  });
});

describe('Test for /users/all/v2', () => {
  let user1: any;
  let user2: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password',
      nameFirst: 'ethan',
      nameLast: 'lam',
    });

    user2 = postAuthReg({
      email: 'calvin@gmail.com',
      password: 'apple123',
      nameFirst: 'calvin',
      nameLast: 'ale',
    });
  });

  test("Test 1: If user's token does not exist, return error", () => {
    const usersAll = getUsersAll(user1.bodyObj.token + 'a');
    expect(usersAll.res.statusCode).toBe(403);
  });

  test('Test 2: Getting user details from user1', () => {
    const usersAll = getUsersAll(user1.bodyObj.token);
    expect(usersAll.queryObj.users).toStrictEqual([
      {
        uId: user1.bodyObj.authUserId,
        email: 'ethan@gmail.com',
        nameFirst: 'ethan',
        nameLast: 'lam',
        handleStr: 'ethanlam',
      },
      {
        uId: user2.bodyObj.authUserId,
        email: 'calvin@gmail.com',
        nameFirst: 'calvin',
        nameLast: 'ale',
        handleStr: 'calvinale',
      }
    ]);
  });

  test('Test 3: Getting user details from user2', () => {
    const usersAll = getUsersAll(user1.bodyObj.token);
    expect(usersAll.queryObj.users).toStrictEqual([
      {
        uId: user1.bodyObj.authUserId,
        email: 'ethan@gmail.com',
        nameFirst: 'ethan',
        nameLast: 'lam',
        handleStr: 'ethanlam',
      },
      {
        uId: user2.bodyObj.authUserId,
        email: 'calvin@gmail.com',
        nameFirst: 'calvin',
        nameLast: 'ale',
        handleStr: 'calvinale',
      }
    ]);
  });

  test('test 4: one user', () => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password',
      nameFirst: 'ethan',
      nameLast: 'lam',
    });

    const usersAll = getUsersAll(user1.bodyObj.token);
    expect(usersAll.queryObj.users).toStrictEqual([
      {
        uId: user1.bodyObj.authUserId,
        email: 'ethan@gmail.com',
        nameFirst: 'ethan',
        nameLast: 'lam',
        handleStr: 'ethanlam',
      }
    ]);
  });
});

describe('Testing user/profile/sethandle/v2', () => {
  let user1: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password',
      nameFirst: 'ethan',
      nameLast: 'lam',
    });
  });

  test('Test 1: return error when invalid token is given', () => {
    const changeHandle = putUserSetHandle({
      token: 'a',
      handleStr: 'ethanlam',
    });
    expect(changeHandle.res.statusCode).toBe(403);
  });

  test('Test 2: return error when length of handleStr is less than 3', () => {
    const changeHandle = putUserSetHandle({
      token: user1.bodyObj.token,
      handleStr: 'et',
    });
    expect(changeHandle.res.statusCode).toBe(400);
  });

  test('Test 3: return error when length of handleStr is greater than 20', () => {
    const changeHandle = putUserSetHandle({
      token: user1.bodyObj.token,
      handleStr: 'ethanethanethanethanethan',
    });
    expect(changeHandle.res.statusCode).toBe(400);
  });

  test('Test 4: return error when handleStr contains non alphanumeric characters', () => {
    const changeHandle = putUserSetHandle({
      token: user1.bodyObj.token,
      handleStr: '!@#$%^&*((',
    });
    expect(changeHandle.res.statusCode).toBe(400);
  });

  test('Test 5: return error when handleStr is taken', () => {
    postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password1',
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });
    const changeHandle = putUserSetHandle({
      token: user1.bodyObj.token,
      handleStr: 'danielhuynh',
    });
    expect(changeHandle.res.statusCode).toBe(400);
  });

  test('Test 6: successfully changed an user handleStr', () => {
    const changeHandle = putUserSetHandle({
      token: user1.bodyObj.token,
      handleStr: 'jasonhe',
    });
    expect(changeHandle.bodyObj).toStrictEqual({});
    expect(changeHandle.res.statusCode).toBe(OK);

    const userProfile = getUserProfile({
      token: user1.bodyObj.token,
      uId: user1.bodyObj.authUserId,
    });

    expect(userProfile.bodyObj).toStrictEqual({
      user: {
        uId: user1.bodyObj.authUserId,
        email: 'ethan@gmail.com',
        nameFirst: 'ethan',
        nameLast: 'lam',
        handleStr: 'jasonhe',
      }
    });
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
  });
});
