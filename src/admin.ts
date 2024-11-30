import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { checkChannelMember, checkGlobalOwner, checkDmMember, countGlobalOwners, validUser } from './functionsHelper';
import { channelLeaveV1 } from './channel2';
import { dmLeaveV1 } from './dm';

export function userPermChangeV1(authUserId: number, uId: number, permissionId: number) {
  const data = getData();

  // error case 5: authUser is not a global owner
  for (const user of data.users) {
    if (authUserId === user.uId) {
      if (user.isGlobalOwner === false) {
        throw HTTPError(403, 'authUser is not a global owner');
      }
    }
  }

  // error case 1: userId is not valid
  if (validUser(uId) === false) {
    throw HTTPError(400, 'userId not valid');
  }

  // error case 3: permission Id is not valid
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'invalid permissionId');
  }

  // error case 4: user already has permission levels of permissionId
  let globalPermission;
  for (const user of data.users) {
    if (user.uId === uId) {
      globalPermission = user.isGlobalOwner;
    }
  }

  if (permissionId === 2 && globalPermission === false) { // if trying to make a member a member
    throw HTTPError(400, 'member is already a member');
  } else if (permissionId === 1 && globalPermission === true) { // if trying to make an owner an owner
    throw HTTPError(400, 'owner is already an owner');
  }

  // error case 2: uId refers to user who is only global owner and
  // they are being demoted to a user

  let numGlobalOwners = 0;
  for (const user of data.users) {
    if (user.isGlobalOwner === true) {
      numGlobalOwners++;
    }
  }
  if (numGlobalOwners === 1 && permissionId === 2) {
    throw HTTPError(400, 'cannot demote the only global owner');
  }

  // success case: change uId to permission specified by permissionId
  for (const user of data.users) {
    if (user.uId === uId) {
      if (permissionId === 1) {
        user.isGlobalOwner = true;
      } else {
        user.isGlobalOwner = false;
      }
    }
  }
  setData(data);

  return {};
}

export const adminUserRemoveV1 = (authUserId: number, uId: number) => {
  const data = getData();
  if (!validUser(uId)) {
    throw HTTPError(400, 'userId not valid');
  } else if (!checkGlobalOwner(authUserId)) {
    throw HTTPError(403, 'Not a global owner');
  } else if (checkGlobalOwner(uId) && countGlobalOwners() === 1) {
    throw HTTPError(400, 'Cannot remove the only global owner');
  } else {
    //  Set the user as "removed".
    for (const user of data.users) {
      if (user.uId === uId) {
        user.isVisible = false;
        user.nameFirst = 'Removed';
        user.nameLast = 'user';
      }
    }

    //  Remove the user from the channel.
    for (const channel of data.channels) {
      if (checkChannelMember(channel.channelId, uId)) {
        channelLeaveV1(uId, channel.channelId);
      }
    }

    //  Remove the user from the dm
    for (const dm of data.dms) {
      if (checkDmMember(uId, dm.dmId)) {
        dmLeaveV1(uId, dm.dmId);
      }
    }

    // Replace contents of the messages to be "Removed user"
    for (const channelMessages of data.channelMessages) {
      if (channelMessages.uId === uId) {
        channelMessages.message = 'Removed user';
      }
    }

    for (const dmMessages of data.dmMessages) {
      if (dmMessages.uId === uId) {
        dmMessages.message = 'Removed user';
      }
    }
  }
  setData(data);
};
