const sendEmail = async ({ to, subject, html }) => {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Sistema de Turnos', email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) console.error('Brevo error:', await res.text());
};

const sendWelcome = (email, nombre, negocioNombre, slug) =>
  sendEmail({
    to: email,
    subject: `¡Bienvenido a Sistema de Turnos! 🎉`,
    html: `
      <h2>Hola ${nombre} 👋</h2>
      <p>Tu negocio <strong>${negocioNombre}</strong> ya está registrado en Sistema de Turnos.</p>
      <p>Tu página de reservas es:</p>
      <p><a href="${process.env.FRONTEND_URL}/${slug}">${process.env.FRONTEND_URL}/${slug}</a></p>
      <p>Ingresa a tu panel para agregar servicios, categorías y colaboradores.</p>
    `,
  });

const sendConfirmacionTurno = (email, clienteNombre, negocioNombre, servicio, fecha, horaInicio) =>
  sendEmail({
    to: email,
    subject: `Turno confirmado en ${negocioNombre} ✅`,
    html: `
      <h2>¡Tu turno está reservado!</h2>
      <p>Hola <strong>${clienteNombre}</strong>,</p>
      <p>Tu cita ha sido agendada correctamente:</p>
      <ul>
        <li><strong>Negocio:</strong> ${negocioNombre}</li>
        <li><strong>Servicio:</strong> ${servicio}</li>
        <li><strong>Fecha:</strong> ${fecha}</li>
        <li><strong>Hora:</strong> ${horaInicio}</li>
      </ul>
      <p>Si necesitas cancelar, contáctanos directamente.</p>
    `,
  });

module.exports = { sendWelcome, sendConfirmacionTurno };
