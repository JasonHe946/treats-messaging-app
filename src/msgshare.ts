import { getData, setData } from './dataStore';
import { SharedChannelMessage, SharedDmMessage } from './typeDefinitions';
import { validDmId, checkDmMember, validChannelId, checkChannelMem, checkChannelMsgId, checkDmMsgId, createTaggedNotifications } from './functionsHelper';
import HTTPError from 'http-errors';

export const messageShareV1 = (authUserId: number, ogMessageId: number, message: string, channelId: number, dmId: number): any | null => {
  const data = getData();

  // If length of message is less than 1 or greater than 1000, return error
  if (message !== null && message.length > 1000) {
    throw HTTPError(400, 'message length should be less than 1000');
  }

  // return error when channelId is invalid
  if (channelId !== null && dmId === null) {
    if (!validChannelId(channelId)) {
      throw HTTPError(400, 'channelId is not valid');
    }
  }

  // return error when dmId is invalid
  if (dmId !== null && channelId === null) {
    if (!validDmId(dmId)) {
      throw HTTPError(400, 'dmId is not valid');
    }
  }

  // return error when authUser is not a member of the dm
  if (validDmId(dmId) === true) {
    if (!checkDmMember(authUserId, dmId)) {
      throw HTTPError(403, 'authUser is not member of DM');
    }
  }

  // return error when authUser is not a member of the channel
  if (validChannelId(channelId) === true) {
    if (!checkChannelMem(authUserId, channelId, data)) {
      throw HTTPError(403, 'authUser is not member of Channel');
    }
  }

  // return error when channelId and dmId both are not null
  if (validChannelId(channelId) === true && validDmId(dmId) === true) {
    throw HTTPError(400, 'channelId and dmId both cannot be valid');
  }

  // return error when ogMessageId is invalid
  if (!checkChannelMsgId(ogMessageId) && !checkDmMsgId(ogMessageId)) {
    throw HTTPError(400, 'ogMessageId is not valid');
  }

  // if no message is given the message will be an empty string
  if (message === null) {
    message = '';
  }

  let toChannel = false;
  let toDm = false;
  const sharedMessageId = data.channelMessages.length + data.dmMessages.length;
  let oldMessage = '';

  // if the condition is true then the ogMessageId is in channels
  for (const Id of data.channelMessages) {
    if (checkChannelMsgId(ogMessageId) === true && validChannelId(channelId) === true && ogMessageId === Id.messageId) {
      oldMessage = Id.message;
      dmId = -1;
      toChannel = true;
    }
    if (checkChannelMsgId(ogMessageId) === true && validDmId(dmId) === true && ogMessageId === Id.messageId) {
      oldMessage = Id.message;
      channelId = -1;
      toDm = true;
    }
  }

  // if the condition is true then the ogMessageId is in dms
  for (const Id of data.dmMessages) {
    if (checkDmMsgId(ogMessageId) === true && validDmId(dmId) === true && ogMessageId === Id.messageId) {
      oldMessage = Id.message;
      channelId = -1;
      toDm = true;
    }
    if (checkDmMsgId(ogMessageId) === true && validChannelId(channelId) === true && ogMessageId === Id.messageId) {
      oldMessage = Id.message;
      dmId = -1;
      toChannel = true;
    }
  }

  // return error when channelId and dmId both are not -1
  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'channelId and dmId both cannot be valid');
  }

  // if message is shared in channel
  if (toChannel === true && toDm === false) {
    const timeMsgSent = Math.floor((new Date()).getTime() / 1000);
    const messageObj: SharedChannelMessage = {
      channelId: channelId,
      messageId: sharedMessageId,
      uId: authUserId,
      message: message + `  ${oldMessage}`,
      timeSent: timeMsgSent,
      isVisible: true,
      reacts: [],
      isPinned: false,
      sharedMessageId: sharedMessageId,
    };
    createTaggedNotifications(message + `  ${oldMessage}`, 'ch', channelId, authUserId, timeMsgSent);
    data.channelMessages.unshift(messageObj);
    setData(data);
  }

  // if message is shared in dm
  if (toDm === true && toChannel === false) {
    const timeMsgSent = Math.floor((new Date()).getTime() / 1000);
    const messageObj: SharedDmMessage = {
      messageId: sharedMessageId,
      dmId: dmId,
      uId: authUserId,
      message: message + `  ${oldMessage} `,
      isVisible: true,
      timeSent: timeMsgSent,
      reacts: [],
      isPinned: false,
      sharedMessageId: sharedMessageId,
    };
    data.dmMessages.unshift(messageObj);
    createTaggedNotifications(message + `  ${oldMessage}`, 'dm', dmId, authUserId, timeMsgSent);
    setData(data);
  }

  return ({ sharedMessageId: sharedMessageId });
};
