'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Versements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idTransaction: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Transactions',
          key: 'id',
          as: 'idTransaction'
        }
      },
      vieme: {
        type: Sequelize.INTEGER
      },
      vntotal: {
        type: Sequelize.INTEGER
      },
      montantVerser: {
        type: Sequelize.FLOAT
      },
      montantAVerser: {
        type: Sequelize.FLOAT
      },
      dateEcheance: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Versements');
  }
};