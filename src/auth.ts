import validator from 'validator';
import { getData, setData } from './dataStore';
import { AuthUserId, ErrorOutput, User } from './typeDefinitions';
import { getHashOf, SECRET } from './functionsHelper';
import HTTPError from 'http-errors';

/**
 * Given a registered user's email and password logs in the user
 * error if the email does not exists or password is not correct
 * @param email email address of the user to log in
 * @param password detail used to enter in password for logging in
 * @returns { AuthUserId } if no errors
 */

function authLoginV1(email: string, password: string): AuthUserId | ErrorOutput {
  const data = getData();

  // Email does not exist in dataStore, return error
  let checkEmail = 0;
  for (const user of data.users) {
    if (user.email === email) {
      checkEmail = 1;
    }
  }

  if (checkEmail === 0) {
    return { error: 'error' };
  }

  // Scan through users array to find corresponding email
  for (const user of data.users) {
    if (user.email === email) {
      if (user.password === getHashOf(password)) {
        return { authUserId: user.uId };
      } else {
        return { error: 'error' };
      }
    }
  }
}

/**
 * Given user's email password, first and last name, creates an account for them and assigns a unique AuthUserId
 * error if email is not valid, email already used, length of password is less than 6 characters
 * and length of nameFirst and nameLaste is not between 1 to 50 characters
 * @param email email address of the user to create the account
 * @param password password of the user to create the account
 * @param nameFirst first name of the user to create the account
 * @param nameLast last name of the user to create the account
 * @returns { AuthUserId } if no errors
 */

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): AuthUserId | ErrorOutput {
  const data = getData();

  // Return error when email entered is not a valid email.
  if (!validator.isEmail(email)) {
    return { error: 'error' };
  }

  // Return error when email address is already being used by another user.
  for (const user of data.users) {
    if (user.email === email) {
      return { error: 'error' };
    }
  }

  // Return error when length of password is less than 6 characters.
  if (password.length < 6) {
    return { error: 'error' };
  }

  // Return error when length of nameFirst is not between 1 and 50 characters inclusive.
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'error' };
  }

  // Return error when length of nameLast is not between 1 and 50 characters inclusive.
  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'error' };
  }

  // Creating uId based on how many users are registered
  const uId = data.users.length + 1;

  // Creating handleStr
  // Casted-to-lowercase alphanumeric (a-z0-9) first name and last name
  const firstName = nameFirst.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const lastName = nameLast.replace(/[^a-z0-9]/gi, '').toLowerCase();
  // handleStr is cut off at 20 characters
  let handleStr = firstName + lastName;
  handleStr = handleStr.slice(0, 20);

  // Iterates through users to see how many handles are taken
  let repetition = -1;
  for (const user of data.users) {
    if (user.handleStr.includes(handleStr)) {
      repetition += 1;
    }
  }

  // Appends the concatenated names with the smallest number if the handle is once again taken
  if (repetition !== -1) {
    handleStr = handleStr + repetition;
  }

  let isGlobalOwner = false;
  if (data.users.length === 0) {
    isGlobalOwner = true;
  }

  // authRegisterV1
  const registeredUser: User = {
    uId: uId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: getHashOf(password),
    isGlobalOwner: isGlobalOwner,
    handleStr: handleStr,
    token: [],
    notifications: [],
    secretCode: -999,
    timeStamp: Math.floor((new Date()).getTime() / 1000),
    isVisible: true,
  };

  // Storing into data and pushing back into dataStore.js
  data.users.push(registeredUser);
  setData(data);

  return { authUserId: uId };
}

/**
 * takes in a token of the user and invalidates it, so the user logs out
 * @param token a unique number given to the user when they register or login
 */

const authLogoutV1 = (token: string) => {
  const data = getData();

  for (const user of data.users) {
    for (const index in user.token) {
      if (getHashOf(user.token[index] + SECRET) === token) {
        // console.log(`++++++${token}`);
        user.token.splice(parseInt(index), 1);
      }
    }
  }

  setData(data);
};

// implementation function for auth/passwordreset/request/v1
export function PWResetRequestV1(email: string) {
  const data = getData();
  // const secretCode = Math.floor((Math.random() * 99999) + 10000);
  let secretCode;

  for (const user of data.users) {
    if (user.email === email) {
      secretCode = user.uId;
      user.secretCode = secretCode;
    }
  }
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: 'jasonhe1531third@outlook.com',
      pass: 'poiu0987'
    }
  });

  const mailOptions = {
    from: 'jasonhe1531third@outlook.com',
    to: email,
    subject: 'OH YEHHHH IT WORKS',
    text: `your daily big shlong code is ${secretCode} please use with discretion`
  };

  transporter.sendMail(mailOptions, function(error: any, info: any) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  setData(data);
  return {};
}

// implementation function for auth/passwordreset/reset/v1
export function PWResetV1(resetCode: number, newPassword: string) {
  const data = getData();
  // error case 2: password entered is less than 6 characters long
  if (newPassword.length < 6) {
    throw HTTPError(400, 'password entered is less than 6 characters long');
  }

  // error case 1: resetCode is wrong
  // iterate through resetCode of all users, for the one that is not the original secretCode
  let validCode = false;
  for (const user of data.users) {
    if (user.secretCode === resetCode) {
      validCode = true;
    }
  }
  if (validCode === false) {
    throw HTTPError(400, 'resetCode is not valid');
  }

  // success case: change the password, and change resetCode to original
  for (const user of data.users) {
    if (user.secretCode === resetCode) {
      user.password = getHashOf(newPassword);
      user.secretCode = -999;
    }
  }

  setData(data);
  return {};
}

export { authLoginV1, authRegisterV1, authLogoutV1 };
