import { adjectives, nouns } from "../constants/index.js";

export const getRandomItem = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

export const generateSongTitle = () =>
  `${getRandomItem(adjectives)} ${getRandomItem(nouns)}`;
