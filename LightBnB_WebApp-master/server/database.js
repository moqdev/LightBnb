const properties = require('./json/properties.json');

const users = require('./json/users.json');

const {Pool} = require("pg");

const pool = new Pool ({
  user:         "vagrant",
  password:     "123",
  host:         "localhost",
  database:     "lighthousebnb", 
});

pool
.connect()
.then(() =>{
  console.log("connected 🥳🥳🥳");
})
.catch((err) => { 
console.log(err);
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const queryString =  `SELECT * FROM users WHERE email LIKE $1`;
  return pool.query(queryString, [email]).then((result) =>{
    console.log("someone is attempting to login....✅✅✅ ");
    return result.rows[0] || null;
  });
  
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const queryString = `SELECT * FROM users WHERE id = $1 `;
  const value = [id];
  console.log(id);
  return pool.query(queryString, value).then((result) => {
    console.log("fetching.... ✅✅✅✅✅✅ ");
    return result.rows[0];
  });
  // return Promise.resolve(users[id]);
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const values = [user.name, user.email, user.password];
  const queryString = `INSERT INTO users(name, email, password) VALUES($1, $2 , $3) RETURNING *`;
  //return the promise itself
  return pool.query(queryString, values).then((result) => {
    console.log("Someone is registering...🎉");
    return result.rows[0];
  });

};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
 const getAllReservations = function (guest_id, limit = 10) {
  const values = [guest_id, limit];
  const queryString = `SELECT 
                       properties.*,
                       reservations.*,
                       avg(property_reviews.rating) AS average_rating
                       FROM reservations
                       LEFT JOIN properties ON properties.id = reservations.property_id
                       LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
                       WHERE reservations.guest_id = $1 AND end_date < now()::date
                       GROUP BY properties.id, reservations.id
                       ORDER BY reservations.start_date
                       LIMIT $2;`;

  return pool.query(queryString, values).then((result) => {
    // console.log(result.rows);
    return result.rows;
  });
 
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {
      console.log(result.rows);
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getAllProperties = getAllProperties;


/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 *
 */
const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) AS average_rating
  FROM properties
  LEFT OUTER JOIN property_reviews ON property_id = properties.id`;
  if (Object.keys(options).length > 1) {
    let queriesAdded = false;

    if (options.city) {
      if (!queriesAdded) {
        queryString += `
        WHERE `;
        queriesAdded = true;
      }
      queryParams.push(`%${options.city}%`);
      queryString += ` properties.city LIKE $${queryParams.length} AND `;
    }
    if (options.owner_id) {
      if (!queriesAdded) {
        queryString += `
        WHERE `;
        queriesAdded = true;
      }
      queryParams.push(Number(options.owner_id));
      queryString += ` properties.owner_id = $${queryParams.length} AND `;
    }
    if (options.minimum_price_per_night) {
      if (!queriesAdded) {
        queryString += `
        WHERE `;
        queriesAdded = true;
      }
      queryParams.push(Number(options.minimum_price_per_night) * 100);
      queryString += ` properties.cost_per_night >= $${queryParams.length} AND `;
    }
    if (options.maximum_price_per_night) {
      if (!queriesAdded) {
        queryString += `
        WHERE `;
        queriesAdded = true;
      }
      queryParams.push(Number(options.maximum_price_per_night) * 100);
      queryString += ` properties.cost_per_night <= $${queryParams.length} AND `;
    }

    if (queriesAdded) {
      queryString = queryString.slice(0, -4);
    
    }
  }

  queryString += `
    GROUP BY properties.id`;
  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    queryString += `
    HAVING avg(rating) >= $${queryParams.length}`;
  }
  queryParams.push(limit);
  queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};`;

    console.log(queryParams);
    console.log(queryParams.length);

  return pool.query(queryString, queryParams).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */

const addProperty = function(property) {
  const queryPrams =  const queryParams = [property.owner_id,property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms, property.country, property.street, property.city, property.province, property.post_code ];
  const queryString = `INSERT INTO properties(owner_id,title,description,thumbnail_photo_url,cover_photo_url, cost_per_night, parking_spaces,number_of_bathrooms,number_of_bedrooms, country,street,city,province,post_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`;
  
  return pool
  .query(queryString, queryParams)
  .then((result)=>{
    return result.rows[0];
  })

  
};
exports.addProperty = addProperty;

/**
 * Add a reservation to the database
 * @param {{}} reservation An object containing all of the reservation details.
 * @returns {Promise<{}>} A promise to the reservation.
 */
 const addReservation = function(reservation) {
  const reservationParams = [reservation.start_date, reservation.end_date, reservation.property_id, reservation.guest_id];
  return db.query(`
    INSERT INTO reservations (start_date, end_date, property_id, guest_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `, reservationParams)
    .then(res => res.rows[0]);
};
exports.addReservation = addReservation ;
