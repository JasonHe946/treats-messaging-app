import { postAuthReg, postAuthLogin, postAuthLogout, postPWResetReq, postPWReset } from './testingHelper';
// commented these out cause i think there's a limit on how many emails you can send

/// //
import express from 'express';
import config from './config.json';
import request from 'sync-request';

// Set up web app, use JSON
const app = express();
app.use(express.json());

/// ///
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

// authLoginV2////
describe('Testing authloginv2', () => {
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He'
    });
    postAuthReg({
      email: 'ethan@hotmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'Lam'
    });
  });
  test('Test 1: Given 1 valid user', () => {
    const login1 = postAuthLogin({
      email: 'jason@hotmail.com',
      password: 'password'
    });
    expect(login1.bodyObj).toStrictEqual({ token: login1.bodyObj.token, authUserId: login1.bodyObj.authUserId });
    expect(login1.res.statusCode).toBe(OK);
  });
  test('Test 2: Given 2 valid user', () => {
    const login1 = postAuthLogin({
      email: 'jason@hotmail.com',
      password: 'password'
    });
    expect(login1.bodyObj).toStrictEqual({ token: login1.bodyObj.token, authUserId: login1.bodyObj.authUserId });
    expect(login1.res.statusCode).toBe(OK);

    const login2 = postAuthLogin({
      email: 'jason@hotmail.com',
      password: 'password'
    });
    expect(login2.bodyObj).toStrictEqual({ token: login2.bodyObj.token, authUserId: login2.bodyObj.authUserId });
    expect(login2.res.statusCode).toBe(OK);
  });

  test('Test 3: (error) Email does not exist in the dataStore, return error', () => {
    const login1 = postAuthLogin({
      email: 'bob@hotmail.com',
      password: 'password'
    });
    expect(login1.res.statusCode).toBe(400);
  });

  test('Test 4: (error) Password is not correct, return error', () => {
    const login1 = postAuthLogin({
      email: 'jason@hotmail.com',
      password: 'wrongpassword'
    });
    expect(login1.res.statusCode).toBe(400);
  });
});

// authRegisterv2 testing
describe('Testing authRegisterV2', () => {
  beforeEach(() => { // clear datastore before each test
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
  });
  test('Test 1: test valid user', () => {
    const user = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He'
    });
    expect(user.bodyObj).toStrictEqual({ token: user.bodyObj.token, authUserId: user.bodyObj.authUserId });
    expect(user.res.statusCode).toBe(OK);
  });

  test('Test 2: testing if delete works', () => {
    const user = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He'
    });
    expect(user.bodyObj).toStrictEqual({ token: user.bodyObj.token, authUserId: user.bodyObj.authUserId });
    expect(user.res.statusCode).toBe(OK);
  });

  test('test 3: registering person with email twice', () => {
    const user1 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He'
    });
    expect(user1.bodyObj).toStrictEqual({ token: user1.bodyObj.token, authUserId: user1.bodyObj.authUserId });
    expect(user1.res.statusCode).toBe(OK);

    const user2 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He'
    });
    expect(user2.res.statusCode).toBe(400);
  });

  test('Test 4: error ifpostAuthRegister password < 6', () => {
    const user = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'p',
      nameFirst: 'Jason',
      nameLast: 'He'
    });
    expect(user.res.statusCode).toBe(400);
  });

  test('Test 5: (error) empty nameFirst', () => {
    const user = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: '',
      nameLast: 'He'
    });
    expect(user.res.statusCode).toBe(400);
  });

  test('Test 6: (error) nameFirst > 50', () => {
    const user = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
      nameLast: 'He'
    });
    expect(user.res.statusCode).toBe(400);
  });

  test('Test 7: (error) empty nameLast', () => {
    const user = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'jason',
      nameLast: ''
    });
    expect(user.res.statusCode).toBe(400);
  });

  test('Test 8: (error) nameLast > 50', () => {
    const user = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'jason',
      nameLast: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'
    });
    expect(user.res.statusCode).toBe(400);
  });

  test('Test 9: (error) invalid email', () => {
    const user = postAuthReg({
      email: 'jasonhotmail',
      password: 'wrong password',
      nameFirst: 'jason',
      nameLast: 'He',
    });
    expect(user.res.statusCode).toBe(400);
  });

  test('Test 10: success, testing the handlestring repeating', () => {
    const user = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'wrong password',
      nameFirst: 'BenjaminBenjamin',
      nameLast: 'Anthony',
    });
    const user2 = postAuthReg({
      email: 'jason2@hotmail.com',
      password: 'wrong password',
      nameFirst: 'BenjaminBenjamin',
      nameLast: 'Anthony',
    });
    const user3 = postAuthReg({
      email: 'jason3@hotmail.com',
      password: 'wrong password',
      nameFirst: 'BenjaminBenjamin',
      nameLast: 'Anthony',
    });
    expect(user.res.statusCode).toBe(OK);
    expect(user2.res.statusCode).toBe(OK);
    expect(user3.res.statusCode).toBe(OK);
  });
});

