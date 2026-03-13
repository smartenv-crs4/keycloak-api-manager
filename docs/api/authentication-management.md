# Authentication Management API

Manage required actions, authentication flows, executions, and execution configs.

Namespace: KeycloakManager.authenticationManagement

## Overview

This handler controls Keycloak authentication internals at realm level:

- Required actions lifecycle and config.
- Flow creation/copy/read/update/delete.
- Execution management inside flows.
- Execution configuration metadata and values.
- Provider discovery for authenticators and forms.

All methods use the currently configured realm, unless an explicit realm override is supported by upstream endpoint payloads.

## Required Actions

### getRequiredActions()

List registered required actions in realm.

Returns:

- Promise<Array<object>>

### getUnregisteredRequiredActions()

List available required actions not yet registered in realm.

Returns:

- Promise<Array<object>>

### registerRequiredAction(actionRepresentation)

Register a required action.

Parameters:

- actionRepresentation (object, required)
- alias (string, required)
- name (string, required)
- providerId (string, required)
- defaultAction (boolean, optional)
- enabled (boolean, optional)
- priority (number, optional)
- config (object, optional)

Returns:

- Promise<void>

### getRequiredActionForAlias(filter)

Read one required action by alias.

Parameters:

- filter (object, required)
- alias (string, required)

Returns:

- Promise<object>

### updateRequiredAction(filter, actionRepresentation)

Update one required action.

Parameters:

- filter (object, required):
- alias (string, required)
- actionRepresentation (object, required): updated action definition.

Returns:

- Promise<void>

### deleteRequiredAction(filter)

Delete one required action by alias.

Parameters:

- filter (object, required)
- alias (string, required)

Returns:

- Promise<void>

### raiseRequiredActionPriority(filter)
### lowerRequiredActionPriority(filter)

Move required action priority up or down.

Parameters:

- filter (object, required)
- alias (string, required)

Returns:

- Promise<void>

### getRequiredActionConfigDescription(filter)

Get config schema/metadata for one required action.

Parameters:

- filter (object, required)
- alias (string, required)

Returns:

- Promise<object>

### getRequiredActionConfig(filter)

Get current config values for one required action.

Parameters:

- filter (object, required)
- alias (string, required)

Returns:

- Promise<object>

### updateRequiredActionConfig(filter, actionConfigRepresentation)

Update config values for one required action.

Parameters:

- filter (object, required)
- alias (string, required)
- actionConfigRepresentation (object, required)

Returns:

- Promise<void>

### removeRequiredActionConfig(filter)

Delete config for one required action.

Parameters:

- filter (object, required)
- alias (string, required)

Returns:

- Promise<void>

## Provider Discovery

### getClientAuthenticatorProviders()
### getFormActionProviders()
### getAuthenticatorProviders()
### getFormProviders()

List available provider metadata for the requested category.

Parameters:

- none

Returns:

- Promise<Array<object>>

## Authentication Flows

### getFlows()

List authentication flows.

Returns:

- Promise<Array<object>>

### createFlow(flowRepresentation)

Create flow.

Parameters:

- flowRepresentation (object, required)
- alias (string, required)
- providerId (string, required), example basic-flow
- topLevel (boolean, required)
- builtIn (boolean, required)
- description (string, optional)

Returns:

- Promise<void>

### updateFlow(filter, flowRepresentation)

Update existing flow.

Parameters:

- filter (object, required):
- flowId (string, required): flow id used by endpoint.
- flowRepresentation (object, required)

Returns:

- Promise<void>

### deleteFlow(filter)

Delete flow.

Parameters:

- filter (object, required)
- flowId (string, required): flow alias/id used by endpoint.

Returns:

- Promise<void>

### copyFlow(filter)

Copy existing flow.

Parameters:

- filter (object, required)
- flow (string, required): source flow alias.
- newName (string, required): alias for the copied flow.

Returns:

- Promise<void>

### getFlow(filter)

Read one flow.

Parameters:

- filter (object, required)
- flowId (string, required)

Returns:

- Promise<object>

## Flow Executions

### getExecutions(filter)

List executions of a flow.

Parameters:

- filter (object, required)
- flow (string, required): flow alias.

Returns:

- Promise<Array<object>>

### addExecutionToFlow(filter)

Add execution to a flow.

Parameters:

- filter (object, required)
- flow (string, required): flow alias.
- provider (string, required): provider id to add.

Returns:

- Promise<void>

### addFlowToFlow(filter)

Add sub-flow to a parent flow.

Parameters:

- filter (object, required)
- flow (string, required): parent flow alias.
- alias (string, required): sub-flow alias.
- type (string, required): flow type.
- provider (string, required): provider id.
- description (string, optional)

Returns:

- Promise<void>

### updateExecution(filter, executionRepresentation)

Update execution settings.

Parameters:

- filter (object, optional): realm-level routing context.
- executionRepresentation (object, required): execution payload including id and fields like requirement/priority.

Returns:

- Promise<void>

### delExecution(filter)

Delete execution.

Parameters:

- filter (object, required)
- id (string, required): execution id.

Returns:

- Promise<void>

### raisePriorityExecution(filter)
### lowerPriorityExecution(filter)

Change execution order.

Parameters:

- filter (object, required)
- id (string, required): execution id.

Returns:

- Promise<void>

## Execution Config

### createConfig(filter)

Create execution config.

Parameters:

- filter (object, required)
- id (string, required): execution id.
- alias (string, required): config alias.
- config (object, optional): key/value map.

Returns:

- Promise<object>

### getConfig(filter)

Read one config by id.

Parameters:

- filter (object, required)
- id (string, required): config id.

Returns:

- Promise<object>

### updateConfig(filter)

Update one config.

Parameters:

- filter (object, required)
- id (string, required): config id.
- config (object, required): key/value map.

Returns:

- Promise<void>

### delConfig(filter)

Delete one config.

Parameters:

- filter (object, required)
- id (string, required): config id.

Returns:

- Promise<void>

### getConfigDescription(filter)

Get config schema description for a provider.

Parameters:

- filter (object, required)
- providerId (string, required)

Returns:

- Promise<object>

## Example

```js
const flows = await KeycloakManager.authenticationManagement.getFlows();

await KeycloakManager.authenticationManagement.createFlow({
  alias: 'custom-browser',
  description: 'Custom browser flow',
  providerId: 'basic-flow',
  topLevel: true,
  builtIn: false
});

await KeycloakManager.authenticationManagement.copyFlow({
  flow: customFlowAlias,
  newName: copiedFlowAlias,
});

const executions = await KeycloakManager.authenticationManagement.getExecutions({
  flow: copiedFlowAlias,
});

if (executions[0]?.id) {
  await KeycloakManager.authenticationManagement.raisePriorityExecution({ id: executions[0].id });
}
```

## See Also
- [API Reference](../api-reference.md)
- [Realms](realms.md)
