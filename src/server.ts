import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { authRegisterV1, authLoginV1, authLogoutV1, PWResetRequestV1, PWResetV1 } from './auth';
import { makeToken, findToken } from './functionsHelper';
import { clearV1, notificationGetV1, searchV1 } from './other';
import { AuthUserId, ChannelId } from './typeDefinitions';
import { channelsCreateV1, channelsListallV1, channelsListV1 } from './channels';
import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 } from './channel';
import { channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 } from './channel2';
import { messageSendV1, messageEditV1, messageRemoveV1, messageSendlaterV1, messageSendlaterDmV1, messageReactV1, messageUnreactV1, messagePinV1, messageUnpinV1 } from './message';
import { userProfileV1, userProfileSetnameV1, usersAllV1, userProfileSetemailV1, userProfileSetHandleV1 } from './users';
import { dmCreateV1, dmListV1, dmLeaveV1, messageSendDmV1, dmRemoveV1, dmDetailsV1, dmMessagesV1 } from './dm';
import { standupActiveV1, standupSendV1, standupStartV1 } from './standup';
import { adminUserRemoveV1, userPermChangeV1 } from './admin';
import { messageShareV1 } from './msgshare';
import fs from 'fs';
import { setData } from './dataStore';
import HTTPError from 'http-errors';
import { userStatsV1 } from './stats';

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());

// for logging errors
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// ADMIN FUNCTIONS //

// admin/userpermission/change/v1
app.post('/admin/userpermission/change/v1', (req, res) => {
  const { uId, permissionId } = req.body;
  const token = req.header('token') as string;
  const authUserId = findToken(token) as AuthUserId;
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(userPermChangeV1(authUserId.authUserId, uId, permissionId));
  }
});

/* AUTH FUNCTIONS */
//  auth/register/v3
app.post('/auth/register/v3', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const ret = authRegisterV1(email, password, nameFirst, nameLast) as AuthUserId;

  // If authRegisterV1 returned error, return error.
  if (JSON.stringify(ret) === JSON.stringify({ error: 'error' })) { // how to compare two objects in javascript
    throw HTTPError(400, 'invalid input');
  } else {
    const authUserId = ret.authUserId;
    const token = makeToken(authUserId);
    res.json({ token: token, authUserId: authUserId });
  }
});

//  auth/login/v2
app.post('/auth/login/v3', (req, res) => {
  const { email, password } = req.body;
  const ret = authLoginV1(email, password) as AuthUserId;
  if (JSON.stringify(ret) === JSON.stringify({ error: 'error' })) { // how to compare two objects in javascript
    throw HTTPError(400, 'invalid input');
  } else {
    const authUserId = ret.authUserId;
    const token = makeToken(authUserId);
    res.json({ token: token, authUserId: authUserId });
  }
});

//  auth/logout/v2
app.post('/auth/logout/v2', (req, res) => {
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    authLogoutV1(token);
    res.json({});
  }
});

app.post('/auth/passwordreset/request/v1', (req, res) => {
  const { email } = req.body;
  res.json(PWResetRequestV1(email));
});

app.post('/auth/passwordreset/reset/v1', (req, res) => {
  const { resetCode, newPassword } = req.body;
  res.json(PWResetV1(resetCode, newPassword));
});

/* CHANNEL(S) FUNCTIONS */

// channels/create/v2
app.post('/channels/create/v3', (req, res) => {
  const { name, isPublic } = req.body;
  const token = req.header('token') as string;
  const authUserId = findToken(token) as AuthUserId;
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    const channelId = channelsCreateV1(authUserId.authUserId, name, isPublic) as ChannelId;
    if (JSON.stringify(channelId) === JSON.stringify({ error: 'error' })) {
      throw HTTPError(400, 'invalid input');
    } else {
      res.json({ channelId: channelId.channelId });
    }
  }
});

// channels/list/v2
app.get('/channels/list/v3', (req, res) => {
  // const token = req.query.token as string;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    const channels = channelsListV1(user.authUserId);
    if (JSON.stringify(channels) === JSON.stringify({ error: 'error' })) {
      res.json({ error: 'error' });
    } else {
      res.json(channels);
    }
  }
});

