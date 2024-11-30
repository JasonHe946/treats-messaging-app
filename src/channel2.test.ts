import { postAuthReg, postChannelsCreate, getChannelDetails, postChannelJoin, postChannelInvite, postChannelLeave, postChannelAddOwner, postChannelRemoveOwner, postStandupStart } from './testingHelper';

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

// channel/leave/v1
describe('Testing channel/leave/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channelPrivate: any;
  let channelPublic: any;
  beforeEach(() => { // before each test, there are 3 users that are defined
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
  test('Test 1: channelId is not valid for public channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const channelLeave = postChannelLeave({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId - 50,
    });
    expect(channelLeave.res.statusCode).toBe(400);
  });

  test('Test 2: channelId is not valid for private channel', () => {
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    const channelLeave = postChannelLeave({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId + 100,
    });
    expect(channelLeave.res.statusCode).toBe(400);
  });

  test('Test 3: token is invalid', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const channelLeave = postChannelLeave({
      token: user1.bodyObj.token + 'a',
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(channelLeave.res.statusCode).toBe(403);
  });

  test('Test 4: random user not in public channel tries to leave public channel ', () => {
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
    const channelLeave = postChannelLeave({
      token: user2.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(channelLeave.res.statusCode).toBe(403);
  });

  test('Test 5: random user not in private channel tries to leave private channel', () => {
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
    const channelLeave = postChannelLeave({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
    });
    expect(channelLeave.res.statusCode).toBe(403);
  });

  test('Test 6: valid input, member leaves public channel which currently has 2 people', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    // user1 and user3 are now in channelPublic

    // user3 now leaves
    const channelLeave = postChannelLeave({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(channelLeave.res.statusCode).toBe(OK);
    expect(channelLeave.bodyObj).toStrictEqual({});
    const details = getChannelDetails({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
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

  test('Test 7: valid input, owner leaves public channel which currently has 2 people', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    // user1 and user3 are now in channelPublic

    // the owner (user 1) now leaves
    const channelLeave = postChannelLeave({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(channelLeave.res.statusCode).toBe(OK);
    expect(channelLeave.bodyObj).toStrictEqual({});

    const details = getChannelDetails({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(details.queryObj).toStrictEqual({
      name: 'channelPublic',
      isPublic: true,
      ownerMembers: [
      ],
      allMembers: [
        {
          email: 'vincent@hotmail.com',
          handleStr: 'vincentnguyen',
          nameFirst: 'Vincent',
          nameLast: 'Nguyen',
          uId: 3,
        }
      ]
    });
  });

  test('Test 8: valid input, owner leaves private channel', () => {
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    // owner now leaves
    const channelLeave = postChannelLeave({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
    });
    expect(channelLeave.res.statusCode).toBe(OK);
    expect(channelLeave.bodyObj).toStrictEqual({});
  });

  test('Test 9: user is the starter of an active standup in the channel', () => {
    const channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true,
    });
    postStandupStart({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
      length: 10
    });
    const create = postChannelLeave({
      token: user1.bodyObj.token,
      channelId: channel1.bodyObj.channelId,
    });
    expect(create.res.statusCode).toBe(400);
  });
});

// Testing channel/addowner/v1
describe('Testing channel/addowner/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channelPrivate: any;
  let channelPublic: any;
  beforeEach(() => { // before each test, there are 3 users that are defined
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

  test('Test 1: channelId is not valid', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    // user 1 is trying to promote user 3 to addowner but channelId is invalid
    const channeladdownerRet = postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId + 50,
      uId: user3.bodyObj.authUserId,
    });
    expect(channeladdownerRet.res.statusCode).toBe(400);
  });

  test('Test 2: uId is not valid', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    // user 1 is trying to promote user 3 to addowner
    const channeladdownerRet = postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId - 50,
    });
    expect(channeladdownerRet.res.statusCode).toBe(400);
  });

  test('Test 2: uId is not valid in a public channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    // user 1 is trying to promote user 3 to addowner
    const channeladdownerRet = postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId - 50,
    });
    expect(channeladdownerRet.res.statusCode).toBe(400);
  });

  test('Test 3: uId refers to user who is not a member of public channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    // user 1 is trying to promote a non-member to an owner
    const channeladdownerRet = postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(channeladdownerRet.res.statusCode).toBe(400);
  });

  test('Test 4: uId refers to user who is already an owner of public channel (promoting twice)', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    // user 1 is trying promote user3 to owner twice
    postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    const ret2 = postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    expect(ret2.res.statusCode).toBe(400);
  });

  test('Test 5: channelId is valid but authorised user does not have owner permissions in public channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    const user4 = postAuthReg({
      email: 'lucy@hotmail.com',
      password: 'password4',
      nameFirst: 'Lucinda',
      nameLast: 'Wang',
    });
    postChannelJoin({
      token: user4.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    // member user3 is trying to promote user4 to owner
    const ret = postChannelAddOwner({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user4.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(403);
  });

  test('Test 6: token is invalid', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const ret = postChannelAddOwner({
      token: user1.bodyObj.token + 'a',
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(403);
  });

  test('Test 7: valid input, adding a channel owner in a public channel', () => {
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    // user 1 adds user 3 as an owner
    const ret = postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});

    // check the datastore if its correct
    const details = getChannelDetails({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
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
        },
        {
          email: 'vincent@hotmail.com',
          handleStr: 'vincentnguyen',
          nameFirst: 'Vincent',
          nameLast: 'Nguyen',
          uId: 3,
        }
      ],
      allMembers: [
        {
          email: 'jason@hotmail.com',
          handleStr: 'jasonhe',
          nameFirst: 'Jason',
          nameLast: 'He',
          uId: 1,
        },
        {
          email: 'vincent@hotmail.com',
          handleStr: 'vincentnguyen',
          nameFirst: 'Vincent',
          nameLast: 'Nguyen',
          uId: 3,
        }
      ]
    });
  });

  test('Test 8: valid input, adding a channel owner in a private channel', () => {
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    postChannelInvite({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    // user 2 adds user 3 as an owner
    const ret = postChannelAddOwner({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});

    // check the datastore if its correct
    const details = getChannelDetails({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
    });
    expect(details.queryObj).toStrictEqual({
      name: 'channelPrivate',
      isPublic: false,
      ownerMembers: [
        {
          email: 'daniel@hotmail.com',
          handleStr: 'danielhuynh',
          nameFirst: 'Daniel',
          nameLast: 'Huynh',
          uId: 2,
        },
        {
          email: 'vincent@hotmail.com',
          handleStr: 'vincentnguyen',
          nameFirst: 'Vincent',
          nameLast: 'Nguyen',
          uId: 3,
        }
      ],
      allMembers: [
        {
          email: 'daniel@hotmail.com',
          handleStr: 'danielhuynh',
          nameFirst: 'Daniel',
          nameLast: 'Huynh',
          uId: 2,
        },
        {
          email: 'vincent@hotmail.com',
          handleStr: 'vincentnguyen',
          nameFirst: 'Vincent',
          nameLast: 'Nguyen',
          uId: 3,
        }
      ]
    });
  });

  test('Test 8: global member in channels having owner permissions', () => {
    channelPublic = postChannelsCreate({
      token: user3.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    const user4 = postAuthReg({
      email: 'lucy@hotmail.com',
      password: 'password4',
      nameFirst: 'Lucinda',
      nameLast: 'Wang',
    });
    postChannelJoin({
      token: user4.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    // user 1 promotes user 4 to owner
    const ret = postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user4.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});
  });
});

// testing channel/remove/owner/v1
describe('Testing channel/removeowner/v1', () => {
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
  test('Test 1: channelId is not valid', () => {
    // create public channel, add user3, promot user3 to owner, remove user3 as owner
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    const ret = postChannelRemoveOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId - 50,
      uId: user3.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 2: uId is not valid', () => {
    // create public channel, add user3, promot user3 to owner, remove user3 as owner
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    const ret = postChannelRemoveOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId - 50,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 3: uId refers to user who is not an owner of channel', () => {
    // create public channel, add user3 as member, try to remove user3 as owner
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    const ret = postChannelRemoveOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 4: uId refers to only owner of the public channel', () => {
    // create public channel (user 2 is creator), user1 joins (global owner) then removes user2 as owner
    channelPublic = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    const ret = postChannelRemoveOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 5: uId refers to only owner of the private channel', () => {
    // create private channel (user 2 is creator), user1 is invited (global owner) then removes user2 as owner
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    postChannelInvite({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user1.bodyObj.authUserId,
    });
    const ret = postChannelRemoveOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 6: uId refers to only owner of the public channel who removes themself', () => {
    // create public channel (user1 is creator), tries to remove themself
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const ret = postChannelRemoveOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user1.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(400);
  });

  test('Test 7: channelId is valid but authorised member does not have owner permissions for public channel', () => {
    // user1 creates public channel, user3 joins as member, user1 adds user3 as owner, user2 joins, user2 tries to remove user3 as owner
    // we have to have 2 owners at least, otherwise this will fall into the previous error case
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    const ret = postChannelRemoveOwner({
      token: user2.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(403);
  });

  test('Test 8: channelId is valid but authorised member does not have owner permissions for private', () => {
    // user1 creates private channel, user3 is invited as member, user1 adds user3 as owner, user2 is invited as member, user2 tries to remove user3 as owner
    // we have to have 2 owners at least, otherwise this will fall into the previous error case
    channelPrivate = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    postChannelInvite({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    const ret = postChannelRemoveOwner({
      token: user2.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(403);
  });
  test('Test 9: success case for remove owner', () => {
    // user1 creates public channel, user3 joins, user1 adds user3 as owner, user 1 removes user3 as owner
    channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    postChannelAddOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    const ret = postChannelRemoveOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user3.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});

    // check the datastore if its correct, user1 as owner, user1 & user3 as members
    const details = getChannelDetails({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
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
        },
      ],
      allMembers: [
        {
          email: 'jason@hotmail.com',
          handleStr: 'jasonhe',
          nameFirst: 'Jason',
          nameLast: 'He',
          uId: 1,
        },
        {
          email: 'vincent@hotmail.com',
          handleStr: 'vincentnguyen',
          nameFirst: 'Vincent',
          nameLast: 'Nguyen',
          uId: 3,
        }
      ]
    });
  });
  test('Test 10: testing valid input for private channel', () => {
    // user2 creates channel, user2 invites user1, user2 adds user1 as owner, user2 removes user1 as owner
    channelPrivate = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    postChannelInvite({
      token: user2.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
      uId: user1.bodyObj.authUserId,
    });
    postChannelAddOwner({
      token: user2.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user1.bodyObj.authUserId,
    });
    const ret = postChannelRemoveOwner({
      token: user2.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user1.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});

    // check the datastore if its correct, user2 as owner, user1 & user2 are members
    const details = getChannelDetails({
      token: user1.bodyObj.token,
      channelId: channelPrivate.bodyObj.channelId,
    });
    expect(details.queryObj).toStrictEqual({
      name: 'channelPrivate',
      isPublic: false,
      ownerMembers: [
        {
          email: 'daniel@hotmail.com',
          handleStr: 'danielhuynh',
          nameFirst: 'Daniel',
          nameLast: 'Huynh',
          uId: 2,
        },
      ],
      allMembers: [
        {
          email: 'daniel@hotmail.com',
          handleStr: 'danielhuynh',
          nameFirst: 'Daniel',
          nameLast: 'Huynh',
          uId: 2,
        },
        {
          email: 'jason@hotmail.com',
          handleStr: 'jasonhe',
          nameFirst: 'Jason',
          nameLast: 'He',
          uId: 1,
        },
      ]
    });
  });

  test('Test 11: checking if global owner can remove owner', () => {
    // user3 creates public channel, user1 joins, user2 joins, user3 adds user2 as owner, user1 (global owner) removes user2 as owner
    channelPublic = postChannelsCreate({
      token: user3.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    postChannelJoin({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    postChannelJoin({
      token: user2.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    postChannelAddOwner({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    const ret = postChannelRemoveOwner({
      token: user1.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
      uId: user2.bodyObj.authUserId,
    });
    expect(ret.res.statusCode).toBe(OK);
    expect(ret.bodyObj).toStrictEqual({});

    // check the datastore if its correct, user3 is owner, user3 & user2 & user1 are members
    const details = getChannelDetails({
      token: user3.bodyObj.token,
      channelId: channelPublic.bodyObj.channelId,
    });
    expect(details.queryObj).toStrictEqual({
      name: 'channelPublic',
      isPublic: true,
      ownerMembers: [
        {
          email: 'vincent@hotmail.com',
          handleStr: 'vincentnguyen',
          nameFirst: 'Vincent',
          nameLast: 'Nguyen',
          uId: 3,
        },
      ],
      allMembers: [
        {
          email: 'vincent@hotmail.com',
          handleStr: 'vincentnguyen',
          nameFirst: 'Vincent',
          nameLast: 'Nguyen',
          uId: 3,
        },
        {
          email: 'jason@hotmail.com',
          handleStr: 'jasonhe',
          nameFirst: 'Jason',
          nameLast: 'He',
          uId: 1,
        },
        {
          email: 'daniel@hotmail.com',
          handleStr: 'danielhuynh',
          nameFirst: 'Daniel',
          nameLast: 'Huynh',
          uId: 2,
        },
      ]
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
