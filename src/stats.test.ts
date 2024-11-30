import express from 'express';
import config from './config.json';
import request from 'sync-request';
import { getUserStats, postAuthReg, postChannelLeave, postChannelsCreate, postDmCreate, postDmLeave, postMessageSend, postMessageSendDm } from './testingHelper';

const app = express();
app.use(express.json());

const port = config.port;
const url = config.url;

describe('Testing /user/stats/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channel1: any;
  let dm1: any;

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
    user2 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password2',
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });
    user3 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password3',
      nameFirst: 'ethan',
      nameLast: 'lam',
    });
    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel 1',
      isPublic: true,
    });
    dm1 = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId],
    });
  });

  test('Test 1: throw error when token is invalid', () => {
    const stats = getUserStats('a');
    expect(stats.res.statusCode).toEqual(403);
  });

  test('Test 2: no channelmessages or dms or channels for the user', () => {
    const stats = getUserStats(user2.bodyObj.token);
    expect(stats.res.statusCode).toEqual(200);
    expect(stats.bodyObj).toStrictEqual({ userStats: stats.bodyObj.userStats });
  });

  test('Test 3: no messages 1 dm and 1 channel', () => {
    postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId],
    });
    const stats = getUserStats(user1.bodyObj.token);
    expect(stats.res.statusCode).toEqual(200);
    expect(stats.bodyObj).toStrictEqual({ userStats: stats.bodyObj.userStats });
  });

  test('Test 4: delete dm and channel', () => {
    dm1 = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId],
    });
    postDmLeave({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
    });
    postChannelLeave({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
    });
    const stats = getUserStats(user1.bodyObj.token);
    expect(stats.res.statusCode).toEqual(200);
    expect(stats.bodyObj).toStrictEqual({ userStats: stats.bodyObj.userStats });
  });

  test('Test 5: message, dm and channel', () => {
    postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'i love my comp1531 group!'
    });
    postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'sshh this is a secret message'
    });
    postChannelLeave({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
    });
    const stats = getUserStats(user1.bodyObj.token);
    expect(stats.res.statusCode).toEqual(200);
    expect(stats.bodyObj).toStrictEqual({ userStats: stats.bodyObj.userStats });
  });
});
