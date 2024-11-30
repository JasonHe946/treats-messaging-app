import { Data } from './typeDefinitions';
import fs from 'fs';

// YOU SHOULD MODIFY THIS OBJECT BELOW

let data:Data = {
  users: [],
  /*
    {
    uId : uId,
    email : email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handleStr,
    isGlobalUser: true/false
    token: string[]
    }
    */
  channels: [],
  /*
    {
      'channelId': "The channel's Id",
      'name': "channel's name",
      'isPublic': "true/false"
      'owners': [uIds],
      'members': [uIds],

    }
    */
  channelMessages: [],
  /* {
      'channel': 'COMP1531'
      'messages': [
        {
          'messageId': 123456,
          'uId': 'hfidhfid',
          'message': 'hello',
          'timeSent': 54
        },
        {
          'messageId': 123456,
          'uId': 'hfidhfid',
          'message': 'hello',
          'timeSent': 54,
          'reacts':[{reactId,uId,isThisUserReacted}],
          isPinned:true/false?,
        }
      ]
      } */
  dms: [],
  /* dms: [],
      dmId: number,
      name: string, e.g. ethanlam, danielhuynh, jasonhe,
      creator: string,
      members: [uIds],
    */
  dmMessages: [],
  userStats: [],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: Data) {
  fs.writeFileSync('src/data.json', JSON.stringify(newData), { flag: 'w' });
  data = newData;
}

export { getData, setData };
