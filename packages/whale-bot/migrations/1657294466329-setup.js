'use strict'

module.exports.up = async function (next) {
   var Config = require('parse-server/lib/Config');
   const schema = await Config.get(process.env.APP_ID, process.env.SERVER_URL + process.env.PARSE_MOUNT).database.loadSchema();

   const firstUser = new User();
   firstUser.set('email', 'trebel@defiplaza.net');
   firstUser.set('username', 'trebel@defiplaza.net');
   firstUser.set('password', 'inj()^%cvibn87jve8778&&');
   await firstUser.save(null, {
      useMasterKey: true,
   });

   // create admin role
   let roleACL = new Parse.ACL();
   let role = new Parse.Role('admins', roleACL);
   role.getUsers().add(firstUser);

   roleACL.setRoleReadAccess(role, true);
   roleACL.setRoleWriteAccess(role, true);
   role.setACL(roleACL);

   await role.save(null, {
      useMasterKey: true,
   });

   // update User class
   try {
      await schema.updateClass('_User', {
         lastName: { type: 'String' },
         firstName: { type: 'String' },
         company: { type: 'String' },
      });
   } catch (err) {
      if (err.code === 255) {
         // user class already updated
         console.warn(err.message);
      } else {
         throw err;
      }
   }

   // set User CLP
   try {
      await schema.setPermissions('_User', {
         find: { '*': true, 'role:admins': true },
         get: { '*': true, 'role:admins': true },
         count: { 'role:admins': true },
         create: { '*': true },
         update: { '*': true },
         delete: { 'role:admins': true },
         addField: { 'role:admins': true },
      });
   } catch (err) {
      throw err;
   }

   // add Exchange class
   try {
      await schema.addClassIfNotExists('Exchange', {
         archived: { type: 'Boolean', defaultValue: false },
			name: { type: 'String' },
			trackerClass: { type: 'String' }
      });
   } catch (err) {
      if (err.code === 103) {
         // class already exists
         console.warn(err.message);
      } else {
         throw err;
      }
   }

   // add Publisher class
   try {
      await schema.addClassIfNotExists('Publisher', {
         archived: { type: 'Boolean', defaultValue: false },
         active: { type: 'Boolean', defaultValue: true },
         type: { type: 'String', defaultValue: 'Telegram' },
         channel: { type: 'String' },
      });
   } catch (err) {
      if (err.code === 103) {
         // class already exists
         console.warn(err.message);
      } else {
         throw err;
      }
   }

   // add Tracker class
   try {
      await schema.addClassIfNotExists('Tracker', {
         archived: { type: 'Boolean', defaultValue: false },
         active: { type: 'Boolean', defaultValue: true },
         exchange: { type: 'Pointer', targetClass: 'Exchange' },
         publisher: { type: 'Pointer', targetClass: 'Publisher' },
         pollInterval: { type: 'Number', defaultValue: 30 },
         minUSD: { type: 'Number', defaultValue: 2500 },
      });
   } catch (err) {
      if (err.code === 103) {
         // class already exists
         console.warn(err.message);
      } else {
         throw err;
      }
   }

   // add Transaction class
   try {
      await schema.addClassIfNotExists('Transaction', {
			archived: { type: 'Boolean', defaultValue: false },
         exchange: { type: 'Pointer', targetClass: 'Exchange' },
         publisher: { type: 'Pointer', targetClass: 'Publisher' },
         pollInterval: { type: 'Number', defaultValue: 30 },
         minUSD: { type: 'Number', defaultValue: 2500 },
      });
   } catch (err) {
      if (err.code === 103) {
         // class already exists
         console.warn(err.message);
      } else {
         throw err;
      }
   }

   next();
};

module.exports.down = function (next) {
   next();
};
