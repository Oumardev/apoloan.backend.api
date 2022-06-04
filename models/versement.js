'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Versement extends Model {
    static associate(models) {
      Versement.belongsTo(models.Transaction,{
        foreignKey : 'idTransaction',
        onDelete : 'CASCADE'
      })
    }
  }
  Versement.init({
    idTransaction: DataTypes.INTEGER,
    vieme: DataTypes.INTEGER,
    vntotal: DataTypes.INTEGER,
    montantVerser: DataTypes.FLOAT,
    montantAVerser: DataTypes.FLOAT,
    dateEcheance: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Versement',
  });
  return Versement;
};