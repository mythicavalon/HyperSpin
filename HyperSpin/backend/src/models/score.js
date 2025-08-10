/* Score model for multi-game leaderboards */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Score = sequelize.define('Score', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    gameKey: { type: DataTypes.STRING, allowNull: false },
    score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    meta: { type: DataTypes.JSON, defaultValue: {} },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    indexes: [
      { fields: ['gameKey', 'score'] },
      { unique: false, fields: ['userId', 'gameKey'] },
    ]
  });
  return Score;
};