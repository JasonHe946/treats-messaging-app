import { getData, setData } from './dataStore';
import { AuthUserId } from './typeDefinitions';
import { messageSendV1 } from './message';
import { findToken } from './functionsHelper';
import HTTPError from 'http-errors';

export function standupStartV1 (token: string, channelId: number, length: number) {
  const data = getData();
  const authUserId = findToken(token) as AuthUserId;
  const uId = authUserId.authUserId;

  // channelId does not refer to a valid channel
  for (const channel of data.channels) {
    let channelIdFound = false;
    if (channelId === channel.channelId) {
      channelIdFound = true;
    }
    if (!channelIdFound) {
      throw HTTPError(400, 'channelId does not refer to a valid channel');
    }
  }

  // length is a negative integer
  if (length < 0) {
    throw HTTPError(400, 'length is a negative integer');
  }

  // an active standup is currently running in the channel
  for (const channel of data.channels) {
    if (channelId === channel.channelId && channel.standupActive !== 0) {
      throw HTTPError(400, 'an active standup is currently running in the channel');
    }
  }

  // channelId is valid and the authorised user is not a member of the channel
  for (const channel of data.channels) {
    let uIdFound = false;
    if (channel.allMembers.includes(uId)) {
      uIdFound = true;
    }
    if (!uIdFound) {
      throw HTTPError(403, 'authorised user is not a member of the channel');
    }
  }

  const timeFinish = Math.floor((new Date()).getTime() / 1000) + length;

  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      channel.standupUser = uId;
      channel.standupActive = timeFinish;
    }
  }

  setData(data);

  setTimeout(() => {
    let standupFinalMessage:any;
    for (const channel of data.channels) {
      if (channelId === channel.channelId) {
        standupFinalMessage = channel.standupMessages.join('\r\n');
        channel.standupUser = 0;
        channel.standupActive = 0;
        messageSendV1(token, channelId, standupFinalMessage);
      }
    }
    setData(data);
  }, length * 1000);

  return { timeFinish: timeFinish };
}

export function standupActiveV1 (token: string, channelId: number) {
  const data = getData();
  const authUserId = findToken(token) as AuthUserId;
  const uId = authUserId.authUserId;

  // channelId does not refer to a valid channel
  for (const channel of data.channels) {
    let channelIdFound = false;
    if (channelId === channel.channelId) {
      channelIdFound = true;
    }
    if (!channelIdFound) {
      throw HTTPError(400, 'channelId does not refer to a valid channel');
    }
  }

  // channelId is valid and the authorised user is not a member of the channel
  for (const channel of data.channels) {
    let uIdFound = false;
    if (channel.allMembers.includes(uId)) {
      uIdFound = true;
    }
    if (!uIdFound) {
      throw HTTPError(403, 'authorised user is not a member of the channel');
    }
  }

  let standupIsActive = false;
  let timeFinish = null;
  for (const channel of data.channels) {
    if (channel.standupActive !== 0) {
      standupIsActive = true;
      timeFinish = channel.standupActive;
    }
  }

  return {
    isActive: standupIsActive,
    timeFinish: timeFinish
  };
}

export function standupSendV1 (token: string, channelId: number, message: string) {
  const data = getData();
  const authUserId = findToken(token) as AuthUserId;
  const uId = authUserId.authUserId;

  // channelId does not refer to a valid channel
  for (const channel of data.channels) {
    let channelIdFound = false;
    if (channelId === channel.channelId) {
      channelIdFound = true;
    }
    if (!channelIdFound) {
      throw HTTPError(400, 'channelId does not refer to a valid channel');
    }
  }

  // length of message is over 1000 characters
  if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  }

  // an active standup is not currently running in the channel
  for (const channel of data.channels) {
    if (channelId === channel.channelId && channel.standupActive === 0) {
      throw HTTPError(400, 'an active standup is not currently running in the channel');
    }
  }

  // channelId is valid and the authorised user is not a member of the channel
  for (const channel of data.channels) {
    let uIdFound = false;
    if (channel.allMembers.includes(uId)) {
      uIdFound = true;
    }
    if (!uIdFound) {
      throw HTTPError(403, 'authorised user is not a member of the channel');
    }
  }

  let messageSenderHandle:any;

  for (const user of data.users) {
    if (uId === user.uId) {
      messageSenderHandle = user.handleStr;
    }
  }

  const standupMessage = messageSenderHandle + ': ' + message;

  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      channel.standupMessages.push(standupMessage);
    }
  }

  setData(data);
  return {};
}