app.get('/channels/listall/v3', (req, res) => {
  // const token = req.query.token as string;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user == null) {
    throw HTTPError(403, 'invalid token');
  } else {
    const channelsAll = channelsListallV1(user.authUserId);
    if (JSON.stringify(channelsAll) === JSON.stringify({ error: 'error' })) {
      res.json({ error: 'error' });
    } else {
      res.json(channelsAll);
    }
  }
});

/* CHANNEL FUNCTIONS */
//  channel/details/v2
app.get('/channel/details/v3', (req, res) => {
  // const token = req.query.token as string;
  const token = req.header('token') as string;
  const channelId = req.query.channelId as any;
  const user = findToken(token) as AuthUserId;
  if (user == null) {
    throw HTTPError(403, 'invalid token');
  } else {
    const channelDetails = channelDetailsV1(user.authUserId, parseInt(channelId));
    if (JSON.stringify(channelDetails) === JSON.stringify({ error: '400' })) {
      throw HTTPError(400, 'invalid channel');
    } else if (JSON.stringify(channelDetails) === JSON.stringify({ error: '403' })) {
      throw HTTPError(403, 'invalid permissions');
    } else {
      res.json(channelDetails);
    }
  }
});

//  channel/join/v2
app.post('/channel/join/v3', (req, res) => {
  const { channelId } = req.body;
  const token = req.header('token') as string;
  const authUserId = findToken(token) as AuthUserId;
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    const ret = channelJoinV1(authUserId.authUserId, channelId);
    if (JSON.stringify(ret) === JSON.stringify({ error: '400' })) {
      throw HTTPError(400, 'invalid input');
    } else if (JSON.stringify(ret) === JSON.stringify({ error: '403' })) {
      throw HTTPError(403, 'invalid permissions');
    } else {
      res.json({});
    }
  }
});

//  channel/invite/v3
app.post('/channel/invite/v3', (req, res) => {
  const { channelId, uId } = req.body;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(channelInviteV1(user.authUserId, channelId, uId));
  }
});

//  channel/leave/v1
app.post('/channel/leave/v2', (req, res) => {
  const { channelId } = req.body;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(channelLeaveV1(user.authUserId, channelId));
  }
});

// channel/addowner/v2
app.post('/channel/addowner/v2', (req, res) => {
  const { channelId, uId } = req.body;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const channelAddOwnerRet = channelAddOwnerV1(user.authUserId, channelId, uId);
    // if (JSON.stringify(channelAddOwnerRet) === JSON.stringify({ error: 'error' })) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json({});
    // }
    res.json(channelAddOwnerV1(user.authUserId, channelId, uId));
  }
});

// channel/removeowner/v2
app.post('/channel/removeowner/v2', (req, res) => {
  const { channelId, uId } = req.body;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const channelRemoveOwner = channelRemoveOwnerV1(user.authUserId, channelId, uId);
    // if (JSON.stringify(channelRemoveOwner) === JSON.stringify({ error: 'error' })) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json({});
    // }
    res.json(channelRemoveOwnerV1(user.authUserId, channelId, uId));
  }
});

//  channel/message/v3
app.get('/channel/messages/v3', (req, res) => {
  const token = req.header('token') as string;
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  const userId = findToken(token) as AuthUserId;
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(channelMessagesV1(userId.authUserId, channelId, start));
  }
});

/* USER FUNCTIONS */

//  user/profile/v2

app.get('/user/profile/v3', (req, res) => {
  const token = req.header('token') as string;
  const uId = parseInt(req.query.uId as string);
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const userProfile = userProfileV1(user.authUserId, uId);
    // if (JSON.stringify(userProfile) === JSON.stringify({ error: 'error' })) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json(userProfile);
    // }
    res.json(userProfileV1(user.authUserId, uId));
  }
});

//  user/profile/setname/v2
app.put('/user/profile/setname/v2', (req, res) => {
  const { nameFirst, nameLast } = req.body;
  const token = req.header('token') as string;

  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const changeUserName = userProfileSetnameV1(user.authUserId, nameFirst, nameLast);
    // if (changeUserName === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json({});
    // }
    res.json(userProfileSetnameV1(user.authUserId, nameFirst, nameLast));
  }
});

//  user/profile/setemail/v2
app.put('/user/profile/setemail/v2', (req, res) => {
  const { email } = req.body;
  const token = req.header('token') as string;

  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const changeEmail = userProfileSetemailV1(user.authUserId, email);
    // if (changeEmail === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json({});
    // }
    res.json(userProfileSetemailV1(user.authUserId, email));
  }
});
// users/all/v1

