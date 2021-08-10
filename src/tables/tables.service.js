const knex = require("../db/connection");

//LISTS ALL EXISTING TABLES
function list() {
    return knex("tables")
    .select("*")
    .orderBy("table_name")
};

//RETURNS ALL DATA FOR A SPECIFIC TABLE
function read(table_id) {
    return knex("tables")
    .select("*")
    .where({table_id: table_id})
    .first()
}

//UPDATES A TABLE WITH A RESERVATION WHEN PARTY IS SEATED
function update(tableId, reservationId) {
    return knex("tables")
    .where({table_id: tableId})
    .update({
        reservation_id: reservationId
    })
}

//CREATES A NEW TABLE
function create(newTable) {
    return knex("tables")
    .insert(newTable)
    .returning("*")
    .then((createdTable) => createdTable[0])
}

//REMOVES A RESERVATION FROM A TABLE WHEN THEY'RE FINISHED
function destroy(tableId) {
    return knex("tables")
    .where({table_id: tableId})
    .update({
        reservation_id: null
    })
}

module.exports = {
    list,
    read,
    update,
    create,
    destroy
}