const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
    .query( `SELECT * FROM users
    WHERE email = $1`,
      [email])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    })
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
  .query( `SELECT * FROM users
  WHERE id = $1`,
    [id])
  .then((result) => {
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  })
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
    return pool
    .query(`INSERT INTO users (name, email, password) 
    VALUES ($1, $2, $3) RETURNING *`,
    [user.name, user.email, user.password])
    .then((result) => {
      console.log(result.rows);
      return result.rows[0]
    })
    .catch((err) => {
      console.log(err.message);
    });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {

  return pool
  .query(`SELECT reservations.id, properties.*, reservations.start_date, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;`,
  [guest_id ,limit = 10])
  .then((result) => {
    return result.rows
  })
  .catch((err) => {
    console.log(err.message);
  });

}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {

  // set up an arr to hold parameters that are available for the query
  const queryParams = [];

  // start query with all info that comes before the WHERE clause
  let queryString = `SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE 1 = 1`;

  //check if a city has been passed in the option
  if (options.city) {
    // add the city to the params arr
    queryParams.push(`%${options.city}%`);
    //create the query string for the city
    queryString += ` AND city LIKE $${queryParams.length}`;
  }

  if (options.owner_id) {
    // add the owner id to the params arr
    queryParams.push(`${options.owner_id}`);
    //create the query string for the owner id
    queryString += ` AND owner_id = $${queryParams.length}`;
  }

  // check if a min price has been passed in the option
  if (options.minimum_price_per_night) {
    // add the min price to the params arr
    queryParams.push(`${options.minimum_price_per_night}`);
    //create the query string for the min price
    queryString += ` AND cost_per_night >= $${queryParams.length}`;
  }

  //check if a max price has been passed in the option
  if (options.maximum_price_per_night) {
    // add the max to the params arr
    queryParams.push(`${options.maximum_price_per_night}`);
    //create the query string for the max price
    queryString += ` AND cost_per_night <= $${queryParams.length}`;
  }
 
  queryString += `
  GROUP BY properties.id`

  // check if a min rating has been passed in the options
  if (options.minimum_rating) {
    // add the min rating to the params arr
    queryParams.push(`${options.minimum_rating}`);
    //create the query string for the min rating
    queryString += ` HAVING average_rating >= $${queryParams.length}`;
  }
  queryParams.push(limit = 10);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length}`;

  //run the query
  return pool
  .query(queryString, queryParams)
  .then((res) => res.rows);

};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
