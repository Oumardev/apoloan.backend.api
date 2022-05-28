'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Compte extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Compte.hasMany(models.User,{
        foreignKey: 'idCompte',
        onDelete: 'CASCADE'
      })
    }
  }
  Compte.init({
    solde: DataTypes.FLOAT,
    plafond: DataTypes.FLOAT,
    idbankaccount : DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Compte',
  });
  return Compte;
};