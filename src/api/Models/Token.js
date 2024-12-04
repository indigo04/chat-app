import { DataTypes } from "sequelize";
import { client } from "../db.js";
import { User } from "./User.js";


export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'tokens'
})

Token.belongsTo(User)
User.hasOne(Token)
