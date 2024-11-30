import { getData, setData } from './dataStore';
import { obtainUserDetails, validUser, checkValidDM, validDmId, generateDmName, checkDmMember } from './functionsHelper';
import { DmMessageType, Dms, UserStats } from './typeDefinitions';
import HTTPError from 'http-errors';
import { createTaggedNotifications } from './functionsHelper';
/**
 * Given a authUserId, creates a group chat known as dm
 * error if user with uId is not in the uIds or there are dublicaete uId inside uIds
 * @param authUserId id of the authorised user
 * @param uIds array of the user ids
 * @returns { dmId } id of the dm if no error
 */

export const dmCreateV1 = (authUserId: number, uIds: number[]) => {
  const data = getData();

  // // If authUserId is invalid, return error
  // if (!validUser(authUserId)) {
  //   throw HTTPError(403, 'invalid auth token');
  // }

  // If a uId refers to an invalid uId, return error
  for (const uId of uIds) {
    if (!validUser(uId)) {
      throw HTTPError(400, 'invalid member uIds');
    }
  }

  // If the authUser is in the uIds array, return error
  for (const uId of uIds) {
    if (authUserId === uId) {
      throw HTTPError(400, 'creator should not be in member uIds');
    }
  }

  // If there are duplicate uIds in "uIds", return error
  const uniqueIds = Array.from(new Set(uIds));
  if (uniqueIds.length !== uIds.length) {
    throw HTTPError(400, 'should not have duplicate uIds');
  }

  // Generate dmId based on the number of dms in dataStore
  const dmId = data.dms.length + 1;

  // Generate the name of the dm
  const dmName = generateDmName(uIds, authUserId);

  const dmObject:Dms = {
    dmId: dmId,
    name: dmName,
    owner: authUserId,
    dmMembers: uIds,
    active: true,
    timeStamp: Math.floor((new Date()).getTime() / 1000),
  };
  // Create time Stamp when a dm is created
  const userStats: UserStats = {
    uId: uIds,
    channel: 0,
    dm: 1,
    timeStamp: Math.floor((new Date()).getTime() / 1000),
  };
  data.userStats.push(userStats);
  //  Create notifications for added users (not including the creator)
  for (const uId of uIds) {
    const notifyObj = {
      channelId: -1,
      dmId: dmId,
      notificationMessage: `${obtainUserDetails(authUserId).handleStr} added you to ${dmName}`,
      timeSent: Math.floor((new Date()).getTime() / 1000),
    };
    for (const user of data.users) {
      if (uId === user.uId) {
        user.notifications.unshift(notifyObj);
      }
    }
  }

  // Add the authUser's uid to the beginning of dmMembers
  dmObject.dmMembers.unshift(authUserId);

  // data.userStats.push(userStats);
  data.dms.push(dmObject);
  setData(data);
  return ({ dmId: dmId });
};

/**
 * Given the id of dm, user is removed and owner can also leave
 * error if id of dm is not of a valid dm or the authorised user is not a member of dm
 * @param authUserId id of the user to leave the group chat
 * @param dmId id of the dm where the user leaves the group chat
 * @returns { } if no error
 */

export const dmLeaveV1 = (authUserId: number, dmId: number) => {
  const data = getData();
  // // If authUserId is invalid, return error
  // if (!validUser(authUserId)) {
  //   throw HTTPError(403, 'invalid authuser token');
  // }

  // return error when dmId is invalid
  if (!validDmId(dmId)) {
    throw HTTPError(400, 'dmId is invalid');
  }

  // return error when authUser is not a member of dm
  if (!checkDmMember(authUserId, dmId)) {
    throw HTTPError(403, 'user is not member of DM');
  }

  // Check if the authUser is the owner of the dm. If yes, set owner key to -1.
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (authUserId === dm.owner) {
        dm.owner = -1;
      }

      // Remove authUser as a member of the dm
      for (const index in dm.dmMembers) {
        if (dm.dmMembers[index] === authUserId) {
          dm.dmMembers.splice(parseInt(index), 1);
          // Creates time Stamp when a user leaves a dm
          const userStats: UserStats = {
            uId: [authUserId],
            channel: 0,
            dm: -2,
            timeStamp: Math.floor((new Date()).getTime() / 1000),
          };
          data.userStats.push(userStats);
        }
      }
    }
  }

  setData(data);
  return {};
};

