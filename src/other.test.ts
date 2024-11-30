import { clearV1 } from './other';
import { authRegisterV1, authLoginV1 } from './auth';
import { channelsCreateV1, channelsListallV1 } from './channels';
import { AuthUserId } from './typeDefinitions';
import express from 'express';
import config from './config.json';
import request from 'sync-request';
import { deleteAdminRemove, getSearch, getNotifications, postAuthReg, postChannelInvite, postChannelsCreate, postDmCreate, postMessageSend, postMessageSendDm, putMessageEdit, getUsersAll, getChannelDetails, getUserProfile, getChannelMessages } from './testingHelper';

// Set up web app, use JSON
const app = express();
app.use(express.json());

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

describe('Testing clearV1', () => {
  test('Test 1: Clearing data for users', () => {
    authRegisterV1('ethan@gmail.com', 'password', 'ethan', 'lam') as AuthUserId;
    clearV1();
    expect(authLoginV1('ethan@gmail.com', 'password')).toStrictEqual({ error: 'error' });
  });
  test('Test 2: Clearing data for channels', () => {
    const user1 = authRegisterV1('ethan@gmail.com', 'password', 'ethan', 'lam') as AuthUserId;
    channelsCreateV1(user1.authUserId, 'bob', true);
    clearV1();
    expect(channelsListallV1(user1.authUserId)).toStrictEqual({ channels: [] });
    const user2 = authRegisterV1('ethan@gmail.com', 'password', 'ethan', 'lam') as AuthUserId;
    expect(channelsListallV1(user2.authUserId)).toStrictEqual({ channels: [] });
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
  });
});

describe('Testing notifications/get/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channel1: any;
  let channel2: any;
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
    channel2 = postChannelsCreate({
      token: user3.bodyObj.token,
      name: 'channel 2',
      isPublic: true,
    });
    postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    postChannelInvite({
      token: user3.bodyObj.token,
      channelId: channel2.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    dm1 = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId],
    });
  });

  test('Test 1: throw error when token is invalid', () => {
    const notify = getNotifications('a');
    expect(notify.res.statusCode).toEqual(403);
  });

  test('Test 2: display empty notification for a user', () => {
    const notify = getNotifications(user1.bodyObj.token);
    expect(notify.res.statusCode).toEqual(200);
    expect(notify.bodyObj).toStrictEqual([]);
  });

  test('Test 3: display notification for a user who was added to a channel', () => {
    const notify = getNotifications(user2.bodyObj.token);
    expect(notify.res.statusCode).toEqual(200);
    expect(notify.bodyObj).toStrictEqual([
      {
        channelId: channel2.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'ethanlam added you to channel 2',
      },
      {
        channelId: channel1.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'jasonhe added you to channel 1',
      }
    ]);
  });
  test('Test 4: display notification of a user who was added to a dm', () => {
    const notify = getNotifications(user3.bodyObj.token);
    expect(notify.res.statusCode).toEqual(200);
    expect(notify.bodyObj).toStrictEqual([
      {
        channelId: -1,
        dmId: dm1.bodyObj.dmId,
        notificationMessage: 'jasonhe added you to ethanlam, jasonhe',
      },
    ]);
  });
  test('Test 5: display notification that a user was tagged in a channel message', () => {
    postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: '@danielhuynh why are you here?',
    });

    const notify = getNotifications(user2.bodyObj.token);
    expect(notify.res.statusCode).toEqual(200);
    expect(notify.bodyObj).toStrictEqual([
      {
        channelId: channel1.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'jasonhe tagged you in channel 1: @danielhuynh why are',
      },
      {
        channelId: channel2.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'ethanlam added you to channel 2',
      },
      {
        channelId: channel1.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'jasonhe added you to channel 1',
      },
    ]);
  });
  test('Test 6: display no notification to tagged user who is not a part of the channel', () => {
    postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: '@ethanlam why are you here?',
    });
    const notify = getNotifications(user3.bodyObj.token);
    expect(notify.res.statusCode).toEqual(200);
    expect(notify.bodyObj).toStrictEqual([
      {
        channelId: -1,
        dmId: dm1.bodyObj.dmId,
        notificationMessage: 'jasonhe added you to ethanlam, jasonhe',
      },
    ]);
    const notify2 = getNotifications(user2.bodyObj.token);
    expect(notify2.res.statusCode).toEqual(200);
    expect(notify2.bodyObj).toStrictEqual([
      {
        channelId: channel2.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'ethanlam added you to channel 2',
      },
      {
        channelId: channel1.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'jasonhe added you to channel 1',
      },
    ]);
  });
  test('Test 7: notify member in a dm when they were tagged in a message', () => {
    postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: '@ethanlam yo what you up to?'
    });

    const notify = getNotifications(user3.bodyObj.token);
    expect(notify.res.statusCode).toEqual(200);
    expect(notify.bodyObj).toStrictEqual([
      {
        channelId: -1,
        dmId: dm1.bodyObj.dmId,
        notificationMessage: 'jasonhe tagged you in ethanlam, jasonhe: @ethanlam yo what yo',
      },
      {
        channelId: -1,
        dmId: dm1.bodyObj.dmId,
        notificationMessage: 'jasonhe added you to ethanlam, jasonhe',
      },
    ]);
  });
  test('Test 8: notify user when a edited message has tagged them in a channel', () => {
    const message1 = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'why are you here?',
    });

    const notify = getNotifications(user2.bodyObj.token);
    expect(notify.res.statusCode).toEqual(200);
    expect(notify.bodyObj).toStrictEqual([
      {
        channelId: channel2.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'ethanlam added you to channel 2',
      },
      {
        channelId: channel1.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'jasonhe added you to channel 1',
      },
    ]);

    putMessageEdit({
      token: user1.bodyObj.token,
      messageId: message1.bodyObj.messageId,
      message: '@danielhuynh, what are you doing here?',
    });

    const notify2 = getNotifications(user2.bodyObj.token);
    expect(notify2.res.statusCode).toEqual(200);
    expect(notify2.bodyObj).toStrictEqual([
      {
        channelId: channel1.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'jasonhe tagged you in channel 1: @danielhuynh, what a',
      },
      {
        channelId: channel2.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'ethanlam added you to channel 2',
      },
      {
        channelId: channel1.bodyObj.channelId,
        dmId: -1,
        notificationMessage: 'jasonhe added you to channel 1',
      },
    ]);
  });
  test('Test 9: notify a user when an edited message tags them', () => {
    const dmMessage1 = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'why are you here?',
    });

    const notify = getNotifications(user3.bodyObj.token);
    expect(notify.res.statusCode).toEqual(200);
    expect(notify.bodyObj).toStrictEqual([
      {
        channelId: -1,
        dmId: dm1.bodyObj.dmId,
        notificationMessage: 'jasonhe added you to ethanlam, jasonhe',
      },
    ]);

    putMessageEdit({
      token: user1.bodyObj.token,
      messageId: dmMessage1.bodyObj.messageId,
      message: '@ethanlam, have you done the assignment?',
    });

    const notify2 = getNotifications(user3.bodyObj.token);
    expect(notify2.res.statusCode).toEqual(200);
    expect(notify2.bodyObj).toStrictEqual([
      {
        channelId: -1,
        dmId: dm1.bodyObj.dmId,
        notificationMessage: 'jasonhe tagged you in ethanlam, jasonhe: @ethanlam, have you ',
      },
      {
        channelId: -1,
        dmId: dm1.bodyObj.dmId,
        notificationMessage: 'jasonhe added you to ethanlam, jasonhe',
      },
    ]);
  });
});

