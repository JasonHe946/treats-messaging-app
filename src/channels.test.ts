import { getChannelsList, postAuthReg, postChannelsCreate, getChannelsListAll } from './testingHelper';

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

// channels/create/v2
describe('Testing channels/create/v2', () => {
  let user1: any;
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
      nameFirst: 'Jason',
      nameLast: 'He'
    });
  });

  test('Test 1: correct inputs, return channelId', () => {
    const create = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'comp1531',
      isPublic: true
    });
    expect(create.bodyObj).toStrictEqual({ channelId: create.bodyObj.channelId });
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 2: (error) length of name is 0, return error', () => {
    const create = postChannelsCreate({
      token: user1.bodyObj.token,
      name: '',
      isPublic: true
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 3: (error) length of name is greater than 20, return error', () => {
    const create = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'abcdefghijklmnopqrstu',
      isPublic: true
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 4: (error) invalid authUserId, return error', () => {
    const create = postChannelsCreate({
      token: user1.bodyObj.token + 'a',
      name: 'comp1531',
      isPublic: true
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 5: creating a private channel', () => {
    const create = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'comp1531',
      isPublic: false
    });
    expect(create.bodyObj).toStrictEqual({ channelId: create.bodyObj.channelId });
    expect(create.res.statusCode).toBe(OK);
  });

  test('Test 6: (error) creating a private channel with an invalid authUserId, return error', () => {
    const create = postChannelsCreate({
      token: user1.bodyObj.token + 'a',
      name: 'comp1531',
      isPublic: false
    });
    expect(create.res.statusCode).toBe(403);
  });

  test('Test 7: (error) creating a private channel with the length of the name at 0, return error', () => {
    const create = postChannelsCreate({
      token: user1.bodyObj.token,
      name: '',
      isPublic: false
    });
    expect(create.res.statusCode).toBe(400);
  });

  test('Test 8: (error) creating a private channel with the length of the name greater than 20, return error', () => {
    const create = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'abcdefghijklmnopqrstu',
      isPublic: false
    });
    expect(create.res.statusCode).toBe(400);
  });
});

describe('Testing channels/List/V2', () => {
  let user1: any;
  let user2: any;
  let channel1: any;
  let channel2: any;
  let channel3: any;
  let channel4: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'lam',
    });

    user2 = postAuthReg({
      email: 'calvin@gmail.com',
      password: 'apple123',
      nameFirst: 'calvin',
      nameLast: 'ale',
    });

    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true,
    });
    channel2 = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channel2',
      isPublic: true,
    });

    channel3 = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channel3',
      isPublic: true,
    });

    channel4 = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channel4',
      isPublic: false,
    });
  });
  test("Test 1: If user's token does not exist, return error", () => {
    const channelsList = getChannelsList(user1.bodyObj.token + 'a');
    expect(channelsList.res.statusCode).toBe(403);
  });

  test('Test 2: Output a single channel', () => {
    const channelsList = getChannelsList(user1.bodyObj.token);
    expect(channelsList.queryObj.channels).toStrictEqual([
      {
        channelId: channel1.bodyObj.channelId,
        name: 'channel1'
      }
    ]);
    expect(channelsList.res.statusCode).toBe(OK);
  });

  test('Test 3: Output multiple channels', () => {
    const channelsList = getChannelsList(user2.bodyObj.token);
    expect(channelsList.queryObj.channels).toStrictEqual([
      {
        channelId: channel2.bodyObj.channelId,
        name: 'channel2'
      },
      {
        channelId: channel3.bodyObj.channelId,
        name: 'channel3'
      },
      {
        channelId: channel4.bodyObj.channelId,
        name: 'channel4'
      }
    ]);
    expect(channelsList.res.statusCode).toBe(OK);
  });

  test('Test 4: test member that is not assigned any channels', () => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'lam',
    });
    const channelsList = getChannelsList(user1.bodyObj.token);
    expect(channelsList.queryObj.channels).toStrictEqual([]);
    expect(channelsList.res.statusCode).toBe(OK);
  });

  test('test 5: test member that isnt part of any channels', () => {
    const user3 = postAuthReg({
      email: 'jason@gmail.com',
      password: 'letmesoloher',
      nameFirst: 'jason',
      nameLast: 'he',
    });

    const channelsList = getChannelsList(user3.bodyObj.token);
    expect(channelsList.queryObj.channels).toStrictEqual([]);
    expect(channelsList.res.statusCode).toBe(OK);
  });

  test('test 6: 1 channel', () => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );
    const user1 = postAuthReg({
      email: 'jason@gmail.com',
      password: 'letmesoloher',
      nameFirst: 'jason',
      nameLast: 'he',
    });

    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true,
    });

    const channelsList = getChannelsList(user1.bodyObj.token);
    expect(channelsList.queryObj.channels).toStrictEqual([{ channelId: channel1.bodyObj.channelId, name: 'channel1' }]);
  });
  // test('test 7: user gets invited and then calls function', () => {

  //     clearV1();
  //     let user1 = authRegisterV1('jason@gmail.com', 'apple123', 'jason', 'Ale');
  //     let user2 = authRegisterV1('calvin@gmail.com', 'apple123', 'Calvin', 'Ale');
  //     const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
  //     channelInviteV1(user1.authUserId, channel1.channelId, user2.authUserId);
  //     let deets = {'channelId': channel1.channelId, 'name': 'channel1'};
  //     expect(channelsListV1(user2.authUserId)['channels']).toContainEqual(deets);

  // });
});

