import crypto from 'crypto';
import { getData, setData } from './dataStore';
import { AuthUserId, UserDetails, Data } from './typeDefinitions';
import { v4 as uuidv4 } from 'uuid';
import { channelDetailsV1 } from './channel';
import { dmDetailsV1 } from './dm';
export const SECRET = 'IHaveACrushOnAHotBabe';

/* HASHING FUNCTION */
export function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

/* TOKEN FUNCTIONS */

/**
 * function to give a token in form of a number converted to a string when user reqests to the server
 * @param authUserId id of the user that the token is associated to
 * @returns { token }
 */

export function makeToken(authUserId: number) {
  const data = getData();
  const token = uuidv4();
  // const token = String(Math.floor((Math.random() * 99999) + 10000));
  for (const user of data.users) {
    if (user.uId === authUserId) {
      user.token.push(token);
    }
  }
  setData(data);
  return getHashOf(token + SECRET);
}

/**
 * Given token, checks if the given token is valid or not
 * error if the token is invalid
 * @param token string associated to a session of a user
 * @returns { uId } when token is valid
 */

export function findToken(token: string): AuthUserId {
  const data = getData();
  //
  let validToken = false;
  for (const user of data.users) {
    for (const tokens of user.token) {
      if (getHashOf(tokens + SECRET) === token) {
        validToken = true;
        return { authUserId: user.uId };
      }
    }
  }
  if (validToken === false) {
    return null;
  }
}

/**
 * helper function to obtain details of the authorised user
 * @param authUserId id of the user to get details of
 * @returns { AuthUserId, email, nameFirst, nameLast, handleStr } of user
 */

export const obtainUserDetails = (authUserId: number): UserDetails => {
  const data = getData();

  for (const user of data.users) {
    if (user.uId === authUserId) {
      return {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
      };
    }
  }
};

/**
 * helper function to check if uId is valid in the dataStore or not
 * @param uId id of the user to validate
 * @returns boolean incase of validity
 */

export const validUser = (uId: number): boolean => {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === uId) {
      return true;
    }
  }
  return false;
};

// takes in dmId, if invalid return -1, if successful return the index in the dms array ADD CHECKER ON IF ITS STILL ACTIVE
export function checkValidDM (dmId: number) {
  const data = getData();
  let index = -1;
  for (let i = 0; i < data.dms.length; i++) {
    if (data.dms[i].dmId === dmId && data.dms[i].active === true) {
      index = i;
    }
  }
  return index;
}

/**
 * helper function takes in dmId, if invalid return -1, if successful return the index in the dms array ADD CHECKER ON IF ITS STILL ACTIVE
 * @param dmId id of the dm
 * @returns { index } when success
 */

export const validDmId = (dmId: number): boolean => {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId && dm.active === true) {
      return true;
    }
  }

  return false;
};

/**
 * helper function to generate a name for dms
 * @param uIds Array of user ids
 * @param authUserId id of the authorised user
 * @returns { handleString } when name generated
 */

export const generateDmName = (uIds: number[], authUserId: number) => {
  const data = getData();

  // Array to store handleStr's
  const handleStrArray:any = [];

  // Push the handleStr for the authUserId into the array above
  for (const user of data.users) {
    if (authUserId === user.uId) {
      handleStrArray.push(user.handleStr);
    }
  }

  // Push all handleStrs' into the above array
  for (const uId of uIds) {
    for (const user of data.users) {
      if (uId === user.uId) {
        handleStrArray.push(user.handleStr);
      }
    }
  }

  // Alphabetically sort, include a space after comma, and convert handleStrArray into a single string
  const handleString = handleStrArray.sort().join(', ').toString();

  // Return the formatted array as a single string
  return handleString;
};

/**
 * helper function to check user is member of dm
 * @param authUserId id of the user
 * @param dmId id of the dmId
 * @param data dataStore of the users
 * @returns boolean depending on if the user is member or not
 */

export const checkDmMember = (authUserId: number, dmId: number): boolean => {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      for (const member of dm.dmMembers) {
        if (member === authUserId) {
          return true;
        }
      }
    }
  }

  return false;
};

export const validChannelId = (channelId: number): boolean => {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }
  return false;
};

/**
 * Function to check if a user is a globalOwner
 * @param authUserId
 * @returns
 */
export const checkGlobalOwner = (authUserId: number) => {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === authUserId && user.isGlobalOwner === true) {
      return true;
    }
  }
  return false;
};

export const checkChannelMem = (authUserId: number, channelId: number, data: Data): boolean => {
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.allMembers) {
        if (member === authUserId) {
          return true;
        }
      }
    }
  }
  return false;
};

export const checkChannelMsgId = (messageId: number): boolean => {
  const data = getData();
  for (const message of data.channelMessages) {
    if (message.messageId === messageId && message.isVisible === true) {
      return true;
    }
  }
  return false;
};

export const checkDmMsgId = (messageId: number): boolean => {
  const data = getData();
  for (const message of data.dmMessages) {
    if (message.messageId === messageId && message.isVisible === true) {
      return true;
    }
  }
  return false;
};

export const countGlobalOwners = () => {
  const data = getData();
  let numGlobalOwners = 0;
  for (const user of data.users) {
    if (user.isGlobalOwner === true) {
      numGlobalOwners++;
    }
  }

  return numGlobalOwners;
};

/**
 * Function to create notifications for users who are tagged
 * @param message message being sent/edited
 * @param session can either be a dm or ch (channel)
 * @param id ID of channel or dm
 */