describe('Testing search/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channel1: any;
  let message1: any;
  let dm1: any;
  let dmMessage1: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
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
    postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      uId: user2.bodyObj.authUserId
    });
    message1 = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'i love my comp1531 group!'
    });
    postMessageSend({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'what?'
    });
    dm1 = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [user3.bodyObj.authUserId],
    });
    dmMessage1 = postMessageSendDm({
      token: user3.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'What is the assignment about?',
    });
    postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'Read the specs',
    });
  });
  test('Test 1: return error when token is invalid', () => {
    const searching = getSearch('a', 'hi');
    expect(searching.res.statusCode).toEqual(403);
  });
  test('Test 2: return error when length of queryStr is 0', () => {
    const searching = getSearch(user1.bodyObj.token, '');
    expect(searching.res.statusCode).toEqual(400);
  });
  test('Test 3: return error when the length of queryStr is greater than 1000', () => {
    const word = 'A'.repeat(1001);
    const searching = getSearch(user1.bodyObj.token, word);
    expect(searching.res.statusCode).toEqual(400);
  });
  test('Test 4: successfully return all the messages containing "love"', () => {
    const searching = getSearch(user1.bodyObj.token, 'love');
    expect(searching.res.statusCode).toEqual(200);
    expect(searching.bodyObj.messages).toStrictEqual(
      [
        {
          messageId: message1.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'i love my comp1531 group!',
          timeSent: expect.any(Number),
        },
      ]
    );
  });
  test('Test 5: successfully return all the messages containing "bob"', () => {
    const searching = getSearch(user1.bodyObj.token, 'bob');
    expect(searching.res.statusCode).toEqual(200);
    expect(searching.bodyObj.messages).toStrictEqual([]);
  });

  test('Test 6: successfully return all messages from dm containing "assignment"', () => {
    const searching = getSearch(user1.bodyObj.token, 'assignment');
    expect(searching.res.statusCode).toEqual(200);
    expect(searching.bodyObj.messages).toStrictEqual(
      [
        {
          messageId: dmMessage1.bodyObj.messageId,
          uId: user3.bodyObj.authUserId,
          message: 'What is the assignment about?',
          timeSent: expect.any(Number),
        }
      ]
    );
  });
});

