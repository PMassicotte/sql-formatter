// -----------------------------------------------------------------------------
// TDODO: This was copied from the sparksql dialect. It needs to be updated to
// match the duckdb dialect.
// -----------------------------------------------------------------------------

import { DialectOptions } from '../../dialect.js';
import { expandPhrases } from '../../expandPhrases.js';
import { EOF_TOKEN, isToken, Token, TokenType } from '../../lexer/token.js';
import { dataTypes, keywords } from './duckdb.keywords.js';
import { functions } from './duckdb.functions.js';

const reservedSelect = expandPhrases([
  'SELECT [ALL | DISTINCT | EXCLUDE | REPLACE]',
]);

const reservedClauses = expandPhrases([
  'CLUSTER BY',
  'DISTRIBUTE BY',
  'FROM',
  'GROUP BY',
  'HAVING',
  'INSERT OVERWRITE [LOCAL] DIRECTORY',
  'INSERT [INTO | OVERWRITE] [TABLE]',
  'LIMIT',
  'LOAD DATA [LOCAL] INPATH',
  'ORDER BY',
  'PARTITION BY',
  'SORT BY',
  'VALUES',
  'WHERE',
  'WINDOW',
  'WITH',
  '[OVERWRITE] INTO TABLE',
]);

const standardOnelineClauses = expandPhrases([
  'CREATE [EXTERNAL] TABLE [IF NOT EXISTS]',
]);

const tabularOnelineClauses = expandPhrases([
  'ADD COLUMNS',
  'ADD FILE',
  'ADD JAR',
  'ALTER COLUMN',
  'ALTER TABLE',
  'ALTER VIEW',
  'ANALYZE TABLE',
  'CACHE TABLE',
  'CLEAR CACHE',
  'CREATE DATABASE',
  'CREATE FUNCTION',
  'CREATE [OR REPLACE] [GLOBAL TEMPORARY | TEMPORARY] VIEW [IF NOT EXISTS]',
  'DESCRIBE DATABASE',
  'DESCRIBE FUNCTION',
  'DESCRIBE QUERY',
  'DESCRIBE TABLE',
  'DROP DATABASE',
  'DROP FUNCTION',
  'DROP TABLE [IF EXISTS]',
  'DROP VIEW',
  'DROP {COLUMN | COLUMNS}',
  'EXPLAIN',
  'INSTALL',
  'LIST FILE',
  'LIST JAR',
  'PIVOT',
  'REFRESH FUNCTION',
  'REFRESH TABLE',
  'REFRESH',
  'RENAME COLUMN',
  'RENAME TO',
  'REPAIR TABLE',
  'RESET',
  'SHOW COLUMNS',
  'SHOW CREATE TABLE',
  'SHOW DATABASES',
  'SHOW TABLES',
  'SHOW VIEWS',
  'TABLESAMPLE',
  'TRANSFORM',
  'UNCACHE TABLE',
  'UNPIVOT',
  'USE DATABASE',
]);

// Looks good for duckdb
const reservedSetOperations = expandPhrases([
  'EXCEPT [ALL | DISTINCT]',
  'INTERSECT [ALL | DISTINCT]',
  'UNION [ALL | DISTINCT]',
]);

const reservedJoins = expandPhrases([
  'ASOF {LEFT} JOIN',
  'JOIN',
  'NATURAL [INNER] JOIN',
  'NATURAL [LEFT] {ANTI | SEMI} JOIN',
  'NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN',
  'POSITIONAL JOIN',
  '[LEFT] {ANTI | SEMI} JOIN',
  '{INNER | CROSS} JOIN',
  '{LEFT | RIGHT | FULL} [OUTER] JOIN',
]);

const reservedPhrases = expandPhrases([
  'CURRENT ROW',
  'ON DELETE',
  'ON UPDATE',
  '{ROWS | RANGE} BETWEEN',
]);

// http://spark.apache.org/docs/latest/sql-programming-guide.html
export const duckdb: DialectOptions = {
  name: 'duckdb',
  tokenizerOptions: {
    reservedSelect,
    reservedClauses: [
      ...reservedClauses,
      ...standardOnelineClauses,
      ...tabularOnelineClauses,
    ],
    reservedSetOperations,
    reservedJoins,
    reservedPhrases,
    supportsXor: true,
    reservedKeywords: keywords,
    reservedDataTypes: dataTypes,
    reservedFunctionNames: functions,
    extraParens: ['[]'],
    stringTypes: [
      "''-bs",
      '""-bs',
      { quote: "''-raw", prefixes: ['R', 'X'], requirePrefix: true },
      { quote: '""-raw', prefixes: ['R', 'X'], requirePrefix: true },
    ],
    identTypes: ['``'],
    variableTypes: [{ quote: '{}', prefixes: ['$'], requirePrefix: true }],
    operators: ['%', '~', '^', '|', '&', '<=>', '==', '!', '||', '->'],
    postProcess,
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses, ...tabularOnelineClauses],
    tabularOnelineClauses,
  },
};

function postProcess(tokens: Token[]) {
  return tokens.map((token, i) => {
    const prevToken = tokens[i - 1] || EOF_TOKEN;
    const nextToken = tokens[i + 1] || EOF_TOKEN;

    // [WINDOW](...)
    if (isToken.WINDOW(token) && nextToken.type === TokenType.OPEN_PAREN) {
      // This is a function call, treat it as a reserved function name
      return { ...token, type: TokenType.RESERVED_FUNCTION_NAME };
    }

    // TODO: deprecate this once ITEMS is merged with COLLECTION
    if (token.text === 'ITEMS' && token.type === TokenType.RESERVED_KEYWORD) {
      if (
        !(prevToken.text === 'COLLECTION' && nextToken.text === 'TERMINATED')
      ) {
        // this is a word and nst COLLECTION ITEMS
        return { ...token, type: TokenType.IDENTIFIER, text: token.raw };
      }
    }

    return token;
  });
}
