import firebase from 'firebase/app'
import { db } from '@/db/firebase'
import { generateQuestions } from '@/lib/question_generator'
import { generateEmoji } from '~/db/emoji'


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
    configuredAnswerTimeLimitSec: 60,
    configuredVoteTimeLimitSec: 30,
    configuredSummaryTimeLimitSec: 20,

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

  const questions = generateQuestions(8)
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
  question.subject2 = names.pop()
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


export async function transitionAfterAnswer(docRef, doc) {
  if (doc.gameStatus === 'VOTE') {
    return  // gameStatus is already 'VOTE', don't make extra calls
  }

  await docRef.update({ gameStatus: 'VOTE', currentGameStatusTimestampEpochSec: getCurrentTimeEpochSec() })
}


export async function transitionAfterVote(docRef, doc) {

  if (doc.gameStatus === 'SUMMARY') {
    return  // gameStatus is already 'SUMMARY', don't make extra calls
  }

  const awardPoints = doc.questions[doc.currentQuestionIndex].points
  const newPlayers = doc.players

  const winningAnswers = getCurrentWinningAnswers(doc)
  winningAnswers.forEach(answer => {
      const winningPlayer = newPlayers.find(p => p.uid === answer.uid)
      if (!winningPlayer.points.includes(awardPoints)) {
        winningPlayer.points.push(awardPoints)
      }
    }
  )

  await docRef.update({ gameStatus: 'SUMMARY', currentGameStatusTimestampEpochSec: getCurrentTimeEpochSec(), players: newPlayers })
}


export async function transitionAfterSummary(docRef, doc) {

  if (doc.gameStatus === 'ANSWER' || doc.gameStatus === 'FINISHED') {
    console.log("NAH")
    return  // gameStatus is already 'ANSWER' or 'FINISHED', don't make extra calls
  }

  console.log("DO IT")
  const hasMoreQuestions = doc.currentQuestionIndex < doc.questions.length - 1
  if (hasMoreQuestions) {
    const newQuestions = doc.questions
    populateCurrentQuestionWithSubjects(newQuestions[doc.currentQuestionIndex+1], doc.players)
    await docRef.update({ gameStatus: 'ANSWER', currentQuestionIndex: doc.currentQuestionIndex+1, currentGameStatusTimestampEpochSec: getCurrentTimeEpochSec(), questions: newQuestions })
  } else {
    await docRef.update({ gameStatus: 'FINISHED' })
  }
}


export function getCurrentWinningAnswers(doc) {
  const answers = doc.questions[doc.currentQuestionIndex].answers
  const winningAnswers = []

  let highestVoteCount = 0  // First: iterate through answers and find highestVoteCount
  for (let i = 0; i < answers.length; i++) {
    if (answers[i].votes > highestVoteCount) { highestVoteCount = answers[i].votes }
  }

  // Second: get all answers with the highestVoteCount
  for (let i = 0; i < answers.length; i++) {
    if (answers[i].votes === highestVoteCount) { winningAnswers.push(answers[i]) }
  }
  return winningAnswers
}


export function getOrderedPlayersWithTotalPoints(doc) {
  const orderedPlayersWithPoints = doc.players
  orderedPlayersWithPoints.forEach(p => p.totalPoints = p.points.reduce((total, points) => total + points, 0))
  return orderedPlayersWithPoints.sort((a, b) => b.totalPoints - a.totalPoints)
}


export async function addPlayer(docRef, name, uid) {
  docRef.get().then(doc => {
    const players = doc.data().players

    // Find the index of the player with the matching uid
    const playerIndex = players.findIndex(player => player.uid === uid)

    // If the player with uid exists, do nothing
    if (playerIndex > -1) {
      return
    }

    // Add the new player to the array
    const newPlayer = {
      emoji: generateEmoji(),
      name: name,
      uid: uid,
      points: [],
    } // Add new player to the array in Firestore document without overwriting the existing elements in the array
    players.push(newPlayer)

    // Update the players field in the document
    docRef.update({ players })
  })
}


export async function changePlayerEmoji(docRef, uid) {
  docRef.get().then(doc => {
    const players = doc.data().players

    // Find the index of the player with the matching uid
    players.find(player => player.uid === uid).emoji = generateEmoji()

    // Update the players field in the document
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


export function loveQuestion(questionId) {
  const db = firebase.firestore();
  const collectionRef = db.collection("questionRatings");

  const incrementValue = firebase.firestore.FieldValue.increment(1);
  collectionRef.doc(questionId).set({ loves: incrementValue }, { merge: true });
}


export function dislikeQuestion(questionId) {
  const db = firebase.firestore();
  const collectionRef = db.collection("questionRatings");

  const incrementValue = firebase.firestore.FieldValue.increment(1);
  collectionRef.doc(questionId).set({ dislikes: incrementValue }, { merge: true });
}


export function addFinalFeedback(text, uid) {
  const db = firebase.firestore();
  const collectionRef = db.collection("feedbacks");

  collectionRef.add({
    createdAt: Date.now(),
    uid: uid,
    text: text
  })
}
