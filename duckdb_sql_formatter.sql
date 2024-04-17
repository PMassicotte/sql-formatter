-- https://duckdb.org/docs/sql/duckdb_table_functions#duckdb_types
SELECT DISTINCT
  UPPER(keyword_name) AS keyword_name
FROM
  duckdb_keywords ();

SELECT DISTINCT
  UPPER(type_name) AS type_name
FROM
  duckdb_types
ORDER BY
  type_name;

SELECT DISTINCT
  UPPER(function_name) AS function_name
FROM
  duckdb_functions ()
WHERE
  regexp_matches (function_name, '^[a-z]')
ORDER BY
  function_name;
