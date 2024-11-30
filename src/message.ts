import { getData, setData } from './dataStore';
import { DmMessageType, MessageId, ErrorOutput, AuthUserId, Message } from './typeDefinitions';
import { checkDmMember, findToken, createTaggedNotifications, validChannel, checkChannelMember, checkValidDM, removeItemOnce, createReactNotification } from './functionsHelper';
import HTTPError from 'http-errors';

/**
 * Send message by an authorised user in the channel provided a channelId.
 * error if channelId is not of a valid channel or message length is less than 1 or greater than 1000 or
 * authorised user is not a member of channel
 * @param token string to get information of authorised user
 * @param channelId id of the channel to send the message
 * @param message message of the authorised user
 * @returns { messageId } if no errors
 */

export function messageSendV1(token: string, channelId: number, message: string): MessageId | ErrorOutput {
  const data = getData();
  const uId = findToken(token) as AuthUserId;

  // if length of message is less than 1 or over 1000 characters, return null
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'invalid message length');
  }

  if (uId === null) {
    throw HTTPError(403, 'invalid token');
  }

  // if channelId does not refer to a valid channel, return null
  let foundChannelId = false;
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      foundChannelId = true;
    }
  }
  if (!foundChannelId) {
    throw HTTPError(400, 'invalid channel');
  }

  // if the authorised user is not a member of the channel, return null
  let foundMember = false;
  for (const channel of data.channels) {
    if (channelId === channel.channelId && channel.allMembers.includes(uId.authUserId)) {
      foundMember = true;
    }
  }
  if (!foundMember) {
    throw HTTPError(403, 'invalid permissions: user is not part of channel');
  }

  //  VALID CASE

  //  Create and add the message
  const messageId = data.channelMessages.length + data.dmMessages.length;
  const timeSent = Math.floor((new Date()).getTime() / 1000);

  const newMessage: Message = {
    channelId: channelId,
    messageId: messageId,
    uId: uId.authUserId,
    message: message,
    timeSent: timeSent,
    isVisible: true,
    reacts: [
      {
        reactId: 1,
        uIds: [],
      }
    ],
    isPinned: false,
  };

  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      if (channel.standupActive !== 0) {
        let messageSenderHandle:any;
        for (const user of data.users) {
          if (uId.authUserId === user.uId) {
            messageSenderHandle = user.handleStr;
          }
        }
        const standupMessage = messageSenderHandle + ': ' + message;
        channel.standupMessages.push(standupMessage);
      } else if (channel.standupActive === 0) {
        data.channelMessages.unshift(newMessage);
        //  Create notifications for tagged members
        createTaggedNotifications(message, 'ch', channelId, uId.authUserId, timeSent);
      }
    }
  }

  setData(data);

  return { messageId: messageId };
}

/**
 * Given message, update the old one with new message or delete if the new message is null
 * error if hte length of the message is less than 1 or more than 1000 or messageId is not thtat of valid message or
 * message not sent by authorised user or authorised user does not have the permission from the owner
 * @param token string to get information of authorised user
 * @param messageId id of the message that needs to be edited
 * @param message string of a message that replaces the old one
 * @returns { } if no errors
 */

