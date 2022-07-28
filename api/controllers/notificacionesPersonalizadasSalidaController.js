const NotificacionesPersonalizadas = require("../models/NotificacionesPersonalizadas");
const { getIdsSuscriptor } = require("../utils/pacientesService");
const { sendPushNotification } = require("../utils/oneSignalService");

exports.create = async (req, res) => {
  const notificacionesInsertadas = [];
  try {
    const notificaciones = req.body;
    if (notificaciones.length < 1)
      return res
        .status(400)
        .send({ error: "No se recibieron notificaciones (arreglo vacío)." });
    for (let datosNotificacion of notificaciones) {
      try {
        const notificacion = new NotificacionesPersonalizadas(
          datosNotificacion
        );
        if (
          !(await isNotificacionValid(notificacion, notificacionesInsertadas))
        )
          continue;
        // obtener notificacion con mismo identificador para evitar repetidas
        const notificacionesMismoIdentificador =
          await NotificacionesPersonalizadas.find({
            correlativo: notificacion.correlativo,
            codigoEstablecimiento: notificacion.codigoEstablecimiento,
          }).exec();
        // si existen multiples notificaciones con el mismo identificador, indicar el error
        if (notificacionesMismoIdentificador.length > 1) {
          notificacionesInsertadas.push({
            afectado: notificacion.correlativo,
            realizado: false,
            error: `Existen ${notificacionesMismoIdentificador.length} notificaciones con el correlativo ${notificacion.correlativo} para el establecimiento ${notificacion.codigoEstablecimiento}.`,
          });
          continue;
        }
        // si ya existe la notificacion, indicar el error y decir que se inserto
        if (notificacionesMismoIdentificador.length === 1) {
          notificacionesInsertadas.push({
            afectado: notificacion.correlativo,
            realizado: true,
            error: "La notificacion ya existe.",
          });
          continue;
        }
        // si la notificacion no existe, se envia y se inserta
        const idsSuscriptor = await getIdsSuscriptor(notificacion.rutPaciente);

        if (!Array.isArray(idsSuscriptor)) {
          notificacionesInsertadas.push({
            afectado: notificacion.correlativo,
            realizado: false,
            error: `${idsSuscriptor.name} - ${idsSuscriptor.message}`,
          });
          continue;
        }
        const oneSignalResponse = await sendPushNotification(
          notificacion.mensajeEs,
          notificacion.tituloEs,
          idsSuscriptor
        );
        if (!oneSignalResponse.id) {
          notificacionesInsertadas.push({
            afectado: notificacion.correlativo,
            realizado: false,
            error: `${idOneSignal.name} - ${idOneSignal.message}`,
          });
          continue;
        }
        if (oneSignalResponse.recipients < 0) {
          notificacionesInsertadas.push({
            afectado: notificacion.correlativo,
            realizado: false,
            error: `Notificación no recibida.`,
          });
          continue;
        }
        notificacion.idOneSignal = oneSignalResponse.id;
        await NotificacionesPersonalizadas.create(notificacion);
        notificacionesInsertadas.push({
          afectado: notificacion.correlativo,
          realizado: true,
          error: "",
        });
      } catch (error) {
        notificacionesInsertadas.push({
          afectado: datosNotificacion.correlativo,
          realizado: false,
          error: `${error.name} - ${error.message}`,
        });
      }
    }
    res.status(201).send({
      respuesta: notificacionesInsertadas,
    });
  } catch (error) {
    res.status(500).send({
      error: `Notificaciones  create: ${error.name} - ${error.message}`,
      respuesta: notificacionesInsertadas,
    });
  }
};

const isNotificacionValid = async (notificacion, notificacionesInsertadas) => {
  const errorValidacion = notificacion.validateSync();
  if (errorValidacion) {
    let errors = "";
    for (let prop in errorValidacion.errors) {
      const separador =
        prop === Object.keys(errorValidacion.errors).pop() ? "" : " ";
      errors += `${errorValidacion.errors[prop].message}${separador}`;
    }
    notificacionesInsertadas.push({
      afectado: notificacion.correlativo,
      realizado: false,
      error: errors,
    });
    return false;
  }
  return true;
};
