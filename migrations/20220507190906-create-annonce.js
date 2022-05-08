'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Annonces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      duree: {
        type: Sequelize.STRING
      },
      pourcentage: {
        type: Sequelize.FLOAT
      },
      montant: {
        type: Sequelize.FLOAT
      },
      isBooster: {
        type: Sequelize.BOOLEAN
      },
      isVisible: {
        type: Sequelize.BOOLEAN
      },
      codeUser: {
        type: Sequelize.INTEGER,
        references:{
          model : 'Users',
          key: 'id',
          as: 'codeUser'
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
    await queryInterface.dropTable('Annonces');
  }
};