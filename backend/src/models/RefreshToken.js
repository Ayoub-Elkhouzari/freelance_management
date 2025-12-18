const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  revoked_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Méthode pour vérifier si le token est valide
RefreshToken.prototype.isValid = function() {
  return !this.revoked_at && new Date() < new Date(this.expires_at);
};

module.exports = RefreshToken;
