const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Deudas = mongoose.model(
  "notificacion",
  new Schema(
    {
      identificador: { type: String, required: true },
      tipo: { type: String, required: true, enum: ["PAGARE"] },
      codigoEstablecimiento: { type: String, required: true, enum: ["HRA"] },
      correlativo: { type: Number, required: true },
      rutPaciente: { type: String, required: true },
      fecha: { type: Date, required: true },
      valor: { type: Number, required: true },
      notificacion: { type: Number, required: true },
      rutDeudor: { type: String, required: true },
      nombreDeudor: { type: String, required: true },
      nombreEstablecimiento: {
        type: String,
        required: true,
        enum: ["Hospital Regional Antofagasta Dr. Leonardo Guzmán"],
      },
    },
    { timestamps: true }
  )
);

module.exports = Deudas;
