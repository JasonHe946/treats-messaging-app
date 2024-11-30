import { postAuthReg, postChannelsCreate, getChannelDetails, postChannelJoin, postChannelInvite, getChannelMessages, postMessageSend } from './testingHelper';

import request from 'sync-request';
import config from './config.json';

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

// channel/details/v2
describe('channel/details/v2 testing', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channelPublic: any;
  let channelPrivate: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He',
    });

    user2 = postAuthReg({
      email: 'gabriel@gmail.com',
      password: 'Gabidon',
      nameFirst: 'Gabriel',
      nameLast: 'Esquivel',
    });

    user3 = postAuthReg({
      email: 'lucy@gmail.com',
      password: 'careers',
      nameFirst: 'Lucy',
      nameLast: 'Wang',
    });
  });

  test('Test 1: negative channel number', () => {
    const details = getChannelDetails({
      token: user1.bodyObj.token,
      channelId: -2,
    });
    expect(details.res.statusCode).toBe(400);
  });

  test('Test 2: wrong channelID for public', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const details = getChannelDetails({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId + 50,
    });
    expect(details.res.statusCode).toBe(400);
  });

  test('Test 3: wrong channelID for private', () => {
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    const details = getChannelDetails({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId - 50,
    });
    expect(details.res.statusCode).toBe(400);
  });

  test('Test 4: public channel is valid but user is not part of channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const details = getChannelDetails({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(details.res.statusCode).toBe(403);
  });

  test('Test 5: private channel is valid but user is not part of channel', () => {
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    const details = getChannelDetails({
      token: user3.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
    });
    expect(details.res.statusCode).toBe(403);
  });

  test('Test 6: valid input for a public channel user', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });

    const details = getChannelDetails({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(details.res.statusCode).toBe(OK);
    expect(details.queryObj).toStrictEqual({
      name: 'channelPublic',
      isPublic: true,
      ownerMembers: [
        {
          email: 'jason@hotmail.com',
          handleStr: 'jasonhe',
          nameFirst: 'Jason',
          nameLast: 'He',
          uId: 1,
        }
      ],
      allMembers: [
        {
          email: 'jason@hotmail.com',
          handleStr: 'jasonhe',
          nameFirst: 'Jason',
          nameLast: 'He',
          uId: 1,
        }
      ]
    });
  });
});