app.get('/users/all/v2', (req, res) => {
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user == null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const usersAll = usersAllV1(user.authUserId);
    // if (JSON.stringify(usersAll) === JSON.stringify({ error: 'error' })) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json(usersAll);
    // }
    res.json(usersAllV1(user.authUserId));
  }
});

app.put('/user/profile/sethandle/v2', (req, res) => {
  const { handleStr } = req.body;
  const token = req.header('token') as string;

  const userId = findToken(token) as AuthUserId;

  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const changeHandle = userProfileSetHandleV1(userId.authUserId, handleStr);
    // if (changeHandle === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json({});
    // }
    res.json(userProfileSetHandleV1(userId.authUserId, handleStr));
  }
});

/* OTHER FUNCTIONS */
app.delete('/clear/v1', (req, res) => {
  clearV1();
  const resetData = {
    users: [] as any,
    channels: [] as any,
    channelMessages: [] as any,
    dms: [] as any,
    dmMessages: [] as any,
  };
  fs.writeFileSync('src/data.json', JSON.stringify(resetData), { flag: 'w' });
  res.json({});
});

/* MESSAGE FUNCTIONS */

// messageSendV2//
app.post('/message/send/v2', (req, res) => {
  const { channelId, message } = req.body;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const messageSend = messageSendV1(token, channelId, message);
    // if (messageSend === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json(messageSend);
    // }
    res.json(messageSendV1(token, channelId, message));
  }
});

// messageEditV2//
app.put('/message/edit/v2', (req, res) => {
  const { messageId, message } = req.body;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const messageEdit = messageEditV1(token, messageId, message);
    // if (messageEdit === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json({});
    // }
    res.json(messageEditV1(token, messageId, message));
  }
});

// messageRemoveV2//
app.delete('/message/remove/v2', (req, res) => {
  const token = req.header('token') as string;
  const messageId = req.query.messageId as any;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const messageRemove = messageRemoveV1(token, parseInt(messageId));
    // if (messageRemove === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json({});
    // }
    res.json(messageRemoveV1(token, parseInt(messageId)));
  }
});

//  messageSendLaterV1
app.post('/message/sendlater/v1', (req, res) => {
  const token = req.headers.token as string;
  const { message, timeSent, channelId } = req.body;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    const messageId = messageSendlaterV1(user.authUserId, channelId, message, timeSent);
    res.json({ messageId: messageId });
  }
});

//  messageSendLaterDm
app.post('/message/sendlaterdm/v1', (req, res) => {
  const { dmId, message, timeSent } = req.body;
  const token = req.headers.token as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'Invalid Token');
  } else {
    const messageId = messageSendlaterDmV1(user.authUserId, dmId, message, timeSent);
    res.json({ messageId: messageId });
  }
});

// message/react/v1
app.post('/message/react/v1', (req, res) => {
  const { messageId, reactId } = req.body;
  const token = req.header('token') as string;
  const userId = findToken(token) as AuthUserId;
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(messageReactV1(token, messageId, reactId));
  }
});

// message/unreact/v1
app.post('/message/unreact/v1', (req, res) => {
  const { messageId, reactId } = req.body;
  const token = req.header('token') as string;
  const userId = findToken(token) as AuthUserId;
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(messageUnreactV1(token, messageId, reactId));
  }
});

// message/pin/v1
app.post('/message/pin/v1', (req, res) => {
  const { messageId } = req.body;
  const token = req.header('token') as string;
  const userId = findToken(token) as AuthUserId;
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(messagePinV1(token, messageId));
  }
});

// message/unpin/v1
app.post('/message/unpin/v1', (req, res) => {
  const { messageId } = req.body;
  const token = req.header('token') as string;
  const userId = findToken(token) as AuthUserId;
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(messageUnpinV1(token, messageId));
  }
});

/* DM FUNCTIONS */

app.post('/dm/create/v2', (req, res) => {
  const { uIds } = req.body;
  const token = req.header('token') as string;
  const userId = findToken(token) as AuthUserId;
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const createDm = dmCreateV1(userId.authUserId, uIds);
    // if (createDm === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json({ dmId: createDm });
    // }
    res.json(dmCreateV1(userId.authUserId, uIds));
  }
});

