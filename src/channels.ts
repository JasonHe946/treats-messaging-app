import { getData, setData } from './dataStore';
import { ChannelId, ErrorOutput, Channel, UserStats } from './typeDefinitions';

/**
 * Creates a new channel that is either public or private and the creater is memeber of the channel
 * error if the channel name is less than1 or more thatn 20 characters
 * @param authUserId id of the user that creates the channel
 * @param name name of the channel
 * @param isPublic boolean to know if the chanel is public or private
 * @returns { channelId } if no errors
 */

function channelsCreateV1(authUserId: number, name: string, isPublic: boolean): ChannelId | ErrorOutput {
  // Error check: if the length of name is 0, return error
  if (name.length <= 0 || name.length > 20) {
    return { error: 'error' };
  }

  const data = getData();
  // // Check if the authUserId is already stored in dataStore
  // let checkUserId = false;
  // for (const user of data.users) {
  //   if (user.uId === authUserId) {
  //     checkUserId = true;
  //   }
  // }

  // // If authUserId is not in dataStore (i.e. checkUserId === 0), return error
  // if (!checkUserId) {
  //   return { error: 'error' };
  // }

  // Creating an Id for the channel
  const channelId = data.channels.length + 1;

  // Creating a new channel
  const newChannel:Channel = {
    channelId: channelId,
    name: name,
    isPublic: isPublic,
    ownerMembers: [authUserId],
    allMembers: [authUserId],
    timeStamp: Math.floor((new Date()).getTime() / 1000),
    standupUser: 0,
    standupActive: 0,
    standupMessages: []
  };
  // Create TimeStamp when a user creates a channel
  const userStats: UserStats = {
    uId: [authUserId],
    channel: 1,
    dm: 0,
    timeStamp: Math.floor((new Date()).getTime() / 1000),
  };

  data.userStats.push(userStats);
  data.channels.push(newChannel);
  setData(data);

  return { channelId: channelId };
}

/**
 * list all the channels and its details that the authorised user part of
 * error if the authuserId is invalid
 * @param authUserId id of the user that iterates inside channels to know if it is part of the channels
 * @returns { channels } if no errors
 */

function channelsListV1(authUserId: number) {
  // checking authUserId is valid
  const data = getData();
  // let checkUserId = false;
  // for (const user of data.users) {
  //   if (user.uId === authUserId) {
  //     checkUserId = true;
  //   }
  // }
  // if (!checkUserId) {
  //   return { error: 'error' };
  // }

  const channels:any = [];

  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      if (member === authUserId) {
        const list = {
          channelId: channel.channelId,
          name: channel.name
        };
        channels.push(list);
      }
    }
  }
  return { channels };
}

/**
 * list all the channels and its details eventhough the user is member or not
 * error is the authuserId is invalid
 * @param authUserId id of the user to get the channel details
 * @returns { channels } if no errors
 */

function channelsListallV1(authUserId: number) {
  // checking authUserId is valid
  const data = getData();
  // let checkUserId = false;
  // for (const user of data.users) {
  //   if (user.uId === authUserId) {
  //     checkUserId = true;
  //   }
  // }
  // if (!checkUserId) {
  //   return { error: 'error' };
  // }

  const channels: any = [];
  for (const channel of data.channels) {
    let list = {};
    list = {
      channelId: channel.channelId,
      name: channel.name
    };
    channels.push(list);
  }
  return { channels };
}

export { channelsCreateV1, channelsListallV1, channelsListV1 };
