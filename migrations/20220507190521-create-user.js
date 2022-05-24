'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nom: {
        type: Sequelize.STRING
      },
      prenom: {
        type: Sequelize.STRING
      },
      isActivated: {
        type: Sequelize.BOOLEAN
      },
      numero: {
        type: Sequelize.INTEGER,
        unique: true
      },
      age: {
        type: Sequelize.INTEGER
      },
      sexe: {
        type: Sequelize.STRING
      },
      adresse: {
        type: Sequelize.STRING
      },
      fonction: {
        type: Sequelize.STRING
      },
      numeroCNI: {
        type: Sequelize.INTEGER,
        unique:true
      },
      password: {
        type: Sequelize.STRING
      },
      idCompte:{
        type: Sequelize.INTEGER,
        references:{
          model : 'Comptes',
          key: 'id',
          as: 'idCompte'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};