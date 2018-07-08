const cfg = require("../config/db").mysql;
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
	cfg.database,
	cfg.username,
	cfg.password, {
		host: cfg.host,
		dialect: 'mysql',

		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000
		}
	});

const City = sequelize.define('city', { countryCode: Sequelize.STRING });
const Country = sequelize.define('country', { isoCode: Sequelize.STRING });

// Here we can connect countries and cities base on country code
Country.hasMany(City, {foreignKey: 'countryCode', sourceKey: 'isoCode'});
City.belongsTo(Country, {foreignKey: 'countryCode', targetKey: 'isoCode'});