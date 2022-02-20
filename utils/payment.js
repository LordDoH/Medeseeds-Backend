require('dotenv').config();
const mercadopago = require('mercadopago');

async function payMercadoPago(data) {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
  try {
    const response = await mercadopago.preferences.create(data);
    return response;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  payMercadoPago,
};
