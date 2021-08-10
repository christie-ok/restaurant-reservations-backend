/**
 * List handler for reservation resources
 */
const reservationsService = require("./reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")

//VALIDATES THE NEW RESERVATION HAS ALL REQUIRED FIELDS
function hasAllFields(req, res, next) {
  const newRes = req.body.data;

  if (newRes) {
    let {first_name, last_name, mobile_number, reservation_date, reservation_time, people, status} = newRes;
    people = parseInt(people);

    if (status === "seated" || status === "finished") return next({status: 400, message: "New reservations not yet seated or finished."})
    if (first_name && last_name && mobile_number && reservation_date && reservation_time && people && Date.parse(`${reservation_date}T${reservation_time}`) && (typeof people === "number")) {

      res.locals.newRes = newRes;
      return next();
    
  }
  }

  next({status: 400, message: "All new reservations must include first_name, last_name, mobile_number, reservation_date, reservation_time, number of people."})
};

//VALIDATES THAT THE RESERVATION IS NOT TOO LATE
function openingHours(req, res, next) {
  const time = res.locals.newRes.reservation_time;

  if ("10:30" <= time && time <= "21:30") return next();

  next({status: 400, message: "Reservations before 10.30am and after 9.30pm not accepted."})
}

//VALIDATES THAT THE RESERVATION IS NOT BOOKED ON A TUESDAY
function notTuesday(req, res, next) {
  const date = res.locals.newRes.reservation_date;
  const current = new Date(date);
  const utcDate = new Date(current.toUTCString());
  utcDate.setHours(utcDate.getHours()+8);
  const usDate = new Date(utcDate)
  
  if (usDate.getDay() !== 2) return next();

  next({status: 400, message: "Restaurant is closed on Tuesday."})
}

//VALIDATES THAT THE RESERVATIONS IS NOT IN THE PAST
function notPast(req, res, next) {
  const date = res.locals.newRes.reservation_date;
  const time = res.locals.newRes.reservation_time;
  const now = new Date();
  const event = new Date(`${date} ${time} PDT`);
  
  if (event > now) return next();

  next({status: 400, message: "Reservation must be for future date & time."})
}

//VALIDATES RESERVATION EXISITS
async function reservationExists(req, res, next) {

  const reservation = await reservationsService.read(req.params.reservation_id);

  if (reservation) {
    res.locals.data = reservation;
    return next();
  }

  next({status: 404, message: `Reservation ${req.params.reservation_id} does not exists.`})
}

//CHECKS THE STATUS OF A RESERVATION TO SEE WHAT CHANGES - IF ANY - CAN BE MADE.
function checkStatus(req, res, next) {
  const statusOK = ["booked", "seated", "finished", "cancelled"];
  const newStatus = req.body.data.status ? req.body.data.status.toLowerCase() : "cancelled"
  let {status} = res.locals.data;
  status = status.toLowerCase();

  if (status === "finished") return next({status: 400, message: "finished reservation cannot be updated."})

  if (!statusOK.includes(newStatus)) return next({status: 400, message: `${newStatus} is not a valid reservation status.`});

  next();

}
 
//API CALL: RETURNS A LIST OF ALL RESERVATIONS
async function list(req, res) {
  const {mobile_number, date} = req.query;
  let reservations = [];

  if (date) {
    unfilteredReservations = await reservationsService.list(date);
    
    const filteredReservations = unfilteredReservations.filter((reservation) => (reservation.status !== "finished" && reservation.status !== "cancelled"));
    reservations = [...filteredReservations];
  };
  
  if (mobile_number) reservations = await reservationsService.search(mobile_number);
  
  res.status(200).json({data: reservations})
}

//API CALL: CREATES A NEW RESERVATION
async function create(req, res, next) {
  const reservation = await reservationsService.create(req.body.data);
  res.status(201).json({data: reservation});
}

//API CALL:UPDATES SPECIFIED RESERVATION
async function update(req, res, next) {
  const oldReserevation = res.locals.data;
  
  const updatedReservation = {
      ...oldReserevation,
      ...req.body.data
  }
  
  const newReservation = await reservationsService.update(updatedReservation)

  res.status(200).json({data: newReservation[0]})
}

//RETURNS SPECIFIED RESERVATION
function read(req, res, next) {
  const reservation = res.locals.data;
  res.status(200).json({data: reservation})
}


module.exports = {
  cancel: [asyncErrorBoundary(reservationExists), checkStatus, asyncErrorBoundary(update)],
  update: [asyncErrorBoundary(reservationExists), hasAllFields, checkStatus, asyncErrorBoundary(update)],
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(reservationExists), read],
  create: [hasAllFields, openingHours, notTuesday, notPast, asyncErrorBoundary(create)]
};