export function messageEditV1(token: string, messageId: number, message: string) {
  const data = getData();
  const authUserId = findToken(token) as AuthUserId;
  const uId = authUserId.authUserId;

  // if length of message is over 1000 characters, return null
  if (message.length > 1000) {
    throw HTTPError(400, 'invalid message length');
  }

  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  // gets information about the message in channels/dms
  const messageInfo:any = {};
  let inChannels = false;
  let inDm = false;

  for (const message of data.channelMessages) {
    if (messageId === message.messageId) {
      messageInfo.channelId = message.channelId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      inChannels = true;
    }
  }
  for (const message of data.dmMessages) {
    if (messageId === message.messageId) {
      messageInfo.dmId = message.dmId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      inDm = true;
    }
  }

  if (!messageInfo.isVisible || messageInfo.timeSent > Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'invalid messageId1HERE');
  }

  let foundId = false;
  // if the messageId is in a channel the user is a part of, isFound = true
  const channelsList = [];
  for (const channel of data.channels) {
    if (channel.allMembers.includes(uId)) {
      channelsList.push(channel.channelId);
    }
  }
  if (inChannels && channelsList.includes(messageInfo.channelId)) {
    foundId = true;
  }

  // if the messageId is in a dm the user is a part of, isFound = true

  const dmList = [];
  for (const dm of data.dms) {
    if (dm.dmMembers.includes(uId)) {
      dmList.push(dm.dmId);
    }
  }
  if (inDm && dmList.includes(messageInfo.dmId)) {
    foundId = true;
  }

  if (!foundId || messageInfo.timeSent > Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'invalid messageId2HERE');
  }

  let isSender = false;
  // if the message in channel was sent by the user making the request, isSender = true
  if (inChannels && uId === messageInfo.uId) {
    isSender = true;
  }
  // if the message in dm was sent by the user making the request, isSender = true
  if (inDm && uId === messageInfo.uId) {
    isSender = true;
  }
  if (!isSender) {
    throw HTTPError(403, 'message not edited by original sender');
  }

  // the user only has permissions to edit messages in channel IFF
  // they are channelOwner OR they are (channelMember AND GlobalOwner)
  let hasPermission = false;
  let isGlobalOwner = false;

  // get information on whether the user is a GlobalOwner
  for (const user of data.users) {
    if (uId === user.uId) {
      isGlobalOwner = user.isGlobalOwner;
    }
  }

  // check if user is a owner or member of channel
  if (inChannels) {
    let isOwner = false;
    let isMember = false;
    let isAuthor = false;

    for (const channel of data.channels) {
      if (messageInfo.channelId === channel.channelId) {
        if (channel.ownerMembers.includes(uId)) {
          isOwner = true;
        }
        if (channel.allMembers.includes(uId)) {
          isMember = true;
        }
      }
    }
    if (messageInfo.uId === uId) {
      isAuthor = true;
    }
    if (isAuthor || isOwner || (isMember && isGlobalOwner)) {
      hasPermission = true;
    }
    if (!hasPermission) {
      throw HTTPError(403, 'can not edit because no owner permissions');
    }
  }

  if (inDm) {
    let isOwner = false;
    let isAuthor = false;
    let hasPermission = false;
    for (const dm of data.dms) {
      if (messageInfo.dmId === dm.dmId) {
        if (dm.owner === uId) {
          isOwner = true;
        }
      }
    }
    if (messageInfo.uId === uId) {
      isAuthor = true;
    }
    if (isAuthor || isOwner) {
      hasPermission = true;
    }
    if (!hasPermission) {
      throw HTTPError(403, 'can not edit because no owner permissions');
    }
  }

  // checks if the user

  if (inChannels) {
    for (const messages of data.channelMessages) {
      if (messageId === messages.messageId && message.length !== 0) {
        messages.message = message;
        createTaggedNotifications(message, 'ch', messages.channelId, uId, messages.timeSent);
      }
      if (messageId === messages.messageId && message.length === 0) {
        messages.isVisible = false;
      }
    }
  }

  if (inDm) {
    for (const messages of data.dmMessages) {
      if (messageId === messages.messageId && message.length !== 0) {
        messages.message = message;
        createTaggedNotifications(message, 'dm', messages.dmId, uId, messages.timeSent);
      }
      if (messageId === messages.messageId && message.length === 0) {
        messages.isVisible = false;
      }
    }
  }
  setData(data);
  return {};
}

/**
 * Given messageId, removes the message from channel or dm
 * error if messageId is not that of a vvalid message that is in dm/channel or
 * request is not made by authorised user or
 * owner has not given permission to the authorised user
 * @param token string to get information of authorised user
 * @param messageId id of the message to be removed
 * @returns { } if no errors
 */

