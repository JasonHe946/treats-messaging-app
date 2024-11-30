import { postAuthReg, postChannelsCreate, postChannelJoin, postDmCreate, postMessageSend, postMessageSendDm, putMessageEdit, deleteMessageRemove, postMessageSendLater, delayMsgSent, postMessageSendLaterDm, getDmMessages, postMessageReact, getChannelMessages, postMessageUnreact, postMessagePin, postMessageUnpin } from './testingHelper';

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

// messageSendV1 //
describe('Testing messageSendV1', () => {
  let user1:any;
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
    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });
  });

  test('Test 1: Valid message sent', () => {
    const create = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'i love my comp1531 group!'
    });
    expect(create.bodyObj).toStrictEqual({ messageId: create.bodyObj.messageId });
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 2: (error) channelId is invalid', () => {
    const create = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId + 5,
      message: 'i love my comp1531 group!'
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 3: (error) message is less than 1 character', () => {
    const messageString = '';
    const create = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: messageString
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 4: (error) message is more than 1000 character', () => {
    const messageString = 'A'.repeat(1001);
    const create = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: messageString
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 5: (error) channelId valid, but member is not part', () => {
    const user2 = postAuthReg({
      email: 'ethan@hotmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'Lam'
    });
    const channel2 = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channel2',
      isPublic: true
    });
    const create = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel2.bodyObj.channelId,
      message: 'i like my comp1531 group!'
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 6: (error) token invalid', () => {
    const create = postMessageSend({
      token: user1.bodyObj.token + 'a',
      channelId: channel1.bodyObj.channelId,
      message: 'i love my comp1531 group!'
    });
    expect(create.res.statusCode).toBe(403);
  });
});

