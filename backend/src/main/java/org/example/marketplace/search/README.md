# 🔎 Search Module (Map-Synced Filters)

This package handles all backend logic for the **Filters & Search Bar (T2.6)** feature.  
It provides endpoints that the frontend uses to:
- fetch listings based on text, price range, and map bounds,
- highlight/pan to a selected listing on the map.

---

## 🌍 Endpoints

### 1️⃣ `GET /api/search/listings`
Returns a **paginated list** of lightweight listing cards (for both the map markers and the sidebar).

**Query parameters**
| Name | Type | Description |
|------|------|-------------|
| `q` | string | Free-text search (title, description, product name) |
| `minPrice`, `maxPrice` | int | Price range in cents |
| `bbox` | string | Bounding box: `west,south,east,north` |
| `productId`, `categoryId` | UUID | Optional filters |
| `available` | boolean | Defaults to `true` |
| `page`, `size` | int | Pagination |
| `sort` | string | `price,asc` or `createdAt,desc` |

**Response:** `PageDto<ListingCardDto>`

---

### 2️⃣ `GET /api/listings/{id}/summary`
Returns minimal data (title, price, coordinates)  
used when clicking a list item to pan/open its map popup.

**Response:** `ListingSummaryDto`

---

## 🧩 Class Overview

| Class | Role | Connects To |
|--------|------|-------------|
| **ListingSearchController** | REST API layer — receives HTTP requests, parses filters, returns DTOs. | Calls `ListingSearchRepository` methods. |
| **ListingSearchRepository** | Interface defining available data-access operations (search, count, summary). | Implemented by `ListingSearchRepositoryImpl`. |
| **ListingSearchRepositoryImpl** | Actual SQL/PostGIS implementation using `NamedParameterJdbcTemplate`. | Maps DB rows → DTOs. Used by Controller. |
| **dto/PageDto** | Generic pagination wrapper (list + metadata). | Returned by Controller for `/search/listings`. |
| **dto/ListingCardDto** | Lightweight representation of each listing card/marker. | Built in RepositoryImpl. |
| **dto/ListingSummaryDto** | Minimal info for a single popup/pan action. | Returned by `/listings/{id}/summary`. |

---

## 🧠 How It Flows

