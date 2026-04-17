/**
 * Database Connection Helper
 * Utility functions for database operations
 */

/**
 * Execute a query with automatic connection handling
 * @param {Pool} database
 * @param {string} query
 * @param {array} params
 * @returns {Promise<array>}
 */
async function executeQuery(database, query, params = []) {
  try {
    const [rows] = await database.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

/**
 * Execute a query and return a single result
 * @param {Pool} database
 * @param {string} query
 * @param {array} params
 * @returns {Promise<object|null>}
 */
async function queryOne(database, query, params = []) {
  const rows = await executeQuery(database, query, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute a transaction
 * @param {Pool} database
 * @param {Function} callback - Async function to execute in transaction
 * @returns {Promise}
 */
async function transaction(database, callback) {
  const connection = await database.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  executeQuery,
  queryOne,
  transaction
};
