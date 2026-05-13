# Amanicare Android API Reference

This document describes the API surface the Android app can use.

For local Android emulator testing, use:

```txt
http://10.0.2.2:3000
```

For a physical device on the same network, use your computer's LAN IP:

```txt
http://YOUR_LAN_IP:3000
```

## Common Rules

All request bodies are JSON unless stated otherwise.

```http
Content-Type: application/json
Accept: application/json
```

Authenticated endpoints accept either the session cookie set by `/api/auth/verify-code` or a bearer token:

```http
Authorization: Bearer <session_token>
```

For seeded local testing:

```http
Authorization: Bearer amanicare-mobile-test-token
```

Error responses use this shape:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Choose a valid help need type.",
    "details": null
  }
}
```

Common status codes:

- `200` success
- `201` created
- `400` validation error
- `401` missing or invalid session
- `404` not found

## Enums

```kotlin
enum class ContactChannel { EMAIL, PHONE }
enum class HelpNeedType { MEDICAL, SECURITY, COUNSELING, REPORT_INCIDENT }
enum class ContactPreference { IN_APP, EMAIL, PHONE, NONE }
enum class IncidentSeverity { LOW, MEDIUM, HIGH, IMMEDIATE_DANGER }
enum class ChatSenderRole { USER, SUPPORT, SYSTEM }
enum class ChatSessionStatus { OPEN, CLOSED, EXPIRED }
```

## Auth

### Request Verification Code

```http
POST /api/auth/request-code
```

Body:

```json
{
  "contact": "mobile@example.com"
}
```

`contact` may be an email address or phone number.

Response:

```json
{
  "ok": true,
  "channel": "EMAIL",
  "maskedContact": "mo***@example.com",
  "expiresInSeconds": 600,
  "delivery": {
    "status": "queued",
    "provider": "stub"
  },
  "devCode": "123456"
}
```

`devCode` is only returned outside production.

### Verify Code

```http
POST /api/auth/verify-code
```

Body for first sign up:

```json
{
  "contact": "mobile@example.com",
  "code": "123456",
  "username": "quiet_sun"
}
```

Body for existing user:

```json
{
  "contact": "mobile@example.com",
  "code": "123456"
}
```

`username` must be 3-24 characters and only letters, numbers, or underscores.

Response:

```json
{
  "user": {
    "id": "clx...",
    "username": "quiet_sun",
    "maskedContact": "mo***@example.com"
  },
  "session": {
    "token": "SESSION_TOKEN",
    "expiresAt": "2026-06-12T10:30:00.000Z"
  }
}
```

Store `session.token` securely and pass it as a bearer token.

## Current User

### Get Current User

```http
GET /api/me
Authorization: Bearer <session_token>
```

Response:

```json
{
  "user": {
    "id": "clx...",
    "username": "mobile_test_user",
    "displayName": "Mobile Test User",
    "maskedContact": "mo***@example.com"
  },
  "session": {
    "expiresAt": "2026-06-12T10:30:00.000Z"
  }
}
```

## Quick Exit

### Revoke Session

```http
POST /api/quick-exit
Authorization: Bearer <session_token>
```

Response:

```json
{
  "ok": true
}
```

Use this when the app's Quick Exit action should invalidate the current anonymous session.

## Help Requests

### List Help Requests

```http
GET /api/help-requests
Authorization: Bearer <session_token>
```

Response:

```json
{
  "requests": [
    {
      "id": "clx...",
      "needType": "COUNSELING",
      "status": "SUBMITTED",
      "description": "I need confidential emotional support and local referral options.",
      "locationText": "Nairobi",
      "preferredContact": "IN_APP",
      "safeToContact": false,
      "contactNotes": null,
      "incidentOccurredAt": null,
      "severity": "MEDIUM",
      "submittedAt": "2026-05-13T10:30:00.000Z",
      "createdAt": "2026-05-13T10:30:00.000Z",
      "updatedAt": "2026-05-13T10:30:00.000Z",
      "userId": "clx..."
    }
  ]
}
```

### Create Help Request

```http
POST /api/help-requests
Authorization: Bearer <session_token>
```

Body:

```json
{
  "needType": "SECURITY",
  "description": "I need help finding a safe place tonight.",
  "locationText": "Nairobi",
  "preferredContact": "IN_APP",
  "safeToContact": false,
  "contactNotes": "Only contact me through the app.",
  "severity": "HIGH",
  "incidentOccurredAt": "2026-05-13T18:30:00.000Z",
  "submit": true
}
```

Notes:

- `submit: true` creates a `SUBMITTED` request.
- Missing or false `submit` creates a `DRAFT`.
- `needType` must be one of `MEDICAL`, `SECURITY`, `COUNSELING`, `REPORT_INCIDENT`.

Response:

```json
{
  "request": {
    "id": "clx...",
    "needType": "SECURITY",
    "status": "SUBMITTED",
    "description": "I need help finding a safe place tonight.",
    "locationText": "Nairobi",
    "preferredContact": "IN_APP",
    "safeToContact": false,
    "contactNotes": "Only contact me through the app.",
    "incidentOccurredAt": "2026-05-13T18:30:00.000Z",
    "severity": "HIGH",
    "submittedAt": "2026-05-13T10:30:00.000Z",
    "createdAt": "2026-05-13T10:30:00.000Z",
    "updatedAt": "2026-05-13T10:30:00.000Z",
    "userId": "clx..."
  }
}
```

## Localized Content

Supported seeded locales:

- `en`
- `sw`

If a requested translation is missing, the API falls back to the record's default language.

### List Resource Categories

```http
GET /api/resource-categories?locale=sw
```

Response:

```json
{
  "locale": "sw",
  "categories": [
    {
      "id": "clx...",
      "slug": "legal-aid",
      "defaultLocale": "en",
      "locale": "sw",
      "name": "Msaada wa Kisheria",
      "description": "Ushauri wa siri wa kisheria, taarifa za haki, na msaada wa nyaraka.",
      "icon": "gavel",
      "sortOrder": 10,
      "createdAt": "2026-05-13T10:30:00.000Z",
      "updatedAt": "2026-05-13T10:30:00.000Z"
    }
  ]
}
```

### List Resources

```http
GET /api/resources?locale=sw
GET /api/resources?locale=en&category=health-services
GET /api/resources?locale=en&urgent=true
```

Query params:

- `locale`: optional, defaults to `en`
- `category`: optional category slug
- `urgent`: optional, use `true` for urgent resources only

Response:

```json
{
  "locale": "sw",
  "resources": [
    {
      "id": "clx...",
      "slug": "health-bridge-hub",
      "defaultLocale": "en",
      "locale": "sw",
      "name": "Health Bridge Hub",
      "summary": "Msaada wa matibabu bila kutaja jina, uchunguzi wa awali, na rufaa salama za kliniki.",
      "address": "Westlands, Nairobi",
      "region": "Nairobi",
      "latitude": null,
      "longitude": null,
      "phone": "+254700000202",
      "email": "care@healthbridge.example",
      "websiteUrl": "https://healthbridge.example",
      "isUrgent": false,
      "anonymityNotes": "Haihitaji kitambulisho cha serikali kwa ushauri wa kwanza.",
      "categoryId": "clx...",
      "category": {
        "id": "clx...",
        "slug": "health-services",
        "locale": "sw",
        "name": "Huduma za Afya",
        "description": "Huduma za matibabu, kliniki, na rufaa za afya.",
        "icon": "briefcase-medical",
        "sortOrder": 20
      }
    }
  ]
}
```

### List Wellness Articles

```http
GET /api/wellness?locale=sw
```

Response:

```json
{
  "locale": "sw",
  "articles": [
    {
      "id": "clx...",
      "slug": "grounding-techniques-for-stress",
      "defaultLocale": "en",
      "locale": "sw",
      "title": "Mbinu za kutulia wakati wa msongo.",
      "excerpt": "Njia rahisi za kutuliza pumzi na mawazo msongo unapoongezeka.",
      "body": "Jaribu kutaja vitu vitano unavyoweza kuona...",
      "tag": "Ustawi wa Kila Siku",
      "imageUrl": "/wellness/grounding.jpg",
      "publishedAt": "2026-01-01T08:00:00.000Z",
      "createdAt": "2026-05-13T10:30:00.000Z",
      "updatedAt": "2026-05-13T10:30:00.000Z"
    }
  ]
}
```

## Chat

### List Chat Sessions

```http
GET /api/chat/sessions
Authorization: Bearer <session_token>
```

Response:

```json
{
  "sessions": [
    {
      "id": "clx...",
      "status": "OPEN",
      "subject": "Local support groups",
      "expiresAt": "2026-05-14T10:30:00.000Z",
      "closedAt": null,
      "createdAt": "2026-05-13T10:30:00.000Z",
      "updatedAt": "2026-05-13T10:30:00.000Z",
      "userId": "clx..."
    }
  ]
}
```

### Create Chat Session

```http
POST /api/chat/sessions
Authorization: Bearer <session_token>
```

Body:

```json
{
  "subject": "Local support groups"
}
```

Response:

```json
{
  "session": {
    "id": "clx...",
    "status": "OPEN",
    "subject": "Local support groups",
    "expiresAt": "2026-05-14T10:30:00.000Z",
    "closedAt": null,
    "messages": [
      {
        "id": "clx...",
        "senderRole": "SYSTEM",
        "body": "This anonymous support session has started.",
        "metadata": null,
        "createdAt": "2026-05-13T10:30:00.000Z",
        "chatSessionId": "clx..."
      }
    ]
  }
}
```

### List Chat Messages

```http
GET /api/chat/sessions/{sessionId}/messages
Authorization: Bearer <session_token>
```

Response:

```json
{
  "session": {
    "id": "clx...",
    "status": "OPEN",
    "subject": "Local support groups",
    "expiresAt": "2026-05-14T10:30:00.000Z"
  },
  "messages": [
    {
      "id": "clx...",
      "senderRole": "USER",
      "body": "I am looking for local support groups.",
      "metadata": null,
      "createdAt": "2026-05-13T10:30:00.000Z",
      "chatSessionId": "clx..."
    }
  ]
}
```

### Send Chat Message

```http
POST /api/chat/sessions/{sessionId}/messages
Authorization: Bearer <session_token>
```

Body:

```json
{
  "message": "I am looking for local support groups.",
  "senderRole": "USER"
}
```

`senderRole` defaults to `USER` if omitted.

Response:

```json
{
  "message": {
    "id": "clx...",
    "senderRole": "USER",
    "body": "I am looking for local support groups.",
    "metadata": null,
    "createdAt": "2026-05-13T10:30:00.000Z",
    "chatSessionId": "clx..."
  }
}
```

## Recommended Android Flow

1. Call `POST /api/auth/request-code` with email or phone.
2. In development, read `devCode`; in production, use the delivered code.
3. Call `POST /api/auth/verify-code` with `contact`, `code`, and `username` for first sign up.
4. Store `session.token` securely.
5. Use `Authorization: Bearer <session_token>` on protected calls.
6. Fetch home data with:
   - `GET /api/wellness?locale=<device_locale>`
   - `GET /api/resource-categories?locale=<device_locale>`
   - `GET /api/resources?locale=<device_locale>`
7. Use `POST /api/quick-exit` and clear local token/session state when the user taps Quick Exit.
