import { getData, setData } from './dataStore';
import { Data } from './typeDefinitions';
import HTTPError from 'http-errors';

export function clearV1() {
  const data:Data = getData();

  for (let i = data.users.length; i > 0; i--) {
    data.users.pop();
  }
  for (let i = data.channels.length; i > 0; i--) {
    data.channels.pop();
  }
  for (let i = data.channelMessages.length; i > 0; i--) {
    data.channelMessages.pop();
  }
  for (let i = data.dms.length; i > 0; i--) {
    data.dms.pop();
  }
  for (let i = data.dmMessages.length; i > 0; i--) {
    data.dmMessages.pop();
  }
  for (let i = data.userStats.length; i > 0; i--) {
    data.userStats.pop();
  }
  return setData(data);
}

export const notificationGetV1 = (authUserId: number) => {
  const data = getData();

  const notificationArray: any = [];
  for (const user of data.users) {
    if (user.uId === authUserId) {
      user.notifications.sort((a, b) => b.timeSent - a.timeSent);
      for (let counter = 0; counter < 20 && counter < user.notifications.length; counter++) {
        if (user.notifications[counter].timeSent <= Math.floor((new Date()).getTime() / 1000)) {
          const notifyOutput = {
            channelId: user.notifications[counter].channelId,
            dmId: user.notifications[counter].dmId,
            notificationMessage: user.notifications[counter].notificationMessage,
          };
          notificationArray.push(notifyOutput);
        }
      }
    }
  }
  return notificationArray;
};

export const searchV1 = (queryStr: string) => {
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'invalid message length');
  }

  const data = getData();

  const messageArray = [];
  for (const messages of data.channelMessages) {
    if (messages.message.includes(queryStr) && messages.timeSent <= Math.floor((new Date()).getTime() / 1000)) {
      const messageObj = {
        messageId: messages.messageId,
        uId: messages.uId,
        message: messages.message,
        timeSent: messages.timeSent,
      };
      messageArray.push(messageObj);
    }
  }

  for (const messages of data.dmMessages) {
    if (messages.message.includes(queryStr) && messages.timeSent <= Math.floor((new Date()).getTime() / 1000)) {
      const messageObj = {
        messageId: messages.messageId,
        uId: messages.uId,
        message: messages.message,
        timeSent: messages.timeSent,
      };
      messageArray.push(messageObj);
    }
  }
  return messageArray;
};
