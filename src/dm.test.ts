import request from 'sync-request';
import config from './config.json';
import { postAuthReg, postDmCreate, getDmList, postDmLeave, postMessageSendDm, dmRemove, getDmDetails, getDmMessages } from './testingHelper';
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

describe('Testing dm/create/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
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
      email: 'jason@gmail.com',
      password: 'password2',
      nameFirst: 'jason',
      nameLast: 'he',
    });

    user3 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password3',
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });
  });

  test('Test 1: if token is invalid, return error', () => {
    const createDm = postDmCreate({
      token: 'a',
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    expect(createDm.res.statusCode).toBe(403);
  });

  test('Test 2: if uId is invalid, return error', () => {
    const createDm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
        -1,
      ]
    });
    expect(createDm.res.statusCode).toBe(400);
  });

  test('Test 3: if there are duplicate uIds, return error', () => {
    const createDm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user2.bodyObj.authUserId,
      ]
    });
    expect(createDm.res.statusCode).toBe(400);
  });

  test('Test 4: successfully creating a dm', () => {
    const createDm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    expect(createDm.res.statusCode).toBe(OK);
    expect(createDm.bodyObj).toStrictEqual({
      dmId: createDm.bodyObj.dmId,
    });
  });

  test("Test 5: return error when creator's uId is in uIds", () => {
    const createDm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user1.bodyObj.authUserId,
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    expect(createDm.res.statusCode).toBe(400);
  });
});

describe('Testing dm/leave/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let user4: any;
  let dm1: any;
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
      email: 'bob@gmail.com',
      password: 'password4',
      nameFirst: 'bob',
      nameLast: 'low',
    });

    dm1 = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId
      ]
    });
  });

  test('Test 1: return error when token is invalid', () => {
    const dmLeave1 = postDmLeave({
      token: 'a',
      dmId: dm1.bodyObj.dmId,
    });
    expect(dmLeave1.res.statusCode).toBe(403);
  });

  test('Test 2: return error when invalid dmId is given', () => {
    const dmLeave1 = postDmLeave({
      token: user2.bodyObj.token,
      dmId: -1,
    });
    expect(dmLeave1.res.statusCode).toBe(400);
  });

  test('Test 3: return error when authUser is not a member of dm', () => {
    const dmLeave1 = postDmLeave({
      token: user4.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
    });
    expect(dmLeave1.res.statusCode).toBe(403);
  });

  test('Test 4: successfully remove authUser (who is just a member) from a dm', () => {
    const dmLeave1 = postDmLeave({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
    });

    expect(dmLeave1.bodyObj).toStrictEqual({});
    expect(dmLeave1.res.statusCode).toBe(OK);
  });

  test('Test 5: return error when trying to leave the same user twice', () => {
    const dmLeave1 = postDmLeave({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
    });

    expect(dmLeave1.bodyObj).toStrictEqual({});
    expect(dmLeave1.res.statusCode).toBe(OK);

    const dmLeave2 = postDmLeave({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
    });
    expect(dmLeave2.res.statusCode).toBe(403);
  });

  test('Test 6: remove the authUser (who is the owner) from the dm', () => {
    const dmLeave1 = postDmLeave({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
    });

    expect(dmLeave1.bodyObj).toStrictEqual({});
    expect(dmLeave1.res.statusCode).toBe(OK);
  });

  test('Test 7: return error when removing the owner twice', () => {
    const dmLeave1 = postDmLeave({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
    });

    expect(dmLeave1.bodyObj).toStrictEqual({});
    expect(dmLeave1.res.statusCode).toBe(OK);

    const dmLeave2 = postDmLeave({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
    });
    expect(dmLeave2.res.statusCode).toBe(403);
  });
});

