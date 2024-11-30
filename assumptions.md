/////auth.js/////

  - For this iteration, it is assumed that the uId for each user is generated in increments of one based on the order in which they were added

  - Assumed that there are no duplicate users

/////channels.js/////

  - For this iteration, it is assumed that the channelId for each channel is generated in increments of one based on the order in which they were added.

  - For channelsCreateV1, channelsListV1, channelsListallV1 it is assumed that if the authUserId is not in the dataStore, return an error

  - Assumed that there are no duplicate channels

/////channel.js/////

  
  - Assume that there are currently no messages in dataStore.

/////user.js/////

  - 

////Other assumption/////

  - Assuming for now that users and channels cannot be removed from the dataStore.

  - Assumed that, to avoid data leaks, .pop() was used to remove the objects stored in the original dataStore rather than intialising a new array.