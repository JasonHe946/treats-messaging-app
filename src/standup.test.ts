import {
  postAuthReg, postChannelsCreate, postChannelJoin,
  postStandupStart, getStandupActive, postStandupSend,
} from './testingHelper';

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

describe('Testing standupStartV1', () => {
  let user1:any;
  let user2:any;
  let channel1:any;

  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh'
    });
    user2 = postAuthReg({
      email: 'jason@gmail.com',
      password: 'password123',
      nameFirst: 'Jason',
      nameLast: 'He'
    });
    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });
  });

  test('Test 1: Valid standup start', () => {
    const create = postStandupStart({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      length: 10
    });
    expect(create.bodyObj).toStrictEqual({ timeFinish: create.bodyObj.timeFinish });
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 2: (error) channelId does not refer to a valid channel', () => {
    const create = postStandupStart({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId + 5,
      length: 10
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 3: (error) length is a negative integer', () => {
    const create = postStandupStart({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      length: -10
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 4: (error) an active standup is currently running in the channel', () => {
    postStandupStart({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      length: 10
    });
    const create = postStandupStart({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      length: 10
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 5: (error) authorised user is not a member of the channel', () => {
    const create = postStandupStart({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      length: 10
    });
    expect(create.res.statusCode).toBe(403);
  });
});

describe('Testing standupActiveV1', () => {
  let user1:any;
  let user2:any;
  let channel1:any;

  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh'
    });
    user2 = postAuthReg({
      email: 'jason@gmail.com',
      password: 'password123',
      nameFirst: 'Jason',
      nameLast: 'He'
    });
    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });
  });

  test('Test 1: Valid standup active - active', () => {
    postStandupStart({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      length: 10
    });
    const create = getStandupActive({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
    });
    expect(create.bodyObj).toStrictEqual({ isActive: create.bodyObj.isActive, timeFinish: create.bodyObj.timeFinish });
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 2: Valid standup active - inactive', () => {
    const create = getStandupActive({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
    });
    expect(create.bodyObj).toStrictEqual({ isActive: create.bodyObj.isActive, timeFinish: create.bodyObj.timeFinish });
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 3: (error) channelId does not refer to a valid channel', () => {
    const create = getStandupActive({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId + 5,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 4: (error) authorised user is not a member of the channel', () => {
    const create = getStandupActive({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
    });
    expect(create.res.statusCode).toBe(403);
  });
});

describe('Testing standupSendV1', () => {
  let user1:any;
  let user2:any;
  let channel1:any;

  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh'
    });
    user2 = postAuthReg({
      email: 'jason@gmail.com',
      password: 'password123',
      nameFirst: 'Jason',
      nameLast: 'He'
    });
    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });
    postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId
    });
  });

  // test('Test 1: Valid standup send', () => {
  //   postStandupStart({
  //     token: user1.bodyObj.token,
  //     channelId: channel1.bodyObj.channelId,
  //     length: 5
  //   });
  //   postStandupSend({
  //     token: user1.bodyObj.token,
  //     channelId: channel1.bodyObj.channelId,
  //     message: 'hello'
  //   });
  //   postStandupSend({
  //     token: user2.bodyObj.token,
  //     channelId: channel1.bodyObj.channelId,
  //     message: 'whats up'
  //   });
  //   postStandupSend({
  //     token: user1.bodyObj.token,
  //     channelId: channel1.bodyObj.channelId,
  //     message: 'i love COMP1531'
  //   });
  //   setTimeout(() => {
  //     const create = getChannelMessages({
  //       token: user2.bodyObj.token,
  //       channelId: channel1.bodyObj.channelId,
  //       start: 0,
  //     });
  //     expect(create.bodyObj).toStrictEqual({
  //       messages: [
  //         {
  //           messageId: expect.any(Number),
  //           uId: user1.bodyObj.authUserId,
  //           message: 'danielhuynh: hello\njasonhe: whats up\ndanielhuynh: i love COMP1531',
  //           timeSent: expect.any(Number),
  //           reacts: [],
  //         }
  //       ],
  //       start: 0,
  //       end: -1,
  //     });
  //     expect(create.res.statusCode).toBe(OK);
  //   }, 6000);
  // });

  test('Test 3: (error) channelId does not refer to a valid channel', () => {
    postStandupStart({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      length: 5
    });
    const create = postStandupSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId + 5,
      message: 'hello'
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 4: (error) length of message is over 1000 characters', () => {
    postStandupStart({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      length: 5
    });
    const message = 'A'.repeat(1001);
    const create = postStandupSend({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: message
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 5: (error) an active standup is not currently running in the channel', () => {
    const create = postStandupSend({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'hello'
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 6: (error) authorised user is not a member of the channel', () => {
    postStandupStart({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      length: 5
    });
    const user3 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password123',
      nameFirst: 'Ethan',
      nameLast: 'Lam'
    });
    const create = postStandupSend({
      token: user3.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'hello'
    });
    expect(create.res.statusCode).toBe(403);
  });
  request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {
      qs: {}
    }
  );
});
