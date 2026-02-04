// datex简易版 - https://github.com/mumuy/datex/

import datex from './module/factory.js';
import baseLoader from './module/method/base.js';
import computeLoader from './module/method/compute.js';
import languageLoader from './module/method/language.js';
import parseLoader from './module/method/parse.js';

// 功能加载
[
    baseLoader,
    computeLoader,
    languageLoader,
    parseLoader
].forEach(datex.extend);

export default datex;