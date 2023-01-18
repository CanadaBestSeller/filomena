import firebase from 'firebase/app'
import { db } from '@/db/firebase'
import { generateQuestions } from '@/lib/question_generator'


export async function createRoomReturnId(userId) {
  const roomId = generateCode()
  const document = {
    // Room-related data
    createdAt: Date.now(),
    hostUid: userId,
    status: 'LOBBY', // LOBBY, GAME
    players: [],
    chatMessages: [],

    // Configs
    configuredAnswerTimeLimitSec: 15,
    configuredVoteTimeLimitSec: 12,
    configuredSummaryTimeLimitSec: 10,

    // Game-related data
    gameStatus: 'ANSWER', // ANSWER, VOTE, SUMMARY, or FINISHED
    currentGameStatusTimestampEpochSec: null,
    questions: [],

    currentQuestionIndex: 0,
  }
  await db.collection('rooms').doc(roomId).set(document)
  return roomId
}

export async function startGame(docRef, players) {

  const questions = generateQuestions(10)
  populateCurrentQuestionWithSubjects(questions[0], players)

  await docRef.update({
    status: 'GAME',
    currentGameStatusTimestampEpochSec: getCurrentTimeEpochSec(),
    questions: questions,
  })
}


function populateCurrentQuestionWithSubjects (question, players) {
  const names = players
    .map(players => ({ players, sortKey: Math.random() }))  // give each object a random sort key
    .sort((a, b) => a.sortKey - b.sortKey)  // sort by sort key
    .map(({ players }) => players.name)  // get name only
  question.subject1 = names.pop()
  // question.subject2 = names.pop()
  question.subject2 = 'David'  // TODO remove and add back previous line
}


export function answerQuestion(docRef, text, uid) {
  const newAnswer = {
    text: text,
    uid: uid,
    votes: 0,
  }

  docRef.get().then(doc => {
    const questions = doc.data().questions
    const currentQuestionIndex = doc.data().currentQuestionIndex
    const currentQuestion = questions[currentQuestionIndex]
    currentQuestion.answers.push(newAnswer)

    const allPlayersHaveAnswered = currentQuestion.answers.length === doc.data().players.length
    if (allPlayersHaveAnswered) {
      docRef.update({ questions: questions, gameStatus: 'VOTE', currentGameStatusTimestampEpochSec: getCurrentTimeEpochSec() })
    } else {
      docRef.update({ questions: questions })
    }
  })
}


export function voteForAnswer(docRef, uid) {
  console.log(`voting for ${uid}`)
  docRef.get().then(doc => {
    const questions = doc.data().questions
    const currentQuestionIndex = doc.data().currentQuestionIndex
    const currentQuestion = questions[currentQuestionIndex]
    const answerFromUid = currentQuestion.answers.find(a => a.uid === uid)
    answerFromUid.votes += 1

    const totalVotes = currentQuestion.answers.reduce((total, answer) => total + answer.votes, 0)
    const allPlayersHaveVoted = totalVotes === doc.data().players.length
    if (allPlayersHaveVoted) {
      docRef.update({ questions: questions, gameStatus: 'SUMMARY', currentGameStatusTimestampEpochSec: getCurrentTimeEpochSec() })
    } else {
      docRef.update({ questions: questions })
    }
  })
}


export async function transitionAfterAnswer(docRef) {
  await docRef.update({ gameStatus: 'VOTE', currentGameStatusTimestampEpochSec: getCurrentTimeEpochSec() })
}


export async function transitionAfterVote(docRef) {
  await docRef.update({ gameStatus: 'SUMMARY', currentGameStatusTimestampEpochSec: getCurrentTimeEpochSec() })
}


export async function transitionAfterSummary(docRef, doc) {
  const hasMoreQuestions = doc.currentQuestionIndex < doc.questions.length - 1
  if (hasMoreQuestions) {
    const newQuestions = doc.questions
    populateCurrentQuestionWithSubjects(newQuestions[doc.currentQuestionIndex+1], doc.players)
    await docRef.update({ gameStatus: 'ANSWER', currentQuestionIndex: doc.currentQuestionIndex+1, currentGameStatusTimestampEpochSec: getCurrentTimeEpochSec(), questions: newQuestions })
  } else {
    await docRef.update({ gameStatus: 'FINISHED' })
  }
}


export async function addPlayer(docRef, name, uid) {
  const newPlayer = {
    name: name,
    uid: uid,
    points: 0,
  } // Add new chatMessage to the array in Firestore document without overwriting the existing elements in the array

  docRef.get().then(doc => {
    const players = doc.data().players

    // Find the index of the player with the matching uid
    const playerIndex = players.findIndex(player => player.uid === uid)

    // If the player with uid exists, delete it from the array
    if (playerIndex > -1) {
      players.splice(playerIndex, 1)
    }

    // Add the new message to the array
    players.push(newPlayer)

    // Update the messages field in the document
    docRef.update({ players })
  })
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


export function getCurrentTimeEpochSec () {
  return Math.round(new Date().getTime() / 1000)
}
