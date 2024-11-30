import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { UserStats } from './typeDefinitions';

/**
 * Given channelId that the authorised user is part of, removes the user of the provided id but their messages remain
 * error if channelId of not of a valid channel or if user is not a member of the channel
 * @param authUserId id of the user that will be removed
 * @param channelId id of the channel that the user is part of
 * @returns { null | ErrorOutput } if no error
 */

function channelLeaveV1(authUserId: number, channelId: number) {
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
  if (validChannel === false) {
    throw HTTPError(400, 'invalid channel');
  }

  for (const channel of data.channels) {
    if (channelId === channel.channelId && authUserId === channel.standupUser) {
      throw HTTPError(400, 'user is the starter of an active standup in the channel');
    }
  }

  // error case 2: channelId is valid but authorised user is not member of channel
  if (isMember === false) {
    throw HTTPError(403, 'user not part of channel');
  }

  // success case
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const index1 in channel.allMembers) {
        if (channel.allMembers[index1] === authUserId) {
          channel.allMembers.splice(parseInt(index1), 1);
          // Creates timeStamp when the user leaves the Channel
          const userStats: UserStats = {
            uId: [authUserId],
            channel: -1,
            dm: 0,
            timeStamp: Math.floor((new Date()).getTime() / 1000),
          };
          data.userStats.push(userStats);
        }
      }
      for (const index2 in channel.ownerMembers) {
        if (channel.ownerMembers[index2] === authUserId) {
          channel.ownerMembers.splice(parseInt(index2), 1);
        }
      }
    }
  }
  setData(data);
  return {};
}

/**
 * Given the uId of the user, maked the user owner of the provided channel
 * error if channelId is not of the valid channel, uId does not idicate to valid user, user with uId is not the member of the channel,
 * user is already the owner of the channel, authorised user does not have the permission of the owner in the channel
 * @param authUserId id of the authorised user
 * @param channelId id of the channel that the owner will be set
 * @param uId id of the user that will be owner when conditons met
 * @returns { null | ErrorOutput }
 */

function channelAddOwnerV1(authUserId: number, channelId: number, uId: number) {
  const data = getData();
  // error case 1: channelId isn't valid channel
  let validChannel = false;
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      validChannel = true;
    }
  }
  if (validChannel === false) {
    throw HTTPError(400, 'invalid channel');
  }

  // error case 2: uId does not refer to a valid user
  let validUId = false;
  for (const user of data.users) {
    if (user.uId === uId) {
      validUId = true;
    }
  }
  if (validUId === false) {
    throw HTTPError(400, 'invalid uId user');
  }

  // error case 3: uId refers to user who is not a member of the channel
  let isMember = false;
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      for (const member of channel.allMembers) {
        if (uId === member) {
          isMember = true;
        }
      }
    }
  }
  if (isMember === false) {
    throw HTTPError(400, 'not member of channel');
  }

  // error case 4: uId refers to user who is already an owner of the channel
  let isOwner = false;
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      for (const owner of channel.ownerMembers) {
        if (owner === uId) {
          isOwner = true;
        }
      }
    }
  }
  if (isOwner === true) {
    throw HTTPError(400, 'already owner of channel');
  }

  // error case 5: authorised user does not have owner permissions in channel (not global owner or owner of channel)

  let isGlobalOwner = false;
  let authIsMember = false;
  let ownerPermissions = false;
  for (const user of data.users) {
    if (authUserId === user.uId) {
      isGlobalOwner = user.isGlobalOwner;
    }
  }
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      for (const member of channel.allMembers) {
        if (member === authUserId) {
          authIsMember = true;
        }
      }
    }
  }
  // if global owner and a member of channel, they get owner permissions
  if (isGlobalOwner === true && authIsMember === true) {
    ownerPermissions = true;
  }

  // if owner, they get owner permissions
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      for (const owner of channel.ownerMembers) {
        if (owner === authUserId) {
          ownerPermissions = true;
        }
      }
    }
  }
  if (ownerPermissions === false) {
    throw HTTPError(403, 'no owner permissions');
  }

  // success case: add uId to ownerMembers
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      channel.ownerMembers.push(uId);
    }
  }

  setData(data);
  return {};
}

/**
 * Given the uId of the user, remove the user as an owner of the channel
 * error if channelId is not of the valid channel, uId does not idicate to valid user, user with uId is not the member of the channel,
 * user is already the owner of the channel, authorised user does not have the permission of the owner in the channel
 * @param authUserId id of the authorised user
 * @param channelId id of the channel where the user owner will be removed
 * @param uId id of the owner to be removed
 * @returns { null | ErrorOutput } if no error
 */

function channelRemoveOwnerV1(authUserId: number, channelId: number, uId: number) {
  const data = getData();

  // error case 1: channelId isn't valid channel
  let validChannel = false;
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      validChannel = true;
    }
  }
  if (validChannel === false) {
    throw HTTPError(400, 'invalid channel');
  }

  // error case 2: uId does not refer to a valid user
  let validUId = false;
  for (const user of data.users) {
    if (user.uId === uId) {
      validUId = true;
    }
  }
  if (validUId === false) {
    throw HTTPError(400, 'uId not valid');
  }

  // error case 3: uId refers to user who is not an owner of the channel
  let uIdIsOwner = false;
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      for (const member of channel.ownerMembers) {
        if (member === uId) {
          uIdIsOwner = true;
        }
      }
    }
  }
  if (uIdIsOwner === false) {
    throw HTTPError(400, 'person getting demoted is not an owner');
  }

  // error case 4: uId refres to user who is currently the only owner of the channel
  let numOwners = 0;
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      numOwners = channel.ownerMembers.length;
    }
  }
  if (uIdIsOwner === true && numOwners === 1) {
    throw HTTPError(400, 'person getting demoted is the only owner');
  }

  // error case 5: channelId is valid and authorised user does not have owner permissions in the channel (not global owner & member or not owner)
  let isGlobalOwner = false;
  let authIsMember = false;
  let ownerPermissions = false;
  for (const user of data.users) {
    if (authUserId === user.uId) {
      isGlobalOwner = user.isGlobalOwner;
    }
  }
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      for (const member of channel.allMembers) {
        if (member === authUserId) {
          authIsMember = true;
        }
      }
    }
  }
  // if global owner and a member of channel, they get owner permissions
  if (isGlobalOwner === true && authIsMember === true) {
    ownerPermissions = true;
  }

  // if owner, they get owner permissions
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      for (const owner of channel.ownerMembers) {
        if (owner === authUserId) {
          ownerPermissions = true;
        }
      }
    }
  }
  if (ownerPermissions === false) {
    throw HTTPError(403, 'person doing the demoting does not have owner permissions');
  }

  // success case: remove uId from owners
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const index in channel.ownerMembers) {
        if (channel.ownerMembers[index] === uId) {
          channel.ownerMembers.splice(parseInt(index), 1);
        }
      }
    }
  }

  setData(data);
  return {};
}

export { channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 };