export function messageRemoveV1(token: string, messageId: number) {
  const data = getData();
  const authUserId = findToken(token) as AuthUserId;
  const uId = authUserId.authUserId;

  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  // gets information about the message in channels/dms
  const messageInfo:any = {};
  let inChannels = false;
  let inDm = false;

  for (const message of data.channelMessages) {
    if (messageId === message.messageId) {
      messageInfo.channelId = message.channelId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      inChannels = true;
    }
  }
  for (const message of data.dmMessages) {
    if (messageId === message.messageId) {
      messageInfo.dmId = message.dmId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      inDm = true;
    }
  }

  if (!messageInfo.isVisible || messageInfo.timeSent > Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'messageId not found');
  }

  let foundId = false;
  // if the messageId is in a channel the user is a part of, isFound = true
  const channelsList = [];
  for (const channel of data.channels) {
    if (channel.allMembers.includes(uId)) {
      channelsList.push(channel.channelId);
    }
  }
  if (inChannels && channelsList.includes(messageInfo.channelId)) {
    foundId = true;
  }

  // if the messageId is in a dm the user is a part of, isFound = true

  const dmList = [];
  for (const dm of data.dms) {
    if (dm.dmMembers.includes(uId)) {
      dmList.push(dm.dmId);
    }
  }
  if (inDm && dmList.includes(messageInfo.dmId)) {
    foundId = true;
  }

  if (!foundId) {
    throw HTTPError(400, 'user is not part of channel/dm the message is in');
  }

  let isSender = false;
  // if the message in channel was sent by the user making the request, isSender = true
  if (inChannels && uId === messageInfo.uId) {
    isSender = true;
  }
  // if the message in dm was sent by the user making the request, isSender = true
  if (inDm && uId === messageInfo.uId) {
    isSender = true;
  }
  if (!isSender) {
    throw HTTPError(403, 'request to delete was not requested by og sender');
  }

  // the user only has permissions to edit messages in channel IFF
  // they are channelOwner OR they are (channelMember AND GlobalOwner)
  let hasPermission = false;
  let isGlobalOwner = false;

  // get information on whether the user is a GlobalOwner
  for (const user of data.users) {
    if (uId === user.uId) {
      isGlobalOwner = user.isGlobalOwner;
    }
  }

  // check if user is a owner or member of channel
  if (inChannels) {
    let isOwner = false;
    let isMember = false;
    let isAuthor = false;

    for (const channel of data.channels) {
      if (messageInfo.channelId === channel.channelId) {
        if (channel.ownerMembers.includes(uId)) {
          isOwner = true;
        }
        if (channel.allMembers.includes(uId)) {
          isMember = true;
        }
      }
    }
    if (messageInfo.uId === uId) {
      isAuthor = true;
    }
    if (isAuthor || isOwner || (isMember && isGlobalOwner)) {
      hasPermission = true;
    }
    if (!hasPermission) {
      throw HTTPError(403, 'no owner permissions in channel');
    }
  }

  if (inDm) {
    let isOwner = false;
    let isAuthor = false;
    let hasPermission = false;
    for (const dm of data.dms) {
      if (messageInfo.dmId === dm.dmId) {
        if (dm.owner === uId) {
          isOwner = true;
        }
      }
    }
    if (messageInfo.uId === uId) {
      isAuthor = true;
    }
    if (isAuthor || isOwner) {
      hasPermission = true;
    }
    if (!hasPermission) {
      throw HTTPError(403, 'no owner permissions in DM');
    }
  }

  // removes the message

  if (inChannels) {
    for (const messages of data.channelMessages) {
      if (messageId === messages.messageId) {
        messages.isVisible = false;
      }
    }
  }

  if (inDm) {
    for (const messages of data.dmMessages) {
      if (messageId === messages.messageId) {
        messages.isVisible = false;
      }
    }
  }
  setData(data);
  return {};
}

