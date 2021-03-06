import * as path from 'path';
import * as fs from 'fs';

import Genetica from './genetica';
import defaults from './defaults';
import Renderer from './renderer';
import Saver from './saver';
import { DNA, Genders } from 'opendnd-core';

const questions = require('questions');
const colors = require('colors/safe');

const rootDir = path.join(__dirname, '..');
const logo = fs.readFileSync(path.join(rootDir, 'logo.txt'), { encoding: 'utf-8' });

const wizardChild = (outputDir, mother = '', father = '') => {
  if (outputDir === undefined) outputDir = '.';

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany({
    gender: {
      info: colors.cyan('What gender is the child? ') + colors.white(`(${defaults.genders.join(' | ')})`),
      required: false,
    },
  }, (opts) => {
    const motherDNA:DNA = Saver.load(mother);
    const fatherDNA:DNA = Saver.load(father);

    // check for proper inputs
    if (motherDNA.race.uuid !== fatherDNA.race.uuid) throw new Error('Cross-breeding between races is not yet supported!');
    if (motherDNA.gender !== Genders.Female) throw new Error('The mother is not female!');
    if (fatherDNA.gender !== Genders.Male) throw new Error('The father is not male!');

    // add mother's race
    opts.race = motherDNA.race;

    // convert the text gender to a enum
    opts.gender = defaults.genderMapping[opts.gender];

    const genetica = new Genetica(opts);
    const result:DNA = genetica.generateChild(opts, motherDNA, fatherDNA);

    Renderer.output(result);
    Saver.finish(outputDir, 'Would you like to save your child? (y | n)', result, result.uuid, undefined);
  });
};

export default wizardChild;
