# Authentication Management API

Manage required actions, authentication flows, executions, and execution configs.

**Namespace:** `KeycloakManager.authenticationManagement`

## 1) Required Actions

### getRequiredActions()
- **Returns**: Promise<Array<object>>

### getUnregisteredRequiredActions()
- **Returns**: Promise<Array<object>>

### registerRequiredAction(actionRepresentation)
- **Required**: `alias`, `name`, `providerId`
- **Optional**: `defaultAction`, `enabled`, `priority`, `config`
- **Returns**: Promise<void>

### getRequiredActionForAlias(filter)
- **Required**: `filter.alias`
- **Returns**: Promise<object>

### updateRequiredAction(filter, actionRepresentation)
- **Required**: `filter.alias`
- **Required**: updated representation
- **Returns**: Promise<void>

### deleteRequiredAction(filter)
- **Required**: `filter.alias`
- **Returns**: Promise<void>

### raiseRequiredActionPriority(filter)
### lowerRequiredActionPriority(filter)
- **Required**: `filter.alias`
- **Returns**: Promise<void>

### getRequiredActionConfigDescription(filter)
- **Required**: `filter.alias`
- **Returns**: Promise<object>

### getRequiredActionConfig(filter)
- **Required**: `filter.alias`
- **Returns**: Promise<object>

### updateRequiredActionConfig(filter, actionConfigRepresentation)
- **Required**: `filter.alias`
- **Required**: config representation
- **Returns**: Promise<void>

### removeRequiredActionConfig(filter)
- **Required**: `filter.alias`
- **Returns**: Promise<void>

## 2) Authenticator / Provider Discovery

### getClientAuthenticatorProviders()
### getFormActionProviders()
### getAuthenticatorProviders()
### getFormProviders()
- **Params**: none
- **Returns**: Promise<Array<object>>

## 3) Authentication Flows

### getFlows()
- **Returns**: Promise<Array<object>>

### createFlow(flowRepresentation)
- **Required**: `alias`, `providerId`, `topLevel`, `builtIn`
- **Optional**: `description`
- **Returns**: Promise<void>

### updateFlow(filter, flowRepresentation)
- **Required**: `filter.id` or `filter.alias` (as expected by endpoint)
- **Required**: representation
- **Returns**: Promise<void>

### deleteFlow(filter)
- **Required**: flow identifier (`id` or `alias`, per endpoint)
- **Returns**: Promise<void>

### copyFlow(filter)
- **Required**: source flow id/alias
- **Required**: `filter.newName`
- **Returns**: Promise<void>

### getFlow(filter)
- **Required**: flow identifier
- **Returns**: Promise<object>

## 4) Flow Executions

### getExecutions(filter)
- **Required**: `filter.flowAlias`
- **Returns**: Promise<Array<object>>

### addExecutionToFlow(filter)
- **Required**: `filter.flowAlias`
- **Required**: `filter.provider`
- **Returns**: Promise<void>

### addFlowToFlow(filter)
- **Required**: `filter.flowAlias`
- **Required**: nested flow payload
- **Returns**: Promise<void>

### updateExecution(filter, executionRepresentation)
- **Required**: execution reference fields
- **Required**: execution representation
- **Returns**: Promise<void>

### delExecution(filter)
- **Required**: execution id reference
- **Returns**: Promise<void>

### raisePriorityExecution(filter)
### lowerPriorityExecution(filter)
- **Required**: execution reference fields
- **Returns**: Promise<void>

## 5) Execution Config

### createConfig(filter)
- **Required**: execution reference + config payload
- **Returns**: Promise<object>

### getConfig(filter)
- **Required**: `filter.id` (config id)
- **Returns**: Promise<object>

### updateConfig(filter)
- **Required**: config id + updated payload
- **Returns**: Promise<void>

### delConfig(filter)
- **Required**: `filter.id` (config id)
- **Returns**: Promise<void>

### getConfigDescription(filter)
- **Required**: provider id / execution reference as required by endpoint
- **Returns**: Promise<object>

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
```

## See Also
- [API Reference](../api-reference.md)
- [Realms](realms.md)
