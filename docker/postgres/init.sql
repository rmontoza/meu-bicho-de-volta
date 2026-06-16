-- Habilita extensão PostGIS para suporte geoespacial
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Confirma instalação
SELECT PostGIS_Version();
