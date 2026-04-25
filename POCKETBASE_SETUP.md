# PocketBase Setup for RaveMap

This project is deployed as a single container running PocketBase with the built frontend static files served automatically from `pb_public`.

## Quick Setup via Schema Import (Recommended)

The easiest way to create the `events` collection is to import the pre-made schema file.

1. Start the app and open the PocketBase Admin UI:
   ```sh
   docker compose up --build
   ```
2. Go to `http://localhost:8090/_/`
3. Complete the initial admin setup (only on first run)
4. In the **Admin UI**, click the **gear icon** (Settings) in the sidebar → **Import Collections**
5. Copy the contents of `pb_schema.json` from this repository and paste it into the import box
6. Click **Import**. The `events` collection will be created automatically.

## Collection Schema

The `events` collection uses these fields:

| Field       | Type   | Required | Notes                                      |
|-------------|--------|----------|--------------------------------------------|
| `name`        | Text   | Yes      | Event name shown in the sidebar list       |
| `date`        | Date   | No       | Event date (ISO), e.g. `2024-06-15T00:00:00.000Z` |
| `description` | Text   | No       | Description shown in list and map popup    |
| `latitude`    | Number | Yes      | Map marker latitude                        |
| `longitude`   | Number | Yes      | Map marker longitude                       |

## API Rules

The schema import already sets these rules. If you create the collection manually, use these values:

- **List rule**: *(empty)* — allows public read access
- **View rule**: *(empty)* — allows public read access
- **Create rule**: `@request.auth.id != ""` — requires login
- **Update rule**: `@request.auth.id != ""` — requires login
- **Delete rule**: `@request.auth.id != ""` — requires login

> **Important:** In PocketBase filter syntax, an **empty string** (`""`) means "allow everyone". The literal string `"true"` is **not** valid filter syntax and will throw an error.

## Data Directory

PocketBase stores its data in `/pb/pb_data` inside the container. The `docker-compose.yml` already mounts a named volume there, so your data persists across restarts.

## Frontend Integration

The `Dockerfile` copies the Vite build output (`dist/`) into `/pb/pb_public`. PocketBase automatically serves those static files at the root path `/`. API calls from the frontend use relative URLs (`/api/collections/events/records`), so no environment variables or CORS configuration are required in production.

## Example API Request

`GET /api/collections/events/records?page=1&perPage=1`

Response:
```json
{
  "page": 1,
  "perPage": 1,
  "totalItems": 42,
  "totalPages": 42,
  "items": [
    {
      "id": "RECORD_ID",
      "collectionId": "...",
      "collectionName": "events",
      "created": "2024-01-01 00:00:00.000Z",
      "updated": "2024-01-01 00:00:00.000Z",
      "name": "Berlin Rave",
      "date": "2024-06-15 00:00:00.000Z",
      "description": "Underground techno party",
      "latitude": 52.5200,
      "longitude": 13.4050
    }
  ]
}
```
