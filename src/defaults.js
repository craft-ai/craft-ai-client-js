const DEFAULTS = {
  token: process.env.CRAFT_TOKEN,
  operationsChunksSize: 500,
  decisionTreeRetrievalTimeout: 1000 * 60 * 10 // 10 minutes
};

export default DEFAULTS;
