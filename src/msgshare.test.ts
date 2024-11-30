import { postAuthReg, postChannelsCreate, postDmCreate, postMessageSend, postMessageSendDm, postMessageShare } from './testingHelper';

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

describe('Testing /message/senddm/v2', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let user4: any;
  let dm1: any;
  let dm2: any;
  let channel1: any;
  let channel2: any;
  let msg1: any;
  let msg2: any;
  let dmMsg1: any;
  let dmMsg2: any;
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
      nameLast: 'lam'
    });

    user2 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password2',
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });

    user3 = postAuthReg({
      email: 'jason@gmail.com',
      password: 'password3',
      nameFirst: 'jason',
      nameLast: 'he',
    });

    user4 = postAuthReg({
      email: 'calvin@gmail.com',
      password: 'password4',
      nameFirst: 'calvin',
      nameLast: 'ale',
    });

    dm1 = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ],
    });

    dm2 = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user4.bodyObj.authUserId,
      ],
    });

    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });

    channel2 = postChannelsCreate({
      token: user4.bodyObj.token,
      name: 'channel2',
      isPublic: true
    });

    msg1 = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'i love my comp1531 group!'
    });

    msg2 = postMessageSend({
      token: user4.bodyObj.token,
      channelId: channel2.bodyObj.channelId,
      message: 'i hate exams'
    });

    dmMsg1 = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'sshh this is a secret message'
    });

    dmMsg2 = postMessageSendDm({
      token: user4.bodyObj.token,
      dmId: dm2.bodyObj.dmId,
      message: 'sshh this is a secret message'
    });
  });

  test('Test 1: return error when an invalid token is given', () => {
    const sendDm = postMessageShare({
      token: 'a',
      ogMessageId: channel1.bodyObj.messageId,
      message: 'hello world',
      channelId: channel1.bodyObj.channelId,
      dmId: null,
    });
    expect(sendDm.res.statusCode).toBe(403);
  });

  test('Test 2: return error when message is longer than 1000 characters', () => {
    const messageString = 'A'.repeat(1234);
    const sendDm = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: dm1.bodyObj.messageId,
      message: messageString,
      channelId: null,
      dmId: dm1.bodyObj.dmId,
    });
    expect(sendDm.res.statusCode).toBe(400);
  });

  test('Test 3: return error channelId does not refer to a valid channel', () => {
    const sendDm = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: msg1.bodyObj.messageId,
      message: 'hello world',
      channelId: channel1.bodyObj.channelId + 3,
      dmId: null,
    });
    expect(sendDm.res.statusCode).toBe(400);
  });

  test('Test 4: return error dmId does not refer to a valid dm', () => {
    const sendDm = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: dmMsg1.bodyObj.messageId,
      message: 'hello world',
      channelId: null,
      dmId: dm1.bodyObj.dmId + 3,
    });
    expect(sendDm.res.statusCode).toBe(400);
  });

  test('Test 5: return error ogMessageId is not valid in channel', () => {
    const sendDm = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: msg1.bodyObj.messageId + 10,
      message: 'hello world',
      channelId: channel1.bodyObj.channelId,
      dmId: null,
    });
    expect(sendDm.res.statusCode).toBe(400);
  });

  test('Test 6: return error ogMessageId is not valid in dm', () => {
    const sendDm = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: dmMsg1.bodyObj.messageId + 10,
      message: 'hello world',
      channelId: null,
      dmId: dm1.bodyObj.dmId,
    });
    expect(sendDm.res.statusCode).toBe(400);
  });

  test('Test 7: return error user is not part of channel', () => {
    const sendDm = postMessageShare({
      token: user2.bodyObj.token,
      ogMessageId: msg1.bodyObj.messageId,
      message: 'hello world',
      channelId: channel1.bodyObj.channelId,
      dmId: null,
    });
    expect(sendDm.res.statusCode).toBe(403);
  });

  test('Test 8: return error user is not part of dm', () => {
    const sendDm = postMessageShare({
      token: user4.bodyObj.token,
      ogMessageId: dmMsg1.bodyObj.messageId,
      message: 'hello world',
      channelId: null,
      dmId: dm1.bodyObj.dmId,
    });
    expect(sendDm.res.statusCode).toBe(403);
  });

  test('Test 9: return error when both channelId and dmId are valid', () => {
    const sendDm = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: msg1.bodyObj.messageId,
      message: 'hello world',
      channelId: channel1.bodyObj.channelId,
      dmId: dm1.bodyObj.dmId,
    });
    expect(sendDm.res.statusCode).toBe(400);
  });

  test('Test 10: successfully share a msg wihtin the channel', () => {
    const shareMsg = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: msg1.bodyObj.messageId,
      message: 'will this be okay',
      channelId: channel1.bodyObj.channelId,
      dmId: null,
    });
    expect(shareMsg.res.statusCode).toBe(OK);
    expect(shareMsg.bodyObj).toStrictEqual({ sharedMessageId: shareMsg.bodyObj.sharedMessageId });
  });

  test('Test 11: successfully share a msg from a channel to dm the user is part of', () => {
    const shareMsg = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: msg1.bodyObj.messageId,
      message: 'will this be okay',
      channelId: null,
      dmId: dm1.bodyObj.dmId,
    });
    expect(shareMsg.res.statusCode).toBe(OK);
    expect(shareMsg.bodyObj).toStrictEqual({ sharedMessageId: shareMsg.bodyObj.sharedMessageId });
  });

  test('Test 12: return error when user tries to send msg from channel to dm which the user is not part of', () => {
    const shareMsg = postMessageShare({
      token: user4.bodyObj.token,
      ogMessageId: msg2.bodyObj.messageId,
      message: 'will this be okay',
      channelId: null,
      dmId: dm1.bodyObj.dmId,
    });
    expect(shareMsg.res.statusCode).toBe(403);
  });

  test('Test 13: return error when user tries to send msg from channel to channel which the user is not part of', () => {
    const shareMsg = postMessageShare({
      token: user4.bodyObj.token,
      ogMessageId: msg2.bodyObj.messageId,
      message: 'will this be okay',
      channelId: channel1.bodyObj.channelId,
      dmId: null,
    });
    expect(shareMsg.res.statusCode).toBe(403);
  });

  test('Test 14: return error when user tries to send msg from dm to channel which the user is not part of', () => {
    const shareMsg = postMessageShare({
      token: user4.bodyObj.token,
      ogMessageId: dmMsg2.bodyObj.messageId,
      message: 'will this be okay',
      channelId: channel1.bodyObj.channelId,
      dmId: null,
    });
    expect(shareMsg.res.statusCode).toBe(403);
  });

  test('Test 15: return error when user tries to send msg from dm to dm which the user is not part of', () => {
    const shareMsg = postMessageShare({
      token: user4.bodyObj.token,
      ogMessageId: dmMsg2.bodyObj.messageId,
      message: 'will this be okay',
      channelId: null,
      dmId: dm1.bodyObj.dmId,
    });
    expect(shareMsg.res.statusCode).toBe(403);
  });

  test('Test 16: successfully share a msg from a dm to channel the user is part of', () => {
    const shareMsg = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: dmMsg1.bodyObj.messageId,
      message: 'will this be okay',
      channelId: channel1.bodyObj.channelId,
      dmId: null,
    });
    expect(shareMsg.res.statusCode).toBe(OK);
    expect(shareMsg.bodyObj).toStrictEqual({ sharedMessageId: shareMsg.bodyObj.sharedMessageId });
  });

  test('Test 17: successfully share a message when optional msg is empty', () => {
    const shareMsg = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: dmMsg1.bodyObj.messageId,
      message: null,
      channelId: channel1.bodyObj.channelId,
      dmId: null,
    });
    expect(shareMsg.res.statusCode).toBe(OK);
    expect(shareMsg.bodyObj).toStrictEqual({ sharedMessageId: shareMsg.bodyObj.sharedMessageId });
  });

  test('Test 18: successfully share a msg from a dm to dm the user is part of', () => {
    const shareMsg = postMessageShare({
      token: user1.bodyObj.token,
      ogMessageId: dmMsg1.bodyObj.messageId,
      message: 'will this be okay',
      channelId: null,
      dmId: dm1.bodyObj.dmId,
    });
    expect(shareMsg.res.statusCode).toBe(OK);
    expect(shareMsg.bodyObj).toStrictEqual({ sharedMessageId: shareMsg.bodyObj.sharedMessageId });
  });
});
