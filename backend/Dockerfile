# Escolhe a imagem base oficial do Node
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia package.json para instalar dependências
COPY package*.json ./

# Instala as dependências
RUN npm install --production

# Copia o código da aplicação e o arquivo de inicialização do banco
COPY server.js ./
COPY init-db.sql ./

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"]