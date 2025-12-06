FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY . /usr/share/nginx/html

EXPOSE 80

ENV API_URL=backend

CMD ["nginx", "-g", "daemon off;"]