/**
 * Given the authorised Id and a dmId, message is sent to the targeted dm
 * error if id of the dm is not of a valid dm, message length is less than 1 or more thatn 1000, authorised user is not a memebr of the group chat
 * @param authUserId id of the user that messages in the dm
 * @param dmId id of the dm message is to be sent
 * @param message message of the user sent in the dm
 * @returns { messageId } if no error
 */

export const messageSendDmV1 = (authUserId: number, dmId: number, message: string): any | null => {
  const data = getData();
  // If length of message is less than 1 or greater than 1000, return error
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'invalid message length');
  }

  // return error when dmId is invalid
  if (!validDmId(dmId)) {
    throw HTTPError(400, 'dmId is not valid');
  }

  // return error when authUser is not a member of dm
  if (!checkDmMember(authUserId, dmId)) {
    throw HTTPError(403, 'authUser is not member of DM');
  }

  // Generating messageId
  const messageId = data.channelMessages.length + data.dmMessages.length;

  const messageObj: DmMessageType = {
    messageId: messageId,
    dmId: dmId,
    uId: authUserId,
    message: message,
    isVisible: true,
    timeSent: Math.floor((new Date()).getTime() / 1000),
    reacts: [
      {
        reactId: 1,
        uIds: [],
      }
    ],
    isPinned: false,
  };

  data.dmMessages.unshift(messageObj);

  createTaggedNotifications(message, 'dm', dmId, authUserId, Math.floor((new Date()).getTime() / 1000));

  setData(data);
  return ({ messageId: messageId });
};

/**
 * Given athorised user Id, provides list of dms and their details
 * @param authUserId id of the user that is memeber inside the dm
 * @returns { dms } Array of objects, where each object contains types { dmId, name }
 */

export function dmListV1(authUserId: number) {
  const data = getData();
  const dms:any = [];
  for (const DM of data.dms) {
    for (const member of DM.dmMembers) {
      if (member === authUserId && DM.active === true) {
        const pushDM = {
          dmId: DM.dmId,
          name: DM.name,
        };
        dms.push(pushDM);
      }
    }
  }
  return { dms: dms };
}

/**
 * Given the creator of the dm, removes the DM and all members are also removed
 * error if id of the dm is not of a valid dm or authorised user is not the dm creator or authorised user is not in the dm
 * @param authUserId id of the authorised user
 * @param dmId id of the dm
 * @returns { } if no error
 */

export function dmRemoveV1(authUserId: number, dmId: number) {
  const data = getData();
  // error case 1: dmId does not refer to a valid DM
  const whichDM = checkValidDM(dmId);
  if (whichDM === -1) {
    throw HTTPError(400, 'invalid DM id');
  }

  // error case 3: dmId is valid but authorised user is no longer in the DM
  let authIsMember = false;
  for (const member of data.dms[whichDM].dmMembers) {
    if (member === authUserId) {
      authIsMember = true;
    }
  }
  if (authIsMember === false) {
    throw HTTPError(403, 'authUser is no longer in DM');
  }

  // whichDM is the index of the DM with dmID passed in
  // error case 2: dmId is valid but authorised user is not the original DM creator
  let ogDMCreator = false;
  if (data.dms[whichDM].owner === authUserId) {
    ogDMCreator = true;
  }

  if (ogDMCreator === false) {
    throw HTTPError(403, 'authUser is not original DM creator');
  }

  // success case: remove DM
  let userStats: any = {};
  data.dms[whichDM].active = false;
  for (let i = data.dms[whichDM].dmMembers.length; i > 0; i--) {
  // Creates a time stamp when a dm is removed
    userStats = {
      uId: [],
      channel: 0,
      dm: -1,
      timeStamp: Math.floor((new Date()).getTime() / 1000),
    };
    userStats.uId.push(data.dms[whichDM].dmMembers[i]);
    data.dms[whichDM].dmMembers.pop();
  }
  data.userStats.push(userStats);
  setData(data);
  return {};
}