export const messageSendlaterV1 = (authUserId: number, channelId: number, message: string, timeSent: number) => {
  const data = getData();
  if (validChannel(channelId) === -1) {
    throw HTTPError(400, 'Invalid channel.');
  } else if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message.');
  } else if (!checkChannelMember(channelId, authUserId)) {
    throw HTTPError(403, 'User not member of channel.');
  } else if (timeSent < Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'Time already passed.');
  } else {
    // Generate messageId
    const messageId = data.channelMessages.length + data.dmMessages.length;

    // Create a message in the dataStore
    const newMessage: Message = {
      channelId: channelId,
      messageId: messageId,
      uId: authUserId,
      message: message,
      timeSent: timeSent,
      isVisible: true,
      isPinned: false,
      reacts: [
        {
          reactId: 1,
          uIds: [],
        }
      ],
    };

    data.channelMessages.unshift(newMessage);

    // Create notification
    createTaggedNotifications(message, 'ch', channelId, authUserId, timeSent);

    setData(data);
    return messageId;
  }
};

export const messageSendlaterDmV1 = (authUserId: number, dmId: number, message: string, timeSent: number) => {
  const data = getData();
  if (checkValidDM(dmId) === -1) {
    throw HTTPError(400, 'Invalid DM.');
  } else if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message.');
  } else if (timeSent < Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'Time already passed.');
  } else if (!checkDmMember(authUserId, dmId)) {
    throw HTTPError(403, 'User not member of channel.');
  } else {
    //  Generate messageId
    const messageId = data.channelMessages.length + data.dmMessages.length;

    // Create a message in the dataStore
    const newMessage: DmMessageType = {
      dmId: dmId,
      messageId: messageId,
      uId: authUserId,
      message: message,
      timeSent: timeSent,
      isVisible: true,
      isPinned: false,
      reacts: [
        {
          reactId: 1,
          uIds: [],
        }
      ],
    };

    data.dmMessages.unshift(newMessage);

    //  Create notification to tagged members.
    createTaggedNotifications(message, 'dm', dmId, authUserId, timeSent);

    setData(data);
    return messageId;
  }
};
export function messageReactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  const authUserId = findToken(token) as AuthUserId;
  const uId = authUserId.authUserId;
  const messageInfo:any = {};
  let inChannels = false;
  let inDm = false;

  for (const message of data.channelMessages) {
    if (messageId === message.messageId) {
      messageInfo.channelId = message.channelId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      messageInfo.reacts = message.reacts;
      inChannels = true;
    }
  }
  for (const message of data.dmMessages) {
    if (messageId === message.messageId) {
      messageInfo.dmId = message.dmId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      messageInfo.reacts = message.reacts;
      inDm = true;
    }
  }
  // check if the message has been deleted
  if (!messageInfo.isVisible) {
    throw HTTPError(400, 'the message has been deleted');
  }

  /**
   * messageInfo {
   * channelId/dmId:
   * uId:
   * messageId:
   * }
   */

  // check if the messageId is valid
  let foundId = false;

  // if the messageId is in a channel the user is a part of, isFound = true
  const channelsList = [];
  for (const channel of data.channels) {
    if (channel.allMembers.includes(uId)) {
      channelsList.push(channel.channelId);
    }
  }
  if (inChannels && channelsList.includes(messageInfo.channelId)) {
    foundId = true;
  }

  // if the messageId is in a dm the user is a part of, isFound = true
  const dmList = [];
  for (const dm of data.dms) {
    if (dm.dmMembers.includes(uId)) {
      dmList.push(dm.dmId);
    }
  }
  if (inDm && dmList.includes(messageInfo.dmId)) {
    foundId = true;
  }
  // if the messageId is not found
  if (!foundId) {
    throw HTTPError(400, 'invalid messageId');
  }
  if (uId === null) {
    throw HTTPError(403, 'invalid token');
  }
  // if the reactId is invalid (only 1 is valid rn)
  if (reactId > 1) {
    throw HTTPError(400, 'invalid reactId');
  }

  // if in channel
  if (inChannels) {
    // loop through the messages
    for (const messages of data.channelMessages) {
      // find the required message
      if (messageId === messages.messageId) {
        // loop through the different reacts
        for (const reacts of messages.reacts) {
          // find the required react type
          if (reacts.reactId === reactId) {
            if (!reacts.uIds.includes(uId)) {
              reacts.uIds.push(uId);
              createReactNotification(uId, messages.uId, 'ch', messages.channelId);
            } else {
              throw HTTPError(400, 'already reacted');
            }
          }
        }
      }
    }
  }

  if (inDm) {
    // loop through the messages
    for (const messages of data.dmMessages) {
      // find the required message
      if (messageId === messages.messageId) {
        // loop through the different reacts
        for (const reacts of messages.reacts) {
          // find the required react type
          if (reacts.reactId === reactId) {
            if (!reacts.uIds.includes(uId)) {
              reacts.uIds.push(uId);
              createReactNotification(uId, messages.uId, 'dm', messages.dmId);
            } else {
              throw HTTPError(400, 'already reacted');
            }
          }
        }
      }
    }
  }

  setData(data);
  return {};
}