describe('Testing /message/senddm/v2', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let user4: any;
  let dm1: any;
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
        user3.bodyObj.authUserId
      ],
    });
  });

  test('Test 1: return error when an invalid token is given', () => {
    const sendDm = postMessageSendDm({
      token: 'a',
      dmId: dm1.bodyObj.dmId,
      message: 'hello world',
    });

    expect(sendDm.res.statusCode).toBe(403);
  });

  test('Test 2: return error when message is less than 1 character long', () => {
    const sendDm = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: '',
    });

    expect(sendDm.res.statusCode).toBe(400);
  });

  test('Test 3: return error when message is longer than 1000 characters', () => {
    const messageString = 'A'.repeat(1234);
    const sendDm = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: messageString,
    });

    expect(sendDm.res.statusCode).toBe(400);
  });

  test('Test 4: return error dmId does not refer to a valid dm', () => {
    const sendDm = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: -1,
      message: 'hello world',
    });
    expect(sendDm.res.statusCode).toBe(400);
  });

  test('Test 5: return error when authUser is not a member of the dm', () => {
    const sendDm = postMessageSendDm({
      token: user4.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'hello world',
    });
    expect(sendDm.res.statusCode).toBe(403);
  });

  test('Test 6: successfully send a dm', () => {
    const sendDm = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'hello world',
    });
    expect(sendDm.res.statusCode).toBe(OK);
    expect(sendDm.bodyObj).toStrictEqual({ messageId: sendDm.bodyObj.messageId });
  });
});

