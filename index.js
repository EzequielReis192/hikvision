const http = require('http');
const fs = require('fs');
const path = require('path');
const getRawBody = require('raw-body');

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/event') {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.startsWith('multipart/form-data')) {
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end('Erro: Content-Type não é multipart/form-data');
      return;
    }

    try {
      const rawBody = await getRawBody(req);
      const bodyStr = rawBody.toString();

      const boundaryMatch = contentType.match(/boundary=(.*)/);
      if (!boundaryMatch) throw new Error('Boundary não encontrado');
      const boundary = '--' + boundaryMatch[1];

      const parts = bodyStr.split(boundary).filter(part => part.trim() && part.trim() !== '--');

      let eventLog = null;
      let imageBuffer = null;
      let imageFilename = null;

      for (const part of parts) {
        if (part.includes('name="event_log"')) {
          const jsonMatch = part.match(/\r\n\r\n([\s\S]*)\r\n$/);
          if (jsonMatch) eventLog = JSON.parse(jsonMatch[1]);
        }
        if (part.includes('name="Picture"')) {
          const filenameMatch = part.match(/filename="(.+?)"/);
          imageFilename = filenameMatch ? filenameMatch[1] : 'imagem.jpg';

          const dataStart = part.indexOf('\r\n\r\n') + 4;
          const dataEnd = part.lastIndexOf('\r\n');
          const rawData = part.substring(dataStart, dataEnd);

          imageBuffer = Buffer.from(rawData, 'latin1');
        }
      }

      if (eventLog) console.log('JSON event_log recebido:', eventLog);
      if (imageBuffer) {
        const savePath = path.join(UPLOAD_DIR, `${Date.now()}_${imageFilename}`);
        fs.writeFileSync(savePath, imageBuffer);
        console.log('Imagem salva em:', savePath);
      }

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Recebido com sucesso');
    } catch (err) {
      console.error('Erro ao processar requisição:', err);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Erro interno do servidor');
    }
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Rota não encontrada');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