describe('Testing channels/ListAll/v2', () => {
  let user1: any;
  let user2: any;
  let channel1: any;
  let channel2: any;
  let channel3: any;
  let channel4: any;
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );

    user1 = postAuthReg({
      email: 'ethan@gmail.com',
      password: 'password',
      nameFirst: 'Ethan',
      nameLast: 'lam',
    });

    user2 = postAuthReg({
      email: 'calvin@gmail.com',
      password: 'apple123',
      nameFirst: 'calvin',
      nameLast: 'ale',
    });

    channel1 = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channel1',
      isPublic: true,
    });
    channel2 = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channel2',
      isPublic: true,
    });

    channel3 = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channel3',
      isPublic: true,
    });

    channel4 = postChannelsCreate({
      token: user2.bodyObj.token,
      name: 'channel4',
      isPublic: false,
    });
  });

  test("Test 1: If user's token does not exist, return error", () => {
    const channelsListAll = getChannelsListAll(user1.bodyObj.token + 'a');
    expect(channelsListAll.res.statusCode).toBe(403);
  });

  test('Test 2: valid user1 using channelsListAll', () => {
    const channelsListAll = getChannelsListAll(user1.bodyObj.token);
    expect(channelsListAll.queryObj.channels).toStrictEqual([
      {
        channelId: channel1.bodyObj.channelId,
        name: 'channel1'
      },
      {
        channelId: channel2.bodyObj.channelId,
        name: 'channel2'
      },
      {
        channelId: channel3.bodyObj.channelId,
        name: 'channel3'
      },
      {
        channelId: channel4.bodyObj.channelId,
        name: 'channel4'
      }
    ]);
    expect(channelsListAll.res.statusCode).toBe(OK);
  });

  test('Test 3: valid user not in any channels using channelsListAll', () => {
    const user3 = postAuthReg({
      email: 'jason@gmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He',
    });
    const channelsListAll = getChannelsListAll(user3.bodyObj.token);
    expect(channelsListAll.queryObj.channels).toStrictEqual([
      {
        channelId: channel1.bodyObj.channelId,
        name: 'channel1'
      },
      {
        channelId: channel2.bodyObj.channelId,
        name: 'channel2'
      },
      {
        channelId: channel3.bodyObj.channelId,
        name: 'channel3'
      },
      {
        channelId: channel4.bodyObj.channelId,
        name: 'channel4'
      }
    ]);
    expect(channelsListAll.res.statusCode).toBe(OK);
  });

  test('Test 4: empty channels', () => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );
    const user1 = postAuthReg({
      email: 'jason@gmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He',
    });
    const response = getChannelsListAll(user1.bodyObj.token);
    expect(response.queryObj.channels).toStrictEqual([]);
    expect(response.res.statusCode).toBe(OK);
  });

  test('Test 5: one private channel', () => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );
    const user1 = postAuthReg({
      email: 'jason@gmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He',
    });
    const channelPrivate = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPrivate',
      isPublic: false,
    });
    const response = getChannelsListAll(user1.bodyObj.token);
    expect(response.queryObj.channels).toStrictEqual([
      {
        channelId: channelPrivate.bodyObj.channelId,
        name: 'channelPrivate'
      }
    ]);
    expect(response.res.statusCode).toBe(OK);
  });

  test('Test 6: one public channel', () => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      { qs: {} }
    );
    const user1 = postAuthReg({
      email: 'jason@gmail.com',
      password: 'password',
      nameFirst: 'Jason',
      nameLast: 'He',
    });
    const channelPublic = postChannelsCreate({
      token: user1.bodyObj.token,
      name: 'channelPublic',
      isPublic: true,
    });
    const response = getChannelsListAll(user1.bodyObj.token);
    expect(response.queryObj.channels).toStrictEqual([
      {
        channelId: channelPublic.bodyObj.channelId,
        name: 'channelPublic'
      }
    ]);

    expect(response.res.statusCode).toBe(OK);
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
  });
});

