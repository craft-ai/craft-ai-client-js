const DEFAULTS = {
  appId: process.env.CRAFT_APP_ID,
  appSecret: process.env.CRAFT_APP_SECRET,
  destroyOnExit: true,
  httpApiUrl: process.env.CRAFT_HTTP_API_URL || 'https://api.craft.ai/v1',
  wsApiUrl: process.env.CRAFT_WS_API_URL || 'wss://api.craft.ai/v1'
};

export default DEFAULTS;
