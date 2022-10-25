const express = require("express");
var timeout = require("connect-timeout");
const deudasSalidaController = require("../controllers/notificacionesPersonalizadasSalidaController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.post("", timeout("25s"), isAuthenticated, deudasSalidaController.create);

module.exports = router;
