# Usa una imagen base con Node.js 18 o superior
FROM node:18-alpine

# Define el puerto de escucha
ENV PORT 8080
EXPOSE 8080

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de la aplicación
COPY package*.json ./
COPY server.js .

# Instala el paquete de Shopify Dev MCP y otras dependencias
RUN npm install

# Comando para iniciar la aplicación
CMD ["npm", "start"]
