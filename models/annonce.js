'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Annonce extends Model {

    static associate(models) {

      Annonce.belongsTo(models.User,{
        foreignKey : 'codeUser',
        onDelete : 'CASCADE'
      })
    }
  }
  Annonce.init({
    type: DataTypes.STRING,
    duree: DataTypes.INTEGER,
    pourcentage: DataTypes.FLOAT,
    modalitePaiement: DataTypes.INTEGER,
    montant: DataTypes.FLOAT,
    isBooster: DataTypes.BOOLEAN,
    isVisible: DataTypes.BOOLEAN,
    codeUser: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Annonce',
  });
  return Annonce;
};