describe('Testing admin/remove', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channel1: any;
  let message1: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
    user1 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'jason',
      nameLast: 'He',
    });
    user2 = postAuthReg({
      email: 'charles@hotmail.com',
      password: 'password1',
      nameFirst: 'charles',
      nameLast: 'tran',
    });
    user3 = postAuthReg({
      email: 'ethan@hotmail.com',
      password: 'password2',
      nameFirst: 'ethan',
      nameLast: 'lam',
    });
    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel 1',
      isPublic: true,
    });
    postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    message1 = postMessageSend({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'hello world!',
    });
  });
  test('Test 1: throw error when the token is invalid', () => {
    const deleteAdmin = deleteAdminRemove('a', user2.bodyObj.authUserId);
    expect(deleteAdmin.res.statusCode).toEqual(403);
  });
  test('Test 2: throw error when the uId is invalid', () => {
    const deleteAdmin = deleteAdminRemove(user1.bodyObj.token, -1);
    expect(deleteAdmin.res.statusCode).toEqual(400);
  });
  test('Test 3: throw error when the token refers to the only owner of Treats', () => {
    const deleteAdmin = deleteAdminRemove(user1.bodyObj.token, user1.bodyObj.authUserId);
    expect(deleteAdmin.res.statusCode).toEqual(400);
  });
  test('Test 4: throw error when the token refers to a user that is not a global owner.', () => {
    const deleteAdmin = deleteAdminRemove(user2.bodyObj.token, user1.bodyObj.authUserId);
    expect(deleteAdmin.res.statusCode).toEqual(403);
  });
  test('Test 5: successfully admin remove a user', () => {
    const deleteAdmin = deleteAdminRemove(user1.bodyObj.token, user2.bodyObj.authUserId);
    expect(deleteAdmin.res.statusCode).toEqual(200);
    expect(deleteAdmin.bodyObj).toStrictEqual({});
    expect(getUsersAll(user1.bodyObj.token).res.statusCode).toEqual(200);
    expect(getUsersAll(user1.bodyObj.token).queryObj.users).toStrictEqual(
      [
        {
          uId: user1.bodyObj.authUserId,
          email: 'jason@hotmail.com',
          nameFirst: 'jason',
          nameLast: 'He',
          handleStr: 'jasonhe'
        },
        {
          uId: user3.bodyObj.authUserId,
          email: 'ethan@hotmail.com',
          nameFirst: 'ethan',
          nameLast: 'lam',
          handleStr: 'ethanlam'
        },
      ]
    );
    expect(getChannelDetails(
      {
        token: user1.bodyObj.token,
        channelId: channel1.bodyObj.channelId
      }).res.statusCode).toEqual(200);
    expect(getChannelDetails(
      {
        token: user1.bodyObj.token,
        channelId: channel1.bodyObj.channelId
      }).queryObj).toStrictEqual({
      name: 'channel 1',
      isPublic: true,
      allMembers: [
        {
          uId: user1.bodyObj.authUserId,
          email: 'jason@hotmail.com',
          nameFirst: 'jason',
          nameLast: 'He',
          handleStr: 'jasonhe',
        },
        {
          uId: user3.bodyObj.authUserId,
          email: 'ethan@hotmail.com',
          nameFirst: 'ethan',
          nameLast: 'lam',
          handleStr: 'ethanlam',
        }
      ],
      ownerMembers: [
        {
          uId: user1.bodyObj.authUserId,
          email: 'jason@hotmail.com',
          nameFirst: 'jason',
          nameLast: 'He',
          handleStr: 'jasonhe',
        },
      ]
    });
    expect(getUserProfile({
      token: user1.bodyObj.token, uId: user2.bodyObj.authUserId
    }).res.statusCode).toEqual(200);
    expect(getUserProfile({
      token: user1.bodyObj.token, uId: user2.bodyObj.authUserId
    }).bodyObj.user).toStrictEqual({
      uId: user2.bodyObj.authUserId,
      email: 'charles@hotmail.com',
      nameFirst: 'Removed',
      nameLast: 'user',
      handleStr: 'charlestran'
    });
    expect((getChannelMessages(
      {
        token: user1.bodyObj.token,
        channelId: channel1.bodyObj.channelId,
        start: 0
      }).res.statusCode)).toEqual(200);
    expect((getChannelMessages(
      {
        token: user1.bodyObj.token,
        channelId: channel1.bodyObj.channelId,
        start: 0
      }).bodyObj)).toStrictEqual({
      messages: [
        {
          uId: user2.bodyObj.authUserId,
          message: 'Removed user',
          messageId: message1.bodyObj.messageId,
          timeSent: expect.any(Number),
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });
});
