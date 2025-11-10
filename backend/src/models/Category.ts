import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class Category extends Model {
  public id!: number;
  public uniqueId!: string;
  public name!: string;
}

Category.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  uniqueId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => uuidv4()
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'categories'
});