export function messageUnreactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  const authUserId = findToken(token) as AuthUserId;
  const uId = authUserId.authUserId;
  const messageInfo:any = {};
  let inChannels = false;
  let inDm = false;

  for (const message of data.channelMessages) {
    if (messageId === message.messageId) {
      messageInfo.channelId = message.channelId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      messageInfo.reacts = message.reacts;
      inChannels = true;
    }
  }
  for (const message of data.dmMessages) {
    if (messageId === message.messageId) {
      messageInfo.dmId = message.dmId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      messageInfo.reacts = message.reacts;
      inDm = true;
    }
  }
  // check if the message has been deleted
  if (!messageInfo.isVisible) {
    throw HTTPError(400, 'the message has been deleted');
  }

  /**
   * messageInfo {
   * channelId/dmId:
   * uId:
   * messageId:
   * }
   */

  // check if the messageId is valid
  let foundId = false;

  // if the messageId is in a channel the user is a part of, isFound = true
  const channelsList = [];
  for (const channel of data.channels) {
    if (channel.allMembers.includes(uId)) {
      channelsList.push(channel.channelId);
    }
  }
  if (inChannels && channelsList.includes(messageInfo.channelId)) {
    foundId = true;
  }

  // if the messageId is in a dm the user is a part of, isFound = true
  const dmList = [];
  for (const dm of data.dms) {
    if (dm.dmMembers.includes(uId)) {
      dmList.push(dm.dmId);
    }
  }
  if (inDm && dmList.includes(messageInfo.dmId)) {
    foundId = true;
  }
  // if the messageId is not found
  if (!foundId) {
    throw HTTPError(400, 'invalid messageId');
  }
  if (uId === null) {
    throw HTTPError(403, 'invalid token');
  }
  // if the reactId is invalid (only 1 is valid rn)
  if (reactId > 1) {
    throw HTTPError(400, 'invalid reactId');
  }
  // create an object
  /*
    const reactObj: reactObj = {
      reactId: reactId,
      uIds: uId[],
    };
  */
  /*
    const newMessage:Message = {
      channelId: channelId,
      messageId: messageId,
      uId: uId.authUserId,
      message: message,
      timeSent: timeSent,
      isVisible: true,
      reacts:[
        {
          reactId: 1,
          uIds: [],
        }
      ],
    };
  */
  // if in channel
  if (inChannels) {
    // loop through the messages
    for (const messages of data.channelMessages) {
      // find the required message
      if (messageId === messages.messageId) {
        // loop through the different reacts
        for (const reacts of messages.reacts) {
          // find the required react type
          if (reacts.reactId === reactId) {
            if (reacts.uIds.includes(uId)) {
              removeItemOnce(reacts.uIds, uId);
            } else {
              throw HTTPError(400, 'already unreacted/ no react');
            }
          }
        }
      }
    }
  }

  if (inDm) {
    // loop through the messages
    for (const messages of data.dmMessages) {
      // find the required message
      if (messageId === messages.messageId) {
        // loop through the different reacts
        for (const reacts of messages.reacts) {
          // find the required react type
          if (reacts.reactId === reactId) {
            if (reacts.uIds.includes(uId)) {
              removeItemOnce(reacts.uIds, uId);
            } else {
              throw HTTPError(400, 'already unreacted/ no react');
            }
          }
        }
      }
    }
  }

  setData(data);
  return {};
}

