# AdPublisher - Publicación de Anuncios de Vehículos

Esta es una aplicación web desarrollada con React.js y Material-UI que permite a los usuarios publicar anuncios de vehículos. Los usuarios pueden ingresar un precio y una descripción, y al hacer clic en "Publicar", se mostrará un indicador de carga mientras se realiza la publicación. Una vez completada, se muestra la información del anuncio publicado junto con una captura de pantalla.

## Características
- Ingresar precio y descripción de un anuncio.
- Publicar anuncios utilizando una API.
- Mostrar captura de pantalla del anuncio publicado.

## Requisitos
- Node.js
- Docker (opcional)

## Variables de Entorno
Antes de ejecutar la aplicación, debes configurar las variables de entorno. Usa el archivo `.env.example` como plantilla para crear tu archivo `.env`:

```
cp .env.example .env
```

Asegúrate de llenar las siguientes variables en el archivo `.env` en backend:

```
EMAIL= [Email_Registrado_www.seminuevos.com]
PASSWORD=[Password_Registrado_www.seminuevos.com]
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

Asegúrate de llenar las siguientes variables en el archivo `.env` en frontend:

```
REACT_APP_API_BASE_URL=http://localhost:3001
```

## Instrucciones para Levantar el Proyecto

### Opción 1: Ejecutar con npm
#### Manual Backend (API)
1. Navega a la carpeta del backend.
2. Instala las dependencias del backend:
   ```bash
   npm install
   ```
3. Inicia el servidor backend:
   ```bash
   node index.js
   ```
   El backend estará disponible en `http://localhost:3001`.

#### Manual Frontend (React)
1. Navega a la carpeta del frontend.
2. Instala las dependencias del frontend:
   ```bash
   npm install
   ```
3. Inicia el servidor backend:
   ```bash
   npm run start
   ```
   La aplicación estará disponible en `http://localhost:3000`.

### Opcion 1: Ejecutar con Docker
1. Asegúrate de tener Docker instalado.
2. Levanta contenedores backed y frontend con Docker:
   ```bash
   docker compose up --force-recreate -d
   ```

La aplicación frontend estará disponible en `http://localhost:3000`.
El backend estará disponible en `http://localhost:3001`.

1. Navega a la carpeta del frontend.
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Inicia la aplicación:
   ```bash
   npm start
   ```

La aplicación estará disponible en `http://localhost:3000`.

## Pruebas de la API
Para probar la API de publicación de anuncios, puedes usar los siguientes comandos `curl`:

### Publicar un Anuncio
```bash
curl --location 'http://localhost:3001/api/publish-ad' \
--header 'Content-Type: application/json' \
--data '{
    "price": 350000,
    "description": "Vendo mi impecable Acura ILX 2018, un sedán de lujo..."
}'
```

La respuesta exitosa debería ser algo como:

```json
{
    "status": "published",
    "publicationId": "4626878",
    "publicationUrl": "https://www.seminuevos.com/myvehicle/4626878",
    "message": "Ad published successfully",
    "screenshot": "iVBORw0KGgoAAAANSUh..."
}
```

## Notas Adicionales
- Asegúrate de tener el backend ejecutándose en `http://localhost:3001` para que la API funcione correctamente.
- Si experimentas problemas con CORS, asegúrate de configurar correctamente el backend para permitir solicitudes desde `http://localhost:3000`.