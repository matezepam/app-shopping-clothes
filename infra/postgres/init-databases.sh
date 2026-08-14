#!/bin/sh
set -eu

: "${POSTGRES_USER:?POSTGRES_USER es requerido}"
: "${PGPASSWORD:?PGPASSWORD es requerido}"
: "${IDENTITY_DATABASE:?IDENTITY_DATABASE es requerido}"
: "${COMMERCE_DATABASE:?COMMERCE_DATABASE es requerido}"

validate_identifier() {
  case "$1" in
    ''|*[!a-zA-Z0-9_]*)
      echo "Nombre de base de datos no permitido: $1" >&2
      exit 1
      ;;
  esac
}

create_database_if_missing() {
  database="$1"
  validate_identifier "$database"

  exists="$(psql -h postgres -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$database'")"
  if [ "$exists" != "1" ]; then
    psql -h postgres -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
      -c "CREATE DATABASE \"$database\" OWNER \"$POSTGRES_USER\""
  fi
}

create_database_if_missing "$IDENTITY_DATABASE"
create_database_if_missing "$COMMERCE_DATABASE"

echo "Bases listas: $IDENTITY_DATABASE y $COMMERCE_DATABASE"
