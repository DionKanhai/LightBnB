-- SELECT reservations.id as id, properties.title as title, properties.cost_per_night as cost_per_night, reservations.start_date as start_date, avg(property_reviews.rating) as rating
-- FROM properties
-- JOIN reservations ON properties.id = property_id
-- JOIN users ON users.id = guest_id
-- JOIN property_reviews ON reservations.id = reservation_id
-- WHERE users.email = 'tristanjacobs@gmail.com' 
-- GROUP BY reservations.id, properties.title, reservations.start_date, properties.cost_per_night
-- ORDER BY reservations.start_date
-- LIMIT 10;

SELECT reservations.id, properties.title, properties.cost_per_night, reservations.start_date, avg(rating) as average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;