#Escolhe a imagem base oficial do Node
FROM node:18-alpine

#Define o diretório de trabalho dentro do container
WORKDIR /app

#Copia o restante do código da aplicação
COPY server.js package.json data.json ./

RUN npm install

#Expõe a porta da aplicação (geralmente 3000)
EXPOSE 3000

#Comando para iniciar o servidor
CMD ["npm", "start"]