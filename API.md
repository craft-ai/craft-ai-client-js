# **craft ai** JavaScript client #

> A fully working example of a Node.js application is available at
[craft-ai/craft-ai-starterkit-nodejs](https://github.com/craft-ai/craft-ai-starterkit-nodejs).

## Setup ##

Follow the following steps to install `craftai` in your JavaScript project. The [API reference](#API) below will give you directions on how to use it.

```sh
npm install craft-ai --save
```

```js
var craftai = require('craft-ai').createInstance;
```

or using es2015 syntax

```js
import craftai from 'craft-ai';
```

These instructions are compliant with a browser project (be it packaged with [Browserify](http://browserify.org) or [Webpack](http://webpack.github.io)) as well as with a Node.js project.

## API ##

### 1. Create an instance ###

````js
craftai({
  owner: '<project_owner>',
  name: '<project_name>',
  version: '<project_version>',
  appId: '<app_id>',
  appSecret: '<app_secret>',
  destroyOnExit: true/false
  cleanupOnDestroy: false/true
},
<init_knowledge>)
.then(function(instance) {
  // Use your instance here
  // instance = {
  //   "id": <instance_id>,
  //   "cfg": <instance_cfg>, // as provided to `craftai(...)`
  //   "getStatus": function() {...}, // Retrieve the current status of the instance
  //   ... // See below for other methods
  // }
})
.catch(function(error) {
  // Catch errors here
})
````

#### `destroyOnExit` ####

If `true`, the instance will destroy itself when the window unloads or the
process exits.

- The **browser** version relies on the
[_beforeunload_](https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload)
event.
- The **nodejs** version relies on the
[_uncaughtException_](https://nodejs.org/api/process.html#process_event_uncaughtexception),
[_unhandledrejection_](https://nodejs.org/api/process.html#process_event_unhandledrejection),
[_SIGINT_, _SIGTERM_, _SIGQUIT_ and _SIGHUP_](https://nodejs.org/api/process.html#process_signal_events) events.

#### `cleanupOnDestroy` ####

If `true`, instance information will also be cleaned up when the instance is destroyed.


### 2. Register actions ###

#### via Websocket (Browser and Nodes.js environments) ####

The most universal way of registering an action is via Websockets, you can use
the method `registerWebsocketAction`.

> the previous method `registerAction` is now deprecated, and is equivalent to
`registerWebsocketAction`.

````js
instance.registerWebsocketAction(
  '<action_name>',
  (requestId, agentId, input, success, failure) => {
    // Implement what needs to be done here using:
    // - requestId, the unique identifier for this action request (ie this call),
    // - agentId, the identifier of the agent on which this reques is executed,
    // - input, a javascript object containing the action input provided in the Behavior Tree
    if (/* everything is good */) {
      success({
        output1: '<output1_value>',
        output2: '<output2_value>'
      })
    }
    else {
      failure({
        output1: '<output1_value>',
        output2: '<output2_value>'
      })
    }
  },
  (requestId, agentId, canceled) => {
    // This parameter is optional, it is the function called to cancel the action
    canceled();
  }
)
.then(function() {
  // Continue work on the instance here
})
.catch(function(error) {
  // Catch errors here
})
````

#### via Webhook (Nodes.js environment) ####

It is possible to register an action using a Webhook HTTP callbacks using the
method `registerWebsocketAction` which returns an [express.js
router](http://expressjs.com/en/4x/api.html#router).

````js
var app = express();

app.listen(8080);

instance.registerWebsocketAction(
  'http://<public_host>:8080',
  '<action_name>',
  (requestId, agentId, input, success, failure) => {
    // Implement what needs to be done here using:
    // - requestId, the unique identifier for this action request (ie this call),
    // - agentId, the identifier of the agent on which this reques is executed,
    // - input, a javascript object containing the action input provided in the Behavior Tree
    if (/* everything is good */) {
      success({
        output1: '<output1_value>',
        output2: '<output2_value>'
      })
    }
    else {
      failure({
        output1: '<output1_value>',
        output2: '<output2_value>'
      })
    }
  },
  (requestId, agentId, canceled) => {
    // This parameter is optional, it is the function called to cancel the action
    canceled();
  }
)
.then(function(router) {
  // Mount the action router in the express app.
  app.use(router);
  // Continue work on the instance here
})
.catch(function(error) {
  // Catch errors here
})
````

### 3. Agents ###

#### Create ####

````js
instance.createAgent(
  '<bt_name>',
  <optional_initial_knowledge_content>)
.then(function(agent) {
  // Continue work on the instance here
  // agent = {
  //   "id": <agent_id>,
  //   "behavior": <bt_name>,
  //   "knowledge": <optional_initial_knowledge_content>
  // }
})
.catch(function(error) {
  // Catch errors here
})
````

#### Destroy ####

_not available yet_

### 4. Update ###

#### Single decision ####

````js
instance.update()
.then(function() {
  // Continue work on the instance here
})
.catch(function(error) {
  // Catch errors here
})
````

#### Continuous regular decision ####

````js
instance.update(<decision_delta_time_in_ms>)
````

### 5. Access Knowledge ###

#### Retrieve the knowledge of an agent ####

````js
instance.getAgentKnowledge(<agent_id>)
.then(function(knowledge) {
  // Use retrieved knowledge
})
.catch(function(error) {
  // Catch errors here
})
````

#### Update the knowledge of an agent ####

````js
instance.updateAgentKnowledge(<agent_id>, {
  key1: '<key1_value>',
  key2: {
    key3: '<key3_value>'
  }
})
.then(function() {
  // Continue work on the instance here
})
.catch(function(error) {
  // Catch errors here
})
````

By default this method **sets** the knowledge to the new value, erasing the previous
one. If you want to merge the new knowledge value with the previous one you can
specify the optional third parameter with the value _merge_.

#### Instance knowledge ####

In the same fashion, you can manipulate instance knowledge using
`instance.getInstanceKnowledge` and `instance.updateInstanceKnowledge`.

### 6. Destroy ###

````js
instance.destroy()
.then(function() {
  // Instance destroyed here (this also stops updates)
})
.catch(function(error) {
  // Catch errors here
})
````

#### Synchronous destruction ####

In some cases, it is desirable to destroy an instance synchronously (it is used
internally to [destroy the instance on exit](#destroyonexit)), there is an API
for that!

````js
instance.destroySync();
````

### Logging ###

The **craft ai** client is using
[visionmedia/debug](https://www.npmjs.com/package/debug) under the namespace
`'craft-ai:client:*'`, please refer to their documentation for further
information.
