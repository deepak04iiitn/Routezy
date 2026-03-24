# Routezy

Routezy is a smart travel planning platform built with an Expo React Native mobile app and a Node.js/Express backend. It helps travelers generate optimized itineraries, discover attractions, and manage trips from planning to completion.

## Table of Contents

- [Product Overview](#product-overview)
- [Core MVP Features](#core-mvp-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Run the App](#run-the-app)
- [API Overview](#api-overview)
- [Data Model Overview](#data-model-overview)
- [Security and Reliability](#security-and-reliability)
- [Design System](#design-system)
- [Roadmap and Implementation Notes](#roadmap-and-implementation-notes)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## Product Overview

Routezy focuses on one core outcome: help users explore more places while reducing wasted travel time.

The app is designed to:
- generate smart itineraries from location, time window, and budget
- optimize route order to reduce backtracking
- support multi-day trip planning
- combine map visibility with practical travel utilities
- evolve into a community-powered travel companion

## Core MVP Features

Routezy defines these MVP pillars:

1. Smart itinerary generation
2. Multi-day itinerary scheduling
3. Route optimization
4. Map visualization
5. Restaurant recommendations
6. Nearby ATM and washroom suggestions
7. Trip progress mode
8. Traveler notes and reviews
9. Private notes
10. Shareable itineraries

### Current Implementation Snapshot

Implemented (or partially implemented) in current codebase:
- user auth: email/password + Google auth plumbing
- trip generation and attraction preview endpoints
- trip persistence, status updates, save/like flows
- explore/latest/recent trip feeds
- trending attractions from cached places
- React Native screens and navigation for home/explore/trips/map/account

Planned/future-expansion areas:
- richer in-trip progress interactions
- deeper community tips/reviews system
- full share/import itinerary flow
- complete open-source map/place pipeline migration path

## Architecture

Routezy uses a split architecture:

- `mobile/`: Expo + React Native client
- `server/`: Express API + MongoDB + Firebase Admin integrations

High-level flow:

1. User interacts with mobile app (location, dates, budget, preferences)
2. Mobile calls backend APIs (`/api/auth`, `/api/trips`)
3. Backend validates payloads and runs itinerary/preview services
4. Backend persists users/trips/caches in MongoDB
5. Backend and mobile use map/location providers and Firebase services where configured

## Tech Stack

### Mobile (`mobile/`)
- Expo SDK 54
- React Native 0.81
- Expo Router + React Navigation
- Zustand state management
- Firebase client SDK
- React Native Maps + Expo Location
- Axios for API communication

### Backend (`server/`)
- Node.js + Express
- MongoDB + Mongoose
- Firebase Admin SDK
- JWT authentication
- Security middleware (Helmet + rate limiting)
- Multer file upload handling

### Tooling (`root`)
- `concurrently` for running server and mobile together

## Project Structure

```text
Routezy/
  mobile/                  Expo React Native app
    app/                   Expo Router routes
    src/
      components/
      navigation/
      screens/
      services/
      store/
      theme/
  server/                  Node/Express API
    src/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
  docs/                    Project docs and setup guides
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (or compatible)
- MongoDB instance (local or cloud)
- Expo Go app or Android/iOS emulator
- Firebase project configured for auth

### Install Dependencies

From repository root:

```powershell
cd "C:\PERSONAL PROJECTS\Routezy"
npm install
cd mobile; npm install
cd ..\server; npm install
```

## Environment Variables

Create the following files:
- `mobile/.env`
- `server/.env`

### Mobile env (`mobile/.env`)

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000

EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=

EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```

### Server env (`server/.env`)

```env
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
FIREBASE_SERVICE_ACCOUNT_JSON=

# Optional tuning
REQUEST_BODY_LIMIT=
ADMIN_EMAILS=

GLOBAL_RATE_LIMIT_WINDOW_MS=
GLOBAL_RATE_LIMIT_MAX=
BURST_RATE_LIMIT_WINDOW_MS=
BURST_RATE_LIMIT_MAX=
AUTH_RATE_LIMIT_WINDOW_MS=
AUTH_RATE_LIMIT_MAX=
ITINERARY_RATE_LIMIT_WINDOW_MS=
ITINERARY_RATE_LIMIT_MAX=

GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_MONTHLY_FREE_CREDIT_USD=
GOOGLE_GEOCODE_COST_PER_REQUEST_USD=
GOOGLE_PLACES_NEARBY_COST_PER_REQUEST_USD=
GOOGLE_DISTANCE_MATRIX_COST_PER_ELEMENT_USD=
CREDIT_GUARD_CRON_SCHEDULE=
```

For a full Firebase + Google Auth walkthrough, see `docs/Firebase_Google_Auth_Setup.md`.

## Run the App

### Run both server and mobile (recommended)

```powershell
cd "C:\PERSONAL PROJECTS\Routezy"
npm run dev
```

### Run services individually

Backend:

```powershell
cd "C:\PERSONAL PROJECTS\Routezy\server"
npm run dev
```

Mobile:

```powershell
cd "C:\PERSONAL PROJECTS\Routezy\mobile"
npx expo start -c
```

## API Overview

Base server URL: `http://localhost:5000` (default)

Health:
- `GET /health`
- `GET /account-deletion` public Play Store account deletion page

Auth routes (`/api/auth`):
- `POST /signup`
- `POST /signin`
- `POST /google`
- `GET /me`
- `PUT /profile`
- `POST /profile/image`
- `DELETE /account`
- `POST /forgot-password/question`
- `POST /forgot-password/reset`
- `POST /logout`
- `POST /session/start`
- `POST /session/end`
- `GET /admin/check`
- `GET /admin/metrics`

Trip routes (`/api/trips`):
- `POST /generate`
- `POST /attractions-preview`
- `POST /`
- `GET /`
- `GET /explore`
- `GET /latest`
- `GET /recent`
- `GET /trending-attractions`
- `GET /saved`
- `POST /:tripId/save`
- `DELETE /:tripId/save`
- `GET /:tripId`
- `PATCH /:tripId/status`
- `PATCH /:tripId/like`
- `DELETE /:tripId`

## Data Model Overview

Primary backend entities include:
- `User`
- `Trip`
- `SavedTrip`
- `PlaceCache`
- `GeocodeCache`
- `ItineraryCache`
- `UserSession`
- `UserActivity`
- `SecurityEvent`
- `MonthlyApiUsage`

These support core flows like itinerary generation, feed/explore, caching, account/session security, and API spend monitoring.

## Security and Reliability

Current backend includes:
- JWT-based auth middleware
- role-aware admin route protection
- layered rate limiting (global, burst, auth, itinerary-specific)
- secure headers via Helmet middleware
- centralized error and not-found handlers
- request payload size controls

## Design System

Routezy uses the "Coastal Light" design direction:
- bright, clean white surfaces
- coral-to-amber branded accents
- deep navy primary text
- sky-blue functional highlights
- rounded cards with soft shadows

Refer to project design documentation for full palette, typography, spacing, and screen-specific notes.

## Roadmap and Implementation Notes

Routezy includes two mapping directions:

1. Google Maps Platform integration (reference architecture)
2. Open-source/no-key replacement pipeline (Expo Location + Photon + OSRM + Overpass)

Current codebase includes active Google-based services in several map modules and backend itinerary services. The open-source stack is a documented strategic path and can be implemented progressively behind service adapters.

Suggested phased roadmap:
- abstract map/place providers behind common interfaces
- add provider toggles via env flags
- implement OSRM route + table services
- implement Photon autocomplete service
- implement Overpass nearby utilities service
- run A/B validation against existing itinerary quality and response times

## Troubleshooting

- If the mobile app cannot reach backend, verify `EXPO_PUBLIC_API_BASE_URL`.
- On Android emulator, `10.0.2.2` typically maps to localhost.
- Restart Expo and backend after env updates.
- If Google auth fails, verify OAuth client IDs and Firebase provider setup.
- If itinerary APIs fail, validate `GOOGLE_MAPS_API_KEY` and server-side quota settings.

## Google Play Account Deletion

Google Play requires apps that support account creation to provide:
- an in-app account deletion option
- a public web URL where users can request deletion without reinstalling the app

Routezy now exposes a public deletion page at:

```text
https://your-domain.com/account-deletion
```

Recommended server env values:

```env
PUBLIC_APP_NAME=Routezy
PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
ACCOUNT_DELETION_RETENTION_NOTE=Some records may be retained when required for legal, fraud-prevention, or security reasons.
```

What Routezy currently deletes when the user deletes their account:
- user profile
- profile image
- user-created trips
- saved-trip records
- session history
- user activity records
- related security event records

Play Console setup:
1. Deploy the backend on a public HTTPS domain.
2. Open `https://your-domain.com/account-deletion` and confirm it loads without authentication.
3. In Play Console, paste that URL into the account deletion field.

## License

This repository currently has no explicit project license declared in source docs. Add one before public distribution.
