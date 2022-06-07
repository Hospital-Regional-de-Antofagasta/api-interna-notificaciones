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
    it("Debería retornar error si no se recibe token.", async () => {
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
    it("Debería retornar error si el token es invalido.", async () => {
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
    it("Debería retornar error si no se envían notificaciones (body vacío).", async () => {
      const response = await request
        .post("/inter-mongo-notificaciones/salida")
        .set("Authorization", token)
        .send();

      expect(response.status).toBe(500);
    });
    it("Debería retornar error si no se envían notificaciones (arreglo vacío).", async () => {
      const response = await request
        .post("/inter-mongo-notificaciones/salida")
        .set("Authorization", token)
        .send([]);

      expect(response.status).toBe(400);

      expect(response.body.error).toBe(
        "No se recibieron notificaciones (arreglo vacío)."
      );
    });
    it("Debería retornar error si no se envían notificaciones (objeto vacío).", async () => {
      const response = await request
        .post("/inter-mongo-notificaciones/salida")
        .set("Authorization", token)
        .send({});

      expect(response.status).toBe(500);
    });
    it("Debería retornar error si alguna notificación no es válida.", async () => {
      const response = await request
        .post("/inter-mongo-notificaciones/salida")
        .set("Authorization", token)
        .send(notificacionesPersonalizadasAInsertarSeed);

      expect(response.status).toBe(201);

      const notificacionesPersonalizadasEnBD =
        await NotificacionesPersonalizadas.find().exec();

      expect(notificacionesPersonalizadasEnBD.length).toBe(9);

      const { respuesta } = response.body;

      expect(respuesta.length).toBe(12);

      expect(respuesta).toEqual([
        {
          realizado: false,
          error:
            "El nombreEstablecimiento es obligatorio. El codigoEstablecimiento es obligatorio. La fechaCreacion es obligatorio. El rutPaciente es obligatorio. El mensajeEs es obligatorio. El tituloEs es obligatorio. El correlativo es obligatorio.",
        },
        {
          realizado: false,
          error: "El correlativo es obligatorio.",
        },
        {
          afectado: 12,
          realizado: false,
          error: "El tituloEs es obligatorio.",
        },
        {
          afectado: 13,
          realizado: false,
          error: "El mensajeEs es obligatorio.",
        },
        {
          afectado: 14,
          realizado: false,
          error: "El rutPaciente es obligatorio.",
        },
        {
          afectado: 15,
          realizado: false,
          error: "La fechaCreacion es obligatorio.",
        },
        {
          afectado: 16,
          realizado: false,
          error: "El codigoEstablecimiento es obligatorio.",
        },
        {
          afectado: 17,
          realizado: false,
          error: "El codigoEstablecimiento 'HR' no es válido.",
        },
        {
          afectado: 18,
          realizado: false,
          error: "El nombreEstablecimiento es obligatorio.",
        },
        {
          afectado: 19,
          realizado: false,
          error:
            "El nombreEstablecimiento 'ospital Regional Antofagasta Dr. Leonardo Guzmán' no es válido.",
        },
        {
          afectado: 2,
          realizado: false,
          error:
            "Existen 2 notificaciones con el correlativo 2 para el establecimiento HRA.",
        },
        {
          afectado: 1,
          realizado: true,
          error: "La notificacion ya existe.",
        },
      ]);
    });
  });
});