export function messagePinV1(token: string, messageId: number) {
  // gets information about the message in channels/dms
  const data = getData();
  const authUserId = findToken(token) as AuthUserId;
  const uId = authUserId.authUserId;

  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  const messageInfo:any = {};
  let inChannels = false;
  let inDm = false;

  for (const message of data.channelMessages) {
    if (messageId === message.messageId) {
      messageInfo.channelId = message.channelId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      messageInfo.isPinned = message.isPinned;
      inChannels = true;
    }
  }
  for (const message of data.dmMessages) {
    if (messageId === message.messageId) {
      messageInfo.dmId = message.dmId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      messageInfo.isPinned = message.isPinned;
      inDm = true;
    }
  }

  if (!messageInfo.isVisible) {
    throw HTTPError(400, 'messageId not found');
  }

  if (messageInfo.isPinned) {
    throw HTTPError(400, 'message is already pinned');
  }

  let foundId = false;
  // if the messageId is in a channel the user is a part of, isFound = true
  const channelsList = [];
  for (const channel of data.channels) {
    if (channel.allMembers.includes(uId)) {
      channelsList.push(channel.channelId);
    }
  }
  if (inChannels && channelsList.includes(messageInfo.channelId)) {
    foundId = true;
  }

  // if the messageId is in a dm the user is a part of, isFound = true
  const dmList = [];
  for (const dm of data.dms) {
    if (dm.dmMembers.includes(uId)) {
      dmList.push(dm.dmId);
    }
  }
  if (inDm && dmList.includes(messageInfo.dmId)) {
    foundId = true;
  }

  if (!foundId) {
    throw HTTPError(400, 'user is not part of channel/dm the message is in');
  }

  let hasPermission = false;
  let isGlobalOwner = false;

  for (const user of data.users) {
    if (uId === user.uId) {
      isGlobalOwner = user.isGlobalOwner;
    }
  }

  // check if user is a owner or member of channel
  if (inChannels) {
    let isOwner = false;
    let isMember = false;
    let isAuthor = false;

    for (const channel of data.channels) {
      if (messageInfo.channelId === channel.channelId) {
        if (channel.ownerMembers.includes(uId)) {
          isOwner = true;
        }
        if (channel.allMembers.includes(uId)) {
          isMember = true;
        }
      }
    }
    if (messageInfo.uId === uId) {
      isAuthor = true;
    }
    if (isAuthor || isOwner || (isMember && isGlobalOwner)) {
      hasPermission = true;
    }
    if (!hasPermission) {
      throw HTTPError(403, 'no owner permissions in channel');
    }
  }

  if (inDm) {
    let isOwner = false;
    let isAuthor = false;
    let hasPermission = false;
    for (const dm of data.dms) {
      if (messageInfo.dmId === dm.dmId) {
        if (dm.owner === uId) {
          isOwner = true;
        }
      }
    }
    if (messageInfo.uId === uId) {
      isAuthor = true;
    }
    if (isAuthor || isOwner) {
      hasPermission = true;
    }
    if (!hasPermission) {
      throw HTTPError(403, 'no owner permissions in DM');
    }
  }

  if (inChannels) {
    for (const messages of data.channelMessages) {
      if (messageId === messages.messageId) {
        messages.isPinned = true;
      }
    }
  }

  if (inDm) {
    for (const messages of data.dmMessages) {
      if (messageId === messages.messageId) {
        messages.isPinned = true;
      }
    }
  }
  setData(data);
  return {};
}

