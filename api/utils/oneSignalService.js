const { httpRequest } = require("./httpRequests");

const oneSignalAppId = process.env.ONE_SIGNAL_APP_ID;
const oneSignalToken = process.env.ONE_SIGNAL_TOKEN;
const largeIcon = process.env.NOTIFICATION_LARGE_ICON;
const urlOneSignal = process.env.ONE_SIGNAL_URL;

exports.sendPushNotification = async (mensaje, titulo, idsSuscriptor) => {
  console.log("sendPushNotification")
  console.log("ONE_SIGNAL_APP_ID", oneSignalAppId)
  console.log("ONE_SIGNAL_TOKEN", oneSignalToken)
  console.log("NOTIFICATION_LARGE_ICON", largeIcon)
  console.log("ONE_SIGNAL_URL", urlOneSignal)
  console.log("mensaje", mensaje)
  console.log("titulo", titulo)
  console.log("idsSuscriptor", idsSuscriptor)
  const body = {
    app_id: oneSignalAppId,
    contents: { en: mensaje },
    headings: { en: titulo },
    include_player_ids: idsSuscriptor,
    large_icon: largeIcon,
  };
  const config = {
    headers: {
      Authorization: `Bearer token="${oneSignalToken}"`,
      "Content-Type": "application/json",
    },
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
