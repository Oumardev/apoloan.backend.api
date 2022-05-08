'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Emprunt extends Model {

    static associate(models) {
      Emprunt.belongsTo(models.Contrat,{
        foreignKey: 'idContrat',
        onDelete: 'CASCADE'
      })

      Emprunt.belongsTo(models.User,{
        foreignKey: 'idContributeur',
        onDelete: 'CASCADE'
      })

      Emprunt.belongsTo(models.Annonce,{
        foreignKey: 'idAnnonce',
        onDelete: 'CASCADE'
      })
    }
  }
  
  Emprunt.init({
    idContributeur: DataTypes.INTEGER,
    idAnnonce: DataTypes.INTEGER,
    idContrat: DataTypes.INTEGER,
    statut: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Emprunt',
  });
  return Emprunt;
};