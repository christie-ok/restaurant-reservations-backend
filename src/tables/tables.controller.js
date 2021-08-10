const tablesService = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")
const reservationsService = require("../reservations/reservations.service");
const reservationController = require("../reservations/reservations.controller");
const { table } = require("../db/connection");

//VALIDATES HAS ALL NEEDED DATA POINTS
function hasBodyDataAndReservationID(req, res, next) {
    if (!req.body.data) return next({status: 400, message: "Request body required."});
    if (!req.body.data.reservation_id) return next({status: 400, message: "reservation_id required."});
    next();
}

//VALIDATES A SPECIFIC RESERVATIONS EXISTS
async function reservationExists(req, res, next) {
    const table = res.locals.table;
    const rezID = table.reservation_id ? table.reservation_id : req.body.data.reservation_id;
    
    const reservation = await reservationsService.read(rezID);

    if (reservation) {
        res.locals.reservation = reservation;
        return next();
    }

    next({status: 404, message: `Reservation id ${rezID} does not exists.`})
}

//VALIDATES A SPECIFIC TABLE EXISTS
async function tableExists(req, res, next) {
    const table = await tablesService.read(req.params.table_id);
    
    if (table) {
        res.locals.table = table;
        return next();
    }
    next({status: 404, message: `Table ${req.params.table_id} not found.`})
}

//VALIDATES A TABLE IS UNOCCUPIED
function tableIsFree(req, res, next) {
    const {reservation_id} = res.locals.table;
    
    if (reservation_id && reservation_id !== req.body.data.reservation_id) return next({status: 400, message: "Table occupied."})
    next();
}

//VALIDATES A TABLE IS OCCUPIED
function tableIsOccupied(req, res, next) {
    const table = res.locals.table;

    if (table.reservation_id) return next();

    next({status: 400, message: "Table is not occupied."})
}

//RETUNS ALL DATA FOR SPECIFIC TABLE
function readTable(req, res, next) {
    return res.status(200).json({data: res.locals.table})
}

//API CALL: MAKES SURE TABLE IS BIG ENOUGH FOR PARTY
async function capacityMatch(req, res, next) {
    const reservation = await reservationsService.read(req.body.data.reservation_id);
    const {people} = reservation;
    const {capacity} = res.locals.table;

    if (people <= capacity) return next();

    next({status: 400, message: "Group size is over table capacity."})
    
}

//VALIDATES A TABLE HAS ALL NEEDED DATA
function hasAllFields(req, res, next) {
    const newTable = req.body.data;
    if (!newTable) return next({status: 400, message: "All table info required."})
    const {table_name, capacity} = newTable;
    

    if (table_name && capacity) {
        if (table_name.length <= 1) return next({status:400, message: "table_name must be at least 2 characters."})
        res.locals.newTable = newTable;
        return next();
    };

    next({status: 400, message: "capacity and table_name are required."})
};

//API CALL: CREATES NEW TABLE
async function create(req, res, next) {
    const newTable = await tablesService.create(req.body.data);
    res.status(201).json({data: newTable})
}

//API CALL: LISTS ALL EXISTING TABLES
async function list(req, res, next) {
    const tables = await tablesService.list();
    res.json({data: tables});
}

//CONFIRMS A RESERVATION IS NOT ALREADY SEATED
function reservationStatus(req, res, next) {
    const reservation = res.locals.reservation;
    if (reservation.status === "seated") return next({status: 400, message: `Table is occupied.  Reservation ${reservation.reservation_id} is already seated.`});
    next();
}

//API CALL: UPDATES A TABLE WITH RESERVATION ID WHEN PARTY IS SEATED
async function update(req, res, next) {
    const {table_id} = res.locals.table;
    const reservation = res.locals.reservation;

    let updatedTable = await tablesService.update(table_id, req.body.data.reservation_id);
    
    const updatedReservation = {
        ...reservation,
        status: "seated"
    }

    await reservationsService.update(updatedReservation);

    res.status(200).json({data: updatedTable})
}

//REMOVES A PARTY FROM THE TABLE WHEN THEY'RE FINSIHED
async function destroy(req, res, next) {
    const table_id = req.params.table_id;
    const reservation = res.locals.reservation;

    const updatedReservation = {
        ...reservation,
        status: "finished"
    }

    await tablesService.destroy(table_id);
    await reservationsService.update(updatedReservation)

    res.status(200).json({});
}

module.exports = {
    read: [asyncErrorBoundary(tableExists), readTable],
    list: [asyncErrorBoundary(list)],
    update: [hasBodyDataAndReservationID, asyncErrorBoundary(tableExists), asyncErrorBoundary(reservationExists), reservationStatus, tableIsFree, asyncErrorBoundary(capacityMatch), asyncErrorBoundary(update)],
    create: [hasAllFields, asyncErrorBoundary(create)],
    destroy: [asyncErrorBoundary(tableExists), tableIsOccupied, reservationExists, asyncErrorBoundary(destroy)]
}