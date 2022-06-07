const { httpRequest } = require("./httpRequests");

const secret = process.env.HRADB_A_MONGODB_SECRET;
const urlPacientes = process.env.API_URL;

exports.getIdsSuscriptor = async (rutPaciente) => {
  const config = {
    headers: {
      Authorization: `${secret}`,
    },
  };

  const response = await httpRequest(
    "GET",
    `${urlPacientes}/inter-mongo-pacientes/pacientes/ids-suscriptor/${rutPaciente}`,
    "",
    config,
    10
  );

  if (!response?.data) return response;

  return response.data;
};
