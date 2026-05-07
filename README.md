# INF653 Final Project — US States REST API

A Node.js/Express RESTful API that serves data about all 50 US states, with MongoDB-backed fun facts management and a frontend UI.

**Live URL:** https://inf653-final.catsoup.dev

---

## Tech Stack

- **Runtime:** Node.js (≥ 14)
- **Framework:** Express 4
- **Database:** MongoDB (via Mongoose)
- **Other:** CORS, dotenv

---

## Getting Started

### Prerequisites
- Node.js ≥ 14
- A MongoDB connection URI

### Installation

```bash
git clone https://github.com/catsoup11789/inf653-final.git
cd inf653-final
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
PORT=3000
```

### Running

```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

---

## API Endpoints

**Base URL:** `https://inf653-final.catsoup.dev/states`

### GET

| Endpoint | Description |
|---|---|
| `/states` | All 50 states |
| `/states?contig=true` | Contiguous 48 states only |
| `/states?contig=false` | Non-contiguous states (AK, HI) |
| `/states/:state` | Single state by 2-letter code |
| `/states/:state/funfact` | Random fun fact for the state |
| `/states/:state/capital` | State capital |
| `/states/:state/nickname` | State nickname |
| `/states/:state/population` | State population |
| `/states/:state/admission` | Statehood admission date |
| `/states/rank/population?order=asc\|desc` | All states ranked by population (default: `desc`) |
| `/states/rank/admission?order=asc\|desc` | All states ranked by admission order (default: `asc`) |
| `/states/admitted/:year` | States admitted in a specific year |
| `/states/admitted/before/:year` | States admitted before a given year |
| `/states/admitted/after/:year` | States admitted after a given year |
| `/states/search?name=` | Search states by name (partial, case-insensitive) |

### POST

| Endpoint | Body | Description |
|---|---|---|
| `/states/:state/funfact` | `{ "funfacts": ["..."] }` | Add fun facts |

### PATCH

| Endpoint | Body | Description |
|---|---|---|
| `/states/:state/funfact` | `{ "index": 1, "funfact": "..." }` | Update a fun fact (1-based index) |

### DELETE

| Endpoint | Body | Description |
|---|---|---|
| `/states/:state/funfact` | `{ "index": 1 }` | Delete a fun fact (1-based index) |

> State codes are case-insensitive 2-letter abbreviations (e.g. `KS`, `mo`, `TX`).  
> Invalid codes return: `{ "message": "Invalid state abbreviation parameter" }`

---

## Project Structure

```
inf653-final/
├── server.js               # Express app entry point
├── config/
│   └── dbConn.js           # MongoDB connection
├── controllers/
│   └── statesController.js # Route handler logic
├── middleware/
│   └── errorHandler.js     # Global error handler
├── models/
│   ├── States.js           # Mongoose model (fun facts)
│   └── statesData.json     # Static state data
├── routes/
│   └── states.js           # /states router
└── public/
    ├── index.html          # Random state explorer UI
    ├── api.html            # API documentation UI
    └── 404.html            # 404 page
```

---

## License

ISC
