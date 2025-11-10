/**
 * We don’t define JPA @Entity types for the map layer.
 * Queries read from the Postgres VIEW v_listings_public via JdbcTemplate for performance.
 * If later needed, add read-only entities here in a separate module.
 */
package org.example.marketplace.map.entity;
