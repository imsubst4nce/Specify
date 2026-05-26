/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mysql from 'mysql2/promise';

/**
 * Enterprise-grade MySQL Cloud Database Connection Pool Manager.
 * Uses lazy-initialization to avoid crashing the server on startup
 * if the environment variables are not yet provided.
 */
class MySQLDbPool {
  private pool: mysql.Pool | null = null;

  /**
   * Safe getter to lazily initialize the MySQL Connection Pool.
   * If any of the variables are empty, it raises an descriptive diagnostic.
   */
  public getPool(): mysql.Pool {
    if (this.pool) {
      return this.pool;
    }

    // Access secret environment variables
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME || 'specify_db';
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

    // Check if configuration parameters are missing or invalid
    if (!user) {
      throw new Error(
        'MySQL DB Error: DB_USER environment variable is missing inside your workspace environment definition. ' +
        'Please check your .env/parameters configuration in settings.'
      );
    }

    try {
      console.log(`[Database] Initializing connection pool to host: ${host}:${port}, database: ${database}`);
      
      this.pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 15, // standard load threshold limit
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });

      return this.pool;
    } catch (err: any) {
      console.error('[Database] Critical error instantiating connection pool:', err);
      throw new Error(`MySQL Connection Error: ${err.message || err}`);
    }
  }

  /**
   * Helper utility to safely test connection status on demand.
   * Returns details about success or fails gracefully.
   */
  public async testConnection(): Promise<{ success: boolean; message: string; config?: any }> {
    try {
      const activePool = this.getPool();
      const connection = await activePool.getConnection();
      
      // Ping the server to assure connection authenticity
      await connection.ping();
      connection.release();
      
      return {
        success: true,
        message: 'Successfully established contact with the target MySQL instance!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err.message || err}`,
        config: {
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'specify_db',
          user: process.env.DB_USER || 'undefined',
        }
      };
    }
  }

  /**
   * Helper query dispatcher returning generic result sets.
   */
  public async query<T extends mysql.RowDataPacket[][] | mysql.RowDataPacket[] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader>(
    sql: string,
    params?: any[]
  ): Promise<T> {
    const activePool = this.getPool();
    const [results] = await activePool.execute<T>(sql, params);
    return results;
  }

  /**
   * Close the pool explicitly (useful for graceful shutdown or unit tests)
   */
  public async shutdown(): Promise<void> {
    if (this.pool) {
      console.log('[Database] Shutting down connection pool...');
      await this.pool.end();
      this.pool = null;
    }
  }
}

export const mysqlDb = new MySQLDbPool();

// =========================================================================
// Real-world CRUD Operations Demonstration & Reference Snippets
// =========================================================================
/**
 * EXAMPLE: Fetching user info from the MySQL query helper
 * 
 *     interface MySqlUserRow extends mysql.RowDataPacket {
 *       id: string;
 *       name: string;
 *       email: string;
 *     }
 * 
 *     export async function queryUserByEmail(email: string): Promise<MySqlUserRow | null> {
 *       const rows = await mysqlDb.query<MySqlUserRow[]>(
 *         'SELECT id, name, email FROM users WHERE email = ? LIMIT 1',
 *         [email]
 *       );
 *       return rows.length > 0 ? rows[0] : null;
 *     }
 */
