import { decide, Time } from 'craft-ai-interpreter';
import * as errors from './errors';
import createClient from './client';
import DEFAULT from './defaults';

window.craftai = createClient;
window.craftai.decide = decide;
window.craftai.DEFAULT = DEFAULT;
window.craftai.errors = errors;
window.craftai.Time = Time;
