import { getData, setData } from './dataStore';
import { UsersOutput, ErrorOutput } from './typeDefinitions';
import validator from 'validator';
import HTTPError from 'http-errors';

/**
 * Given an authorised user Id, provides information of the user
 * error if the uId is not refering to a valid user
 * @param authUserId id of the user that the details is obtained
 * @param uId id of the user that is already registered
 * @returns { user } if no errors
 */

export function userProfileV1(authUserId: number, uId: number): UsersOutput | ErrorOutput {
  const data = getData();
  let validAuthUser = false;
  for (const user of data.users) {
    if (user.uId === authUserId) {
      validAuthUser = true;
    }
  }

  if (!validAuthUser) {
    throw HTTPError(403, 'invalid token');
  }

  let validUser = false;
  for (const user of data.users) {
    if (user.uId === uId) {
      validUser = true;
    }
  }

  if (!validUser) {
    throw HTTPError(400, 'invalid user');
  }

  // scan through array and check if uId exists
  for (const user of data.users) {
    if (user.uId === uId) {
      return {
        user: {
          uId: user.uId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr
        }
      };
    }
  }
}

/**
 * Given authorised user Id, new first and last name is updated of th user
 * error if the length of the user first and last name is not between 1 and 50 characters
 * @param authUserId id of the user that the name is updated
 * @param nameFirst new first name of the user
 * @param nameLast new last name of the user
 * @returns { } if no errors
 */

export const userProfileSetnameV1 = (authUserId: number, nameFirst: string, nameLast: string) => {
  const data = getData();
  //  If authUserId is invalid, return error
  let isValidUser = false;
  for (const user of data.users) {
    if (user.uId === authUserId) {
      isValidUser = true;
    }
  }

  if (!isValidUser) {
    throw HTTPError(403, 'invalid token');
  }

  //  If nameFirst is empty or is more than 50 characters long, return error
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'invalid nameFirst');
  }

  //  If nameLast is empty or is more than 50 characters long, return error
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'invalid nameLast');
  }

  for (const user of data.users) {
    if (user.uId === authUserId) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
      break;
    }
  }

  setData(data);
  return {};
};

/**
 * Given authorised use Id, sets a new email of the user
 * error if the email is not valid or email is already in use
 * @param authUserId id of the user that the email is being changed
 * @param email new email of the user
 * @returns { } if no errors
 */

export const userProfileSetemailV1 = (authUserId: number, email: string) => {
  //  If authUserId is invalid, return error
  const data = getData();
  let isValidUser = false;
  for (const user of data.users) {
    if (user.uId === authUserId) {
      isValidUser = true;
    }
  }
  if (!isValidUser) {
    throw HTTPError(403, 'invalid token');
  }
  //  Return error when email entered is not a valid email.
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'invalid email entered');
  }
  //  Return error when email address is already being used by another user.
  for (const user of data.users) {
    if (user.email === email) {
      throw HTTPError(400, 'email already used by another user');
    }
  }

  // success case
  for (const user of data.users) {
    if (user.uId === authUserId) {
      user.email = email;
    }
  }
  setData(data);
  return {};
};

/**
 * lists all the user and their details
 * @param authUserId id passed in to get information for the users
 * @returns { users } array of objects, where each object contains user
 */

export function usersAllV1(authUserId: number) {
  //  checking authUserId is valid
  const data = getData();
  let isValidUser = false;
  for (const user of data.users) {
    if (user.uId === authUserId) {
      isValidUser = true;
    }
  }

  if (!isValidUser) {
    throw HTTPError(403, 'invalid token');
  }

  const users: any = [];
  for (const user of data.users) {
    if (user.isVisible === true) {
      const list = {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr
      };
      users.push(list);
    }
  }
  return { users: users };
}

/**
 * Given authorised user Id, updates users handle with new handle
 * error if length of handleStr is not between 3 and 20 or handleStr contains non alphanumeric characters or handle is already used
 * @param authUserId id of the user whose handle is being changed
 * @param handleStr new handle of the user
 * @returns { } if no errors
 */

export const userProfileSetHandleV1 = (authUserId: number, handleStr: string) => {
  // If authUserId is invalid, return error
  const data = getData();
  let isValidUser = false;
  for (const user of data.users) {
    if (user.uId === authUserId) {
      isValidUser = true;
    }
  }

  if (!isValidUser) {
    throw HTTPError(403, 'invalid token');
  }

  // If length of handleStr is less than 3 or greater than 20, return error
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'invalid length of handleStr');
  }

  // If handleStr contains non alphanumeric characters, return error
  if (!handleStr.match(/^[0-9a-z]+$/)) {
    throw HTTPError(400, 'handleStr should not contain non-alphanumeric characters');
  }

  // If handleStr is taken, return error
  for (const user of data.users) {
    if (user.handleStr === handleStr) {
      throw HTTPError(400, 'handleStr already taken by another user');
    }
  }

  // success case

  for (const user of data.users) {
    if (user.uId === authUserId) {
      user.handleStr = handleStr;
    }
  }

  setData(data);
  return {};
};
