// ================= SALA: versión publicada en Claude =================
// Usa la capacidad `room` del artefacto (solo personas con sesión iniciada e invitadas al juego).
const SALA={
 tipo:'claude',
 lista:true, // el lobby muestra las partidas abiertas de quienes están en la sala
 async lobby(){try{const c=window.claude;if(!c||typeof c.use!=='function')return null;return await c.use('room')}catch(e){return null}},
 sinSala:'La sala no está disponible aquí. Abre el juego desde su enlace en Claude, con sesión iniciada y con acceso de colaborador.',
 nota:'Tu amigo abre este mismo enlace del juego. Para mandar órdenes necesita permiso de colaborador (o más) en el artefacto. Si alguien se desconecta, la partida espera a que vuelva.'
};

