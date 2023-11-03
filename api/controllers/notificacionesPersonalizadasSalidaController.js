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
        const idsOneSignal = await getIdsSuscriptor(notificacion.rutPaciente);

        if (!Array.isArray(idsOneSignal)) {
          notificacionesInsertadas.push({
            afectado: notificacion.correlativo,
            realizado: false,
            error: `${idsOneSignal.name} - ${idsOneSignal.message}`,
          });
          continue;
        }
        const { idsSuscriptorOneSignalResponse, idsExternosOneSignalResponse } =
          await sendPushNotification(
            notificacion.mensajeEs,
            notificacion.tituloEs,
            idsOneSignal
          );

        if (
          !idsSuscriptorOneSignalResponse?.id &&
          !idsExternosOneSignalResponse?.id
        ) {
          notificacionesInsertadas.push({
            afectado: notificacion.correlativo,
            realizado: false,
            error: `Envío con id suscriptor: ${JSON.stringify(
              idsSuscriptorOneSignalResponse
            )} | Envío con external id: ${JSON.stringify(
              idsExternosOneSignalResponse
            )}`,
          });
          continue;
        }
        notificacion.idOneSignal = `${idsSuscriptorOneSignalResponse?.id};${idsExternosOneSignalResponse?.id};`;
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
