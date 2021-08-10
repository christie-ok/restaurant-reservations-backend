/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const { route } = require("../tables/tables.router");

router
    .route("/:reservation_id/status")
    .put(controller.cancel)
    .all(methodNotAllowed)

router
    .route("/:reservation_id/edit")
    .put(controller.update)
    .all(methodNotAllowed)
    
router
    .route("/:reservation_id")
    .get(controller.read)
    .put(controller.update)
    .all(methodNotAllowed)

router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

module.exports = router;
