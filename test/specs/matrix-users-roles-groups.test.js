const path = require('path');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', 'config');

const keycloakManager = require('keycloak-api-manager');
const { TEST_REALM } = require('../testConfig');
const { loadMatrix, uniqueName } = require('../helpers/matrix');

describe('Matrix - Users, Roles, Groups', function () {
  this.timeout(30000);

  const matrix = loadMatrix('users-roles-groups');

  before(function () {
    keycloakManager.setConfig({ realmName: TEST_REALM });
  });

  matrix.cases.forEach((testCase) => {
    it(`user-role-group case: ${testCase.name}`, async function () {
      const roleName = uniqueName(`matrix-role-${testCase.name}`);
      const groupName = uniqueName(`matrix-group-${testCase.name}`);
      const username = uniqueName(`matrix-user-${testCase.name}`);
      const email = `${username}@example.test`;

      await keycloakManager.roles.create({
        name: roleName,
        description: `Role for ${testCase.name}`,
      });

      const group = await keycloakManager.groups.create({
        name: groupName,
        attributes: { description: ['Matrix group'] },
      });

      const user = await keycloakManager.users.create({
        username,
        email,
        enabled: testCase.user.enabled,
        emailVerified: testCase.user.emailVerified,
        firstName: 'Matrix',
        lastName: 'User',
      });

      await keycloakManager.users.addToGroup({
        id: user.id,
        groupId: group.id,
      });

      const role = await keycloakManager.roles.findOneByName({ name: roleName });
      await keycloakManager.users.addRealmRoleMappings({
        id: user.id,
        roles: [role],
      });

      const userGroups = await keycloakManager.users.listGroups({ id: user.id });
      expect(userGroups.map((g) => g.id)).to.include(group.id);

      const roleMappings = await keycloakManager.users.listRealmRoleMappings({ id: user.id });
      expect(roleMappings.map((r) => r.name)).to.include(roleName);

      await keycloakManager.users.del({ id: user.id });
      await keycloakManager.groups.del({ id: group.id });
      await keycloakManager.roles.delByName({ name: roleName });
    });
  });
});
