import { DataTypes } from "sequelize";
import db from "../config/database.js";

export const Vehicle = db.define('Vehicle', {
    plate: {
        type: DataTypes.STRING(7),
        allowNull: false,
        unique: true
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: 'vehicles'
})