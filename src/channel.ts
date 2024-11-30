import { getData, setData } from './dataStore';
import { ChannelDetails, UserStats } from './typeDefinitions';
import { obtainUserDetails } from './functionsHelper';
import HTTPError from 'http-errors';

/**
 * Given channelId that the user is member of, supply details of channel
 * error if channelId is not refer to a valid channel or user is not member of the provided channel
 * @param authUserId id of the user that is a member of the channel
 * @param channelId id of the channel where the details is obtained
 * @returns { name, isPublic, ownerMembers, allMembers } if no erros
 */

export function channelDetailsV1(authUserId: number, channelId: number): ChannelDetails {
  const data = getData();

  // error case 1: channelId does not refer to a valid channel
  let validChannel = false;
  let isMember = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      validChannel = true;
      for (const member of channel.allMembers) {
        if (member === authUserId) {
          isMember = true;
        }
      }
    }
  }
  if (!validChannel) {
    throw HTTPError(400, 'invalid input');
  }

  // error case 2: channelId is valid but authorised user is not member of channel
  if (!isMember) {
    throw HTTPError(403, 'invalid permissions');
  }

  // // error case 3: Check if the authUserId is already stored in dataStore
  // let checkUserId = false;
  // for (const user of data.users) {
  //   if (user.uId === authUserId) {
  //     checkUserId = true;
  //   }
  // }

  // // If authUserId is not in dataStore (i.e. checkUserId === 0), return error
  // if (!checkUserId) {
  //   throw HTTPError(400, 'invalid input');
  // }

  const ownerMembers:any = [];
  const allMembers:any = [];

  // Store user details of users in ownerMembers
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.ownerMembers) {
        ownerMembers.push(obtainUserDetails(member));
      }
    }
  }

  // Store user details of users in all
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.allMembers) {
        allMembers.push(obtainUserDetails(member));
      }
    }
  }

  // valid input
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: ownerMembers,
        allMembers: allMembers,
      };
    }
  }

  // If channel does not exist, return error
  // throw HTTPError(400, 'invalid input');
}

/**
 * Given a channelId and an authorised user, adds the user to the channel
 * error if channelId is not of a valid channel, user is already member of the channel,
 * channelId is of a private channel and authorised user is not a global owner
 * @param authUserId id of the user that the user can join
 * @param channelId id of the channel that the user joins
 * @returns { } if no error
 */

export function channelJoinV1(authUserId: number, channelId: number): null {
  const data = getData();

  // error case 1: channelId does not refer to valid channel
  let validChannel = false;
  let isPublic = false; // find whether its public or private

  for (let i = 0; i < data.channels.length; i++) {
    if (data.channels[i].channelId === channelId) {
      validChannel = true;
      isPublic = data.channels[i].isPublic;
    }
  }
  if (validChannel === false) {
    throw HTTPError(400, 'invalid input');
  }

  let alreadyMember = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.allMembers) {
        if (member === authUserId) {
          alreadyMember = true;
        }
      }
    }
  }

  if (alreadyMember === true) {
    throw HTTPError(400, 'invalid input');
  }
  // error case 3: channelId refers to a private channel and the joining
  // authorised user is not a member or a global owner (first user to ever register)
  let globalOwner = false;
  for (let j = 0; j < data.users.length; j++) {
    if (data.users[j].uId === authUserId) {
      globalOwner = data.users[j].isGlobalOwner;
    }
  }

  if (isPublic === false && globalOwner === false && alreadyMember === false) {
    throw HTTPError(403, 'invalid permissions');
  }

  // // error case 4: Check if the authUserId is already stored in dataStore
  // let checkUserId = false;
  // for (const user of data.users) {
  //   if (user.uId === authUserId) {
  //     checkUserId = true;
  //   }
  // }

  // // If authUserId is not in dataStore (i.e. checkUserId === 0), return error
  // if (!checkUserId) {
  //   throw HTTPError(400, 'invalid input');
  // }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.allMembers.push(authUserId);
      // Creates timeStamp when the User joins the Channel
      const userStats: UserStats = {
        uId: [authUserId],
        channel: 2,
        dm: 0,
        timeStamp: Math.floor((new Date()).getTime() / 1000),
      };
      data.userStats.push(userStats);
    }
  }
  setData(data);

  return null;
}

/**
 * Invites a user with uId, adds the user to the channel immediately in both public and private and members of the channel are able to invite
 * error if channelId is not of a valid channel, uId is not of valid user, uId is of a existing member of the channel and authorised user is not a member of the channel
 * @param authUserId id of the valid user that sends the invites
 * @param channelId id of the channel that the user is invited to
 * @param uId id of the user that gets the invitation
 * @return { } if no error
 */

