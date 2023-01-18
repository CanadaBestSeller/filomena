import en from '~/lang/en'


export function generateQuestions(questionCount) {
  const result = []

  for (let i = 1; i <= questionCount; i++) {
    const weightStatic = 2
    const weightDynamic1 = 5
    const weightDynamic2 = 3

    let question = generateRandomQuestion(weightStatic, weightDynamic1, weightDynamic2, i*100)
    while (result.some(q => q.id === question.id)) {
      console.log(`SAME QUESTION: ${question.id}`)
      question = generateRandomQuestion(weightStatic, weightDynamic1, weightDynamic2, i*100)
    }

    result.push(question)
  }
  return result
}


function generateRandomQuestion (weightStatic, weightDynamic1, weightDynamic2, points) {
  const totalWeight = weightStatic + weightDynamic1 + weightDynamic2;
  const rand = Math.random() * totalWeight;

  if (rand < weightStatic) {
    return generateRandomQuestionStatic(points)
  } else if (rand < weightDynamic1) {
    return generateRandomQuestionDynamic1(points)
  } else {
    return generateRandomQuestionDynamic2(points)
  }
}


export function generateRandomQuestionStatic(points) {
  const staticQuestionIds = Object.keys(en.questions.static)
  const randomStaticQuestionId = staticQuestionIds[ Math.floor(staticQuestionIds.length * Math.random()) ]
  return {
    id: 'questions.static.' + randomStaticQuestionId,
    points: points,
    answers: []
  }
}


export function generateRandomQuestionDynamic1(points) {
  const dynamicQuestionIds = Object.keys(en.questions.dynamic1)
  const randomDynamicQuestionId = dynamicQuestionIds[ Math.floor(dynamicQuestionIds.length * Math.random()) ]
  return {
    id: 'questions.dynamic1.' + randomDynamicQuestionId,
    points: points,
    answers: []
  }
}


export function generateRandomQuestionDynamic2(points) {
  const dynamic2QuestionIds = Object.keys(en.questions.dynamic2)
  const randomDynamic2QuestionId = dynamic2QuestionIds[ Math.floor(dynamic2QuestionIds.length * Math.random()) ]
  return {
    id: 'questions.dynamic2.' + randomDynamic2QuestionId,
    points: points,
    answers: []
  }
}


