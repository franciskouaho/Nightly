import { listenButDontJudgeRules } from "./listen-but-don-t-judge-rules";
import { truthOrDareRules } from "./truth-or-dare-rules";
import { geniusOrLiarRules } from "./genius-or-liar-rules";
import { neverHaveIEverHotRules } from "./never-have-i-ever-hot-rules";
import { trapAnswerRules } from "./trap-answer-rules";
import { twoLettersOneWordRules } from "./two-letters-one-word-rules";
import { wordGuessingRules } from "./word-guessing-rules";
import { quizHalloweenRules } from "./quiz-halloween-rules";
import { forbiddenDesireRules } from "./forbidden-desire-rules";
import { doubleDareRules } from "./double-dare-rules";
import { pileOuFaceRules } from "./pile-ou-face-rules";
import { dareOrStripRules } from "./dare-or-strip-rules";
import { blindtestGenerationsRules } from "./blindtest-generations-rules";

export const gameRules = {
  "listen-but-don-t-judge": listenButDontJudgeRules,
  "truth-or-dare": truthOrDareRules,
  "genius-or-liar": geniusOrLiarRules,
  "never-have-i-ever-hot": neverHaveIEverHotRules,
  "trap-answer": trapAnswerRules,
  "two-letters-one-word": twoLettersOneWordRules,
  "word-guessing": wordGuessingRules,
  "quiz-halloween": quizHalloweenRules,
  "forbidden-desire": forbiddenDesireRules,
  "double-dare": doubleDareRules,
  "pile-ou-face": pileOuFaceRules,
  "dare-or-strip": dareOrStripRules,
  "blindtest-generations": blindtestGenerationsRules,
};
