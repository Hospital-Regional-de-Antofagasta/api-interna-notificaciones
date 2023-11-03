const express = require("express");
const notificacionesPersonalizadasSalidaController = require("../controllers/notificacionesPersonalizadasSalidaController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.post(
  "",
  isAuthenticated,
  notificacionesPersonalizadasSalidaController.create
);

module.exports = router;
