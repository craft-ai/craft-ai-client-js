require('./helper');

require('../test_bindInstance');
require('../test_createAgent');
require('../test_createInstance');
require('../test_errors');
require('../test_getAgentKnowledge');
require('../test_getInstanceKnowledge');
// require('../test_registerWebhookAction'); // NOT AVAILABLE IN THE BROWSER
require('../test_update');

if (window.initMochaPhantomJS) {
  window.initMochaPhantomJS();
}
