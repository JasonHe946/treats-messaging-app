import { getData } from './dataStore';

export const userStatsV1 = (authUserId: number) => {
  const data = getData();
  const channelsJoined: any = [];
  const dmsJoined: any = [];
  const messagesSent: any = [];

  let messageList = {};
  let dmMessageList = {};
  let channelList = {};
  let dmList = {};

  // first stats when user is registered
  for (const initial of data.users) {
    if (authUserId === initial.uId) {
      messageList = {
        timeStamp: initial.timeStamp,
      };
      messagesSent.push(messageList);
      channelList = {
        numChannelsJoined: 0,
        timeStamp: initial.timeStamp,
      };
      channelsJoined.push(channelList);
      dmList = {
        numDmsJoined: 0,
        timeStamp: initial.timeStamp,
      };
      dmsJoined.push(dmList);
    }
  }

  // Update the stats when the user sends a message
  for (const numChannelMessage of data.channelMessages) {
    if (authUserId === numChannelMessage.uId) {
      messageList = {
        timeStamp: numChannelMessage.timeSent,
      };
      messagesSent.push(messageList);
    }
  }

  for (const numDmMessage of data.dmMessages) {
    if (authUserId === numDmMessage.uId) {
      dmMessageList = {
        timeStamp: numDmMessage.timeSent,
      };
      messagesSent.push(dmMessageList);
    }
  }

  // sort the messages sent in timeStamp ascending order
  messagesSent.sort((a: { timeStamp: number; }, b: { timeStamp: number; }) => a.timeStamp - b.timeStamp);

  // number the number of messages send by user correctly
  let num = 0;
  for (const numMessages of messagesSent) {
    Object.assign({ numMessagesSent: numMessages.numMessagesSent = num }, numMessages);
    num++;
  }

  // Sort UserStats in data Store
  data.userStats.sort((a: { timeStamp: number; }, b: { timeStamp: number; }) => a.timeStamp - b.timeStamp);

  // Update stats for Channels Joined
  let counter = 1;
  for (const channel of data.userStats) {
  // data.userStats.sort((a: { timeStamp: number; }, b: { timeStamp: number; }) =>  a.timeStamp - b.timeStamp);
    for (const id of channel.uId) {
      if (authUserId === id) {
        if (channel.channel >= 1) {
          channelList = {
            numChannelsJoined: counter++,
            timeStamp: channel.timeStamp,
          };
          channelsJoined.push(channelList);
        }
        if (channel.channel === -1) {
          channelList = {
            numChannelsJoined: counter - 2,
            timeStamp: channel.timeStamp,
          };
          channelsJoined.push(channelList);
        }
      }
    }
  }

  // Update stats for dm Joined
  let dmCount = 1;
  for (const dm of data.userStats) {
    data.userStats.sort((a: { timeStamp: number; }, b: { timeStamp: number; }) => a.timeStamp - b.timeStamp);
    for (const id of dm.uId) {
      if (authUserId === id) {
        if (dm.dm > 0) {
          dmList = {
            numDmsJoined: dmCount++,
            timeStamp: dm.timeStamp,
          };
          dmsJoined.push(dmList);
        }
        if (dm.dm < 0) {
          dmList = {
            numDmsJoined: dmCount - 2,
            timeStamp: dm.timeStamp,
          };
          dmsJoined.push(dmList);
        }
      }
    }
  }

  // calculation of involvement rate
  const num1 = channelsJoined[channelsJoined.length - 1].numChannelsJoined + dmsJoined[dmsJoined.length - 1].numDmsJoined + messagesSent[messagesSent.length - 1].numMessagesSent;
  const num2 = data.channels.length + data.dms.length + data.channelMessages.length + data.dmMessages.length;

  let involvementRate: any = num1 / num2;

  if (num2 <= 0) {
    involvementRate = 0;
  }

  if (involvementRate >= 1) {
    involvementRate = 1;
  }

  const userStats = {
    channelsJoined: channelsJoined,
    dmsJoined: dmsJoined,
    messagesSent: messagesSent,
    involvementRate: involvementRate,
  };

  return { userStats };
};
