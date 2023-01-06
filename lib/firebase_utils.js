import firebase from 'firebase'
import { db } from '@/db/firebase'
import { RoomStatus } from '@/lib/room_status'


export async function createRoomReturnId(userId) {
  const roomId = generateCode()
  const document = {
    createdAt: Date.now(),
    hostUid: userId,
    status: RoomStatus.LOBBY,
    memberUids: [userId],
    chatMessages: [],
  }

  await db.collection('rooms').doc(roomId).set(document)
  return roomId
}


export async function addChatroomMessage(docRef, message, senderName, senderUid) {
  const newMessage = {
    text: message,
    id: randomId(),
    senderName: senderName,
    senderUid: senderUid,
  } // Add new chatMessage to the array in Firestore document without overwriting the existing elements in the array
  await docRef.update({ chatMessages: firebase.firestore.FieldValue.arrayUnion(newMessage) })
}


export function randomId() {
  return Math.random().toString(36).slice(2)
}


function generateCode() {
  const validAlphabetChars = 'ABCDEFGHJKMNPQRSTUVWXYZ'
  const validNumericChars = '23456789'
  const validChars = validAlphabetChars+validNumericChars

  const c1 = validChars.charAt(Math.floor(Math.random() * validChars.length))
  const c2 = validChars.charAt(Math.floor(Math.random() * validChars.length))
  const c3 = validChars.charAt(Math.floor(Math.random() * validChars.length))
  const c4 = validChars.charAt(Math.floor(Math.random() * validChars.length))

  return c1+c2+c3+c4
}
