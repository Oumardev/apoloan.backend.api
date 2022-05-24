'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      User.hasMany(models.Annonce,{
        foreignKey: 'codeUser',
        onDelete: 'CASCADE'
      })

      User.hasMany(models.Emprunt,{
        foreignKey: 'idContributeur',
        onDelete: 'CASCADE'
      })

      User.hasMany(models.Pret,{
        foreignKey: 'idDemandeur',
        onDelete: 'CASCADE'
      })

      User.belongsTo(models.Compte,{
        foreignKey:'idCompte',
        onDelete: 'CASCADE'
      })

    }
  }
  User.init({
    nom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    numero: {
      type : DataTypes.INTEGER,
      unique : true
    },
    atnaissance: DataTypes.INTEGER,
    sexe: DataTypes.STRING,
    adresse: DataTypes.STRING,
    isActivated: DataTypes.BOOLEAN,
    fonction: DataTypes.STRING,
    numeroCNI: {
      type : DataTypes.INTEGER,
      unique : true
    },
    password: DataTypes.STRING,
    idCompte : DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};