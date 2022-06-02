const supertest = require("supertest");
const app = require("../api/app");
const mongoose = require("mongoose");
const NotificacionesPersonalizadas = require("../api/models/NotificacionesPersonalizadas");
const notificacionesPersonalizadasSeed = require("../tests/testSeeds/notificacionesPersonalizadasSeed.json");
const notificacionesPersonalizadasAInsertarSeed = require("../tests/testSeeds/notificacionesPersonalizadasAInsertarSeed.json");

const request = supertest(app);

const token = process.env.HRADB_A_MONGODB_SECRET;

const notificacionPersonalizadaGuardar = {
  correlativo: 9,
  tituloEs: "titulo guardar",
  mensajeEs: "mensaje guardar",
  tituloEn: "title save",
  mensajeEn: "message save",
  rutPaciente: "11111111-1",
  codigoEstablecimiento: "HRA",
  nombreEstablecimiento: "Hospital Regional Antofagasta Dr. Leonardo Guzmán",
  fechaCreacion: "2022-06-01",
};

beforeEach(async () => {
  await mongoose.disconnect();
  await mongoose.connect(
    `${process.env.MONGO_URI}/notificaciones_salida_test`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  await NotificacionesPersonalizadas.create(notificacionesPersonalizadasSeed, {
    validateBeforeSave: false,
  });
});

afterEach(async () => {
  await NotificacionesPersonalizadas.deleteMany();
  await mongoose.disconnect();
});

describe("Endpoints notificaciones salida", () => {
  describe("POST /inter-mongo-notificaciones/salida", () => {
    it("Should not save notificacion without token", async () => {
      const response = await request
        .post("/inter-mongo-notificaciones/salida")
        .send(notificacionPersonalizadaGuardar);

      expect(response.status).toBe(401);

      expect(response.body.error).toBe("Acceso no autorizado.");

      const notificacionPersonalizadaDespues =
        await NotificacionesPersonalizadas.findOne({
          correlativo: notificacionPersonalizadaGuardar.correlativo,
          codigoEstablecimiento:
            notificacionPersonalizadaGuardar.codigoEstablecimiento,
        });

      expect(notificacionPersonalizadaDespues).toBeFalsy();
    });
    it("Should not save notificacion with invalid token", async () => {
      const response = await request
        .post("/inter-mongo-notificaciones/salida")
        .set("Authorization", "no-token")
        .send(notificacionPersonalizadaGuardar);

      expect(response.status).toBe(401);

      expect(response.body.error).toBe("Acceso no autorizado.");

      const notificacionPersonalizadaDespues =
        await NotificacionesPersonalizadas.findOne({
          correlativo: notificacionPersonalizadaGuardar.correlativo,
          codigoEstablecimiento:
            notificacionPersonalizadaGuardar.codigoEstablecimiento,
        });

      expect(notificacionPersonalizadaDespues).toBeFalsy();
    });
    // it("Should save notificacion personalizada", async () => {
    //   const response = await request
    //     .post("/inter-mongo-notificaciones/salida")
    //     .set("Authorization", token)
    //     .send([notificacionPersonalizadaGuardar]);

    //   expect(response.status).toBe(201);

    //   const notificacionPersonalizadaDespues =
    //     await NotificacionesPersonalizadas.findOne({
    //       correlativo: notificacionPersonalizadaGuardar.correlativo,
    //       codigoEstablecimiento:
    //         notificacionPersonalizadaGuardar.codigoEstablecimiento,
    //     });

    //   expect(notificacionPersonalizadaDespues).toBeTruthy();
    //   expect(notificacionPersonalizadaDespues.correlativo).toBe(
    //     notificacionPersonalizadaGuardar.correlativo
    //   );
    //   expect(notificacionPersonalizadaDespues.rutPaciente).toBe(
    //     notificacionPersonalizadaGuardar.rutPaciente
    //   );
    //   expect(Date.parse(notificacionPersonalizadaDespues.fecha)).toBe(
    //     Date.parse(notificacionPersonalizadaGuardar.fecha)
    //   );
    //   expect(notificacionPersonalizadaDespues.identificador).toBe(
    //     notificacionPersonalizadaGuardar.identificador
    //   );
    //   expect(notificacionPersonalizadaDespues.valor).toBe(
    //     notificacionPersonalizadaGuardar.valor
    //   );
    //   expect(notificacionPersonalizadaDespues.notificacion).toBe(
    //     notificacionPersonalizadaGuardar.notificacion
    //   );
    //   expect(notificacionPersonalizadaDespues.tipo).toBe(
    //     notificacionPersonalizadaGuardar.tipo
    //   );
    //   expect(notificacionPersonalizadaDespues.codigoEstablecimiento).toBe(
    //     notificacionPersonalizadaGuardar.codigoEstablecimiento
    //   );
    //   expect(notificacionPersonalizadaDespues.nombreEstablecimiento).toBe(
    //     notificacionPersonalizadaGuardar.nombreEstablecimiento
    //   );
    //   expect(notificacionPersonalizadaDespues.rutDeudor).toBe(
    //     notificacionPersonalizadaGuardar.rutDeudor
    //   );
    //   expect(notificacionPersonalizadaDespues.nombreDeudor).toBe(
    //     notificacionPersonalizadaGuardar.nombreDeudor
    //   );
    // });
    // it("Should save multiple notificaciones and return errors", async () => {
    //   const response = await request
    //     .post("/inter-mongo-notificaciones/salida")
    //     .set("Authorization", token)
    //     .send(notificacionesPersonalizadasAInsertarSeed);

    //   expect(response.status).toBe(201);

    //   const notificacionesPersonalizadasEnBD =
    //     await NotificacionesPersonalizadas.find().exec();

    //   expect(notificacionesPersonalizadasEnBD.length).toBe(10);

    //   const { respuesta } = response.body;

    //   expect(respuesta.length).toBe(7);
    //   expect(respuesta).toEqual([
    //     {
    //       afectado: 1,
    //       realizado: true,
    //       error: "La notificacion ya existe.",
    //     },
    //     {
    //       afectado: 13,
    //       realizado: true,
    //       error: "",
    //     },
    //     {
    //       afectado: 2,
    //       realizado: true,
    //       error: "La notificacion ya existe.",
    //     },
    //     {
    //       afectado: 14,
    //       realizado: true,
    //       error: "",
    //     },
    //     {
    //       afectado: 16,
    //       realizado: false,
    //       error:
    //         "MongoServerError - E11000 duplicate key error collection: notificaciones_salida_test.notificaciones index: _id_ dup key: { _id: ObjectId('303030303030303030303031') }",
    //     },
    //     {
    //       afectado: 15,
    //       realizado: true,
    //       error: "",
    //     },
    //     {
    //       afectado: 4,
    //       realizado: true,
    //       error: "La notificacion ya existe.",
    //     },
    //   ]);
    // });
  });
});