export const createTaggedNotifications = (message: string, session: string, id: number, authUserId: number, timeSent: number) => {
  const data = getData();

  //  Store handles in an array.
  const handles = [] as any;
  const regexp = '@([a-z0-9]+)';

  for (let char = 0; char < message.length; char++) {
    if (message[char] === '@') {
      const handleStr = message.substring(char);
      handles.push(handleStr.match(regexp)[1]);
    }
  }
  //  Remove duplicate handles
  const uniqueHandles = handles.filter((value: any, index: any) => handles.indexOf(value) === index);

  //  Check if the handles are valid, if not remove them from the uniqueHandle array
  for (const index in uniqueHandles) {
    let validHandle = false;
    for (const user of data.users) {
      if (user.handleStr === uniqueHandles[index]) {
        validHandle = true;
        break;
      }
    }
    if (!validHandle) {
      uniqueHandles.splice(parseInt(index), 1);
    }
  }

  // Check if the handles are associated with a user who is in the channel/dm, if not remove them
  let membersIdArray: any = [];
  const membersHandleArray: any = [];
  if (session === 'ch') {
    //  Locate all the members of the channel
    for (const channel of data.channels) {
      if (channel.channelId === id) {
        membersIdArray = channel.allMembers;
      }
    }
    //  Locate the members respective handleStr
    for (const user of data.users) {
      for (const uId of membersIdArray) {
        if (user.uId === uId) {
          membersHandleArray.push(user.handleStr);
          break;
        }
      }
    }

    // Compare uniqueHandle array with membersHandleArray to see if any handles are not members
    for (const key in uniqueHandles) {
      if (!membersHandleArray.includes(uniqueHandles[key])) {
        uniqueHandles.splice(parseInt(key), 1);
      }
    }
  } else {
    //  Locate all the members of the channel
    for (const channel of data.dms) {
      if (channel.dmId === id) {
        membersIdArray = channel.dmMembers;
      }
    }

    //  Locate the members respective handleStr
    for (const user of data.users) {
      for (const uId of membersIdArray) {
        if (uId === user.uId) {
          membersHandleArray.push(user.handleStr);
          break;
        }
      }
    }

    // Compare uniqueHandle array with membersHandleArray to see if any handles are not members
    for (const key in uniqueHandles) {
      if (!membersHandleArray.includes(uniqueHandles[key])) {
        uniqueHandles.splice(parseInt(key), 1);
      }
    }
  }

  //  Send notifications to everyone that is tagged in the channel
  if (session === 'ch') {
    for (const user of data.users) {
      for (const handle of uniqueHandles) {
        if (handle === user.handleStr) {
          const notifyObj = {
            channelId: id,
            dmId: -1,
            notificationMessage: `${obtainUserDetails(authUserId).handleStr} tagged you in ${channelDetailsV1(authUserId, id).name}: ${message.slice(0, 20)}`,
            timeSent: timeSent,
          };
          user.notifications.unshift(notifyObj);
        }
      }
    }
    //  Send notifications to everyone that is tagged in the dm
  } else {
    for (const user of data.users) {
      for (const handle of uniqueHandles) {
        if (handle === user.handleStr) {
          const notifyObj = {
            channelId: -1,
            dmId: id,
            notificationMessage: `${obtainUserDetails(authUserId).handleStr} tagged you in ${dmDetailsV1(authUserId, id).name}: ${message.slice(0, 20)}`,
            timeSent: timeSent,
          };
          user.notifications.unshift(notifyObj);
        }
      }
    }
  }

  setData(data);
};

export const createReactNotification = (authUserId: number, uId: number, sessionType: string, sessionId: number) => {
  const data = getData();

  let authUserHandle: string;
  for (const user of data.users) {
    if (user.uId === authUserId) {
      authUserHandle = user.handleStr;
    }
  }

  let sessionName: string;
  if (sessionType === 'ch') {
    for (const channel of data.channels) {
      if (channel.channelId === sessionId) {
        sessionName = channel.name;
      }
    }
  } else {
    for (const dm of data.dms) {
      if (dm.dmId === sessionId) {
        sessionName = dm.name;
      }
    }
  }

  for (const user of data.users) {
    if (user.uId === uId) {
      if (sessionType === 'ch') {
        const notifyObj = {
          channelId: sessionId,
          dmId: -1,
          notificationMessage: `${authUserHandle} reacted to your message in ${sessionName}`,
          timeSent: Math.floor((new Date()).getTime() / 1000),
        };
        user.notifications.unshift(notifyObj);
      } else {
        const notifyObj = {
          channelId: -1,
          dmId: sessionId,
          notificationMessage: `${authUserHandle} reacted to your message in ${sessionName}`,
          timeSent: Math.floor((new Date()).getTime() / 1000),
        };
        user.notifications.unshift(notifyObj);
      }
    }
  }
  setData(data);
};

/**
 * Function to check if the channelID is valid
 * @param channelId ID of the channel
 */
export const validChannel = (channelId: number) => {
  const data = getData();
  for (const index in data.channels) {
    if (data.channels[index].channelId === channelId) {
      return parseInt(index);
    }
  }
  return -1;
};

/**
 * Function to check if a user is a member of a channel
 * @param channelId ID of the channel
 * @param authUserId User ID
 * @returns
 */
export const checkChannelMember = (channelId: number, authUserId: number) => {
  const data = getData();
  const channel = data.channels[validChannel(channelId)];
  for (const member of channel.allMembers) {
    if (member === authUserId) {
      return true;
    }
  }
  return false;
};

/**
 * Function to remove an item
 * @param arr
 * @param value
 * @returns
 */
export const removeItemOnce = (arr: number[], value: number): number[] => {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }

  return arr;
};
