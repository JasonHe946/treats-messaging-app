export interface TypeMessage {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number
}

export interface TypeMessages {
  messages: TypeMessage[],
  start: number,
  end: number
}

// DATASTORE //

export interface Dms {
  dmId: number,
  name: string,
  owner: number,
  dmMembers: number[],
  active: boolean,
  timeStamp: number,
}

export interface reactObj {
  reactId: number,
  uIds: number[],
}

export interface DmMessages {
  messageId: number,
  dmId: number,
  uId: number,
  message: string,
  timeSent: number,
  isVisible: boolean,
  reacts: reactObj[],
  isPinned: boolean,
}
// ADMIN //
export interface userPermChangeBody {
  token: string,
  uId: number,
  permissionId: number,
}

// AUTH //

export interface AuthUserId { authUserId: number }

export interface AuthRegisterDetails {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
}

export interface AuthLoginDetails {
  email: string,
  password: string,
}

export interface TokenType {token: string}

export interface PWResetBody {
  resetCode: number,
  newPassword: string,
}

// CHANNEL(S) //

export interface ChannelMessagesType {
  token: string,
  channelId: number,
  start: number,
}

export interface ChannelId { channelId: number }

export interface Channel {
  'channelId': number,
  'name': string,
  'isPublic': boolean,
  'ownerMembers': number[],
  'allMembers': number[],
  'timeStamp': number,
  'standupUser': number,
  'standupActive': number,
  'standupMessages': string[]
}

export interface channelDetailsV2 {
  token: string,
  channelId: number
}

export interface channelsCreateDetails {
  'token': string,
  'name': string,
  'isPublic': boolean,
}

export interface ChannelInvite {
  'token': string,
  'channelId': number,
  'uId': number,
}
export interface channelJoinBody {
  token: string,
  channelId: number
}

export interface ChannelLeave {
  token: string,
  channelId: number
}

export interface ChannelAddOwner {
  token: string,
  channelId: number,
  uId: number,
}

export interface ChannelRemoveOwner {
  token: string,
  channelId: number,
  uId: number,
}

// MESSAGE(S) //

export interface Message {
  'channelId': number,
  'messageId': number,
  'uId': number,
  'message': string,
  'timeSent': number,
  'isVisible': boolean,
  'reacts': reactObj[],
  'isPinned': boolean,
}

export interface Messages {
  channelId: number,
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  isVisible: boolean,
  reacts: reactObj[],
  isPinned: boolean,
}

export interface MessageDetails {
  messages: Message[],
  start: number,
  end: number
}

export interface MessageId {
  messageId: number
}

export interface MessageSendInput {
  token: string,
  channelId: number,
  message: string
}

export interface MessageEditInput {
  token: string,
  messageId: number,
  message: string
}

export interface MessageRemoveInput {
  token: string,
  messageId: number,
}

// OTHER  //

export interface notificationType {
  channelId: number,
  dmId: number,
  notificationMessage: string,
  timeSent: number,
}

export interface MessageReactInput {
  token: string,
  messageId: number,
  reactId: number,
}

export interface MessagePinInput {
  token: string,
  messageId: number,
}

// USER(S) //

export interface User {
  uId: number,
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  isGlobalOwner: boolean,
  token: string[],
  notifications: notificationType[],
  timeStamp: number,
  secretCode: number,
  isVisible: boolean,
}

export interface UserDetails {
  'uId': number,
  'email': string,
  'nameFirst': string,
  'nameLast': string,
  'handleStr': string,
}

export interface UserProfileInput {
  'token': string,
  'uId': number,
}
export interface UsersOutput { user: UserDetails }

export interface UserSetnameType {
  token: string,
  nameFirst: string,
  nameLast: string,
}

export interface UserSetemailType {
  token: string,
  email: string,
}

export interface UserSetHandleStr {
  token: string,
  handleStr: string,
}

// OTHER //

export interface ErrorOutput { error: string }

// DM //

export interface DmCreateType {
  token: string,
  uIds: number[],
}

export interface DmLeaveType {
  token: string,
  dmId: number,
}

export interface SendDmType {
  token: string,
  dmId: number,
  message: string,
}

export interface DmMessageType {
  messageId: number,
  dmId: number,
  uId: number,
  message: string,
  isVisible: boolean,
  timeSent: number,
  reacts: reactObj[],
  isPinned: boolean,
}

export interface dmListObject {
  dmId: number,
  name: string,
}

export interface dmListType {
  dms: dmListObject[],
}

export interface dmRemoveInput {
  token: string,
  dmId: number,
}

export interface dmDetailsInput {
  token: string,
  dmId: number,
}

export interface DmMessageInputType {
  token: string,
  dmId: number,
  start: number,
}

export interface ChannelDetails {
  'name': string,
  'isPublic': boolean,
  'ownerMembers': UserDetails[],
  'allMembers': UserDetails[],
}

export interface UserStats {
  uId: number[],
  channel: number,
  dm: number,
  timeStamp: number,
}

export interface Data {
  users: User[],
  channels: Channel[],
  channelMessages: Messages[],
  dms: Dms[],
  dmMessages: DmMessages[],
  userStats: UserStats[],
}

export interface MessageShareType {
  token: string;
  ogMessageId: number;
  message: string;
  channelId: number;
  dmId: number;
}

export interface SharedChannelMessage {
  channelId: number;
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  isVisible: boolean;
  reacts: reactObj[],
  isPinned: boolean,
  sharedMessageId: number;
}

export interface SharedDmMessage {
  messageId: number,
  dmId: number,
  uId: number,
  message: string,
  isVisible: boolean,
  timeSent: number,
  reacts: reactObj[],
  isPinned: boolean,
  sharedMessageId: number;
}

// export interface channelsJoined {
//   numChannelsJoined: number,
//   timeStamp: number
// }

// export interface dmsJoined{
//   numDmsJoined: number,
//   timeStamp: number
// }

// export interface messagesSent{
//   numMessagesSent: number,
//   timeStamp: number
// }

// export interface channelsExist {
//   numChannelsExist: number,
//   timeStamp: number
// }

// export interface dmsExist{
//   numDmsExist: number,
//   timeStamp: number
// }

// export interface messagesExist{
//   numMessagesExist: number,
//   timeStamp: number
// }
// STANDUP

export interface StandupStartInput {
  token: string,
  channelId: number,
  length: number
}

export interface StandupActiveInput {
  token: string,
  channelId: number,
}

export interface StandupSendInput {
  token: string,
  channelId: number,
  message: string,
}
