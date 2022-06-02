const NotificacionesPersonalizadas = require("../models/NotificacionesPersonalizadas");
const oneSignalControler = require("../controllers/oneSignalController")

exports.create = async (req, res) => {
  const notificacionesPersonalizadasInsertadas = [];
  try {
    const notificaciones = req.body;
    for (let notificacion of notificaciones) {
      try {
        const notificacionesPersonalizadasMismoIdentificador = await NotificacionesPersonalizadas.find({
          correlativo: notificacion.correlativo,
          codigoEstablecimiento: notificacion.codigoEstablecimiento,
        }).exec();
        // si existen multiples notificaciones con el mismo identificador, indicar el error
        if (notificacionesPersonalizadasMismoIdentificador.length > 1) {
          notificacionesPersonalizadasInsertadas.push({
            afectado: notificacion.correlativo,
            realizado: false,
            error: `Existen ${notificacionesPersonalizadasMismoIdentificador.length} notificaciones con el correlativo ${notificacion.correlativo} para el establecimiento ${notificacion.codigoEstablecimiento}.`,
          });
          continue;
        }
        // si ya existe la notificacion, indicar el error y decir que se inserto
        if (notificacionesPersonalizadasMismoIdentificador.length === 1) {
          notificacionesPersonalizadasInsertadas.push({
            afectado: notificacion.correlativo,
            realizado: true,
            error: "La notificacion ya existe.",
          });
          continue;
        }
        // si la notificacion no existe, se envia y se inserta

        enviarNotificacion()

        await NotificacionesPersonalizadas.create(notificacion);
        notificacionesPersonalizadasInsertadas.push({
          afectado: notificacion.correlativo,
          realizado: true,
          error: "",
        });
      } catch (error) {
        notificacionesPersonalizadasInsertadas.push({
          afectado: notificacion.correlativo,
          realizado: false,
          error: `${error.name} - ${error.message}`,
        });
      }
    }
    res.status(201).send({
      respuesta: notificacionesPersonalizadasInsertadas,
    });
  } catch (error) {
    res.status(500).send({
      error: `Notificaciones Personalizadas create: ${error.name} - ${error.message}`,
      respuesta: notificacionesPersonalizadasInsertadas,
    });
  }
};
