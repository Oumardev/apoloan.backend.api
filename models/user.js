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

    }
  }
  User.init({
    nom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    numero: {
      type : DataTypes.INTEGER,
      unique : true
    },
    age: DataTypes.INTEGER,
    solde: DataTypes.FLOAT,
    sexe: DataTypes.STRING,
    adresse: DataTypes.STRING,
    fonction: DataTypes.STRING,
    numeroCNI: {
      type : DataTypes.STRING,
      unique : true
    },
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};