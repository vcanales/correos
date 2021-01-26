const { exec } = require("child_process");
const { parse } = require('node-html-parser')


const requestArgs = `'https://chilexpress.cl/contingencia/Resultado' \
-X 'POST' \
-H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-H 'Origin: https://chilexpress.cl' \
-H 'Content-Length: 18' \
-H 'Accept-Language: en-us' \
-H 'Host: chilexpress.cl' \
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15' \
-H 'Referer: https://chilexpress.cl/contingencia/' \
-H 'Accept-Encoding: gzip, deflate, br' \
-H 'Connection: keep-alive' \
--data 'FindOt=95501422822'
`

exec(`curl ${requestArgs}`, (err, stdout, stderr) => {
  if (err) {
    return console.log(stderr)
  }

  const pageContent = parse(stdout)

  const resultsContainer = pageContent.querySelector('div.resultado_busqueda')
  const persona = resultsContainer.querySelector('div.entrega_recibido.datos_informacion')

  console.log(persona.text)
});