import { Sequelize } from "sequelize";

export const client = new Sequelize({
  username: 'postgres',
  database: 'postgres',
  host: 'localhost',
  password: 'jujuda1993',
  dialect: 'postgres',
})