// testing dm/list/v1
describe('Testing dm/list/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let user4: any;
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
      email: 'jason@gmail.com',
      password: 'password2',
      nameFirst: 'jason',
      nameLast: 'he',
    });

    user3 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password3',
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });
    user4 = postAuthReg({
      email: 'lucy@gmail.com',
      password: 'password4',
      nameFirst: 'lucy',
      nameLast: 'wang',
    });
  });
  test('Test 1: if token is invalid, return error', () => {
    postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    const dmList = getDmList(user1.bodyObj.token + 'a');
    expect(dmList.res.statusCode).toBe(403);
  });
  test('Test 2: success, user is a member of the dm he created', () => {
    const createDm = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    const dmList = getDmList(user1.bodyObj.token);
    expect(dmList.res.statusCode).toBe(OK);
    expect(dmList.bodyObj).toStrictEqual({
      dms: [
        {
          dmId: createDm.bodyObj.dmId,
          name: 'danielhuynh, ethanlam, jasonhe',
        }
      ]
    });
  });
  test('Test 3: success, user is not a member of any dms', () => {
    postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    const dmList = getDmList(user4.bodyObj.token);
    expect(dmList.res.statusCode).toBe(OK);
    expect(dmList.bodyObj).toStrictEqual({
      dms: []
    });
  });
  test('Test 4: success, user1 is part of 2 DMS, one that he created and that he is a normal member of', () => {
    const createDm1 = postDmCreate({ // dm1 contains user1,2,3
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    const createDm2 = postDmCreate({ // dm2 contains user4,1,3
      token: user4.bodyObj.token,
      uIds: [
        user1.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    const dmList = getDmList(user1.bodyObj.token);
    expect(dmList.res.statusCode).toBe(OK);
    expect(dmList.bodyObj).toStrictEqual({
      dms: [
        {
          dmId: createDm1.bodyObj.dmId,
          name: 'danielhuynh, ethanlam, jasonhe',
        },
        {
          dmId: createDm2.bodyObj.dmId,
          name: 'danielhuynh, ethanlam, lucywang',
        }
      ]
    });
  });
  test('Test 5: success, user1 is part of 2 DMS, one that he created and that he is a normal member of, but not part of 3rd DM', () => {
    const createDm1 = postDmCreate({ // dm1 contains user1,2,3
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    const createDm2 = postDmCreate({ // dm2 contains user4,1,3
      token: user4.bodyObj.token,
      uIds: [
        user1.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    postDmCreate({ // dm2 contains user 4,2,3
      token: user4.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
    const dmList = getDmList(user1.bodyObj.token);
    expect(dmList.res.statusCode).toBe(OK);
    expect(dmList.bodyObj).toStrictEqual({
      dms: [
        {
          dmId: createDm1.bodyObj.dmId,
          name: 'danielhuynh, ethanlam, jasonhe',
        },
        {
          dmId: createDm2.bodyObj.dmId,
          name: 'danielhuynh, ethanlam, lucywang',
        }
      ]
    });
  });
});

// testing dm/remove/v1
describe('Testing dm/remove/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let user4: any;
  let createDm1: any;
  beforeEach(() => { // before each test, a DM is created that contains 1 as owner and user 2 & user 3 as other members
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
      email: 'jason@gmail.com',
      password: 'password2',
      nameFirst: 'jason',
      nameLast: 'he',
    });

    user3 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password3',
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });
    user4 = postAuthReg({
      email: 'lucy@gmail.com',
      password: 'password4',
      nameFirst: 'lucy',
      nameLast: 'wang',
    });
    createDm1 = postDmCreate({ // dm1 contains user1,2,3
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
  });
  test('Test 1: token is not valid', () => {
    const dmRemoveRet = dmRemove({
      token: user1.bodyObj.token + 'a',
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmRemoveRet.res.statusCode).toBe(403);
  });
  test('Test 2: dmId does not refer to valid DM', () => {
    const dmRemoveRet = dmRemove({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId * -1,
    });
    expect(dmRemoveRet.res.statusCode).toBe(400);
  });
  test('Test 3: dmId is valid but authorised user is not original DM creator', () => {
    const dmRemoveRet = dmRemove({
      token: user2.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmRemoveRet.res.statusCode).toBe(403);
  });
  test('Test 4: dmId is valid but authorised user is no longer in DM', () => {
    const ret = postDmLeave({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(ret.bodyObj).toStrictEqual({});
    const dmRemoveRet = dmRemove({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmRemoveRet.res.statusCode).toBe(403);
  });
  test('Test 5: success case: 2 DMS are created then 1 is removed', () => {
    // user1 creates dm1 with user1 & user2 & user3 as members,  user4 creates dm2 with user4 & user1 as members, dm1 is removed
    const createDm2 = postDmCreate({
      token: user4.bodyObj.token,
      uIds: [
        user1.bodyObj.authUserId,
      ]
    });
    const dmRemoveRet = dmRemove({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmRemoveRet.res.statusCode).toBe(OK);
    expect(dmRemoveRet.bodyObj).toStrictEqual({});
    // check if datastore is correct: user1 should only be apart of dm2 now
    const dmList = getDmList(user1.bodyObj.token);
    expect(dmList.res.statusCode).toBe(OK);
    expect(dmList.bodyObj).toStrictEqual({
      dms: [
        {
          dmId: createDm2.bodyObj.dmId,
          name: 'ethanlam, lucywang',
        }
      ]
    });
  });
  test('Test 6: success case: 1DM is created, 1DM is removed', () => {
    // user1 creates dm1 with user1 & user2 & user3 as members,  user1 deletes dm1
    const dmRemoveRet = dmRemove({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmRemoveRet.res.statusCode).toBe(OK);
    expect(dmRemoveRet.bodyObj).toStrictEqual({});
    // check if datastore is correct: user1 should be apart of no dms now
    const dmList = getDmList(user1.bodyObj.token);
    expect(dmList.res.statusCode).toBe(OK);
    expect(dmList.bodyObj).toStrictEqual({
      dms: [
      ]
    });
  });
  test('Test 7: success case: 2 DMS are created then 1 is removed', () => {
    // user1 creates dm1 with user1 & user2 & user3 as members,  user4 creates dm2 with user4 as members, dm1 is removed
    const createDm2 = postDmCreate({
      token: user4.bodyObj.token,
      uIds: [
      ]
    });
    const dmRemoveRet = dmRemove({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmRemoveRet.res.statusCode).toBe(OK);
    expect(dmRemoveRet.bodyObj).toStrictEqual({});
    // check if datastore is correct: user4 should be in dm2
    const dmList = getDmList(user4.bodyObj.token);
    expect(dmList.res.statusCode).toBe(OK);
    expect(dmList.bodyObj).toStrictEqual({
      dms: [
        {
          dmId: createDm2.bodyObj.dmId,
          name: 'lucywang',
        }
      ]
    });
  });
  test('Test 8: error if removing twice because the dmId should not be valid the second time', () => {
    dmRemove({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    const dmRemoveRet2 = dmRemove({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmRemoveRet2.res.statusCode).toBe(400);
  });
});

describe('Testing dm/messages/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let user4: any;
  let dm1: any;
  let message1: any;
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
      email: 'bob@gmail.com',
      password: 'password4',
      nameFirst: 'bob',
      nameLast: 'low',
    });

    dm1 = postDmCreate({
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId
      ]
    });

    message1 = postMessageSendDm({
      token: user1.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'hello everyone'
    });
  });

  test('Test 1: return error when token is invalid', () => {
    const dmMessages = getDmMessages({
      token: 'a',
      dmId: dm1.bodyObj.dmId,
      start: 0,
    });
    expect(dmMessages.res.statusCode).toBe(403);
  });

  test('Test 2: return error when dmId does not refer to a valid dm', () => {
    const dmMessages = getDmMessages({
      token: user2.bodyObj.token,
      dmId: -1,
      start: 0,
    });
    expect(dmMessages.res.statusCode).toBe(400);
  });

  test('Test 3: return error authUser is not a member of the dm', () => {
    const dmMessages = getDmMessages({
      token: user4.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      start: 0,
    });
    expect(dmMessages.res.statusCode).toBe(403);
  });

  test('Test 4: return error when start is greater than the number of messages in a dm', () => {
    const dmMessages = getDmMessages({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      start: 10,
    });
    expect(dmMessages.res.statusCode).toBe(400);
  });

  test('Test 5: successfully display one dm message in the dm', () => {
    const dmMessages = getDmMessages({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      start: 0,
    });
    expect(dmMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: message1.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'hello everyone',
          timeSent: expect.any(Number),
        }
      ],
      start: 0,
      end: -1,
    });
    expect(dmMessages.res.statusCode).toBe(OK);
  });

  test('Test 6: successfully display multiple dm messages in the dm', () => {
    const message2 = postMessageSendDm({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'Hey mate'
    });

    const dmMessages = getDmMessages({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      start: 0,
    });

    expect(dmMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: message2.bodyObj.messageId,
          uId: user2.bodyObj.authUserId,
          message: 'Hey mate',
          timeSent: expect.any(Number),
        },
        {
          messageId: message1.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'hello everyone',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
    expect(dmMessages.res.statusCode).toBe(OK);
  });

  test('Test 7: successfully display the oldest dm message in the dm', () => {
    postMessageSendDm({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'Hey mate'
    });

    const dmMessages = getDmMessages({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      start: 1,
    });

    expect(dmMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: message1.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'hello everyone',
          timeSent: expect.any(Number),
        },
      ],
      start: 1,
      end: -1,
    });
    expect(dmMessages.res.statusCode).toBe(OK);
  });

  test('Test 8: successfully display the 2 dm message in the desired dm', () => {
    const user5 = postAuthReg({
      email: 'jessica@gmail.com',
      password: 'password10',
      nameFirst: 'jessica',
      nameLast: 'bee',
    });

    const dm2 = postDmCreate({
      token: user4.bodyObj.token,
      uIds: [user5.bodyObj.authUserId]
    });

    postMessageSendDm({
      token: user5.bodyObj.token,
      dmId: dm2.bodyObj.dmId,
      message: 'Hi bob',
    });

    const message2 = postMessageSendDm({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      message: 'Hey mate'
    });

    const dmMessages = getDmMessages({
      token: user2.bodyObj.token,
      dmId: dm1.bodyObj.dmId,
      start: 0,
    });

    expect(dmMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: message2.bodyObj.messageId,
          uId: user2.bodyObj.authUserId,
          message: 'Hey mate',
          timeSent: expect.any(Number),
        },
        {
          messageId: message1.bodyObj.messageId,
          uId: user1.bodyObj.authUserId,
          message: 'hello everyone',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
    expect(dmMessages.res.statusCode).toBe(OK);
  });
});

// testing dm/details/v1
describe('Testing dm/details/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let user4: any;
  let createDm1: any;
  beforeEach(() => { // before each test, a DM is created that contains 1 as owner and user 2 & user 3 as other members
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
      email: 'jason@gmail.com',
      password: 'password2',
      nameFirst: 'jason',
      nameLast: 'he',
    });

    user3 = postAuthReg({
      email: 'daniel@gmail.com',
      password: 'password3',
      nameFirst: 'daniel',
      nameLast: 'huynh',
    });
    user4 = postAuthReg({
      email: 'lucy@gmail.com',
      password: 'password4',
      nameFirst: 'lucy',
      nameLast: 'wang',
    });
    createDm1 = postDmCreate({ // dm1 contains user1,2,3
      token: user1.bodyObj.token,
      uIds: [
        user2.bodyObj.authUserId,
        user3.bodyObj.authUserId,
      ]
    });
  });
  test('Test 1: token is not valid', () => {
    const dmDetailsRet = getDmDetails({
      token: user1.bodyObj.token + 'a',
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmDetailsRet.res.statusCode).toBe(403);
  });
  test('Test 2: dmId refers to dmId that has not existed before', () => {
    const dmDetailsRet = getDmDetails({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId * -1,
    });
    expect(dmDetailsRet.res.statusCode).toBe(400);
  });
  test('Test 3: dmId refers to a DM that got removed, in other words, a DM that previously existed (still counts as invalid dmId)', () => {
    dmRemove({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    const dmDetailsRet = getDmDetails({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId
    });
    expect(dmDetailsRet.res.statusCode).toBe(400);
  });
  test('Test 4: dmId is valid but authorised user is not a member of the of DM', () => {
    const dmDetailsRet = getDmDetails({
      token: user4.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmDetailsRet.res.statusCode).toBe(403);
  });
  test('Test 5: dmId is valid but authorised user left the DM', () => {
    postDmLeave({
      token: user2.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    const dmDetailsRet = getDmDetails({
      token: user2.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmDetailsRet.res.statusCode).toBe(403);
  });
  test('Test 6: success case, owner & member of DM both call dm/details', () => {
    const dmDetailsRet1 = getDmDetails({
      token: user1.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmDetailsRet1.res.statusCode).toBe(OK);
    expect(dmDetailsRet1.bodyObj).toStrictEqual({
      name: 'danielhuynh, ethanlam, jasonhe',
      members: [
        {
          email: 'ethan@gmail.com',
          handleStr: 'ethanlam',
          nameFirst: 'ethan',
          nameLast: 'lam',
          uId: 1,
        },
        {
          email: 'jason@gmail.com',
          handleStr: 'jasonhe',
          nameFirst: 'jason',
          nameLast: 'he',
          uId: 2,
        },
        {
          email: 'daniel@gmail.com',
          handleStr: 'danielhuynh',
          nameFirst: 'daniel',
          nameLast: 'huynh',
          uId: 3,
        }
      ]
    });
    const dmDetailsRet2 = getDmDetails({
      token: user2.bodyObj.token,
      dmId: createDm1.bodyObj.dmId,
    });
    expect(dmDetailsRet2.res.statusCode).toBe(OK);
    expect(dmDetailsRet2.bodyObj).toStrictEqual({
      name: 'danielhuynh, ethanlam, jasonhe',
      members: [
        {
          email: 'ethan@gmail.com',
          handleStr: 'ethanlam',
          nameFirst: 'ethan',
          nameLast: 'lam',
          uId: 1,
        },
        {
          email: 'jason@gmail.com',
          handleStr: 'jasonhe',
          nameFirst: 'jason',
          nameLast: 'he',
          uId: 2,
        },
        {
          email: 'daniel@gmail.com',
          handleStr: 'danielhuynh',
          nameFirst: 'daniel',
          nameLast: 'huynh',
          uId: 3,
        }
      ]
    });
  });
  test('Test 7: success case, only owner in channel', () => {
    const createDm2 = postDmCreate({ // dm1 contains user1,2,3
      token: user4.bodyObj.token,
      uIds: [
      ]
    });
    const dmDetailsRet1 = getDmDetails({
      token: user4.bodyObj.token,
      dmId: createDm2.bodyObj.dmId,
    });
    expect(dmDetailsRet1.res.statusCode).toBe(OK);
    expect(dmDetailsRet1.bodyObj).toStrictEqual({
      name: 'lucywang',
      members: [
        {
          email: 'lucy@gmail.com',
          handleStr: 'lucywang',
          nameFirst: 'lucy',
          nameLast: 'wang',
          uId: 4,
        }
      ]
    });
  });
});