/**
 * Given a dmId of a dm that the authorised user is member of, displays specified messages
 * error if dmId is not valid of a valid dm, start is greater than total number of messages and authorised user is not a member of the dm
 * @param authUserId id of the user that is sending the message
 * @param dmId id of an dm that the message of sent
 * @param start index for messages
 * @returns { messagesArray, end } if no error
 */

export const dmMessagesV1 = (authUserId: number, dmId: number, start: number) => {
  const data = getData();

  // return null when dmId is invalid
  if (!validDmId(dmId)) {
    throw HTTPError(400, 'dmId is invalid');
  }

  // return null when authUser is not a member of the dm
  if (!checkDmMember(authUserId, dmId)) {
    throw HTTPError(403, 'authUser is not member of DM');
  }

  // Return null when start is greater than the number of messages in the dm
  const dmMessages = data.dmMessages.filter(dmMessage => dmMessage.dmId === dmId);
  const numOfMessages = dmMessages.length;

  if (numOfMessages < start) {
    throw HTTPError(400, 'start is greater than total messages');
  }

  // Display at most the first 50 messages in the dm starting from the start index

  // Sort data.dmMessages based on timeSent.
  data.dmMessages.sort((a, b) => b.timeSent - a.timeSent);

  // Array to store the desired messages in
  const messagesArray: any = [];

  // Counter to track how many messages are being added to messagesArray
  let messageCounter = 0;

  // end is either 50 + start if 50 messages are being displayed or -1 all the messages in the dm are found.
  let end = -1;

  for (const dmMessage of dmMessages) {
    if (messageCounter < start && dmMessage.isVisible === true) {
      messageCounter++;
    } else if (messageCounter === start + 50) {
      end = start + 50;
      break;
    } else if (messageCounter >= start && dmMessage.isVisible === true && dmMessage.timeSent <= Math.floor((new Date()).getTime() / 1000)) {
      const messageObj = {
        messageId: dmMessage.messageId,
        uId: dmMessage.uId,
        message: dmMessage.message,
        timeSent: dmMessage.timeSent,
      };
      messagesArray.push(messageObj);
      messageCounter++;
    }
  }
  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
};

/**
 * Given the dm id and the authorised user Id, supplies the details of the dm
 * @param authUserId id of the user taht is part of the dm
 * @param dmId id of the dm that the information is obtained
 * @returns { name, members } if no errors
 */

export function dmDetailsV1(authUserId: number, dmId: number) {
  const data = getData();

  // error case 1: dmId does not refer to a valid DM
  const whichDM = checkValidDM(dmId);
  if (whichDM === -1) {
    throw HTTPError(400, 'invalid DmId');
  }

  // error case 2: dmId is valid but authorised user is not member of the DM
  let authIsMember = false;
  for (const member of data.dms[whichDM].dmMembers) {
    if (member === authUserId) {
      authIsMember = true;
    }
  }
  if (authIsMember === false) {
    throw HTTPError(403, 'authUser is not member of DM');
  }

  // // extra error case: if DM is no longer in use
  // if (data.dms[whichDM].active === false) {
  //   throw HTTPError(400, 'invalid DmId');
  // }

  // success case
  const members = [];
  for (const member of data.dms[whichDM].dmMembers) {
    members.push(obtainUserDetails(member));
  }

  setData(data);
  return {
    name: data.dms[whichDM].name,
    members: members,
  };
}
