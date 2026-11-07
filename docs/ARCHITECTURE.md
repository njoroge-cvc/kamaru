# Kamaru Challenge — Architecture & API Reference

## System overview

```
Browser (React 19 SPA, CRA 5, Tailwind 3 via react-scripts, Framer Motion)
   │  axios → REACT_APP_API_BASE_URL (…/api), JWT in localStorage (Bearer header)
   ▼
Flask 3 API on Render (gunicorn run:app)
   ├─ Flask-SQLAlchemy → PostgreSQL (sslmode=require)
   ├─ Flask-JWT-Extended (access tokens; JWT_ACCESS_TOKEN_HOURS, default 12h)
   ├─ Cloudinary  (image uploads: gallery, events, site images, banners)
   └─ Brevo       (transactional email: contact form, newsletter, password reset)
```

| Layer | Location | Notes |
|---|---|---|
| Frontend | `kamaru-frontend/src` | `pages/` routes, `components/home/` landing-page chapters, `components/ui/` branded primitives, `components/motion/` animation primitives, `content/story.js` editable copy, `auth.js` session + permissions |
| Backend | `kamaru-backend/app` | `models/`, `routes/` (one blueprint per area), `utils/rbac.py` roles → permissions, `utils/email_service.py` |
| Migrations | `kamaru-backend/migrations/versions` | **git-ignored** (see Known issues) |

## Roles & permissions (RBAC)

Defined in `kamaru-backend/app/utils/rbac.py`. Routes ask for a *permission*, never a role.

| Permission | member | media | coordinator | admin |
|---|:-:|:-:|:-:|:-:|
| `dashboard:view` | | ✓ | ✓ | ✓ |
| `gallery:manage`, `videos:manage`, `site_images:manage` | | ✓ | | ✓ |
| `events:manage`, `seasons:manage`, `participants:manage` | | | ✓ | ✓ |
| `users:manage` | | | | ✓ |

Safeguards: the last administrator can't be demoted or deleted; admins can't delete themselves. `user.is_admin` is kept in sync (`role == "admin"`) for older clients.

## Participation window

A season has `is_active`, `registration_open` and optional `registration_closes_at` (local time).
Registrations are accepted only when **active AND open AND before the close time** (`Season.is_registration_open()`).
Coordinators/admins control this at **Dashboard → Seasons & Registration**; staff can still add late entries via `POST /api/participants/admin`.

## API endpoints

Auth column: **public**, **JWT** (any logged-in user), or the permission required.

### Users — `/api/users`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | public | Create account (role `member`) |
| POST | `/login` | public | Returns `token`, `user`, `role`, `permissions`, `is_admin` |
| GET | `/me` | JWT | Current profile + permissions (UI refreshes roles on load) |
| GET | `/roles` | `users:manage` | Role catalogue for the admin UI |
| POST | `/forgot_password` | public | Emails a 6-char code; same response whether or not the email exists |
| POST | `/reset_password` | public | `{short_token, new_password}` |
| GET | `/admin/users` | `users:manage` | List users |
| GET/PUT/DELETE | `/admin/users/<id>` | `users:manage` | Read / update (`username`, `email`, `role`) / delete |
| GET | `/admin/dashboard` | `dashboard:view` | Access probe |

### Seasons — `/api/seasons`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/active` | public | Active season incl. `accepting_registrations` |
| GET | `/` | public | All seasons |
| POST | `/` | `seasons:manage` | Create (starts inactive & closed) |
| PATCH | `/<id>` | `seasons:manage` | `name`, `year`, `is_active`, `registration_open`, `registration_closes_at` |

### Participants — `/api/participants`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/` | JWT + window open | Self-registration into the active season (403 when closed) |
| POST | `/admin` | `participants:manage` | Staff registration (ignores the window) |
| GET | `/?season_id=` | `participants:manage` | List |
| PUT/DELETE | `/<id>` | `participants:manage` | Update (409 on duplicate email/phone) / delete |
| GET | `/mine` | JWT | The member's own entries |
| DELETE | `/mine/<id>` | JWT (owner) | Withdraw own entry while registration is open |

### Events — `/api/events`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/?scope=upcoming\|past\|all` | public | Default `upcoming` (non-cancelled, future) |
| GET | `/<id>` | public | Detail |
| POST | `/` | `events:manage` | multipart, image required |
| PUT/DELETE | `/<id>` | `events:manage` | Update / delete |

### Media & site
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/gallery/` | public | All images (200 with `[]` when empty) |
| GET | `/api/gallery/about-image` | public | Legacy; unused by the frontend |
| POST | `/api/gallery/upload` | `gallery:manage` | multipart |
| DELETE | `/api/gallery/<id>` | `gallery:manage` | Also destroys the Cloudinary asset |
| GET | `/api/videos/` | public | YouTube links |
| POST | `/api/videos/add` | `videos:manage` | `{title, youtube_url}` |
| DELETE | `/api/videos/delete/<id>` | `videos:manage` | |
| GET | `/api/sys_images/<section>` | public | `logo`, `about`, `contact`; `banners` returns a list |
| GET | `/api/sys_images/banners` | public | |
| POST | `/api/sys_images/upload`, `/api/sys_images/banners/upload` | `site_images:manage` | |
| DELETE | `/api/sys_images/<id>`, `/api/sys_images/banners/<id>` | `site_images:manage` | By numeric id |
| GET | `/api/stats/` | public | Counts for dashboard tiles |

### Communication
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/contact` | public | Emails info@ (input HTML-escaped) |
| POST | `/api/newsletter/subscribe` | public | Sends verification email |
| GET | `/api/newsletter/verify?token=` | public | Verifies + welcome email |

### Root
| GET `/` | public | health message · GET `/favicon.ico` · GET `/db_stats` → `users:manage` |
|---|---|---|

## Deploying the RBAC / registration-window release

1. Back up the database.
2. Apply migrations `a1c3e5f7b9d2` (roles, registration window) and `b4d6f8a0c2e1` (entries ↔ accounts) with `flask db upgrade` — **already applied to the live database on 2026-11-07**. It adds `user.role` (existing admins → `admin`) and the season registration columns (the currently active season stays **open**).
3. Deploy the backend, then the frontend. Existing logged-in admins keep working; others pick up roles on next load.

## Hardening in place

- **Rate limiting** (Flask-Limiter): login 10/min · 60/h, register 10/h, forgot-password 5/15 min, reset 10/15 min, contact 5/h, newsletter 5/h, contestant registration 20/h. In-memory per process; set `RATELIMIT_STORAGE_URI=redis://…` if you scale to several instances.
- **Cloudinary cleanup**: deleting or replacing event images, site images, banners and gallery photos also removes the file (`app/utils/media.py`, folder-aware).
- **Entries linked to accounts**: `participant.user_id`; members see their entries (`GET /api/participants/mine`) and can withdraw while registration is open (`DELETE /api/participants/mine/<id>`).
- **One DB connection pool** with `pool_pre_ping`; log level from `LOG_LEVEL` (default INFO).
- **Repo hygiene**: virtualenv untracked; `migrations/` and `package-lock.json` are tracked; `kamaru-backend/backups/` is git-ignored (contains personal data).

## Remaining recommendations

- No **pagination** on list endpoints; no **unsubscribe** endpoint for the newsletter.
- Event create/update return raw exception text on bad input; password length is enforced client-side only.
- JWT lives in `localStorage` — fine with today's content, but avoid rendering untrusted HTML anywhere.
- Render free tier cold starts (2s+) — the homepage loads each section independently so a slow endpoint doesn't block the page.
