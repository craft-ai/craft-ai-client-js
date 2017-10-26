const DEFAULTS = {
  token: process.env.CRAFT_TOKEN,
  operationsChunksSize: 500,
  decisionTreeRetrievalTimeout: 1000 * 60 * 5 // 5 minutes
};

export default DEFAULTS;
