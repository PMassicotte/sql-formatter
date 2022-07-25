import { expandPhrases } from 'src/expandPhrases';
import Formatter from 'src/formatter/Formatter';
import Tokenizer from 'src/lexer/Tokenizer';
import { functions } from './db2.functions';
import { keywords } from './db2.keywords';

// https://www.ibm.com/docs/en/db2-for-zos/11?topic=statements-list-supported
const reservedCommands = [
  'ALLOCATE CURSOR',
  'ALTER DATABASE',
  'ALTER FUNCTION',
  'ALTER INDEX',
  'ALTER MASK',
  'ALTER PERMISSION',
  'ALTER PROCEDURE',
  'ALTER SEQUENCE',
  'ALTER STOGROUP',
  'ALTER TABLE',
  'ALTER TABLESPACE',
  'ALTER TRIGGER',
  'ALTER TRUSTED CONTEXT',
  'ALTER VIEW',
  'ASSOCIATE LOCATORS',
  'BEGIN DECLARE SECTION',
  'CALL',
  'CLOSE',
  'COMMENT',
  'COMMIT',
  'CONNECT',
  'CREATE ALIAS',
  'CREATE AUXILIARY TABLE',
  'CREATE DATABASE',
  'CREATE FUNCTION',
  'CREATE GLOBAL TEMPORARY TABLE',
  'CREATE INDEX',
  'CREATE LOB TABLESPACE',
  'CREATE MASK',
  'CREATE PERMISSION',
  'CREATE PROCEDURE',
  'CREATE ROLE',
  'CREATE SEQUENCE',
  'CREATE STOGROUP',
  'CREATE SYNONYM',
  'CREATE TABLE',
  'CREATE TABLESPACE',
  'CREATE TRIGGER',
  'CREATE TRUSTED CONTEXT',
  'CREATE TYPE',
  'CREATE VARIABLE',
  'CREATE VIEW',
  'DECLARE CURSOR',
  'DECLARE GLOBAL TEMPORARY TABLE',
  'DECLARE STATEMENT',
  'DECLARE TABLE',
  'DECLARE VARIABLE',
  'DELETE',
  'DELETE FROM',
  'DESCRIBE CURSOR',
  'DESCRIBE INPUT',
  'DESCRIBE OUTPUT',
  'DESCRIBE PROCEDURE',
  'DESCRIBE TABLE',
  'DROP',
  'END DECLARE SECTION',
  'EXCHANGE',
  'EXECUTE',
  'EXECUTE IMMEDIATE',
  'EXPLAIN',
  'FETCH',
  'FREE LOCATOR',
  'GET DIAGNOSTICS',
  'GRANT',
  'HOLD LOCATOR',
  'INCLUDE',
  'INSERT',
  'LABEL',
  'LOCK TABLE',
  'MERGE',
  'OPEN',
  'PREPARE',
  'REFRESH',
  'RELEASE',
  'RELEASE SAVEPOINT',
  'RENAME',
  'REVOKE',
  'ROLLBACK',
  'SAVEPOINT',
  'SELECT',
  'SELECT INTO',
  'SET CONNECTION',
  'SET',
  'SET CURRENT ACCELERATOR',
  'SET CURRENT APPLICATION COMPATIBILITY',
  'SET CURRENT APPLICATION ENCODING SCHEME',
  'SET CURRENT DEBUG MODE',
  'SET CURRENT DECFLOAT ROUNDING MODE',
  'SET CURRENT DEGREE',
  'SET CURRENT EXPLAIN MODE',
  'SET CURRENT GET_ACCEL_ARCHIVE',
  'SET CURRENT LOCALE LC_CTYPE',
  'SET CURRENT MAINTAINED TABLE TYPES FOR OPTIMIZATION',
  'SET CURRENT OPTIMIZATION HINT',
  'SET CURRENT PACKAGE PATH',
  'SET CURRENT PACKAGESET',
  'SET CURRENT PRECISION',
  'SET CURRENT QUERY ACCELERATION',
  'SET CURRENT QUERY ACCELERATION WAITFORDATA',
  'SET CURRENT REFRESH AGE',
  'SET CURRENT ROUTINE VERSION',
  'SET CURRENT RULES',
  'SET CURRENT SQLID',
  'SET CURRENT TEMPORAL BUSINESS_TIME',
  'SET CURRENT TEMPORAL SYSTEM_TIME',
  'SET ENCRYPTION PASSWORD',
  'SET PATH',
  'SET SCHEMA',
  'SET SESSION TIME ZONE',
  'SIGNAL',
  'TRUNCATE',
  'UPDATE',
  'VALUES',
  'VALUES INTO',
  'WHENEVER',
  // other
  'ADD',
  'ALTER COLUMN', // verify
  'AFTER',
  'DROP TABLE', // verify
  'FETCH FIRST',
  'FROM',
  'GROUP BY',
  'GO',
  'HAVING',
  'INSERT INTO',
  'LIMIT',
  'OFFSET',
  'ORDER BY',
  'SELECT',
  'SET CURRENT SCHEMA',
  'WHERE',
  'WITH',
];

const reservedBinaryCommands = expandPhrases([
  'INTERSECT [ALL | DISTINCT]',
  'UNION [ALL | DISTINCT]',
  'EXCEPT [ALL | DISTINCT]',
]);

const reservedJoins = expandPhrases([
  'JOIN',
  '{LEFT | RIGHT | FULL} [OUTER] JOIN',
  '{INNER | CROSS} JOIN',
]);

// https://www.ibm.com/support/knowledgecenter/en/ssw_ibm_i_72/db2/rbafzintro.htm
export default class Db2Formatter extends Formatter {
  static operators = ['**', '¬=', '¬>', '¬<', '!>', '!<', '||'];

  tokenizer() {
    return new Tokenizer({
      reservedCommands,
      reservedBinaryCommands,
      reservedJoins,
      reservedDependentClauses: ['WHEN', 'ELSE', 'ELSEIF'],
      reservedKeywords: keywords,
      reservedFunctionNames: functions,
      stringTypes: [{ quote: "''", prefixes: ['G', 'N', 'X', 'BX', 'GX', 'UX', 'U&'] }],
      identTypes: [`""`],
      positionalParams: true,
      namedParamTypes: [':'],
      paramChars: { first: '@#$', rest: '@#$' },
      operators: Db2Formatter.operators,
    });
  }
}