export function messageUnpinV1(token: string, messageId: number) {
  // gets information about the message in channels/dms
  const data = getData();
  const authUserId = findToken(token) as AuthUserId;
  const uId = authUserId.authUserId;

  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  const messageInfo:any = {};
  let inChannels = false;
  let inDm = false;

  for (const message of data.channelMessages) {
    if (messageId === message.messageId) {
      messageInfo.channelId = message.channelId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      messageInfo.isPinned = message.isPinned;
      inChannels = true;
    }
  }
  for (const message of data.dmMessages) {
    if (messageId === message.messageId) {
      messageInfo.dmId = message.dmId;
      messageInfo.uId = message.uId;
      messageInfo.messageId = message.messageId;
      messageInfo.isVisible = message.isVisible;
      messageInfo.isPinned = message.isPinned;
      inDm = true;
    }
  }

  if (!messageInfo.isVisible) {
    throw HTTPError(400, 'messageId not found');
  }

  if (!messageInfo.isPinned) {
    throw HTTPError(400, 'message is already unpinned');
  }

  let foundId = false;
  // if the messageId is in a channel the user is a part of, isFound = true
  const channelsList = [];
  for (const channel of data.channels) {
    if (channel.allMembers.includes(uId)) {
      channelsList.push(channel.channelId);
    }
  }
  if (inChannels && channelsList.includes(messageInfo.channelId)) {
    foundId = true;
  }

  // if the messageId is in a dm the user is a part of, isFound = true
  const dmList = [];
  for (const dm of data.dms) {
    if (dm.dmMembers.includes(uId)) {
      dmList.push(dm.dmId);
    }
  }
  if (inDm && dmList.includes(messageInfo.dmId)) {
    foundId = true;
  }

  if (!foundId) {
    throw HTTPError(400, 'user is not part of channel/dm the message is in');
  }

  let hasPermission = false;
  let isGlobalOwner = false;

  for (const user of data.users) {
    if (uId === user.uId) {
      isGlobalOwner = user.isGlobalOwner;
    }
  }

  // check if user is a owner or member of channel
  if (inChannels) {
    let isOwner = false;
    let isMember = false;
    let isAuthor = false;

    for (const channel of data.channels) {
      if (messageInfo.channelId === channel.channelId) {
        if (channel.ownerMembers.includes(uId)) {
          isOwner = true;
        }
        if (channel.allMembers.includes(uId)) {
          isMember = true;
        }
      }
    }
    if (messageInfo.uId === uId) {
      isAuthor = true;
    }
    if (isAuthor || isOwner || (isMember && isGlobalOwner)) {
      hasPermission = true;
    }
    if (!hasPermission) {
      throw HTTPError(403, 'no owner permissions in channel');
    }
  }

  if (inDm) {
    let isOwner = false;
    let isAuthor = false;
    let hasPermission = false;
    for (const dm of data.dms) {
      if (messageInfo.dmId === dm.dmId) {
        if (dm.owner === uId) {
          isOwner = true;
        }
      }
    }
    if (messageInfo.uId === uId) {
      isAuthor = true;
    }
    if (isAuthor || isOwner) {
      hasPermission = true;
    }
    if (!hasPermission) {
      throw HTTPError(403, 'no owner permissions in DM');
    }
  }

  if (inChannels) {
    for (const messages of data.channelMessages) {
      if (messageId === messages.messageId) {
        messages.isPinned = false;
      }
    }
  }

  if (inDm) {
    for (const messages of data.dmMessages) {
      if (messageId === messages.messageId) {
        messages.isPinned = false;
      }
    }
  }
  setData(data);
  return {};
}
