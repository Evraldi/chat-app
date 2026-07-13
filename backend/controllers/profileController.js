const User = require('../models/User');
const { success, error } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Get user profile by ID
 */
exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        logger.info(`Fetching profile for user ${userId}`);

        const user = await User.findById(userId).select('-password');

        if (!user) {
            logger.warn(`User not found: ${userId}`);
            return error(res, 'User not found', 404);
        }

        return success(res, {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar
            });
    } catch (err) {
        logger.error(`Error fetching profile for ${req.params.userId}: ${err.message}`, { stack: err.stack });
        return error(res, `Failed to fetch profile: ${err.message}`, 500);
    }
};

/**
 * Update authenticated user's profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
                const { displayName, avatar } = req.body;

        logger.info(`Profile update request for user ${userId}`, { displayName, avatarLength: avatar?.length });

        const user = await User.findById(userId);

        if (!user) {
            logger.warn(`User not found for profile update: ${userId}`);
            return error(res, 'User not found', 404);
        }

                // Update fields
        if (displayName !== undefined) user.displayName = displayName;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        logger.info(`Profile updated successfully for user ${userId}`);

                return success(res, {
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar
        }, 'Profile updated successfully');
    } catch (err) {
        logger.error(`Error updating profile for user ${req.user?.id}: ${err.message}`, {
            stack: err.stack,
            userId: req.user?.id,
            body: req.body
        });
        return error(res, `Failed to update profile: ${err.message}`, 500);
    }
};

