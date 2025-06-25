const http = require('http');
const getRawBody = require('raw-body');

const PORT = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    try {
      const rawBody = await getRawBody(req);
      const bodyStr = rawBody.toString();

      console.log('\n📥 NOVA REQUISIÇÃO RECEBIDA 📥');
      console.log('📌 HEADERS:', req.headers);
      console.log('🧾 BODY:', bodyStr);

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK - Recebido com sucesso');
    } catch (err) {
      console.error('❌ Erro ao processar body:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Erro interno no servidor');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Rota não encontrada');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
