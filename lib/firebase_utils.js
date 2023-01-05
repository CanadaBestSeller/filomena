import { db } from '@/db/firebase'

export async function createRoomWithUniqueId(userId) {
  const roomId = generateRoomId();
  const document = {
    createdAt: Date.now(),
    owner: userId,
    roomId: roomId,
    members: [userId]
  }

  await db.collection('room').add(document)
  return roomId
}


function generateRoomId() {
  const validAlphabetChars = 'ABCDEFGHJKMNPQRSTUVWXYZ'
  const validNumericChars = '23456789'
  const validChars = validAlphabetChars+validNumericChars

  const c1 = validChars.charAt(Math.floor(Math.random() * validChars.length))
  const c2 = validChars.charAt(Math.floor(Math.random() * validChars.length))
  const c3 = validChars.charAt(Math.floor(Math.random() * validChars.length))
  const c4 = validChars.charAt(Math.floor(Math.random() * validChars.length))

  return c1+c2+c3+c4 ;
}
