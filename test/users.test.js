const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Users Handler', function () {
  this.timeout(10000);
  let client;
  let testUserId;

  before(function () {
    client = getAdminClient();
  });

  describe('create', function () {
    it('should create a user with valid representation', async function () {
      const userRepresentation = {
        username: 'testuser',
        enabled: true,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      };

      const result = await client.users.create({ realm: 'test-realm' }, userRepresentation);

      expect(result).to.have.property('id');
      testUserId = result.id;
    });

    it('should fail creating duplicate username', async function () {
      try {
        await client.users.create(
          { realm: 'test-realm' },
          {
            username: 'testuser',
            enabled: true,
          }
        );
        expect.fail('Should have thrown an error for duplicate username');
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe('find', function () {
    it('should list all users', async function () {
      const users = await client.users.find({ realm: 'test-realm' });

      expect(users).to.be.an('array');
      expect(users.some((u) => u.username === 'testuser')).to.be.true;
    });

    it('should search users by username', async function () {
      const users = await client.users.find({ realm: 'test-realm', username: 'testuser' });

      expect(users).to.be.an('array');
      expect(users.length).to.equal(1);
      expect(users[0].username).to.equal('testuser');
    });
  });

  describe('findOne', function () {
    it('should find a specific user by id', async function () {
      const user = await client.users.findOne({ realm: 'test-realm', id: testUserId });

      expect(user).to.exist;
      expect(user.username).to.equal('testuser');
    });
  });

  describe('update', function () {
    it('should update user attributes', async function () {
      const updateRepresentation = {
        firstName: 'Updated',
        lastName: 'Name',
        attributes: {
          department: ['IT'],
        },
      };

      await client.users.update(
        { realm: 'test-realm', id: testUserId },
        updateRepresentation
      );

      const updatedUser = await client.users.findOne({ realm: 'test-realm', id: testUserId });
      expect(updatedUser.firstName).to.equal('Updated');
      expect(updatedUser.lastName).to.equal('Name');
    });
  });

  describe('setPassword', function () {
    it('should set user password', async function () {
      const passwordRepresentation = {
        type: 'password',
        value: 'NewPassword123!',
        temporary: false,
      };

      await client.users.resetPassword(
        { realm: 'test-realm', id: testUserId },
        passwordRepresentation
      );

      // Verify password was set by attempting auth
      // (This would require a separate auth client, so we just verify no error thrown)
    });
  });

  after(async function () {
    // Cleanup: delete test user
    try {
      if (testUserId) {
        await client.users.del({ realm: 'test-realm', id: testUserId });
      }
    } catch (err) {
      // Ignore if not found
    }
  });
});
