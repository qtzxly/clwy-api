'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Category.init({
    name: {
      // type: DataTypes.STRING,
      // allowNull: false,
      // unique: {msg: '名称已存在,请选择其他名称'},
      // validate: {
      //   notNull: {
      //     msg: 'Name cannot be null.'
      //   },
      //   notEmpty: {
      //     msg: 'Name cannot be empty.'
      //   },
      //   len:{
      //     args: [2, 45],
      //     msg: 'Name length should between 2 ~ 45'
      //   },
      //  }
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: '名称必须填写。' },
        notEmpty: { msg: '名称不能为空。' },
        len: { args: [2, 45], msg: '长度必须是2 ~ 45之间。' },
        async isUnique(value) {
          const category = await Category.findOne({ where: { name: value } })
          if (category) {
            throw new Error('名称已存在,请选择其他名称。');
          }
        }
      }
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Rank cannot be null.'
        },
        notEmpty: {
          msg: 'Rank cannot be empty.'
        },
        isInt: {
          msg: 'Rank must be int.'
        },
        isPositive(value) {
          if(value<=0) {
            throw new Error('排序必须是正整数')
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};