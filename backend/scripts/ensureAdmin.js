const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Ensure the default admin account exists / is promoted.
 * evraldi is the bootstrap admin; any other existing user stays 'user'.
 */
const ensureAdmin = async () => {
  try {
    const adminUsername = 'evraldi';
    const admin = await User.findOne({ username: adminUsername });

    if (admin && admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      logger.info(`Promoted '${adminUsername}' to admin`);
    } else if (!admin) {
      logger.info(`Note: admin user '${adminUsername}' not found yet (will get admin role on registration)`);
    } else {
      logger.info(`Admin '${adminUsername}' already has admin role`);
    }
  } catch (err) {
    logger.error(`ensureAdmin failed: ${err.message}`, { stack: err.stack });
  }
};

module.exports = ensureAdmin;
