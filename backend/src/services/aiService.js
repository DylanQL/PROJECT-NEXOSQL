const { OpenAI } = require('openai');
const mysql = require('mysql2/promise');
const postgres = require('pg');
const mssql = require('mssql');
const oracledb = require('oracledb');
const { MongoClient } = require('mongodb');

class AIService {
  constructor() {
    this.maxIterations = 10; // Maximum number of iterations for the AI loop
    this.apiKey = process.env.DEEPSEEK_API_KEY || 'sk-c5e57255b0084232bfaa688c85417627'; // Fallback to the provided key
    this.baseURL = 'https://api.deepseek.com';
    this.model = 'deepseek-chat';

    this.openai = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL
    });
  }

  /**
   * Process a natural language query against a database
   * @param {Object} connection - Database connection details
   * @param {string} question - Natural language question
   * @returns {Object} - Answer and metadata
   */
  async processQuery(connection, question) {
    // Create a database client based on the motor type
    const dbClient = await this.createDatabaseClient(connection);

    try {
      // Get the schema information for the database
      const schemaInfo = await this.getSchemaInfo(dbClient, connection);

      // Create the system prompt with database schema information
      const systemPrompt = this.createSystemPrompt(schemaInfo, connection.motor.nombre);

      // Process the question using the AI service
      const result = await this.processWithAI(dbClient, systemPrompt, question, connection);

      return result;
    } finally {
      // Close database connection
      await this.closeDatabaseClient(dbClient, connection.motor.nombre);
    }
  }

  /**
   * Create a database client based on the motor type
   * @param {Object} connection - Connection details
   * @returns {Object} - Database client
   */
  async createDatabaseClient(connection) {
    const { motor, host, port, database_name, username, password } = connection;
    const motorName = motor.nombre.toLowerCase();

    try {
      if (motorName.includes('mysql') || motorName.includes('mariadb')) {
        // MySQL or MariaDB connection
        const pool = mysql.createPool({
          host,
          port: parseInt(port, 10),
          database: database_name,
          user: username,
          password,
          waitForConnections: true,
          connectionLimit: 1,
          queueLimit: 0
        });

        // Test the connection
        const conn = await pool.getConnection();
        conn.release();

        return { pool, type: 'mysql' };
      }
      else if (motorName.includes('postgres')) {
        // PostgreSQL connection
        const client = new postgres.Pool({
          host,
          port: parseInt(port, 10),
          database: database_name,
          user: username,
          password,
        });

        // Test the connection
        await client.connect();

        return { pool: client, type: 'postgres' };
      }
      else if (motorName.includes('sql server')) {
        // SQL Server connection
        const config = {
          server: host,
          port: parseInt(port, 10),
          database: database_name,
          user: username,
          password,
          options: {
            encrypt: true,
            trustServerCertificate: true,
          }
        };

        const pool = await mssql.connect(config);

        return { pool, type: 'mssql' };
      }
      else if (motorName.includes('oracle')) {
        // Oracle connection
        oracledb.autoCommit = true;
        const connection = await oracledb.getConnection({
          user: username,
          password,
          connectString: `${host}:${port}/${database_name}`
        });

        return { pool: connection, type: 'oracle' };
      }
      else if (motorName.includes('mongo')) {
        // MongoDB connection
        const uri = `mongodb://${username}:${password}@${host}:${port}/${database_name}`;
        const client = new MongoClient(uri);
        await client.connect();

        return { pool: client, type: 'mongodb' };
      }
      else {
        throw new Error(`Motor de base de datos no soportado: ${motorName}`);
      }
    } catch (error) {
      throw new Error(`Error al conectar a la base de datos: ${error.message}`);
    }
  }

  /**
   * Close the database connection
   * @param {Object} dbClient - Database client
   * @param {string} motorType - Type of database motor
   */
  async closeDatabaseClient(dbClient, motorType) {
    if (!dbClient) return;

    const type = motorType.toLowerCase();

    try {
      if (type.includes('mysql') || type.includes('mariadb')) {
        await dbClient.pool.end();
      }
      else if (type.includes('postgres')) {
        await dbClient.pool.end();
      }
      else if (type.includes('sql server')) {
        await dbClient.pool.close();
      }
      else if (type.includes('oracle')) {
        await dbClient.pool.close();
      }
      else if (type.includes('mongo')) {
        await dbClient.pool.close();
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  /**
   * Get schema information for the database
   * @param {Object} dbClient - Database client
   * @param {Object} connection - Connection details
   * @returns {Object} - Schema information
   */
  async getSchemaInfo(dbClient, connection) {
    const { motor } = connection;
    const motorName = motor.nombre.toLowerCase();

    try {
      if (motorName.includes('mysql') || motorName.includes('mariadb')) {
        // Get MySQL/MariaDB schema information
        return await this.getMySQLSchemaInfo(dbClient, connection.database_name);
      }
      else if (motorName.includes('postgres')) {
        // Get PostgreSQL schema information
        return await this.getPostgresSchemaInfo(dbClient);
      }
      else if (motorName.includes('sql server')) {
        // Get SQL Server schema information
        return await this.getSQLServerSchemaInfo(dbClient);
      }
      else if (motorName.includes('oracle')) {
        // Get Oracle schema information
        return await this.getOracleSchemaInfo(dbClient, connection.username.toUpperCase());
      }
      else if (motorName.includes('mongo')) {
        // Get MongoDB schema information
        return await this.getMongoDBSchemaInfo(dbClient, connection.database_name);
      }
      else {
        throw new Error(`Motor de base de datos no soportado para obtener esquema: ${motorName}`);
      }
    } catch (error) {
      throw new Error(`Error al obtener información del esquema: ${error.message}`);
    }
  }

  /**
   * Get MySQL schema information
   * @param {Object} dbClient - Database client
   * @param {string} database - Database name
   * @returns {Object} - Schema information
   */
  async getMySQLSchemaInfo(dbClient, database) {
    try {
      // Get tables
      const [tables] = await dbClient.pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = ?
        ORDER BY table_name
      `, [database]);

      const schemaInfo = {
        tables: [],
      };

      // For each table, get columns and their information
      for (const table of tables) {
        const tableName = table.TABLE_NAME || table.table_name;

        // Get columns
        const [columns] = await dbClient.pool.query(`
          SELECT
            column_name,
            data_type,
            is_nullable,
            column_key,
            column_comment
          FROM information_schema.columns
          WHERE table_schema = ? AND table_name = ?
          ORDER BY ordinal_position
        `, [database, tableName]);

        // Get primary keys
        const [primaryKeys] = await dbClient.pool.query(`
          SELECT
            column_name
          FROM information_schema.key_column_usage
          WHERE table_schema = ?
            AND table_name = ?
            AND constraint_name = 'PRIMARY'
          ORDER BY ordinal_position
        `, [database, tableName]);

        // Get foreign keys
        const [foreignKeys] = await dbClient.pool.query(`
          SELECT
            column_name,
            referenced_table_name,
            referenced_column_name
          FROM information_schema.key_column_usage
          WHERE table_schema = ?
            AND table_name = ?
            AND referenced_table_name IS NOT NULL
          ORDER BY ordinal_position
        `, [database, tableName]);

        const tableInfo = {
          name: tableName,
          columns: columns.map(col => ({
            name: col.COLUMN_NAME || col.column_name,
            type: col.DATA_TYPE || col.data_type,
            nullable: (col.IS_NULLABLE || col.is_nullable) === 'YES',
            primaryKey: (col.COLUMN_KEY || col.column_key) === 'PRI',
            comment: col.COLUMN_COMMENT || col.column_comment || ''
          })),
          primaryKeys: primaryKeys.map(pk => pk.COLUMN_NAME || pk.column_name),
          foreignKeys: foreignKeys.map(fk => ({
            column: fk.COLUMN_NAME || fk.column_name,
            referencedTable: fk.REFERENCED_TABLE_NAME || fk.referenced_table_name,
            referencedColumn: fk.REFERENCED_COLUMN_NAME || fk.referenced_column_name
          }))
        };

        schemaInfo.tables.push(tableInfo);
      }

      return schemaInfo;
    } catch (error) {
      throw new Error(`Error getting MySQL schema: ${error.message}`);
    }
  }

  /**
   * Get PostgreSQL schema information
   * @param {Object} dbClient - Database client
   * @returns {Object} - Schema information
   */
  async getPostgresSchemaInfo(dbClient) {
    try {
      // Get tables
      const tablesResult = await dbClient.pool.query(`
        SELECT tablename as table_name
        FROM pg_catalog.pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);

      const schemaInfo = {
        tables: [],
      };

      // For each table, get columns and their information
      for (const table of tablesResult.rows) {
        const tableName = table.table_name;

        // Get columns
        const columnsResult = await dbClient.pool.query(`
          SELECT
            a.attname as column_name,
            pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
            CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END as is_nullable,
            CASE
              WHEN p.contype = 'p' THEN 'PRI'
              ELSE ''
            END as column_key,
            d.description as column_comment
          FROM pg_catalog.pg_attribute a
          LEFT JOIN pg_catalog.pg_constraint p ON p.conrelid = a.attrelid AND a.attnum = ANY(p.conkey) AND p.contype = 'p'
          LEFT JOIN pg_catalog.pg_description d ON d.objoid = a.attrelid AND d.objsubid = a.attnum
          WHERE a.attrelid = $1::regclass
            AND a.attnum > 0
            AND NOT a.attisdropped
          ORDER BY a.attnum
        `, [tableName]);

        // Get primary keys
        const primaryKeysResult = await dbClient.pool.query(`
          SELECT
            a.attname as column_name
          FROM pg_catalog.pg_attribute a
          JOIN pg_catalog.pg_constraint p ON p.conrelid = a.attrelid AND a.attnum = ANY(p.conkey)
          WHERE p.contype = 'p'
            AND a.attrelid = $1::regclass
        `, [tableName]);

        // Get foreign keys
        const foreignKeysResult = await dbClient.pool.query(`
          SELECT
            a.attname as column_name,
            cl.relname as referenced_table_name,
            a2.attname as referenced_column_name
          FROM pg_constraint c
          JOIN pg_catalog.pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
          JOIN pg_class cl ON cl.oid = c.confrelid
          JOIN pg_catalog.pg_attribute a2 ON a2.attrelid = c.confrelid AND a2.attnum = c.confkey[1]
          WHERE c.conrelid = $1::regclass
            AND c.contype = 'f'
        `, [tableName]);

        const tableInfo = {
          name: tableName,
          columns: columnsResult.rows.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            primaryKey: col.column_key === 'PRI',
            comment: col.column_comment || ''
          })),
          primaryKeys: primaryKeysResult.rows.map(pk => pk.column_name),
          foreignKeys: foreignKeysResult.rows.map(fk => ({
            column: fk.column_name,
            referencedTable: fk.referenced_table_name,
            referencedColumn: fk.referenced_column_name
          }))
        };

        schemaInfo.tables.push(tableInfo);
      }

      return schemaInfo;
    } catch (error) {
      throw new Error(`Error getting PostgreSQL schema: ${error.message}`);
    }
  }

  /**
   * Get SQL Server schema information
   * @param {Object} dbClient - Database client
   * @returns {Object} - Schema information
   */
  async getSQLServerSchemaInfo(dbClient) {
    try {
      // Get tables
      const tablesResult = await dbClient.pool.request().query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);

      const schemaInfo = {
        tables: [],
      };

      // For each table, get columns and their information
      for (const table of tablesResult.recordset) {
        const tableName = table.TABLE_NAME;

        // Get columns
        const columnsResult = await dbClient.pool.request()
          .input('tableName', mssql.VarChar, tableName)
          .query(`
            SELECT
              c.COLUMN_NAME,
              c.DATA_TYPE,
              c.IS_NULLABLE,
              CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'PRI' ELSE '' END AS COLUMN_KEY,
              ep.value AS COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS c
            LEFT JOIN (
              SELECT ku.TABLE_CATALOG, ku.TABLE_SCHEMA, ku.TABLE_NAME, ku.COLUMN_NAME
              FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
              JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
                ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
            ) pk
              ON c.TABLE_CATALOG = pk.TABLE_CATALOG
              AND c.TABLE_SCHEMA = pk.TABLE_SCHEMA
              AND c.TABLE_NAME = pk.TABLE_NAME
              AND c.COLUMN_NAME = pk.COLUMN_NAME
            LEFT JOIN sys.columns sc
              ON sc.name = c.COLUMN_NAME
              AND sc.object_id = OBJECT_ID(c.TABLE_SCHEMA + '.' + c.TABLE_NAME)
            LEFT JOIN sys.extended_properties ep
              ON ep.major_id = sc.object_id
              AND ep.minor_id = sc.column_id
              AND ep.name = 'MS_Description'
            WHERE c.TABLE_NAME = @tableName
            ORDER BY c.ORDINAL_POSITION
          `);

        // Get primary keys
        const primaryKeysResult = await dbClient.pool.request()
          .input('tableName', mssql.VarChar, tableName)
          .query(`
            SELECT ku.COLUMN_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
              ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
              AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
            WHERE ku.TABLE_NAME = @tableName
            ORDER BY ku.ORDINAL_POSITION
          `);

        // Get foreign keys
        const foreignKeysResult = await dbClient.pool.request()
          .input('tableName', mssql.VarChar, tableName)
          .query(`
            SELECT
              ku1.COLUMN_NAME,
              ku2.TABLE_NAME AS REFERENCED_TABLE_NAME,
              ku2.COLUMN_NAME AS REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku1
              ON ku1.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku2
              ON ku2.CONSTRAINT_NAME = rc.UNIQUE_CONSTRAINT_NAME
            WHERE ku1.TABLE_NAME = @tableName
          `);

        const tableInfo = {
          name: tableName,
          columns: columnsResult.recordset.map(col => ({
            name: col.COLUMN_NAME,
            type: col.DATA_TYPE,
            nullable: col.IS_NULLABLE === 'YES',
            primaryKey: col.COLUMN_KEY === 'PRI',
            comment: col.COLUMN_COMMENT || ''
          })),
          primaryKeys: primaryKeysResult.recordset.map(pk => pk.COLUMN_NAME),
          foreignKeys: foreignKeysResult.recordset.map(fk => ({
            column: fk.COLUMN_NAME,
            referencedTable: fk.REFERENCED_TABLE_NAME,
            referencedColumn: fk.REFERENCED_COLUMN_NAME
          }))
        };

        schemaInfo.tables.push(tableInfo);
      }

      return schemaInfo;
    } catch (error) {
      throw new Error(`Error getting SQL Server schema: ${error.message}`);
    }
  }

  /**
   * Get Oracle schema information
   * @param {Object} dbClient - Database client
   * @param {string} schema - Schema name (usually username in uppercase)
   * @returns {Object} - Schema information
   */
  async getOracleSchemaInfo(dbClient, schema) {
    try {
      // Get tables
      const tablesResult = await dbClient.pool.execute(
        `SELECT TABLE_NAME FROM ALL_TABLES WHERE OWNER = :schema ORDER BY TABLE_NAME`,
        [schema],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const schemaInfo = {
        tables: [],
      };

      // For each table, get columns and their information
      for (const table of tablesResult.rows) {
        const tableName = table.TABLE_NAME;

        // Get columns
        const columnsResult = await dbClient.pool.execute(
          `SELECT
            COLUMN_NAME,
            DATA_TYPE,
            NULLABLE,
            CASE WHEN CONSTRAINT_TYPE = 'P' THEN 'PRI' ELSE '' END AS COLUMN_KEY,
            COMMENTS AS COLUMN_COMMENT
          FROM ALL_TAB_COLUMNS c
          LEFT JOIN (
            SELECT acc.OWNER, acc.TABLE_NAME, acc.COLUMN_NAME, ac.CONSTRAINT_TYPE
            FROM ALL_CONS_COLUMNS acc
            JOIN ALL_CONSTRAINTS ac ON acc.CONSTRAINT_NAME = ac.CONSTRAINT_NAME
            WHERE ac.CONSTRAINT_TYPE = 'P'
          ) pk ON c.OWNER = pk.OWNER AND c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
          LEFT JOIN ALL_COL_COMMENTS cc ON c.OWNER = cc.OWNER AND c.TABLE_NAME = cc.TABLE_NAME AND c.COLUMN_NAME = cc.COLUMN_NAME
          WHERE c.OWNER = :schema AND c.TABLE_NAME = :tableName
          ORDER BY c.COLUMN_ID`,
          [schema, tableName],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Get primary keys
        const primaryKeysResult = await dbClient.pool.execute(
          `SELECT acc.COLUMN_NAME
          FROM ALL_CONS_COLUMNS acc
          JOIN ALL_CONSTRAINTS ac ON acc.CONSTRAINT_NAME = ac.CONSTRAINT_NAME
          WHERE ac.CONSTRAINT_TYPE = 'P'
            AND acc.OWNER = :schema
            AND acc.TABLE_NAME = :tableName
          ORDER BY acc.POSITION`,
          [schema, tableName],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Get foreign keys
        const foreignKeysResult = await dbClient.pool.execute(
          `SELECT
            acc1.COLUMN_NAME,
            ac.R_CONSTRAINT_NAME,
            acc2.TABLE_NAME AS REFERENCED_TABLE_NAME,
            acc2.COLUMN_NAME AS REFERENCED_COLUMN_NAME
          FROM ALL_CONSTRAINTS ac
          JOIN ALL_CONS_COLUMNS acc1
            ON ac.CONSTRAINT_NAME = acc1.CONSTRAINT_NAME
          JOIN ALL_CONS_COLUMNS acc2
            ON ac.R_CONSTRAINT_NAME = acc2.CONSTRAINT_NAME
          WHERE ac.CONSTRAINT_TYPE = 'R'
            AND ac.OWNER = :schema
            AND ac.TABLE_NAME = :tableName`,
          [schema, tableName],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const tableInfo = {
          name: tableName,
          columns: columnsResult.rows.map(col => ({
            name: col.COLUMN_NAME,
            type: col.DATA_TYPE,
            nullable: col.NULLABLE === 'Y',
            primaryKey: col.COLUMN_KEY === 'PRI',
            comment: col.COLUMN_COMMENT || ''
          })),
          primaryKeys: primaryKeysResult.rows.map(pk => pk.COLUMN_NAME),
          foreignKeys: foreignKeysResult.rows.map(fk => ({
            column: fk.COLUMN_NAME,
            referencedTable: fk.REFERENCED_TABLE_NAME,
            referencedColumn: fk.REFERENCED_COLUMN_NAME
          }))
        };

        schemaInfo.tables.push(tableInfo);
      }

      return schemaInfo;
    } catch (error) {
      throw new Error(`Error getting Oracle schema: ${error.message}`);
    }
  }

  /**
   * Get MongoDB schema information (simplified as MongoDB is schemaless)
   * @param {Object} dbClient - Database client
   * @param {string} database - Database name
   * @returns {Object} - Schema information
   */
  async getMongoDBSchemaInfo(dbClient, database) {
    try {
      const db = dbClient.pool.db(database);
      const collections = await db.listCollections().toArray();

      const schemaInfo = {
        collections: [],
      };

      // For each collection, get a sample document to infer schema
      for (const collection of collections) {
        const collectionName = collection.name;
        const coll = db.collection(collectionName);

        // Get a sample document
        const sampleDocs = await coll.find().limit(5).toArray();

        // Infer schema from sample documents
        const fields = new Set();
        const fieldTypes = {};

        sampleDocs.forEach(doc => {
          Object.keys(doc).forEach(key => {
            fields.add(key);

            if (!fieldTypes[key]) {
              fieldTypes[key] = typeof doc[key];
            }
          });
        });

        const collectionInfo = {
          name: collectionName,
          fields: Array.from(fields).map(field => ({
            name: field,
            type: fieldTypes[field],
            nullable: true, // In MongoDB, fields are optional by default
            primaryKey: field === '_id',
            comment: ''
          }))
        };

        schemaInfo.collections.push(collectionInfo);
      }

      return schemaInfo;
    } catch (error) {
      throw new Error(`Error getting MongoDB schema: ${error.message}`);
    }
  }

  /**
   * Create the system prompt with database schema information
   * @param {Object} schemaInfo - Schema information
   * @param {string} motorType - Type of database motor
   * @returns {string} - System prompt
   */
  createSystemPrompt(schemaInfo, motorType) {
    let prompt = `You are an expert SQL assistant that helps users query databases. You have access to the following database schema:\n\n`;

    // For SQL databases
    if (schemaInfo.tables) {
      // Add tables information
      prompt += `TABLES:\n`;

      schemaInfo.tables.forEach(table => {
        prompt += `- ${table.name}\n`;

        // Add columns
        prompt += `  Columns:\n`;
        table.columns.forEach(column => {
          const primaryKey = column.primaryKey ? ' (PRIMARY KEY)' : '';
          const nullable = column.nullable ? '' : ' NOT NULL';
          const comment = column.comment ? ` -- ${column.comment}` : '';
          prompt += `    - ${column.name}: ${column.type}${primaryKey}${nullable}${comment}\n`;
        });

        // Add foreign keys if any
        if (table.foreignKeys && table.foreignKeys.length > 0) {
          prompt += `  Foreign Keys:\n`;
          table.foreignKeys.forEach(fk => {
            prompt += `    - ${fk.column} -> ${fk.referencedTable}.${fk.referencedColumn}\n`;
          });
        }

        prompt += `\n`;
      });
    }
    // For MongoDB
    else if (schemaInfo.collections) {
      prompt += `COLLECTIONS:\n`;

      schemaInfo.collections.forEach(collection => {
        prompt += `- ${collection.name}\n`;

        // Add fields
        prompt += `  Fields:\n`;
        collection.fields.forEach(field => {
          const primaryKey = field.primaryKey ? ' (PRIMARY KEY)' : '';
          prompt += `    - ${field.name}: ${field.type}${primaryKey}\n`;
        });

        prompt += `\n`;
      });
    }

    // Add instructions for the AI based on the database type
    if (motorType.toLowerCase().includes('mongo')) {
      prompt += `
When I ask you a question about the data, you should:

1. Think about which collection(s) and fields you need to query
2. Generate MongoDB queries to get the answer
3. Only after you have all the necessary information, provide the final answer

Always respond in the following format:

If you need to run a query:
ACTION: QUERY
QUERY: <your MongoDB query>
REASONING: <your reasoning for running this query>

If you have the final answer:
ACTION: ANSWER
RESPONSE: <your answer to my question>

Important rules:
- Don't use markdown formatting in your QUERY section
- Always use proper MongoDB syntax
- Never fabricate data - only respond based on the results of your queries
- If you need more information, ask for it
- Always consider the most efficient way to query the data
`;
    } else {
      prompt += `
When I ask you a question about the data, you should:

1. Think about which table(s) and columns you need to query
2. Generate SQL queries to get the answer
3. Only after you have all the necessary information, provide the final answer

Always respond in the following format:

If you need to run a query:
ACTION: QUERY
SQL: <your SQL query>
REASONING: <your reasoning for running this query>

If you have the final answer:
ACTION: ANSWER
RESPONSE: <your answer to my question>

Important rules:
- Don't use markdown formatting in your SQL section
- Always use proper SQL syntax for ${motorType}
- Never fabricate data - only respond based on the results of your queries
- If you need more information, ask for it
- Always consider the most efficient way to query the data
`;
    }

    return prompt;
  }

  /**
   * Parse the AI response to extract action, SQL/query, reasoning, and response
   * @param {string} text - AI response text
   * @returns {Object} - Parsed response
   */
  parseAIResponse(text) {
    console.log('Parsing AI response:', text);

    const result = {
      action: null,
      sql: null,
      query: null, // For MongoDB
      reasoning: null,
      response: null
    };

    // Extract action - try multiple patterns
    let actionMatch = text.match(/ACTION:\s*(QUERY|ANSWER)/i);
    if (!actionMatch) {
      // Try alternative patterns
      actionMatch = text.match(/\b(QUERY|ANSWER)\b/i);
    }
    if (actionMatch) {
      result.action = actionMatch[1].toUpperCase();
    } else {
      // If no explicit action found, try to infer from content
      if (text.match(/SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER/i) ||
          text.match(/db\.|find\(|aggregate\(/i)) {
        result.action = 'QUERY';
      } else if (text.length > 50) {
        result.action = 'ANSWER';
        result.response = text.trim();
        return result;
      }
    }

    // If action is QUERY, extract SQL or MongoDB query
    if (result.action === 'QUERY') {
      // Try to extract SQL query with multiple patterns
      let sqlMatch = text.match(/SQL:\s*([\s\S]+?)(?=REASONING:|ACTION:|$)/i);
      if (!sqlMatch) {
        // Try code block patterns
        sqlMatch = text.match(/```sql\s*([\s\S]+?)\s*```/i) ||
                   text.match(/```\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER[\s\S]+?)\s*```/i);
      }
      if (!sqlMatch) {
        // Try to find SQL-like statements directly
        sqlMatch = text.match(/(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)[\s\S]+?;?/i);
      }

      if (sqlMatch) {
        // Clean up the SQL - remove any markdown formatting
        let sql = sqlMatch[1].trim();
        sql = sql.replace(/```sql\s*|\s*```/g, ''); // Remove SQL markdown markers
        sql = sql.replace(/```\s*|\s*```/g, ''); // Remove generic markdown markers
        sql = sql.replace(/^\s*SQL:\s*/i, ''); // Remove SQL: prefix if present
        result.sql = sql;
      }

      // Try to extract MongoDB query with multiple patterns
      let queryMatch = text.match(/QUERY:\s*([\s\S]+?)(?=REASONING:|ACTION:|$)/i);
      if (!queryMatch) {
        // Try code block patterns
        queryMatch = text.match(/```javascript\s*([\s\S]+?)\s*```/i) ||
                     text.match(/```js\s*([\s\S]+?)\s*```/i) ||
                     text.match(/```\s*(db\.[\s\S]+?)\s*```/i);
      }
      if (!queryMatch) {
        // Try to find MongoDB-like statements directly
        queryMatch = text.match(/(db\.[\w]+\.(?:find|aggregate|insertOne|updateOne|deleteOne|count)[\s\S]*)/i);
      }

      if (queryMatch) {
        // Clean up the query - remove any markdown formatting
        let query = queryMatch[1].trim();
        query = query.replace(/```javascript\s*|\s*```/g, ''); // Remove JS markdown markers
        query = query.replace(/```js\s*|\s*```/g, ''); // Remove JS markdown markers
        query = query.replace(/```\s*|\s*```/g, ''); // Remove generic markdown markers
        query = query.replace(/^\s*QUERY:\s*/i, ''); // Remove QUERY: prefix if present
        result.query = query;
      }

      // Extract reasoning
      const reasoningMatch = text.match(/REASONING:\s*([\s\S]+?)(?=ACTION:|$)/i);
      if (reasoningMatch) {
        result.reasoning = reasoningMatch[1].trim();
      }
    }

    // If action is ANSWER, extract response
    if (result.action === 'ANSWER') {
      let responseMatch = text.match(/RESPONSE:\s*([\s\S]+)$/i);
      if (!responseMatch) {
        // If no RESPONSE: tag found, use the entire text after cleaning
        responseMatch = text.match(/ACTION:\s*ANSWER\s*([\s\S]+)$/i);
      }
      if (responseMatch) {
        result.response = responseMatch[1].trim();
      } else if (!result.response) {
        // Fallback: use the entire text if it seems like an answer
        result.response = text.trim();
      }
    }

    console.log('Parsed result:', result);
    return result;
  }

  /**
   * Process the question using the AI service with an iterative approach
   * @param {Object} dbClient - Database client
   * @param {string} systemPrompt - System prompt with schema information
   * @param {string} question - User's question
   * @param {Object} connection - Connection details
   * @returns {Object} - Final answer and metadata
   */
  async processWithAI(dbClient, systemPrompt, question, connection) {
    let iterations = 0;
    let currentPrompt = `${question}`;
    const queryResults = [];
    const motorType = connection.motor.nombre.toLowerCase();

    while (iterations < this.maxIterations) {
      iterations++;

      try {
        // Add query results to the prompt if available
        if (queryResults.length > 0) {
          currentPrompt += "\n\nPrevious queries and results:\n";
          for (let i = 0; i < queryResults.length; i++) {
            if (motorType.includes('mongo')) {
              currentPrompt += `Query ${i + 1}: ${queryResults[i].query}\n`;
            } else {
              currentPrompt += `Query ${i + 1}: ${queryResults[i].sql}\n`;
            }

            if (queryResults[i].error) {
              currentPrompt += `Error: ${queryResults[i].error}\n`;
            } else {
              currentPrompt += `Result: ${JSON.stringify(queryResults[i].result, null, 2)}\n`;
            }

            if (queryResults[i].reasoning) {
              currentPrompt += `Reasoning: ${queryResults[i].reasoning}\n`;
            }

            currentPrompt += "\n";
          }
        }

        // Call the AI service
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: currentPrompt }
          ],
          temperature: 0.1, // Lower temperature for more precise SQL
          max_tokens: 2000
        });

        // Log API call info
        console.log('OpenAI API call info:', {
          model: this.model,
          iteration: iterations,
          promptLength: currentPrompt.length,
          hasCompletion: !!completion,
          hasChoices: !!completion?.choices,
          choicesLength: completion?.choices?.length || 0
        });

        const aiResponse = completion.choices[0].message.content;

        // Log the raw AI response for debugging
        console.log('Raw AI response:', {
          length: aiResponse?.length || 0,
          preview: aiResponse?.substring(0, 200) || 'null/undefined',
          iteration: iterations,
          question: currentPrompt.substring(0, 100)
        });

        // Validate AI response
        if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
          throw new Error('La IA devolvió una respuesta vacía o inválida');
        }

        // Parse the AI response
        const parsed = this.parseAIResponse(aiResponse);

        // If the AI wants to run a query
        if (parsed.action === 'QUERY') {
          // Execute the query
          let queryResult;
          let queryError = null;

          try {
            if (motorType.includes('mongo')) {
              if (!parsed.query) {
                throw new Error('La consulta MongoDB no es válida');
              }

              // Execute MongoDB query
              // Note: This is potentially unsafe and would need proper sandboxing in production
              // Typically, you'd want to parse the query and execute it safely
              const db = dbClient.pool.db(connection.database_name);

              // Simple eval for demonstration - in production, use a safer approach
              const mongoQuery = new Function('db', `return (async () => { return ${parsed.query} })();`);
              queryResult = await mongoQuery(db);
            } else {
              if (!parsed.sql) {
                throw new Error('La consulta SQL no es válida');
              }

              // Execute SQL query based on the database type
              if (motorType.includes('mysql') || motorType.includes('mariadb')) {
                const [rows] = await dbClient.pool.query(parsed.sql);
                queryResult = rows;
              }
              else if (motorType.includes('postgres')) {
                const result = await dbClient.pool.query(parsed.sql);
                queryResult = result.rows;
              }
              else if (motorType.includes('sql server')) {
                const result = await dbClient.pool.request().query(parsed.sql);
                queryResult = result.recordset;
              }
              else if (motorType.includes('oracle')) {
                const result = await dbClient.pool.execute(
                  parsed.sql,
                  [],
                  { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );
                queryResult = result.rows;
              }
            }

            // Add the successful query and result to the history
            queryResults.push({
              sql: parsed.sql,
              query: parsed.query,
              result: queryResult,
              reasoning: parsed.reasoning
            });
          } catch (error) {
            console.error('Query execution error:', error);

            // Add the failed query to the history
            queryResults.push({
              sql: parsed.sql,
              query: parsed.query,
              error: error.message,
              reasoning: parsed.reasoning
            });
          }

          // Continue to the next iteration
          continue;
        }

        // If the AI has a final answer
        if (parsed.action === 'ANSWER') {
          return {
            answer: parsed.response,
            metadata: {
              iterations,
              queriesExecuted: queryResults.length,
              queries: queryResults
            }
          };
        }

        // If the AI response doesn't match the expected format, try to provide a helpful response
        console.error('AI response format not recognized:', {
          aiResponse: aiResponse,
          parsed: parsed,
          iterations: iterations,
          hasAction: !!parsed.action,
          hasSQL: !!parsed.sql,
          hasQuery: !!parsed.query,
          hasResponse: !!parsed.response
        });

        // Try to extract any useful information from the response
        if (aiResponse && aiResponse.trim().length > 0) {
          return {
            answer: `La IA proporcionó la siguiente respuesta: ${aiResponse.trim()}. Si esto no responde tu pregunta, intenta reformularla de manera más específica.`,
            metadata: {
              iterations,
              queriesExecuted: queryResults.length,
              queries: queryResults,
              rawResponse: aiResponse,
              parseResult: parsed,
              error: 'Formato de respuesta no reconocido'
            }
          };
        }

        throw new Error('La respuesta de la IA no tiene el formato esperado y está vacía');
      } catch (error) {
        console.error('Error in AI processing:', {
          message: error.message,
          stack: error.stack,
          iteration: iterations,
          queriesExecuted: queryResults.length,
          motorType: motorType
        });

        return {
          answer: `Lo siento, no pude procesar tu consulta debido a un error: ${error.message}`,
          metadata: {
            error: error.message,
            errorType: error.constructor.name,
            iterations,
            queriesExecuted: queryResults.length,
            queries: queryResults,
            motorType: motorType
          }
        };
      }
    }

    // If we reach the maximum number of iterations without an answer
    return {
      answer: 'Lo siento, no pude encontrar una respuesta a tu consulta después de varios intentos. Por favor, intenta reformular tu pregunta.',
      metadata: {
        error: 'Máximo número de iteraciones alcanzado',
        iterations,
        queriesExecuted: queryResults.length,
        queries: queryResults
      }
    };
  }
}

module.exports = new AIService();
