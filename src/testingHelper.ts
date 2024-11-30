import { UserSetHandleStr, AuthRegisterDetails, AuthLoginDetails, channelsCreateDetails, channelDetailsV2, channelJoinBody, ChannelInvite, UserProfileInput, TokenType, ChannelLeave, ChannelAddOwner, UserSetnameType, UserSetemailType, ChannelRemoveOwner, DmCreateType, DmLeaveType, SendDmType, dmRemoveInput, dmDetailsInput, DmMessageInputType, ChannelMessagesType, MessageSendInput, MessageEditInput, MessageRemoveInput, MessageReactInput, MessagePinInput, userPermChangeBody, PWResetBody, MessageShareType, StandupStartInput, StandupSendInput, StandupActiveInput } from './typeDefinitions';
import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

// ADMIN FUNCTIONS //
// helper http function for /admin/userpermission/change/v1
export const postUserPermChange = (body: userPermChangeBody) => {
  const res = request(
    'POST',
    `${url}:${port}/admin/userpermission/change/v1`,
    {
      body: JSON.stringify({
        uId: body.uId,
        permissionId: body.permissionId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      },
    });
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

/* AUTH FUNCTIONS */

// helper http function for /auth/register/v2
export const postAuthReg = (body: AuthRegisterDetails) => {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      },
    });
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /auth/login/v2
export const postAuthLogin = (body: AuthLoginDetails) => {
  const res = request(
    'POST',
    `${url}:${port}/auth/login/v3`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      },
    });
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /auth/logout/v1
export const postAuthLogout = (body: TokenType) => {
  const res = request(
    'POST',
    `${url}:${port}/auth/logout/v2`,
    {
      body: JSON.stringify({}),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for auth/passwordreset/request/v1
export const postPWResetReq = (email: string) => {
  const res = request(
    'POST',
    `${url}:${port}/auth/passwordreset/request/v1`,
    {
      body: JSON.stringify({
        email: email,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for auth/passwordreset/reset/v1
export const postPWReset = (body: PWResetBody) => {
  const res = request(
    'POST',
    `${url}:${port}/auth/passwordreset/reset/v1`,
    {
      body: JSON.stringify({
        resetCode: body.resetCode,
        newPassword: body.newPassword,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

/* CHANNEL(S) FUNCTIONS */

// helper http function for /channels/create/v2`
// const postChannelsCreate = (body: channelsCreateDetails) => {
//   const res = request(
//     'POST',
//     `${url}:${port}/channels/create/v2`,
//     {
//       body: JSON.stringify(body),
//       headers: {
//         'Content-type': 'application/json',
//       },
//     });
//   const bodyObj = JSON.parse(String(res.getBody()));
//   return { res, bodyObj };
// };

export const postChannelsCreate = (body: channelsCreateDetails) => {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v3`,
    {
      body: JSON.stringify({
        name: body.name,
        isPublic: body.isPublic,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      },
    });
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /channels/list/v2
export const getChannelsList = (token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/channels/list/v3`,
    {
      qs: {},
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const queryObj = JSON.parse(String(res.getBody()));
  return { res, queryObj };
};

// helper http function for /channels/listall/v2
export const getChannelsListAll = (token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/channels/listall/v3`,
    {
      qs: {},
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const queryObj = JSON.parse(String(res.getBody()));
  return { res, queryObj };
};

/* CHANNEL FUNCTIONS */

// helper http function for /channel/details/v2
export const getChannelDetails = (query: channelDetailsV2) => {
  const res = request(
    'GET',
    `${url}:${port}/channel/details/v3`,
    {
      qs: {
        channelId: query.channelId,
      },
      headers: {
        token: query.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const queryObj = JSON.parse(String(res.getBody()));
  return { res, queryObj };
};

// helper http function for /channel/join/v3
export const postChannelJoin = (body: channelJoinBody) => {
  const res = request(
    'POST',
    `${url}:${port}/channel/join/v3`,
    {
      body: JSON.stringify({
        channelId: body.channelId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      },
    });
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /channel/invite/v2
export const postChannelInvite = (body: ChannelInvite) => {
  const res = request(
    'POST',
    `${url}:${port}/channel/invite/v3`,
    {
      body: JSON.stringify({
        channelId: body.channelId,
        uId: body.uId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /channel/leave/v2
export const postChannelLeave = (body: ChannelLeave) => {
  const res = request(
    'POST',
    `${url}:${port}/channel/leave/v2`,
    {
      body: JSON.stringify({
        channelId: body.channelId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /channel/addowner/v2
export const postChannelAddOwner = (body: ChannelAddOwner) => {
  const res = request(
    'POST',
    `${url}:${port}/channel/addowner/v2`,
    {
      body: JSON.stringify({
        channelId: body.channelId,
        uId: body.uId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /channel/removeowner/v2
export const postChannelRemoveOwner = (body: ChannelRemoveOwner) => {
  const res = request(
    'POST',
    `${url}:${port}/channel/removeowner/v2`,
    {
      body: JSON.stringify({
        channelId: body.channelId,
        uId: body.uId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /channel/messages/v2
export const getChannelMessages = (query: ChannelMessagesType) => {
  const res = request(
    'GET',
    `${url}:${port}/channel/messages/v3`,
    {
      qs: {
        channelId: query.channelId,
        start: query.start
      },
      headers: {
        token: query.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

/* USERS FUNCTIONS */

// helper http function for /user/profile/v2
export const getUserProfile = (query: UserProfileInput) => {
  const res = request(
    'GET',
    `${url}:${port}/user/profile/v3`,
    {
      qs: {
        uId: query.uId,
      },
      headers: {
        token: query.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /users/all/v2
export const getUsersAll = (token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/users/all/v2`,
    {
      qs: {},
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const queryObj = JSON.parse(String(res.getBody()));
  return { res, queryObj };
};

// helper http function for /user/profile/setname/v2
export const putUsersSetname = (body: UserSetnameType) => {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setname/v2`,
    {
      body: JSON.stringify({
        nameFirst: body.nameFirst,
        nameLast: body.nameLast,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http fucntion for /user/profile/setemail/v2
export const putUserSetemail = (body: UserSetemailType) => {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setemail/v2`,
    {
      body: JSON.stringify({
        email: body.email,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /user/profile/sethandle/v2
export const putUserSetHandle = (body: UserSetHandleStr) => {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/sethandle/v2`,
    {
      body: JSON.stringify({
        handleStr: body.handleStr,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

/* MESSAGE FUNCTIONS */

// helper http function for /message/send/v2
export const postMessageSend = (body: MessageSendInput) => {
  const res = request(
    'POST',
    `${url}:${port}/message/send/v2`,
    {
      body: JSON.stringify({
        channelId: body.channelId,
        message: body.message,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /message/edit/v2
export const putMessageEdit = (body: MessageEditInput) => {
  const res = request(
    'PUT',
    `${url}:${port}/message/edit/v2`,
    {
      body: JSON.stringify({
        messageId: body.messageId,
        message: body.message,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /message/remove/v2
export const deleteMessageRemove = (query: MessageRemoveInput) => {
  const res = request(
    'DELETE',
    `${url}:${port}/message/remove/v2`,
    {
      qs: {
        messageId: query.messageId,
      },
      headers: {
        token: query.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

export const postMessageSendLater = (token: string, channelId: number, message: string, timeSent: number) => {
  const res = request(
    'POST',
    `${url}:${port}/message/sendlater/v1`,
    {
      json: {
        channelId: channelId,
        message: message,
        timeSent: timeSent,
      },
      headers: {
        token: token,
      },
    }
  );

  if (res.statusCode !== 200) {
    return { res };
  } else {
    const bodyObj = JSON.parse(String(res.getBody()));
    return { res, bodyObj };
  }
};

export const postMessageSendLaterDm = (token: string, dmId: number, message: string, timeSent: number) => {
  const res = request(
    'POST',
    `${url}:${port}/message/sendlaterdm/v1`,
    {
      json: {
        dmId: dmId,
        message: message,
        timeSent: timeSent,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  } else {
    const bodyObj = JSON.parse(String(res.getBody()));
    return { res, bodyObj };
  }
};
// helper http function for /message/react/v1
export const postMessageReact = (body: MessageReactInput) => {
  const res = request(
    'POST',
    `${url}:${port}/message/react/v1`,
    {
      body: JSON.stringify({
        messageId: body.messageId,
        reactId: body.reactId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  } else {
    const bodyObj = JSON.parse(String(res.getBody()));
    return { res, bodyObj };
  }
};

// helper http function for /message/unreact/v1
export const postMessageUnreact = (body: MessageReactInput) => {
  const res = request(
    'POST',
    `${url}:${port}/message/unreact/v1`,
    {
      body: JSON.stringify({
        messageId: body.messageId,
        reactId: body.reactId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /message/pin/v1
export const postMessagePin = (body: MessagePinInput) => {
  const res = request(
    'POST',
    `${url}:${port}/message/pin/v1`,
    {
      body: JSON.stringify({
        messageId: body.messageId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /message/unpin/v1
export const postMessageUnpin = (body: MessagePinInput) => {
  const res = request(
    'POST',
    `${url}:${port}/message/unpin/v1`,
    {
      body: JSON.stringify({
        messageId: body.messageId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  } else {
    const bodyObj = JSON.parse(String(res.getBody()));
    return { bodyObj, res };
  }
};

/* DM FUNCTIONS */

// helper http function for /dm/create/v2
export const postDmCreate = (body: DmCreateType) => {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v2`,
    {
      body: JSON.stringify({
        uIds: body.uIds,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /dm/leave/v2
export const postDmLeave = (body: DmLeaveType) => {
  const res = request(
    'POST',
    `${url}:${port}/dm/leave/v2`,
    {
      body: JSON.stringify({
        dmId: body.dmId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /message/senddm/v2
export const postMessageSendDm = (body: SendDmType) => {
  const res = request(
    'POST',
    `${url}:${port}/message/senddm/v2`,
    {
      body: JSON.stringify({
        dmId: body.dmId,
        message: body.message,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return ({ res, bodyObj });
};

// helper http function for /dm/list/v1
export const getDmList = (token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/dm/list/v2`,
    {
      qs: {},
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /dm/remove/v2
export const dmRemove = (query: dmRemoveInput) => {
  const res = request(
    'DELETE',
    `${url}:${port}/dm/remove/v2`,
    {
      qs: {
        dmId: query.dmId,
      },
      headers: {
        token: query.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /dm/messages/v1
export const getDmMessages = (query: DmMessageInputType) => {
  const res = request(
    'GET',
    `${url}:${port}/dm/messages/v2`,
    {
      qs: {
        dmId: query.dmId,
        start: query.start,
      },
      headers: {
        token: query.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// helper http function for /dm/details/v2
export const getDmDetails = (query: dmDetailsInput) => {
  const res = request(
    'GET',
    `${url}:${port}/dm/details/v2`,
    {
      qs: {
        dmId: query.dmId,
      },
      headers: {
        token: query.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

export const getNotifications = (token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/notifications/get/v2`,
    {
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  } else {
    const bodyObj = JSON.parse(String(res.getBody()));
    return { res, bodyObj };
  }
};

export const getSearch = (token: string, queryStr: string) => {
  const res = request(
    'GET',
    `${url}:${port}/search/v1`,
    {
      qs: {
        queryStr: queryStr,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  } else {
    const bodyObj = JSON.parse(String(res.getBody()));
    return { res, bodyObj };
  }
};

export const deleteAdminRemove = (token: string, uId: number) => {
  const res = request(
    'DELETE',
    `${url}:${port}/admin/user/remove/v1`,
    {
      qs: {
        uId: uId,
      },
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  } else {
    const bodyObj = JSON.parse(String(res.getBody()));
    return { res, bodyObj };
  }
};

export const delayMsgSent = (seconds: number) => {
  return Math.floor((new Date()).getTime() / 1000) + seconds;
};

export function sleep(second: number) {
  return new Promise(resolve => setTimeout(resolve, second * 1000));
}

// helper http function for /message/share/v1
export const postMessageShare = (body: MessageShareType) => {
  const res = request(
    'POST',
    `${url}:${port}/message/share/v1`,
    {
      body: JSON.stringify({
        ogMessageId: body.ogMessageId,
        message: body.message,
        channelId: body.channelId,
        dmId: body.dmId,
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

// STANDUP

export const postStandupStart = (body: StandupStartInput) => {
  const res = request(
    'POST',
    `${url}:${port}/standup/start/v1`,
    {
      body: JSON.stringify({
        channelId: body.channelId,
        length: body.length
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

export const getStandupActive = (query: StandupActiveInput) => {
  const res = request(
    'GET',
    `${url}:${port}/standup/active/v1`,
    {
      qs: {
        channelId: query.channelId,
      },
      headers: {
        token: query.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  } else {
    const bodyObj = JSON.parse(String(res.getBody()));
    return { res, bodyObj };
  }
};

export const postStandupSend = (body: StandupSendInput) => {
  const res = request(
    'POST',
    `${url}:${port}/standup/send/v1`,
    {
      body: JSON.stringify({
        channelId: body.channelId,
        message: body.message
      }),
      headers: {
        'Content-type': 'application/json',
        token: body.token,
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  }
  const bodyObj = JSON.parse(String(res.getBody()));
  return { res, bodyObj };
};

export const getUserStats = (token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/user/stats/v1`,
    {
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode !== 200) {
    return { res };
  } else {
    const bodyObj = JSON.parse(String(res.getBody()));
    return { res, bodyObj };
  }
};
