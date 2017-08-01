export const IN_BROWSER = typeof window !== 'undefined';

export const AGENT_ID_MAX_LENGTH = 36;
export const AGENT_ID_ALLOWED_REGEXP = /^([a-z0-9_-]){1,36}$/i;
