const { httpRequest } = require("./httpRequests");

const oneSignalAppId = process.env.ONE_SIGNAL_APP_ID;
const oneSignalToken = process.env.ONE_SIGNAL_TOKEN;
const largeIcon = process.env.NOTIFICATION_LARGE_ICON;
const urlOneSignal = process.env.ONE_SIGNAL_URL;

const config = {
  headers: {
    Authorization: `Bearer token="${oneSignalToken}"`,
    "Content-Type": "application/json",
  },
};

const sendIdsSuscriptorPushNotification = async (
  mensaje,
  titulo,
  idsSuscriptor
) => {
  if (idsSuscriptor.length <= 0) return;
  const body = {
    app_id: oneSignalAppId,
    contents: { en: mensaje },
    headings: { en: titulo },
    include_player_ids: idsSuscriptor,
    large_icon: largeIcon,
  };

  const response = await httpRequest(
    "POST",
    `${urlOneSignal}/api/v1/notifications`,
    body,
    config,
    10
  );

  if (!response?.data) return response;

  return response.data;
};

const sendIdsExternosPushNotification = async (
  mensaje,
  titulo,
  idsExternos
) => {
  if (idsExternos.length <= 0) return;
  const body = {
    app_id: oneSignalAppId,
    contents: { en: mensaje },
    headings: { en: titulo },
    include_aliases: {
      external_id: idsExternos,
    },
    target_channel: "push",
    large_icon: largeIcon,
  };

  const response = await httpRequest(
    "POST",
    `${urlOneSignal}/api/v1/notifications`,
    body,
    config,
    10
  );

  if (!response?.data) return response;

  return response.data;
};

exports.sendPushNotification = async (mensaje, titulo, idsOneSignal) => ({
  idsSuscriptorOneSignalResponse: await sendIdsSuscriptorPushNotification(
    mensaje,
    titulo,
    idsOneSignal
      .filter((id) => !id.esExternalId)
      .map((idSuscriptor) => idSuscriptor.idSuscriptor)
  ),
  idsExternosOneSignalResponse: await sendIdsExternosPushNotification(
    mensaje,
    titulo,
    idsOneSignal
      .filter((id) => id.esExternalId)
      .map((idExterno) => idExterno.idSuscriptor)
  ),
});
