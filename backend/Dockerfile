# Escolhe a imagem base oficial do Node
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala as dependências (sem --production para garantir todas as deps)
RUN npm ci --only=production || npm install

# Copia os arquivos da aplicação
COPY server.js init-db.sql ./

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]