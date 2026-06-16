import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class GeoService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUsersWithinRadius(lat: number, lng: number, radiusKm: number): Promise<string[]> {
    const rows = await this.dataSource.query(
      `
      SELECT ul.user_id
      FROM user_locations ul
      WHERE ST_DWithin(
        ST_MakePoint(ul.longitude, ul.latitude)::geography,
        ST_MakePoint($1, $2)::geography,
        $3
      )
      `,
      [lng, lat, radiusKm * 1000],
    );
    return rows.map((r: { user_id: string }) => r.user_id);
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
          ST_Distance(
            ST_MakePoint(lpc.last_seen_longitude, lpc.last_seen_latitude)::geography,
            ST_MakePoint($1, $2)::geography
          ) / 1000.0,
          2
        ) AS distance_km
      FROM lost_pet_cases lpc
      WHERE lpc.status = 'ACTIVE'
        AND ST_DWithin(
          ST_MakePoint(lpc.last_seen_longitude, lpc.last_seen_latitude)::geography,
          ST_MakePoint($1, $2)::geography,
          $3
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
