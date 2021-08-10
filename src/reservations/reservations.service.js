const knex = require("../db/connection");

//CREATES NEW RESERVATION
function create(newRes) {
    return knex("reservations")
      .insert(newRes)
      .returning("*")
      .then((createdRes) => createdRes[0]);
  }

  //LISTS ALL EXISTING RESERVATIONS AND SORTS BY TIME
  function list(date) {
      return knex("reservations")
      .where({reservation_date: date})
      .select("*")
      .orderBy("reservation_time")
  }

  //RETURNS SPECIFIC RESERVATION
  function read(reservation_id) {
      return knex("reservations")
      .where({reservation_id: reservation_id})
      .returning("*")
      .first();
  }
  
  //UPDATES SPECIFIC RESERVATION WITH NEW INFORMATION
  function update(updatedReservation) {
    return knex("reservations")
      .where({reservation_id: updatedReservation.reservation_id})
      .update(updatedReservation, "*")
  }

  //FINDS ALL RESERVATIONS WITH MATCHING PHONE NUMBER
  function search(mobile_number) {
    return knex("reservations")
      .whereRaw(
        "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`
      )
      .orderBy("reservation_date");
  }
  
  module.exports = {
    search,
    create,
    list,
    read,
    update
  };