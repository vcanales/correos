#!/usr/bin/env node

const chalk = require("chalk");
const { exec } = require("child_process");
const ansiEscapes = require("ansi-escapes");
const [, , trackingCode] = process.argv;

function out(message) {
  process.stdout.write(`${ansiEscapes.eraseLines(1)}${message}`);
}

if (!trackingCode) {
  out(chalk.red("Error: Please provide a tracking code"));
}

const requestArgs = `'https://www.correos.cl/web/guest/seguimiento-en-linea?p_p_id=cl_cch_seguimiento_portlet_seguimientoenlineaportlet_INSTANCE_rsbcMueFRL4k&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=cl_cch_seguimiento_portlet_seguimientoresurcecommand&p_p_cacheability=cacheLevelPage&_cl_cch_seguimiento_portlet_seguimientoenlineaportlet_INSTANCE_rsbcMueFRL4k_cmd=cmd_resource_get_seguimientos' -H 'authority: www.correos.cl' -H 'accept: */*' -H 'x-requested-with: XMLHttpRequest' -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' -H 'origin: https://www.correos.cl' -H 'sec-fetch-site: same-origin' -H 'sec-fetch-mode: cors' -H 'sec-fetch-dest: empty' -H 'referer: https://www.correos.cl/web/guest/seguimiento-en-linea?codigos=${trackingCode}' -H 'accept-language: en-US,en;q=0.9' --data-raw '_cl_cch_seguimiento_portlet_seguimientoenlineaportlet_INSTANCE_rsbcMueFRL4k_param_nro_seguimiento=${trackingCode}' --compressed --silent`;

const chars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"];

let x = 0;

const loader = setInterval(() => {
  process.stdout.write(chalk.cyan(`\r${chars[x++]}`));
  x %= chars.length;
}, 250);

out(chalk.green(`  Obteniendo informaction para el código '${trackingCode}'`));

exec(`curl ${requestArgs}`, (err, stdout, stderr) => {
  clearInterval(loader);
  if (err) {
		out(chalk.red(`Ha ocurrido un error en la peticion de informacion para el codigo '${trackingCode}'`));
		process.exit(1);
	}
  
  try {
  	const response = JSON.parse(stdout);
  	const { seguimiento, ultimoEstado, error } = response;
	} catch (jsonError) {
		out(chalk.red(`El servicio de tracking de correos.cl no esta disponible, o ha ocurrido un error en su sistema.`));
		process.exit(1);
	}
  if (error) {
    out(chalk.red(`No hay informacion para el código '${trackingCode}'`));
    process.exit(1);
  }

  const tracking = JSON.parse(seguimiento);
  const { NombreEntrega: name, RutEntrega: rut } = tracking;

  const { TextoTT, fecha } = JSON.parse(ultimoEstado);
  const lastStatusDate = fecha.split(" / ").join("-");

  const receptionInfo = name
    ? chalk.white(
        `\nRecibido por ${chalk.yellow(name)}${
          rut ? chalk.grey(` (RUT: ${rut}) `) : ""
        }`
      )
    : "";

  out(
    `\nÚltimo Estado\n-------------\n${chalk.red(
      `${lastStatusDate}`
    )} — ${chalk.yellowBright(TextoTT)}${receptionInfo}\n\n`
  );
  process.exit(0);
});
