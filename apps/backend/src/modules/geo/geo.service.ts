import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class GeoService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUsersWithinRadius(lat: number, lng: number, radiusKm: number): Promise<string[]> {
    const rows = await this.dataSource.query(
      `
      SELECT ul."userId"
      FROM user_locations ul
      WHERE ST_DWithin(
        ST_MakePoint(ul.longitude::float8, ul.latitude::float8)::geography,
        ST_MakePoint($1::float8, $2::float8)::geography,
        $3::float8
      )
      `,
      [lng, lat, radiusKm * 1000],
    );
    return rows.map((r: { userId: string }) => r.userId);
  }

  async findCasesNearUser(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<Array<{ id: string; distanceKm: number }>> {
    const rows = await this.dataSource.query(
      `
      SELECT
        lpc.id,
        ROUND(
          (ST_Distance(
            ST_MakePoint(lpc."lastSeenLongitude"::float8, lpc."lastSeenLatitude"::float8)::geography,
            ST_MakePoint($1::float8, $2::float8)::geography
          ) / 1000.0)::numeric,
          2
        ) AS distance_km
      FROM lost_pet_cases lpc
      WHERE lpc.status = 'ACTIVE'
        AND lpc."lastSeenLatitude" IS NOT NULL
        AND lpc."lastSeenLongitude" IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint(lpc."lastSeenLongitude"::float8, lpc."lastSeenLatitude"::float8)::geography,
          ST_MakePoint($1::float8, $2::float8)::geography,
          $3::float8
        )
      ORDER BY distance_km ASC
      `,
      [lng, lat, radiusKm * 1000],
    );
    return rows.map((r: { id: string; distance_km: string }) => ({
      id: r.id,
      distanceKm: parseFloat(r.distance_km),
    }));
  }
}