app.post('/dm/leave/v2', (req, res) => {
  const { dmId } = req.body;
  const token = req.header('token') as string;
  const userId = findToken(token) as AuthUserId;
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const leavingDm = dmLeaveV1(userId.authUserId, dmId);
    // if (leavingDm === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json({});
    // }
    res.json(dmLeaveV1(userId.authUserId, dmId));
  }
});

app.get('/dm/list/v2', (req, res) => {
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user == null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const dmList = dmListV1(user.authUserId);
    // if (dmList === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json(dmList);
    // }
    res.json(dmListV1(user.authUserId));
  }
});

app.post('/message/senddm/v2', (req, res) => {
  const { dmId, message } = req.body;
  const token = req.header('token') as string;
  const userId = findToken(token) as AuthUserId;
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const sendDm = messageSendDmV1(userId.authUserId, dmId, message);
    // if (sendDm === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json(sendDm);
    // }
    res.json(messageSendDmV1(userId.authUserId, dmId, message));
  }
});

app.delete('/dm/remove/v2', (req, res) => {
  const token = req.header('token') as string;
  const dmId = req.query.dmId as any;
  const user = findToken(token) as AuthUserId;
  if (user == null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const dmRemove = dmRemoveV1(user.authUserId, parseInt(dmId));
    // if (dmRemove === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json(dmRemove);
    // }
    res.json(dmRemoveV1(user.authUserId, parseInt(dmId)));
  }
});

app.get('/dm/messages/v2', (req, res) => {
  const token = req.header('token') as string;
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);

  const userId = findToken(token) as AuthUserId;
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const displayMessages = dmMessagesV1(userId.authUserId, dmId, start);
    // if (displayMessages === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json({
    //     messages: displayMessages.messagesArray,
    //     start: start,
    //     end: displayMessages.end,
    //   });
    // }
    res.json(dmMessagesV1(userId.authUserId, dmId, start));
  }
});

app.get('/dm/details/v2', (req, res) => {
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  const dmId = req.query.dmId as any;
  if (user == null) {
    throw HTTPError(403, 'invalid token');
  } else {
    // const dmDetails = dmDetailsV1(user.authUserId, parseInt(dmId));
    // if (dmDetails === null) {
    //   res.json({ error: 'error' });
    // } else {
    //   res.json(dmDetails);
    // }
    res.json(dmDetailsV1(user.authUserId, parseInt(dmId)));
  }
});

// OTHER FUNCTION //

app.get('/notifications/get/v2', (req, res) => {
  const token = req.headers.token as string;
  const user = findToken(token);
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(notificationGetV1(user.authUserId));
  }
});

app.get('/search/v1', (req, res) => {
  const token = req.headers.token as string;
  const queryStr = req.query.queryStr as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    const messages = searchV1(queryStr);
    res.json({ messages: messages });
  }
});

app.delete('/admin/user/remove/v1', (req, res) => {
  const token = req.headers.token as string;
  const uId = Number(req.query.uId as string);
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'Invalid Token');
  } else {
    adminUserRemoveV1(user.authUserId, uId);
    res.json({});
  }
});

// messageShareV1
app.post('/message/share/v1', (req, res) => {
  const { ogMessageId, message, channelId, dmId } = req.body;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(messageShareV1(user.authUserId, ogMessageId, message, channelId, dmId));
  }
});

app.get('/user/stats/v1', (req, res) => {
  const token = req.headers.token as string;
  const user = findToken(token);
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(userStatsV1(user.authUserId));
  }
});

// STANDUP

// standupStartV1
app.post('/standup/start/v1', (req, res) => {
  const { channelId, length } = req.body;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(standupStartV1(token, channelId, length));
  }
});

// standupActiveV1
app.get('/standup/active/v1', (req, res) => {
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  const channelId = req.query.channelId as any;
  if (user == null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(standupActiveV1(token, parseInt(channelId)));
  }
});

// standupSendV1
app.post('/standup/send/v1', (req, res) => {
  const { channelId, message } = req.body;
  const token = req.header('token') as string;
  const user = findToken(token) as AuthUserId;
  if (user === null) {
    throw HTTPError(403, 'invalid token');
  } else {
    res.json(standupSendV1(token, channelId, message));
  }
});

// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  const storedData = fs.readFileSync('src/data.json', { flag: 'r' });
  setData(JSON.parse(String(storedData)));
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