export function channelInviteV1(authUserId: number, channelId: number, uId: number) {
  const data = getData();

  // error case 1: channelID doesn't refer to valid channel
  let validChannel = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      validChannel = true;
    }
  }
  if (!validChannel) {
    // return { error: '400' };
    throw HTTPError(400, 'invalid input');
  }

  // error case 2: uId doesn't refer to a valid user
  let validUId = false;
  for (const user of data.users) {
    if (user.uId === uId) {
      validUId = true;
    }
  }
  if (validUId === false) {
    // return { error: '400' };
    throw HTTPError(400, 'invalid input');
  }

  let uIdIsMember = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.allMembers) {
        if (member === uId) {
          uIdIsMember = true;
        }
      }
    }
  }

  if (uIdIsMember === true) {
    throw HTTPError(400, 'invalid input');
  }

  let authIsMember = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.allMembers) {
        if (member === authUserId) {
          authIsMember = true;
        }
      }
    }
  }

  if (authIsMember === false) {
    throw HTTPError(403, 'invalid permissions');
  }

  // // Error case 5: Check if the authUserId is already stored in dataStore
  // let checkUserId = false;
  // for (const user of data.users) {
  //   if (user.uId === authUserId) {
  //     checkUserId = true;
  //   }
  // }

  // // If authUserId is not in dataStore (i.e. checkUserId === 0), return error
  // if (!checkUserId) {
  //   throw HTTPError(400, 'user not in datastore');
  // }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.allMembers.push(uId);
      // Create a timeStamp for the user when the user is invited to channel
      const userStats: UserStats = {
        uId: [uId],
        channel: 3,
        dm: 0,
        timeStamp: Math.floor((new Date()).getTime() / 1000),
      };

      data.userStats.push(userStats);
      //  Create a notification object for the user being added to channel
      const notifyObj = {
        channelId: channelId,
        dmId: -1,
        timeSent: Math.floor((new Date()).getTime() / 1000),
        notificationMessage: `${obtainUserDetails(authUserId).handleStr} added you to ${channelDetailsV1(authUserId, channelId).name}`,
      };

      //  Add the notifyObject to the correct user.
      for (const user of data.users) {
        if (user.uId === uId) {
          user.notifications.unshift(notifyObj);
        }
      }
    }
  }

  setData(data);
  return {};
}

/**
 * Given a channelId of a channel that the authorised user is member of, displays specified messages
 * error if channelId is not valid of a valid channel, start is greater than total number of messages and authorised user is not a member of the channel
 * @param authUserId id of the authorised user
 * @param channelId id of the valid channel
 * @param start index for the messages
 * @return { messages, start, end } if no error
 */

export function channelMessagesV1(authUserId: number, channelId: number, start: number) {
  const data = getData();

  // check if channeld is valid
  let validChannel = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      validChannel = true;
    }
  }
  if (!validChannel) {
    throw HTTPError(400, 'invalid input');
  }

  // // check if authUserId is valid
  // let checkUserId = false;
  // for (const user of data.users) {
  //   if (user.uId === authUserId) {
  //     checkUserId = true;
  //   }
  // }

  // // If authUserId is not in dataStore (i.e. checkUserId === 0), return error
  // if (!checkUserId) {
  //   throw HTTPError(400, 'user not in datastore');
  // }

  // check if authUserId is a member of the channel
  let isMember = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.allMembers) {
        if (member === authUserId) {
          isMember = true;
        }
      }
    }
  }
  if (!isMember) {
    throw HTTPError(403, 'invalid permissions');
  }

  //  count how many messages are in a channel, if it is greater, return null
  const channelMessages = data.channelMessages.filter(channelMessage => channelMessage.channelId === channelId);
  const numOfMessages = channelMessages.length;

  if (numOfMessages < start) {
    throw HTTPError(400, 'invalid input');
  }

  // Display most recent 50 messages in the channel

  // Sort data.channelMessages based on timeSent.
  data.channelMessages.sort((a, b) => b.timeSent - a.timeSent);

  // Array to store the desired messages in
  const messagesArray: any = [];

  // Counter to track how many messages are being added to messagesArray
  let messageCounter = 0;

  // end is either 50 + start if 50 messages are being displayed or -1 all the messages in the dm are found.
  let end = -1;

  for (const channelMessage of channelMessages) {
    if (messageCounter < start && channelMessage.isVisible === true) {
      messageCounter++;
    } else if (messageCounter === start + 50) {
      end = start + 50;
      break;
    } else if (messageCounter >= start && channelMessage.isVisible === true && channelMessage.timeSent <= Math.floor((new Date()).getTime() / 1000)) {
      if (channelMessage.reacts[0].uIds.length === 0) {
        const messageObj = {
          messageId: channelMessage.messageId,
          uId: channelMessage.uId,
          message: channelMessage.message,
          timeSent: channelMessage.timeSent,
          reacts: [] as any,
        };

        messagesArray.push(messageObj);
        messageCounter++;
      } else {
        const messageObj = {
          messageId: channelMessage.messageId,
          uId: channelMessage.uId,
          message: channelMessage.message,
          timeSent: channelMessage.timeSent,
          reacts: {
            reactId: 1,
            uIds: channelMessage.reacts[0].uIds,
            isThisUserReacted: channelMessage.reacts[0].uIds.includes(authUserId),
          },
        };

        messagesArray.push(messageObj);
        messageCounter++;
      }
    }
  }

  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
}
