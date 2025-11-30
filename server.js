import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Shopify Dev MCP Server (EasyPanel) is running. Connect to /sse endpoint.');
});

app.get('/sse', (req, res) => {
    // Configuración de cabeceras para Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.status(200);

    // Configura las variables de entorno para el proceso hijo
    const env = {
        ...process.env,
        SHOPIFY_STORE_DOMAIN: process.env.MY_SHOPIFY_DOMAIN,
        SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN 
    };

    console.log('Starting Shopify Dev MCP process...');

    // Ejecuta el comando de Shopify Dev MCP
    const mcpProcess = spawn('npx', ['-y', '@shopify/dev-mcp@latest'], { env });

    // Redirige la salida (el stream de datos) del proceso MCP al cliente (N8N)
    mcpProcess.stdout.pipe(res);
    mcpProcess.stderr.pipe(process.stderr);

    // Manejo de desconexión del cliente
    req.on('close', () => {
        console.log('Client disconnected. Killing MCP process.');
        mcpProcess.kill();
    });

    // Manejo de errores del proceso MCP
    mcpProcess.on('exit', (code) => {
        console.log(`MCP process exited with code ${code}`);
        if (!res.closed) {
            res.end();
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