// channel/join/v2 testing
describe('channel/join/v2 testing', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channelPublic: any;
  let channelPrivate: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'jason@hotmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He',
    });

    user2 = postAuthReg({
      email: 'gabriel@gmail.com',
      password: 'password',
      nameFirst: 'Gabriel',
      nameLast: 'Esquivel',
    });

    user3 = postAuthReg({
      email: 'lucy@gmail.com',
      password: 'careers',
      nameFirst: 'Lucy',
      nameLast: 'Wang',
    });
  });

  test('test 1: (error) negative channel number', () => {
    const ret = postChannelJoin({
      token: user1.bodyObj.token,
      channelId: -2,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('test 2: (error) wrong channelId for public', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const ret = postChannelJoin({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId + 50,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('test 3: (error) wrong channelId for private', () => {
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    const ret = postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId - 50,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('test 4: (error) creator of public channel tries to rejoin channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const ret1 = postChannelJoin({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(ret1.res.statusCode).toBe(400);
  });

  test('test 5: (error) creator of private channel tries to rejoin channel', () => {
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    const ret = postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('test 6: (error) random joins public twice', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    const ret2 = postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(ret2.res.statusCode).toBe(400);
  });

  test('test 7: (error) random tries to join private channel', () => {
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    const ret = postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
    });
    expect(ret.res.statusCode).toBe(403);
  });

  test('test 8: (error) success random joining public channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const ret = postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});
  });

  test('test 9: (error) global owner joins private channel', () => {
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false
    });

    const ret = postChannelJoin({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
    });

    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});
  });

  test('test 10: (error) invalid token', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const ret = postChannelJoin({
      token: user3.bodyObj.token + 'a',
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(ret.res.statusCode).toBe(403);
  });
});

// Testing channelInviteV2
describe('Testing /channel/invite/v3', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channelPrivate: any;
  let channelPublic: any;
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
      password: 'password1',
      nameFirst: 'jason',
      nameLast: 'he',
    });

    user2 = postAuthReg({
      email: 'daniel@hotmail.com',
      password: 'password2',
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });

    user3 = postAuthReg({
      email: 'vincent@hotmail.com',
      password: 'password3',
      nameFirst: 'vincent',
      nameLast: 'nguyen',
    });
  });

  test('Test 1: return error when negative channel number', () => {
    const channelInvite = postChannelInvite({
      token: user1.bodyObj.token,
      channelId: -2,
      uId: user2.bodyObj.authUserId,
    });
    expect(channelInvite.res.statusCode).toBe(400);
  });

  test('Test 2: return error when invalid token is given', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const channelInvite = postChannelInvite({
      token: 'a',
      channelId: channelPublic.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(channelInvite.res.statusCode).toBe(403);
  });

  test('Test 3: return error when wrong channelId is given', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });

    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });

    const channelInvite = postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(channelInvite.res.statusCode).toBe(400);
  });

  test('Test 4: return error when invalid channelId is given for private channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });

    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });

    const channelInvite = postChannelInvite({
      token: user2.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user1.bodyObj.authUserId,
    });
    expect(channelInvite.res.statusCode).toBe(400);
  });

  test('Test 5: return error when uId does not refer to a valid ID', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });

    const channelInvite = postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: -2,
    });
    expect(channelInvite.res.statusCode).toBe(400);
  });

  test('Test 6: return error when uId refers to an invalid Id using a private channel', () => {
    channelPrivate = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });

    const channelInvite = postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: -2,
    });
    expect(channelInvite.res.statusCode).toBe(400);
  });

  test('Test 7: valid input for a public channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const channelInvite1 = postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(channelInvite1.res.statusCode).toBe(OK);
    expect(channelInvite1.bodyObj).toStrictEqual({});
  });

  test('Test 8: valid input for a private channel', () => {
    channelPrivate = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    const channelInvite1 = postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(channelInvite1.res.statusCode).toBe(OK);
    expect(channelInvite1.bodyObj).toStrictEqual({});
  });

  test('Test 9: return error when inviting the same person twice in public channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });

    const channelInvite2 = postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(channelInvite2.res.statusCode).toBe(400);
  });

  test('Test 10: return error when inviting the same person twice in private channel', () => {
    channelPrivate = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });

    const channelInvite2 = postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(channelInvite2.res.statusCode).toBe(400);
  });

  test('Test 11: inviting globalowner to a public channel', () => {
    channelPublic = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });

    const channelInvite1 = postChannelInvite({
      token: user2.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user1.bodyObj.authUserId,
    });

    expect(channelInvite1.res.statusCode).toBe(OK);
    expect(channelInvite1.bodyObj).toStrictEqual({});
  });

  test('Test 12: inviting globalowner to a public channel', () => {
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });

    const channelInvite1 = postChannelInvite({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user1.bodyObj.authUserId,
    });
    expect(channelInvite1.res.statusCode).toBe(OK);
    expect(channelInvite1.bodyObj).toStrictEqual({});
  });

  test('Test 13: inviting two users to a channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const channelInvite1 = postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(channelInvite1.res.statusCode).toBe(OK);
    expect(channelInvite1.bodyObj).toStrictEqual({});

    const channelInvite2 = postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });

    expect(channelInvite2.res.statusCode).toBe(OK);
    expect(channelInvite2.bodyObj).toStrictEqual({});
  });

  test('Test 14: return error when channelId is valid but authorised user is not member of channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const channelInvite = postChannelInvite({
      token: user2.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    expect(channelInvite.res.statusCode).toBe(403);
  });
});

