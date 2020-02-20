require('./helper');

// require('../test_interpreterSuite'); // Not suitable for browser
require('../test_addAgentContextOperations');
require('../test_computeGeneratorDecision');
require('../test_computeAgentDecision');
require('../test_context');
require('../test_createAgent');
require('../test_createClient');
require('../test_createGenerator');
require('../test_decideFromContextsArray');
require('../test_errors');
require('../test_getAgent');
require('../test_getAgentContextOperations');
require('../test_getAgentDecisionTree');
require('../test_getAgentStateHistory');
require('../test_getDecisionRulesProperties');
require('../test_getGenerator');
require('../test_getGeneratorContextOperations');
require('../test_getGeneratorDecisionTree');
require('../test_getSharedAgentInspectorUrl');
require('../test_listAgents');
require('../test_listGenerators');
require('../test_properties');
require('../test_time');

if (window.initMochaPhantomJS) {
  window.initMochaPhantomJS();
}
