export type JeopardyClue = {
  value: number;
  question: string;
  answer: string;
};

export type JeopardyCategory = {
  title: string;
  clues: JeopardyClue[];
};