describe('Testing channel/messages/v3', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let user4: any;
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
      password: 'password1',
      nameFirst: 'jason',
      nameLast: 'he',
    });

    user2 = postAuthReg({
      email: 'daniel@hotmail.com',
      password: 'password2',
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });

    user3 = postAuthReg({
      email: 'vincent@hotmail.com',
      password: 'password3',
      nameFirst: 'vincent',
      nameLast: 'nguyen',
    });

    user4 = postAuthReg({
      email: 'bob@gmail.com',
      password: 'password4',
      nameFirst: 'bob',
      nameLast: 'low',
    });

    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true,
    });

    postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      uId: user2.bodyObj.authUserId
    });

    postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      uId: user3.bodyObj.authUserId
    });

    message1 = postMessageSend({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'hello everyone'
    });
  });

  test('Test 1: return error when invalid token is given', () => {
    const channelMessages = getChannelMessages({
      token: 'a',
      channelId: channel1.bodyObj.channelId,
      start: 0,
    });
    expect(channelMessages.res.statusCode).toBe(403);
  });

  test('Test 2: return error when channelId is invalid', () => {
    const channelMessages = getChannelMessages({
      token: user1.bodyObj.token,
      channelId: -1,
      start: 0,
    });
    expect(channelMessages.res.statusCode).toBe(400);
  });

  test('Test 3: return error when authUser is not a member of the channel', () => {
    const channelMessages = getChannelMessages({
      token: user4.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      start: 0,
    });
    expect(channelMessages.res.statusCode).toBe(403);
  });

  test('Test 4: return error when start is greater than the number of messages in a channel', () => {
    const channelMessages = getChannelMessages({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      start: 10,
    });
    expect(channelMessages.res.statusCode).toBe(400);
  });

  test('Test 5: successfully display one channel message in the channel', () => {
    const channelMessages = getChannelMessages({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      start: 0,
    });
    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: message1.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'hello everyone',
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });
    expect(channelMessages.res.statusCode).toBe(OK);
  });

  test('Test 6: successfully display multiple channel messages in the channel', () => {
    const message2 = postMessageSend({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'Hey mate'
    });

    const channelMessages = getChannelMessages({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      start: 0,
    });

    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: message2.bodyObj.messageId,
          uId: user2.bodyObj.authUserId,
          message: 'Hey mate',
          timeSent: expect.any(Number),
          reacts: [],
        },
        {
          messageId: message1.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'hello everyone',
          timeSent: expect.any(Number),
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
    expect(channelMessages.res.statusCode).toBe(OK);
  });

  test('Test 7: successfully display the oldest channel message in the channel', () => {
    postMessageSend({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'Hey mate'
    });

    const channelMessages = getChannelMessages({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      start: 1,
    });

    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: message1.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'hello everyone',
          timeSent: expect.any(Number),
          reacts: [],
        },
      ],
      start: 1,
      end: -1,
    });
    expect(channelMessages.res.statusCode).toBe(OK);
  });

  test('Test 8: successfully display the 2 channel message in the desired channel', () => {
    const user5 = postAuthReg({
      email: 'jessica@gmail.com',
      password: 'password10',
      nameFirst: 'jessica',
      nameLast: 'bee',
    });

    const channel2 = postChannelsCreate({
      token: user4.bodyObj.token,
      name: 'COMP1531AERO',
      isPublic: true
    });

    postChannelJoin({
      token: user5.bodyObj.token,
      channelId: channel2.bodyObj.channelId
    });

    postMessageSend({
      token: user5.bodyObj.token,
      channelId: channel2.bodyObj.channelId,
      message: 'Hi bob',
    });

    const message2 = postMessageSend({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      message: 'Hey mate'
    });

    const channelMessages = getChannelMessages({
      token: user2.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      start: 0,
    });

    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: message2.bodyObj.messageId,
          uId: user2.bodyObj.authUserId,
          message: 'Hey mate',
          timeSent: expect.any(Number),
          reacts: [],
        },
        {
          messageId: message1.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'hello everyone',
          timeSent: expect.any(Number),
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
    expect(channelMessages.res.statusCode).toBe(OK);
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
  });
});