/// //channelsListV1/////
// describe('Testing for channelsListV1', () => {
//   let user;
//   let user2;
//   let channel1;
//   let channel2;
//   let channel3;
//   let channel4;
//   beforeEach(() => {
//     clearV1();
//     user = authRegisterV1('ethan@gmail.com', 'password', 'Ethan', 'lam');
//     user2 = authRegisterV1('calvin@gmail.com', 'apple123', 'Calvin', 'Ale');
//     channel1 = channelsCreateV1(user.authUserId, 'Channel1', true);
//     channel2 = channelsCreateV1(user2.authUserId, 'Channel2', true);
//     channel3 = channelsCreateV1(user2.authUserId, 'Channel3', true);
//     channel4 = channelsCreateV1(user2.authUserId, 'Channel4', false);
//   });
//   test('Test 1: (error) Check for authUserId exist', () => {
//     expect(channelsListV1(!user.authUserId)).toStrictEqual({ error: 'error' })
//   });
//   test('Test 2: Single Channel', () => {
//     expect(channelsListV1(user.authUserId)['channels']).toStrictEqual([
//       {
//         channelId: channel1.channelId,
//         name: 'Channel1'
//       }
//     ]);
//   });
//   test('Test 3: Multiple Channel', () => {
//     expect(channelsListV1(user2.authUserId)['channels']).toStrictEqual([
//       {
//         channelId: channel2.channelId,
//         name: 'Channel2'
//       },
//       {
//         channelId: channel3.channelId,
//         name: 'Channel3'
//       },
//       {
//         channelId: channel4.channelId,
//         name: 'Channel4'
//       }
//     ]);
//   });
//   test('test 4: test member when no channels exist', () => {
//     clearV1();
//     const user = authRegisterV1('ethan@gmail.com', 'password', 'Ethan', 'lam');
//     let res = channelsListV1(user.authUserId)['channels']
//     expect(res).toStrictEqual([]);

//   });
//   test('test 5: test member that isnt part of any channels', () => {
//     let user3 = authRegisterV1('jason@gmail.com', 'apple123', 'jason', 'Ale');
//     let res = channelsListV1(user3.authUserId)['channels']
//     expect(res).toStrictEqual([]);

//   });
//   test('test 6: 1 channel', () => {
//     clearV1();
//     let user = authRegisterV1('jason@gmail.com', 'apple123', 'jason', 'Ale');
//     const channel1 = channelsCreateV1(user.authUserId, 'channel1', true);
//     let deets = {'channelId': channel1.channelId, 'name': 'channel1'};
//     expect(channelsListV1(user.authUserId)['channels']).toContainEqual(deets);

//   });
//   test('test 7: user gets invited and then calls function', () => {
//     clearV1();
//     let user1 = authRegisterV1('jason@gmail.com', 'apple123', 'jason', 'Ale');
//     let user2 = authRegisterV1('calvin@gmail.com', 'apple123', 'Calvin', 'Ale');
//     const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
//     channelInviteV1(user1.authUserId, channel1.channelId, user2.authUserId);
//     let deets = {'channelId': channel1.channelId, 'name': 'channel1'};
//     expect(channelsListV1(user2.authUserId)['channels']).toContainEqual(deets);

//   });
// });
