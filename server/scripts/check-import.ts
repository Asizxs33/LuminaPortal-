import assert from 'node:assert/strict';
import { parseQuestions } from '../../api/tests/index';
assert.equal(parseQuestions('1. Sum?\nA) 2\nB) 3\nЖауап: A')[0]?.options[0].is_correct, true);
assert.equal(parseQuestions('1. Missing key\nA) one\nB) two').length, 0);
assert.equal(parseQuestions('1. Two keys\n*A) one\n*B) two').length, 0);
assert.equal(parseQuestions('1. Valid\n*A) one\nB) two\n2. Broken\nA) only').length, 1);
assert.equal(parseQuestions('<question>Tagged<variant>Correct<variant>Other')[0].options[0].is_correct, true);
console.log('PASS: Word parser accepts supported keys and excludes incomplete or ambiguous questions.');
