const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Deudas = mongoose.model(
  "notificaciones_personalizadas",
  new Schema(
    {
      correlativo: { type: String, required: true, unique: true },
      idOneSignal: { type: String, required: true, unique: true, default: 1 },
      tituloEs: { type: String, required: true },
      mensajeEs: { type: String, required: true },
      tituloEn: { type: String },
      mensajeEn: { type: String },
      rutPaciente: { type: String, required: true },
      estado: { type: String, required: true, default: "ENVIADA" },
      fechaCreacion: { type: Date, required: true },
      leida: { type: Boolean, default: false },
      fijada: { type: Boolean, default: false },
      codigoEstablecimiento: { type: String, required: true, enum: ["HRA"] },
      nombreEstablecimiento: {
        type: String,
        required: true,
        enum: ["Hospital Regional Antofagasta Dr. Leonardo Guzmán"],
      },
      deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
  )
);

module.exports = Deudas;
