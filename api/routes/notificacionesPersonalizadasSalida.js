const express = require("express");
const deudasSalidaController = require("../controllers/notificacionesPersonalizadasSalidaController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.post("", isAuthenticated, deudasSalidaController.create);

module.exports = router;
