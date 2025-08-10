/* SaveState model */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SaveState = sequelize.define('SaveState', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    level: { type: DataTypes.INTEGER, defaultValue: 1 },
    wave: { type: DataTypes.INTEGER, defaultValue: 1 },
    hp: { type: DataTypes.INTEGER, defaultValue: 100 },
    credits: { type: DataTypes.INTEGER, defaultValue: 0 },
    upgrades: { type: DataTypes.JSONB || DataTypes.JSON, defaultValue: {} },
    blades: { type: DataTypes.JSONB || DataTypes.JSON, defaultValue: {} },
    lastSaveAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
  return SaveState;
};