describe('Testing authLogout', () => {
  let user1: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {},
      }
    );

    user1 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'jason',
      nameLast: 'He',
    });
  });

  test('Test 1: successfully log out a user', () => {
    const user1Logout = postAuthLogout({
      token: user1.bodyObj.token
    });
    expect(user1Logout.bodyObj).toStrictEqual({});
    expect(user1Logout.res.statusCode).toBe(OK);
  });

  test('Test 2: if token is invalid return error', () => {
    const user1Logout = postAuthLogout({
      token: 'a'
    });
    expect(user1Logout.res.statusCode).toBe(403);
  });

  test('Test 3: Trying to logout the same person twice', () => {
    const userLogout1 = postAuthLogout({
      token: user1.bodyObj.token
    });

    expect(userLogout1.bodyObj).toStrictEqual({});
    expect(userLogout1.res.statusCode).toBe(OK);

    const userLogout2 = postAuthLogout({
      token: user1.bodyObj.token
    });

    expect(userLogout2.res.statusCode).toBe(403);
  });

  test('Test 4: logging out multiple users when multiple users are logged in', () => {
    const user2 = postAuthReg({
      email: 'ethan@hotmail.com',
      password: 'password1',
      nameFirst: 'ethan',
      nameLast: 'lam',
    });
    const user3 = postAuthReg({
      email: 'david@hotmail.com',
      password: 'password2',
      nameFirst: 'david',
      nameLast: 'gunner',
    });

    const userLogout1 = postAuthLogout({
      token: user2.bodyObj.token
    });

    expect(userLogout1.bodyObj).toStrictEqual({});
    expect(userLogout1.res.statusCode).toBe(OK);

    const userLogout2 = postAuthLogout({
      token: user2.bodyObj.token
    });

    expect(userLogout2.res.statusCode).toBe(403);

    const userLogout3 = postAuthLogout({
      token: user1.bodyObj.token
    });

    expect(userLogout3.bodyObj).toStrictEqual({});
    expect(userLogout3.res.statusCode).toBe(OK);

    const userLogout4 = postAuthLogout({
      token: user1.bodyObj.token
    });

    expect(userLogout4.res.statusCode).toBe(403);

    const userLogout5 = postAuthLogout({
      token: user3.bodyObj.token
    });

    expect(userLogout5.bodyObj).toStrictEqual({});
    expect(userLogout5.res.statusCode).toBe(OK);

    const userLogout6 = postAuthLogout({
      token: user3.bodyObj.token
    });

    expect(userLogout6.res.statusCode).toBe(403);
  });

  test('Test 5: using authLogin and logging out the user twice', () => {
    const userLogin1 = postAuthLogin({
      email: 'jason@hotmail.com',
      password: 'password',
    });

    const userLogout1 = postAuthLogout({
      token: user1.bodyObj.token,
    });

    expect(userLogout1.bodyObj).toStrictEqual({});
    expect(userLogout1.res.statusCode).toBe(OK);

    const userLogout2 = postAuthLogout({
      token: userLogin1.bodyObj.token,
    });

    expect(userLogout2.bodyObj).toStrictEqual({});
    expect(userLogout2.res.statusCode).toBe(OK);

    const userLogout3 = postAuthLogout({
      token: userLogin1.bodyObj.token,
    });
    expect(userLogout3.res.statusCode).toBe(403);
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
  });
});

// testing for auth/passwordreset/request/v1
// describe('auth/passwordreset/request/v1 testing', () => {
//   beforeEach(() => {
//     request(
//       'DELETE',
//       `${url}:${port}/clear/v1`,
//       { qs: {} }
//     );
//     postAuthReg({
//       email: 'jasonhe1531second@outlook.com',
//       password: 'oldPassword',
//       nameFirst: 'Jason',
//       nameLast: 'He',
//     });
//     postAuthReg({
//       email: 'jasonhe1531fourth@outlook.com',
//       password: 'oldPassword',
//       nameFirst: 'Peter',
//       nameLast: 'He',
//     });
//   });
// can only send one email at a time so can only test once rip
// test('Test 1: email sent through', () => {
//   const pwReset = postPWResetReq('jasonhe1531third@outlook.com');
//   expect(pwReset.res.statusCode).toBe(200);
// });
// test('Test 2: email sent through', () => {
//   const pwReset = postPWResetReq('jasonhe1531fourth@outlook.com');
//   expect(pwReset.res.statusCode).toBe(200);
// });
// });

describe('auth/passwordreset/reset/v1', () => {
  let user1: any;

  beforeEach(() => { // before each test, there are 3 users that are defined
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );
    user1 = postAuthReg({
      email: 'jasonhe1531fourth@outlook.com',
      password: 'passwordOG',
      nameFirst: 'Jason',
      nameLast: 'He',
    });
    postPWResetReq('jasonhe1531fourth@outlook.com');
  });
  test('Test 1: password entered is too short', () => {
    const ret = postPWReset({
      resetCode: user1.bodyObj.authUserId,
      newPassword: 'hi',
    });
    expect(ret.res.statusCode).toBe(400);
  });
  test('Test 2: invalid code', () => {
    const ret = postPWReset({
      resetCode: -2,
      newPassword: 'newpassword',
    });
    expect(ret.res.statusCode).toBe(400);
  });
  test('Test 3: trying to use code more than once', () => {
    const ret = postPWReset({
      resetCode: user1.bodyObj.authUserId,
      newPassword: 'newpassword1',
    });
    expect(ret.res.statusCode).toBe(OK);
    const ret1 = postPWReset({
      resetCode: user1.bodyObj.authUserId,
      newPassword: 'newpassword',
    });
    expect(ret1.res.statusCode).toBe(400);
  });
  test('Test 4: success case', () => {
    const ret = postPWReset({
      resetCode: user1.bodyObj.authUserId,
      newPassword: 'newpassword',
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});
  });
});