// messageEditV1 //
describe('Testing messageEditV1', () => {
  let user1:any;
  let user2:any;
  let user3:any;
  let channel:any;
  let dm:any;
  let channelMessage:any;
  let dmMessage:any;

  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    // Initialising the 4 users
    // user1 and user2 are in a channel
    // user1 and user3 are in a dm
    // user1 is the owner of both channel and dm
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh'
    });
    user2 = postAuthReg({
      email: 'ethan@hotmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'Lam'
    });
    user3 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He'
    });

    // user1 makes channel and user2 joins
    channel = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });
    postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId
    });

    // user1 makes dm and invites user3
    dm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId]
    });

    // user1 puts a message in both channel and dm
    channelMessage = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: 'hello world!'
    });
    dmMessage = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm.bodyObj.dmId,
      message: 'sshh this is a secret message'
    });
  });

  test('Test 1: Valid message in channel edited by channel owner', () => {
    const create = putMessageEdit({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      message: 'i love my comp1531 group!'
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 2: Valid message in DM edited by DM owner', () => {
    const create = putMessageEdit({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      message: 'i love my comp1531 group!'
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 3: Valid message in channel edited by message owner', () => {
    const channelMessage2 = postMessageSend({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: 'i am a square!'
    });
    const create = putMessageEdit({
      token: user2.bodyObj.token,
      messageId: channelMessage2.bodyObj.messageId,
      message: 'i love my comp1531 group!'
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 4: Valid message in DM edited by message owner', () => {
    const dmMessage2 = postMessageSendDm({
      token: user3.bodyObj.token,
      dmId: dm.bodyObj.dmId,
      message: 'yo gabba gabba!'
    });
    const create = putMessageEdit({
      token: user3.bodyObj.token,
      messageId: dmMessage2.bodyObj.messageId,
      message: 'i love my comp1531 group!'
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 5: Valid empty string input', () => {
    const create = putMessageEdit({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      message: ''
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 6: (error) message is more than 1000 character', () => {
    const messageString = 'A'.repeat(1001);
    const create = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: messageString
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 7: (error) user not part of channel messageId is in', () => {
    const create = putMessageEdit({
      token: user3.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      message: 'i love my comp1531 group!'
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 8: (error) user not part of DM messageId is in', () => {
    const create = putMessageEdit({
      token: user2.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      message: 'i love my comp1531 group!'
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 9: (error) the authorised user does not have owner permissions in the channel', () => {
    const create = putMessageEdit({
      token: user2.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      message: 'i love my comp1531 group!'
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 10: (error) the authorised user does not have owner permissions in the DM', () => {
    const create = putMessageEdit({
      token: user3.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      message: 'i love my comp1531 group!'
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 11: (error) token invalid for channel message', () => {
    const create = postMessageSend({
      token: user1.bodyObj.token + 'a',
      channelId: channel.bodyObj.channelId,
      message: 'i love my comp1531 group!'
    });
    expect(create.res.statusCode).toBe(403);
  });
  test('Test 12: (error) editing a removed message', () => {
    deleteMessageRemove({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    const create = putMessageEdit({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      message: 'i love my comp1531 group!'
    });
    expect(create.res.statusCode).toBe(400);
  });
});

// messageRemoveV1 //
describe('Testing messageRemoveV1', () => {
  let user1:any;
  let user2:any;
  let user3:any;
  let channel:any;
  let dm:any;
  let channelMessage:any;
  let dmMessage:any;

  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    // Initialising the 4 users
    // user1 and user2 are in a channel
    // user1 and user3 are in a dm
    // user1 is the owner of both channel and dm
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh'
    });
    user2 = postAuthReg({
      email: 'ethan@hotmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'Lam'
    });
    user3 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He'
    });

    // user1 makes channel and user2 joins
    channel = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });
    postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId
    });

    // user1 makes dm and invites user3
    dm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId]
    });

    // user1 puts a message in both channel and dm
    channelMessage = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: 'hello world!'
    });
    dmMessage = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm.bodyObj.dmId,
      message: 'sshh this is a secret message'
    });
  });

  test('Test 1: Valid message in channel removed', () => {
    const create = deleteMessageRemove({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 2: Valid message in DM removed', () => {
    const create = deleteMessageRemove({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 3: Valid message in channel deleted by message owner', () => {
    const channelMessage2 = postMessageSend({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: 'i am a square!'
    });
    const create = deleteMessageRemove({
      token: user2.bodyObj.token,
      messageId: channelMessage2.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 4: Valid message in DM deleted by message owner', () => {
    const dmMessage2 = postMessageSendDm({
      token: user3.bodyObj.token,
      dmId: dm.bodyObj.dmId,
      message: 'yo gabba gabba!'
    });
    const create = deleteMessageRemove({
      token: user3.bodyObj.token,
      messageId: dmMessage2.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 5: (error) messageId not part of channel user is in', () => {
    const create = deleteMessageRemove({
      token: user3.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 6: (error) messageId not part of DM user is in', () => {
    const create = deleteMessageRemove({
      token: user2.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 7: (error) user does not have owner permissions in the channel', () => {
    const create = deleteMessageRemove({
      token: user2.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 8: (error) user does not have owner permissions in the DM', () => {
    const create = deleteMessageRemove({
      token: user3.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 9: (error) token invalid for channel message', () => {
    const create = deleteMessageRemove({
      token: user1.bodyObj.token + 'a',
      messageId: channelMessage.bodyObj.messageId
    });
    expect(create.res.statusCode).toBe(403);
  });
  test('Test 10: (error) removing a removed message', () => {
    deleteMessageRemove({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    const create = deleteMessageRemove({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(400);
  });
});

// my react

describe('Testing messageReactV1', () => {
  let user1:any;
  let user2:any;
  let user3:any;
  let channel:any;
  let dm:any;
  let channelMessage:any;
  let dmMessage:any;

  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    // Initialising the 3 users
    // user1 and user2 are in a channel
    // user1 and user3 are in a dm
    // user1 is the owner of both channel and dm
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh',
    });
    user2 = postAuthReg({
      email: 'ethan@hotmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'Lam',
    });
    user3 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He',
    });

    // user1 makes channel and user2 joins
    channel = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true,
    });
    postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId
    });

    // user1 makes dm and invites user3
    dm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId]
    });

    // user1 puts a message in both channel and dm
    channelMessage = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: 'hello world!'
    });
    dmMessage = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm.bodyObj.dmId,
      message: 'sshh this is a secret message'
    });
  });

  test('Test 1: Valid react to channel message', () => {
    const create = postMessageReact({
      token: user2.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    const channelMessages = getChannelMessages({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      start: 0,
    });
    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: channelMessage.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'hello world!',
          timeSent: expect.any(Number),
          reacts: {
            reactId: 1,
            uIds: [user2.bodyObj.authUserId],
            isThisUserReacted: true,
          },
        }
      ],
      start: 0,
      end: -1,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 2: Valid react to DM message', () => {
    const create = postMessageReact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 3: (error) reactId is invalid in channel', () => {
    const create = postMessageReact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 100,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 4: (error) reactId is invalid in DM', () => {
    const create = postMessageReact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 100,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 5: (error) messageId is invalid in DM', () => {
    const create = postMessageReact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId + 5,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 6: (error) messageId is invalid in channel', () => {
    const create = postMessageReact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId + 5,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 7: (error) message already contains a react from the authorised user in channel', () => {
    postMessageReact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    const create2 = postMessageReact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create2.res.statusCode).toBe(400);
  });

  test('Test 8: (error) message already contains a react from the authorised user in DM', () => {
    postMessageReact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
    const create2 = postMessageReact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create2.res.statusCode).toBe(400);
  });

  test('Test 9: (error) authorised user in not in the channel', () => {
    const create = postMessageReact({
      token: user3.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 10: (error) authorised user in not in the DM', () => {
    const create = postMessageReact({
      token: user2.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 11: (error) react to a message already deleted in channel', () => {
    deleteMessageRemove({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    const create = postMessageReact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 12: (error) react to a message already deleted in DM', () => {
    deleteMessageRemove({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    const create = postMessageReact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });
});

describe('Testing messageUnreactV1', () => {
  let user1:any;
  let user2:any;
  let user3:any;
  let channel:any;
  let dm:any;
  let channelMessage:any;
  let dmMessage:any;

  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    // Initialising the 3 users
    // user1 and user2 are in a channel
    // user1 and user3 are in a dm
    // user1 is the owner of both channel and dm
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh'
    });
    user2 = postAuthReg({
      email: 'ethan@hotmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'Lam'
    });
    user3 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He'
    });

    // user1 makes channel and user2 joins
    channel = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });
    postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId
    });

    // user1 makes dm and invites user3
    dm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId]
    });

    // user1 puts a message in both channel and dm
    channelMessage = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: 'hello world!'
    });
    dmMessage = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm.bodyObj.dmId,
      message: 'sshh this is a secret message'
    });
    // react to the channel message
    postMessageReact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    // react to the DM message
    postMessageReact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
  });

  test('Test 1: Valid unreact to channel message', () => {
    // unreact to the channel message
    const create = postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });

    // print out the mesages
    const channelMessages = getChannelMessages({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      start: 0,
    });

    // check if the output same as requirement
    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: channelMessage.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'hello world!',
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 2: Valid unreact to DM message', () => {
    const create = postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 3: (error) reactId is invalid in channel', () => {
    const create = postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 100,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 4: (error) reactId is invalid in DM', () => {
    const create = postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 100,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 5: (error) messageId is invalid in DM', () => {
    const create = postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId + 5,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 6: (error) messageId is invalid in channel', () => {
    const create = postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId + 5,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 7: (error) message already unreact from the authorised user in channel', () => {
    postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    const create2 = postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create2.res.statusCode).toBe(400);
  });

  test('Test 8: (error) message already unreact from the authorised user in DM', () => {
    postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
    const create2 = postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create2.res.statusCode).toBe(400);
  });

  test('Test 9: (error) authorised user in not in the channel', () => {
    const create = postMessageUnreact({
      token: user3.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 10: (error) authorised user in not in the DM', () => {
    const create = postMessageUnreact({
      token: user2.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 11: (error) unreact to a message already deleted in channel', () => {
    deleteMessageRemove({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    const create = postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 12: (error) unreact to a message already deleted in DM', () => {
    deleteMessageRemove({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    const create = postMessageUnreact({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 13: (error) unreact to a msg without react from the authorised user in channel', () => {
    const unreact = postMessageUnreact({
      token: user2.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(unreact.res.statusCode).toBe(400);
  });

  test('Test 14: (error) unreact to a msg without react from the authorised user in DM', () => {
    const unreact = postMessageUnreact({
      token: user3.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
      reactId: 1,
    });
    expect(unreact.res.statusCode).toBe(400);
  });
});

describe('Testing messagePinV1', () => {
  let user1:any;
  let user2:any;
  let user3:any;
  let channel:any;
  let dm:any;
  let channelMessage:any;
  let dmMessage:any;

  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    // Initialising the 4 users
    // user1 and user2 are in a channel
    // user1 and user3 are in a dm
    // user1 is the owner of both channel and dm
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh'
    });
    user2 = postAuthReg({
      email: 'ethan@hotmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'Lam'
    });
    user3 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He'
    });

    // user1 makes channel and user2 joins
    channel = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });
    postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId
    });

    // user1 makes dm and invites user3
    dm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId]
    });

    // user1 puts a message in both channel and dm
    channelMessage = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: 'hello world!'
    });
    dmMessage = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm.bodyObj.dmId,
      message: 'sshh this is a secret message'
    });
  });

  test('Test 1: Valid message in channel pinned', () => {
    const create = postMessagePin({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 2: Valid message in DM pinned', () => {
    const create = postMessagePin({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 3: Valid message in channel pinned by message owner', () => {
    const channelMessage2 = postMessageSend({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: 'i am a square!'
    });
    const create = postMessagePin({
      token: user2.bodyObj.token,
      messageId: channelMessage2.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 4: Valid message in DM pinned by message owner', () => {
    const dmMessage2 = postMessageSendDm({
      token: user3.bodyObj.token,
      dmId: dm.bodyObj.dmId,
      message: 'yo gabba gabba!'
    });
    const create = postMessagePin({
      token: user3.bodyObj.token,
      messageId: dmMessage2.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 5: (error) messageId not part of channel user is in', () => {
    const create = postMessagePin({
      token: user3.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 6: (error) messageId not part of DM user is in', () => {
    const create = postMessagePin({
      token: user2.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 7: (error) user does not have owner permissions in the channel', () => {
    const create = postMessagePin({
      token: user2.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 8: (error) user does not have owner permissions in the DM', () => {
    const create = postMessagePin({
      token: user3.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 9: (error) token invalid for channel message', () => {
    const create = postMessagePin({
      token: user1.bodyObj.token + 'a',
      messageId: channelMessage.bodyObj.messageId
    });
    expect(create.res.statusCode).toBe(403);
  });
  test('Test 10: (error) pinning a pinned message', () => {
    postMessagePin({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    const create = postMessagePin({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(400);
  });
});

describe('Testing messageUnpinV1', () => {
  let user1:any;
  let user2:any;
  let user3:any;
  let channel:any;
  let dm:any;
  let channelMessage:any;
  let dmMessage:any;

  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    // Initialising the 4 users
    // user1 and user2 are in a channel
    // user1 and user3 are in a dm
    // user1 is the owner of both channel and dm
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh'
    });
    user2 = postAuthReg({
      email: 'ethan@hotmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'Lam'
    });
    user3 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He'
    });

    // user1 makes channel and user2 joins
    channel = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });
    postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId
    });

    // user1 makes dm and invites user3
    dm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId]
    });

    // user1 puts a message in both channel and dm
    channelMessage = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: 'hello world!'
    });

    dmMessage = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm.bodyObj.dmId,
      message: 'sshh this is a secret message'
    });

    // user1 pins both messages
    postMessagePin({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });

    postMessagePin({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
  });

  test('Test 1: Valid message in channel unpinned', () => {
    const create = postMessageUnpin({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 2: Valid message in DM unpinned', () => {
    const create = postMessageUnpin({
      token: user1.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 3: Valid message in channel unpinned by message owner', () => {
    const channelMessage2 = postMessageSend({
      token: user2.bodyObj.token,
      channelId: channel.bodyObj.channelId,
      message: 'i am a square!'
    });
    postMessagePin({
      token: user2.bodyObj.token,
      messageId: channelMessage2.bodyObj.messageId,
    });
    const create = postMessageUnpin({
      token: user2.bodyObj.token,
      messageId: channelMessage2.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 4: Valid message in DM unpinned by message owner', () => {
    const dmMessage2 = postMessageSendDm({
      token: user3.bodyObj.token,
      dmId: dm.bodyObj.dmId,
      message: 'yo gabba gabba!'
    });
    postMessagePin({
      token: user3.bodyObj.token,
      messageId: dmMessage2.bodyObj.messageId,
    });
    const create = postMessageUnpin({
      token: user3.bodyObj.token,
      messageId: dmMessage2.bodyObj.messageId,
    });
    expect(create.bodyObj).toStrictEqual({});
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 5: (error) messageId not part of channel user is in', () => {
    const create = postMessageUnpin({
      token: user3.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 6: (error) messageId not part of DM user is in', () => {
    const create = postMessageUnpin({
      token: user2.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 7: (error) user does not have owner permissions in the channel', () => {
    const create = postMessageUnpin({
      token: user2.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 8: (error) user does not have owner permissions in the DM', () => {
    const create = postMessageUnpin({
      token: user3.bodyObj.token,
      messageId: dmMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 9: (error) token invalid for channel message', () => {
    const create = postMessageUnpin({
      token: user1.bodyObj.token + 'a',
      messageId: channelMessage.bodyObj.messageId
    });
    expect(create.res.statusCode).toBe(403);
  });
  test('Test 10: (error) unpinning an unpinned message', () => {
    postMessageUnpin({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    const create = postMessageUnpin({
      token: user1.bodyObj.token,
      messageId: channelMessage.bodyObj.messageId,
    });
    expect(create.res.statusCode).toBe(400);
  });
  request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {
      qs: {}
    }
  );
});

describe('Testing message/sendlater/v1', () => {
  let user1: any;
  let channel1: any;
  let user2: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {},
      }
    );
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh'
    });
    user2 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password1234',
      nameFirst: 'Ethan',
      nameLast: 'Lam'
    });
    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true
    });
  });

  test('Test 1: throw error when the token is invalid', () => {
    const msgSendLater = postMessageSendLater('a', channel1.bodyObj.channelId, 'What do you want?', delayMsgSent(5));
    expect(msgSendLater.res.statusCode).toEqual(403);
  });
  test('Test 2: throw error when the channelId is invalid', () => {
    const msgSendLater = postMessageSendLater(user1.bodyObj.token, -1, 'What do you want?', delayMsgSent(5));
    expect(msgSendLater.res.statusCode).toEqual(400);
  });
  test('Test 3: throw error when the length of the message is 0', () => {
    const msgSendLater = postMessageSendLater(user1.bodyObj.token, channel1.bodyObj.channelId, '', delayMsgSent(5));
    expect(msgSendLater.res.statusCode).toEqual(400);
  });
  test('Test 4: throw error when the length of the message is greater than 1000', () => {
    const messageString = 'A'.repeat(1001);
    const msgSendLater = postMessageSendLater(user1.bodyObj.token, channel1.bodyObj.channelId, messageString, delayMsgSent(5));
    expect(msgSendLater.res.statusCode).toEqual(400);
  });
  test('Test 5: throw error when the channelId is valid but the sender of message is not part of the channel', () => {
    const msgSendLater = postMessageSendLater(user2.bodyObj.token, channel1.bodyObj.channelId, 'hello', delayMsgSent(5));
    expect(msgSendLater.res.statusCode).toEqual(403);
  });
  test('Test 6: throw error when timeSent has passed', () => {
    const msgSendLater = postMessageSendLater(user1.bodyObj.token, channel1.bodyObj.channelId, 'hello', delayMsgSent(-1));
    expect(msgSendLater.res.statusCode).toEqual(400);
  });
  test('Test 7: successfully send a delayed message', () => {
    const msgSendLater = postMessageSendLater(user1.bodyObj.token, channel1.bodyObj.channelId, 'hello', delayMsgSent(5));
    expect(msgSendLater.res.statusCode).toEqual(200);
    expect(msgSendLater.bodyObj).toStrictEqual({ messageId: expect.any(Number) });

    const channelMessages = getChannelMessages({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      start: 0,
    });
    expect(channelMessages.res.statusCode).toEqual(200);
    expect(channelMessages.bodyObj).toStrictEqual({
      end: -1,
      messages: [],
      start: 0
    });

    // sleep(5);
    // expect(msgSendLater.res.statusCode).toEqual(200);
    // expect(channelMessages.bodyObj).toStrictEqual({
    //   end: -1,
    //   messages: [
    //     {
    //       messageId: msgSendLater.bodyObj.messageId,
    //       uId: user1.bodyObj.authUserId,
    //       message: 'hello',
    //       timeSent: expect.any(Number),
    //     }
    //   ],
    //   start: 0
    // });
    // jest.setTimeout(() => expect(msgSendLater.res.statusCode).toEqual(200), 6000);
    // jest.useFakeTimers(() => expect(channelMessages.bodyObj).toStrictEqual({
    //   end: -1,
    //   messages: [
    //     {
    //       messageId: msgSendLater.bodyObj.messageId,
    //       uId: user1.bodyObj.authUserId,
    //       message: 'hello',
    //       timeSent: expect.any(Number),
    //     }
    //   ],
    //   start: 0
    // }), 6000);
  });
});

describe('Testing sendLaterdm', () => {
  let user1: any;
  let dm1: any;
  let user2: any;
  let user3: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {},
      }
    );
    user1 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password123',
      nameFirst: 'Daniel',
      nameLast: 'Huynh'
    });
    user2 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password1234',
      nameFirst: 'Ethan',
      nameLast: 'Lam'
    });
    user3 = postAuthReg({
      email: 'calvin@gmail.com',
      password: 'password12345',
      nameFirst: 'calvin',
      nameLast: 'ale'
    });
    dm1 = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user2.bodyObj.authUserId],
    });
  });
  test('Test 1: return error when token invalid', () => {
    const msgSendLaterDm = postMessageSendLaterDm('a', dm1.bodyObj.dmId, 'hey everyone', delayMsgSent(5));
    expect(msgSendLaterDm.res.statusCode).toEqual(403);
  });
  test('Test 2: return error when dmId is invalid', () => {
    const msgSendLaterDm = postMessageSendLaterDm(user1.bodyObj.token, -1, 'Hey lol', delayMsgSent(5));
    expect(msgSendLaterDm.res.statusCode).toEqual(400);
  });
  test('Test 3: return error when message length is 0', () => {
    const msgSendLaterDm = postMessageSendLaterDm(user1.bodyObj.token, dm1.bodyObj.dmId, '', delayMsgSent(5));
    expect(msgSendLaterDm.res.statusCode).toEqual(400);
  });
  test('Test 4: return error when message length is greater than 1000', () => {
    const msgSendLaterDm = postMessageSendLaterDm(user1.bodyObj.token, dm1.bodyObj.dmId, '', delayMsgSent(5));
    expect(msgSendLaterDm.res.statusCode).toEqual(400);
  });
  test('Test 5: return error when timesent has passed', () => {
    const msgSendLaterDm = postMessageSendLaterDm(user1.bodyObj.token, dm1.bodyObj.dmId, 'hello', delayMsgSent(-1));
    expect(msgSendLaterDm.res.statusCode).toEqual(400);
  });
  test('Test 6: return error when dmId is valid but authUserId is not part of dm', () => {
    const msgSendLaterDm = postMessageSendLaterDm(user3.bodyObj.token, dm1.bodyObj.dmId, 'hello', delayMsgSent(5));
    expect(msgSendLaterDm.res.statusCode).toEqual(403);
  });
  test('Test 7: successfully send a late dm message', () => {
    const msgSendLaterDm = postMessageSendLaterDm(user2.bodyObj.token, dm1.bodyObj.dmId, 'hello', delayMsgSent(5));
    expect(msgSendLaterDm.res.statusCode).toEqual(200);
    expect(msgSendLaterDm.bodyObj).toStrictEqual({
      messageId: expect.any(Number)
    });

    const dmMessage = getDmMessages({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      start: 0
    });
    expect(dmMessage.res.statusCode).toEqual(200);
    expect(dmMessage.bodyObj).toStrictEqual({
      messages: [],
      end: -1,
      start: 0
    });
  });
});

request(
  'DELETE',
  `${url}:${port}/clear/v1`,
  {
    qs: {},
  }
);
