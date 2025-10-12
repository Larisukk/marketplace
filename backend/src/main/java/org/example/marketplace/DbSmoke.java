package org.example.marketplace;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbSmoke implements CommandLineRunner {
    private final JdbcTemplate jdbc;

    public DbSmoke(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    public void run(String... args) {
        Integer one = jdbc.queryForObject("SELECT 1", Integer.class);
        if (one != null && one == 1) {
            System.out.println("✅ DB connection OK");
        } else {
            System.out.println("❌ DB connection failed");
        }
    }
}
