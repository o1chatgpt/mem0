import type { Migration } from "../migration-manager"

const migration: Migration = {
  name: "20240429_000006_create_user_settings_table",
  async up(executeSql) {
    console.log("Running migration: create user_settings table")

    // Create the user_settings table
    const sql = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL UNIQUE,
        openai_api_key TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
    `

    await executeSql(sql)
    console.log("Migration complete: user_settings table created")
    return true
  },

  async down(executeSql) {
    console.log("Running down migration: drop user_settings table")

    // Drop the user_settings table
    const sql = `
      DROP TABLE IF EXISTS user_settings;
    `

    await executeSql(sql)
    console.log("Down migration complete: user_settings table dropped")
    return true
  },
}

export default migration
