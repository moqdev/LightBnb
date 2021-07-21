-- SELECT reservations.*, properties.*, AVG(property_reviews.rating) as average_rating 
-- FROM properties
-- JOIN reservations ON  property_id = properties(id)
-- JOIN property_reviews ON property_id = properties(id)
-- ORDER BY (end_date - start_date)
-- WHERE end_date < now()::date;

SELECT properties.*, reservations.*, avg(rating) as average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
AND reservations.end_date < now()::date
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;