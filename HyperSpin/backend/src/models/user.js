/* User model */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    fbId: { type: DataTypes.STRING, unique: true },
    displayName: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    profilePictureUrl: { type: DataTypes.STRING },
    friends: { type: DataTypes.JSONB || DataTypes.JSON }, // array of fbIds
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    lastActive: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    credits: { type: DataTypes.INTEGER, defaultValue: 0 },
  });
  return User;
};