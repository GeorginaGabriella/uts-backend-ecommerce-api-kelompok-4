/**
 * Database Configuration
 * Manages MySQL connection pool
 */
const mysql = require('mysql2/promise');

class DatabaseConfig {
  static instance = null;

  constructor() {
    this.pool = null;
    this.databaseName = process.env.DB_NAME || 'ecommerce_db';
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabaseConfig();
    }
    return this.instance;
  }

  getConnectionConfig({ includeDatabase = true } = {}) {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    };

    if (includeDatabase) {
      config.database = this.databaseName;
    }

    return config;
  }

  async ensureDatabaseExists() {
    const connection = await mysql.createConnection(
      this.getConnectionConfig({ includeDatabase: false })
    );

    try {
      await connection.query(
        'CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
        [this.databaseName]
      );
    } finally {
      await connection.end();
    }
  }

  async initialize() {
    if (this.pool) {
      return this.pool;
    }

    try {
      await this.ensureDatabaseExists();

      this.pool = mysql.createPool({
        ...this.getConnectionConfig(),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      await this.pool.query('SELECT 1');
      console.log('Database connection pool created');
      return this.pool;
    } catch (error) {
      console.error('Database connection failed:', error.message);
      this.pool = null;
      throw error;
    }
  }

  getPool() {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  async closeConnection() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database connection closed');
    }
  }
}

module.exports = DatabaseConfig;
