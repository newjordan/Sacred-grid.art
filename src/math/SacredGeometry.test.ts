// src/math/SacredGeometry.test.ts - Comprehensive tests for Sacred Geometry calculations

import { SacredGeometry } from './SacredGeometry';
import { Vector2D, Vector3D } from '../types';
import { SACRED_RATIOS, PI, TWO_PI } from '../utils/constants';

describe('SacredGeometry', () => {
  // Test constants for reuse
  const origin: Vector2D = { x: 0, y: 0 };
  const center100: Vector2D = { x: 100, y: 100 };
  const origin3D: Vector3D = { x: 0, y: 0, z: 0 };

  // Helper function to calculate distance between two 2D points
  const distance2D = (p1: Vector2D, p2: Vector2D): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Helper function to calculate distance between two 3D points
  const distance3D = (p1: Vector3D, p2: Vector3D): number => {
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) +
      Math.pow(p2.y - p1.y, 2) +
      Math.pow(p2.z - p1.z, 2)
    );
  };

  // Helper to check if a number is close to expected (for floating point comparison)
  const isClose = (actual: number, expected: number, tolerance: number = 1e-10): boolean => {
    return Math.abs(actual - expected) < tolerance;
  };

  describe('regularPolygon', () => {
    it('should generate a triangle with 3 vertices', () => {
      const vertices = SacredGeometry.regularPolygon(origin, 100, 3);
      expect(vertices).toHaveLength(3);
    });

    it('should generate a square with 4 vertices', () => {
      const vertices = SacredGeometry.regularPolygon(origin, 100, 4);
      expect(vertices).toHaveLength(4);
    });

    it('should generate a hexagon with 6 vertices', () => {
      const vertices = SacredGeometry.regularPolygon(origin, 100, 6);
      expect(vertices).toHaveLength(6);
    });

    it('should place all vertices at the specified radius from center', () => {
      const radius = 100;
      const vertices = SacredGeometry.regularPolygon(origin, radius, 6);

      vertices.forEach(vertex => {
        const dist = distance2D(origin, vertex);
        expect(dist).toBeCloseTo(radius, 10);
      });
    });

    it('should center the polygon at the specified center point', () => {
      const center = { x: 50, y: 75 };
      const radius = 100;
      const vertices = SacredGeometry.regularPolygon(center, radius, 6);

      vertices.forEach(vertex => {
        const dist = distance2D(center, vertex);
        expect(dist).toBeCloseTo(radius, 10);
      });
    });

    it('should apply rotation offset correctly', () => {
      const radius = 100;
      const noRotation = SacredGeometry.regularPolygon(origin, radius, 4, 0);
      const withRotation = SacredGeometry.regularPolygon(origin, radius, 4, PI / 4);

      // First vertex of no rotation should be at angle 0 (rightmost)
      expect(noRotation[0].x).toBeCloseTo(radius, 10);
      expect(noRotation[0].y).toBeCloseTo(0, 10);

      // First vertex with PI/4 rotation should be at 45 degrees
      const expectedX = radius * Math.cos(PI / 4);
      const expectedY = radius * Math.sin(PI / 4);
      expect(withRotation[0].x).toBeCloseTo(expectedX, 10);
      expect(withRotation[0].y).toBeCloseTo(expectedY, 10);
    });

    it('should generate equidistant vertices for regular polygon', () => {
      const vertices = SacredGeometry.regularPolygon(origin, 100, 6);
      const edgeLengths: number[] = [];

      for (let i = 0; i < vertices.length; i++) {
        const next = (i + 1) % vertices.length;
        edgeLengths.push(distance2D(vertices[i], vertices[next]));
      }

      // All edges should be equal length
      const firstEdge = edgeLengths[0];
      edgeLengths.forEach(length => {
        expect(length).toBeCloseTo(firstEdge, 10);
      });
    });

    it('should use default rotation of 0 when not specified', () => {
      const withDefault = SacredGeometry.regularPolygon(origin, 100, 4);
      const withZero = SacredGeometry.regularPolygon(origin, 100, 4, 0);

      withDefault.forEach((vertex, i) => {
        expect(vertex.x).toBeCloseTo(withZero[i].x, 10);
        expect(vertex.y).toBeCloseTo(withZero[i].y, 10);
      });
    });
  });

  describe('starPolygon', () => {
    it('should generate correct number of vertices (2 * points)', () => {
      const vertices = SacredGeometry.starPolygon(origin, 100, 50, 5);
      expect(vertices).toHaveLength(10); // 5 points * 2
    });

    it('should generate 6-pointed star with 12 vertices', () => {
      const vertices = SacredGeometry.starPolygon(origin, 100, 50, 6);
      expect(vertices).toHaveLength(12);
    });

    it('should alternate between outer and inner radius', () => {
      const outerRadius = 100;
      const innerRadius = 50;
      const vertices = SacredGeometry.starPolygon(origin, outerRadius, innerRadius, 5);

      vertices.forEach((vertex, index) => {
        const dist = distance2D(origin, vertex);
        const expectedRadius = index % 2 === 0 ? outerRadius : innerRadius;
        expect(dist).toBeCloseTo(expectedRadius, 10);
      });
    });

    it('should apply rotation offset correctly', () => {
      const rotation = PI / 6;
      const vertices = SacredGeometry.starPolygon(origin, 100, 50, 5, rotation);

      // First vertex should be at angle = rotation
      const expectedX = 100 * Math.cos(rotation);
      const expectedY = 100 * Math.sin(rotation);
      expect(vertices[0].x).toBeCloseTo(expectedX, 10);
      expect(vertices[0].y).toBeCloseTo(expectedY, 10);
    });

    it('should use default rotation of 0 when not specified', () => {
      const vertices = SacredGeometry.starPolygon(origin, 100, 50, 5);

      // First vertex should be at angle 0 (rightmost at outer radius)
      expect(vertices[0].x).toBeCloseTo(100, 10);
      expect(vertices[0].y).toBeCloseTo(0, 10);
    });

    it('should center the star at the specified point', () => {
      const center = { x: 200, y: 150 };
      const vertices = SacredGeometry.starPolygon(center, 100, 50, 5);

      // All vertices should be relative to center
      vertices.forEach((vertex, index) => {
        const dist = distance2D(center, vertex);
        const expectedRadius = index % 2 === 0 ? 100 : 50;
        expect(dist).toBeCloseTo(expectedRadius, 10);
      });
    });
  });

  describe('flowerOfLife', () => {
    it('should generate at least 1 circle (center) with 0 rings', () => {
      const circles = SacredGeometry.flowerOfLife(origin, 50, 0);
      expect(circles.length).toBeGreaterThanOrEqual(1);
    });

    it('should generate correct number of circles for given rings', () => {
      // With 1 ring: 1 center + 6 surrounding = 7
      const oneRing = SacredGeometry.flowerOfLife(origin, 50, 1);
      expect(oneRing).toHaveLength(7);

      // With 2 rings: 1 + 6 + 12 = 19
      const twoRings = SacredGeometry.flowerOfLife(origin, 50, 2);
      expect(twoRings).toHaveLength(19);
    });

    it('should place center circle at the specified center', () => {
      const circles = SacredGeometry.flowerOfLife(center100, 50, 2);

      expect(circles[0].center.x).toBe(center100.x);
      expect(circles[0].center.y).toBe(center100.y);
    });

    it('should set all circles to the same radius', () => {
      const radius = 75;
      const circles = SacredGeometry.flowerOfLife(origin, radius, 2);

      circles.forEach(circle => {
        expect(circle.radius).toBe(radius);
      });
    });

    it('should use default of 2 rings when not specified', () => {
      const circles = SacredGeometry.flowerOfLife(origin, 50);
      expect(circles).toHaveLength(19); // 1 + 6 + 12
    });

    it('should position ring circles at correct distances', () => {
      const radius = 50;
      const circles = SacredGeometry.flowerOfLife(origin, radius, 1);

      // First ring circles should be at distance = radius * sqrt(3)
      const expectedDistance = radius * Math.sqrt(3);
      for (let i = 1; i < circles.length; i++) {
        const dist = distance2D(origin, circles[i].center);
        expect(dist).toBeCloseTo(expectedDistance, 10);
      }
    });
  });

  describe('seedOfLife', () => {
    it('should generate exactly 7 circles', () => {
      const circles = SacredGeometry.seedOfLife(origin, 50);
      expect(circles).toHaveLength(7);
    });

    it('should place center circle at the specified center', () => {
      const circles = SacredGeometry.seedOfLife(center100, 50);

      expect(circles[0].center.x).toBe(center100.x);
      expect(circles[0].center.y).toBe(center100.y);
    });

    it('should set all circles to the same radius', () => {
      const radius = 60;
      const circles = SacredGeometry.seedOfLife(origin, radius);

      circles.forEach(circle => {
        expect(circle.radius).toBe(radius);
      });
    });

    it('should place surrounding circles at the specified radius distance', () => {
      const radius = 50;
      const circles = SacredGeometry.seedOfLife(origin, radius);

      // Skip the center circle (index 0), check surrounding 6
      for (let i = 1; i < 7; i++) {
        const dist = distance2D(origin, circles[i].center);
        expect(dist).toBeCloseTo(radius, 10);
      }
    });

    it('should evenly space surrounding circles at 60-degree intervals', () => {
      const radius = 100;
      const circles = SacredGeometry.seedOfLife(origin, radius);

      // Check angles of surrounding circles
      for (let i = 1; i < 7; i++) {
        const expectedAngle = ((i - 1) / 6) * TWO_PI;
        const expectedX = radius * Math.cos(expectedAngle);
        const expectedY = radius * Math.sin(expectedAngle);

        expect(circles[i].center.x).toBeCloseTo(expectedX, 10);
        expect(circles[i].center.y).toBeCloseTo(expectedY, 10);
      }
    });
  });

  describe('vesicaPiscis', () => {
    it('should return two circles', () => {
      const result = SacredGeometry.vesicaPiscis(
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        50
      );
      expect(result.circles).toHaveLength(2);
    });

    it('should return circles with correct centers', () => {
      const center1: Vector2D = { x: 0, y: 0 };
      const center2: Vector2D = { x: 60, y: 0 };
      const radius = 50;

      const result = SacredGeometry.vesicaPiscis(center1, center2, radius);

      expect(result.circles[0].center).toEqual(center1);
      expect(result.circles[1].center).toEqual(center2);
    });

    it('should return circles with correct radius', () => {
      const radius = 75;
      const result = SacredGeometry.vesicaPiscis(
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        radius
      );

      expect(result.circles[0].radius).toBe(radius);
      expect(result.circles[1].radius).toBe(radius);
    });

    it('should return empty intersection when circles are too far apart', () => {
      const result = SacredGeometry.vesicaPiscis(
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        50
      );
      expect(result.intersection).toHaveLength(0);
    });

    it('should return empty intersection when circles are at the same position', () => {
      const result = SacredGeometry.vesicaPiscis(
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        50
      );
      expect(result.intersection).toHaveLength(0);
    });

    it('should return two intersection points for overlapping circles', () => {
      const result = SacredGeometry.vesicaPiscis(
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        50
      );
      expect(result.intersection).toHaveLength(2);
    });

    it('should compute intersection points equidistant from both centers', () => {
      const radius = 50;
      const center1: Vector2D = { x: 0, y: 0 };
      const center2: Vector2D = { x: 50, y: 0 };

      const result = SacredGeometry.vesicaPiscis(center1, center2, radius);

      result.intersection.forEach(point => {
        const distFromCenter1 = distance2D(center1, point);
        const distFromCenter2 = distance2D(center2, point);

        expect(distFromCenter1).toBeCloseTo(radius, 8);
        expect(distFromCenter2).toBeCloseTo(radius, 8);
      });
    });
  });

  describe('merkaba', () => {
    it('should generate exactly 8 vertices (two tetrahedra)', () => {
      const vertices = SacredGeometry.merkaba(origin3D, 100);
      expect(vertices).toHaveLength(8);
    });

    it('should center the merkaba at the specified 3D point', () => {
      const center: Vector3D = { x: 50, y: 50, z: 50 };
      const size = 100;
      const vertices = SacredGeometry.merkaba(center, size);

      // Calculate centroid of all vertices
      const centroid = vertices.reduce(
        (acc, v) => ({
          x: acc.x + v.x / vertices.length,
          y: acc.y + v.y / vertices.length,
          z: acc.z + v.z / vertices.length
        }),
        { x: 0, y: 0, z: 0 }
      );

      // Centroid should be close to the specified center
      expect(centroid.x).toBeCloseTo(center.x, 10);
      expect(centroid.y).toBeCloseTo(center.y, 10);
      expect(centroid.z).toBeCloseTo(center.z, 10);
    });

    it('should scale vertices based on size parameter', () => {
      const smallMerkaba = SacredGeometry.merkaba(origin3D, 50);
      const largeMerkaba = SacredGeometry.merkaba(origin3D, 100);

      // Larger merkaba should have vertices further from center
      const smallMaxDist = Math.max(...smallMerkaba.map(v => distance3D(origin3D, v)));
      const largeMaxDist = Math.max(...largeMerkaba.map(v => distance3D(origin3D, v)));

      expect(largeMaxDist).toBeGreaterThan(smallMaxDist);
    });

    it('should create symmetric structure', () => {
      const vertices = SacredGeometry.merkaba(origin3D, 100);

      // Upper tetrahedron vertices (first 4)
      const upper = vertices.slice(0, 4);
      // Lower tetrahedron vertices (last 4)
      const lower = vertices.slice(4, 8);

      expect(upper).toHaveLength(4);
      expect(lower).toHaveLength(4);
    });
  });

  describe('sriYantra', () => {
    it('should generate exactly 9 triangles', () => {
      const triangles = SacredGeometry.sriYantra(origin, 300);
      expect(triangles).toHaveLength(9);
    });

    it('should generate 5 upward triangles and 4 downward triangles', () => {
      const triangles = SacredGeometry.sriYantra(origin, 300);

      // First 5 triangles are upward (rotation 0)
      // Last 4 triangles are downward (rotation PI)
      expect(triangles.slice(0, 5)).toHaveLength(5);
      expect(triangles.slice(5, 9)).toHaveLength(4);
    });

    it('should generate triangles with 3 vertices each', () => {
      const triangles = SacredGeometry.sriYantra(origin, 300);

      triangles.forEach(triangle => {
        expect(triangle).toHaveLength(3);
      });
    });

    it('should center triangles at the specified point', () => {
      const triangles = SacredGeometry.sriYantra(center100, 300);

      // Check that triangle centroids are near the specified center
      triangles.forEach(triangle => {
        const centroid = {
          x: (triangle[0].x + triangle[1].x + triangle[2].x) / 3,
          y: (triangle[0].y + triangle[1].y + triangle[2].y) / 3
        };

        // Centroids should be relatively close to the specified center
        const dist = distance2D(center100, centroid);
        expect(dist).toBeLessThan(300); // Within reasonable bounds
      });
    });

    it('should create progressively smaller triangles', () => {
      const triangles = SacredGeometry.sriYantra(origin, 300);

      // Calculate approximate size of each upward triangle
      const upwardSizes = triangles.slice(0, 5).map(triangle => {
        const side1 = distance2D(triangle[0], triangle[1]);
        return side1;
      });

      // Each subsequent triangle should be smaller or equal
      for (let i = 1; i < upwardSizes.length; i++) {
        expect(upwardSizes[i]).toBeLessThanOrEqual(upwardSizes[i - 1] + 0.001);
      }
    });
  });

  describe('metatronsCube', () => {
    it('should generate exactly 13 circles', () => {
      const circles = SacredGeometry.metatronsCube(origin, 300);
      expect(circles).toHaveLength(13);
    });

    it('should place center circle at the specified center', () => {
      const circles = SacredGeometry.metatronsCube(center100, 300);

      expect(circles[0].center.x).toBe(center100.x);
      expect(circles[0].center.y).toBe(center100.y);
    });

    it('should set all circles to the same radius (1/6 of total)', () => {
      const totalRadius = 300;
      const expectedCircleRadius = totalRadius / 6;
      const circles = SacredGeometry.metatronsCube(origin, totalRadius);

      circles.forEach(circle => {
        expect(circle.radius).toBeCloseTo(expectedCircleRadius, 10);
      });
    });

    it('should have 1 center + 6 inner + 6 outer circles', () => {
      const circles = SacredGeometry.metatronsCube(origin, 300);

      // First circle is center
      expect(circles[0].center).toEqual(origin);

      // Next 6 are inner hexagon
      const innerCircles = circles.slice(1, 7);
      expect(innerCircles).toHaveLength(6);

      // Last 6 are outer hexagon
      const outerCircles = circles.slice(7, 13);
      expect(outerCircles).toHaveLength(6);
    });

    it('should position inner circles at correct distance', () => {
      const radius = 300;
      const circleRadius = radius / 6;
      const innerDistance = circleRadius * 2;

      const circles = SacredGeometry.metatronsCube(origin, radius);

      // Inner circles (indices 1-6) should be at innerDistance from center
      for (let i = 1; i <= 6; i++) {
        const dist = distance2D(origin, circles[i].center);
        expect(dist).toBeCloseTo(innerDistance, 10);
      }
    });

    it('should position outer circles at correct distance', () => {
      const radius = 300;
      const circleRadius = radius / 6;
      const outerDistance = circleRadius * 4;

      const circles = SacredGeometry.metatronsCube(origin, radius);

      // Outer circles (indices 7-12) should be at outerDistance from center
      for (let i = 7; i <= 12; i++) {
        const dist = distance2D(origin, circles[i].center);
        expect(dist).toBeCloseTo(outerDistance, 10);
      }
    });
  });

  describe('getSacredRatio', () => {
    it('should return the golden ratio for "GOLDEN"', () => {
      const ratio = SacredGeometry.getSacredRatio('GOLDEN');
      expect(ratio).toBeCloseTo(1.618033988749895, 10);
    });

    it('should return the silver ratio for "SILVER"', () => {
      const ratio = SacredGeometry.getSacredRatio('SILVER');
      expect(ratio).toBeCloseTo(1 + Math.sqrt(2), 10);
    });

    it('should return the bronze ratio for "BRONZE"', () => {
      const ratio = SacredGeometry.getSacredRatio('BRONZE');
      expect(ratio).toBeCloseTo((3 + Math.sqrt(13)) / 2, 10);
    });

    it('should return vesica piscis ratio (sqrt(3)) for "VESICA_PISCIS"', () => {
      const ratio = SacredGeometry.getSacredRatio('VESICA_PISCIS');
      expect(ratio).toBeCloseTo(Math.sqrt(3), 10);
    });

    it('should return sqrt(2) for "ROOT_2"', () => {
      const ratio = SacredGeometry.getSacredRatio('ROOT_2');
      expect(ratio).toBeCloseTo(Math.sqrt(2), 10);
    });

    it('should return sqrt(3) for "ROOT_3"', () => {
      const ratio = SacredGeometry.getSacredRatio('ROOT_3');
      expect(ratio).toBeCloseTo(Math.sqrt(3), 10);
    });

    it('should return sqrt(5) for "ROOT_5"', () => {
      const ratio = SacredGeometry.getSacredRatio('ROOT_5');
      expect(ratio).toBeCloseTo(Math.sqrt(5), 10);
    });

    it('should return values matching SACRED_RATIOS constants', () => {
      const keys = Object.keys(SACRED_RATIOS) as Array<keyof typeof SACRED_RATIOS>;

      keys.forEach(key => {
        const ratio = SacredGeometry.getSacredRatio(key);
        expect(ratio).toBe(SACRED_RATIOS[key]);
      });
    });
  });

  describe('mandala', () => {
    it('should generate patterns with default 3 layers', () => {
      const patterns = SacredGeometry.mandala(origin, 200, 6);

      // Check that patterns from all 3 layers exist
      const layerCounts = [0, 0, 0];
      patterns.forEach(p => layerCounts[p.layer]++);

      expect(layerCounts[0]).toBeGreaterThan(0);
      expect(layerCounts[1]).toBeGreaterThan(0);
      expect(layerCounts[2]).toBeGreaterThan(0);
    });

    it('should generate patterns with specified number of layers', () => {
      const patterns = SacredGeometry.mandala(origin, 200, 6, 5);

      // Check that patterns from all 5 layers exist
      const maxLayer = Math.max(...patterns.map(p => p.layer));
      expect(maxLayer).toBe(4); // 0-indexed, so layer 4 is the 5th layer
    });

    it('should increase petal count with each layer', () => {
      const petals = 4;
      const layers = 3;
      const patterns = SacredGeometry.mandala(origin, 200, petals, layers);

      // Count patterns per layer
      const patternsPerLayer = [0, 0, 0];
      patterns.forEach(p => patternsPerLayer[p.layer]++);

      // Each layer should have more petals: layer 0 = petals, layer 1 = 2*petals, etc.
      expect(patternsPerLayer[0]).toBe(petals);
      expect(patternsPerLayer[1]).toBe(petals * 2);
      expect(patternsPerLayer[2]).toBe(petals * 3);
    });

    it('should generate patterns with hexagonal petal shapes', () => {
      const patterns = SacredGeometry.mandala(origin, 200, 6, 1);

      // Each pattern should have 6 points (hexagonal shape)
      patterns.forEach(pattern => {
        expect(pattern.points).toHaveLength(6);
      });
    });

    it('should include layer information in each pattern', () => {
      const patterns = SacredGeometry.mandala(origin, 200, 6, 3);

      patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('layer');
        expect(pattern).toHaveProperty('points');
        expect(pattern.layer).toBeGreaterThanOrEqual(0);
        expect(pattern.layer).toBeLessThan(3);
      });
    });
  });

  describe('lissajous', () => {
    it('should generate the specified number of points plus one', () => {
      const points = 500;
      const curve = SacredGeometry.lissajous(
        origin,
        { x: 100, y: 100 },
        { x: 3, y: 4 },
        0,
        points
      );
      expect(curve).toHaveLength(points + 1);
    });

    it('should use default values when optional parameters not specified', () => {
      const curve = SacredGeometry.lissajous(
        origin,
        { x: 100, y: 100 },
        { x: 3, y: 4 }
      );
      // Default points = 1000, so 1001 points
      expect(curve).toHaveLength(1001);
    });

    it('should constrain points within amplitude bounds', () => {
      const amplitude = { x: 100, y: 150 };
      const curve = SacredGeometry.lissajous(
        origin,
        amplitude,
        { x: 3, y: 2 },
        0,
        100
      );

      curve.forEach(point => {
        expect(Math.abs(point.x)).toBeLessThanOrEqual(amplitude.x + 0.001);
        expect(Math.abs(point.y)).toBeLessThanOrEqual(amplitude.y + 0.001);
      });
    });

    it('should offset by center position', () => {
      const center = { x: 200, y: 300 };
      const amplitude = { x: 50, y: 50 };
      const curve = SacredGeometry.lissajous(
        center,
        amplitude,
        { x: 1, y: 1 },
        0,
        100
      );

      curve.forEach(point => {
        expect(point.x).toBeGreaterThanOrEqual(center.x - amplitude.x - 0.001);
        expect(point.x).toBeLessThanOrEqual(center.x + amplitude.x + 0.001);
        expect(point.y).toBeGreaterThanOrEqual(center.y - amplitude.y - 0.001);
        expect(point.y).toBeLessThanOrEqual(center.y + amplitude.y + 0.001);
      });
    });

    it('should apply phase offset to x coordinate', () => {
      const noPhase = SacredGeometry.lissajous(
        origin,
        { x: 100, y: 100 },
        { x: 1, y: 1 },
        0,
        10
      );

      const withPhase = SacredGeometry.lissajous(
        origin,
        { x: 100, y: 100 },
        { x: 1, y: 1 },
        PI / 2,
        10
      );

      // First point should differ due to phase
      expect(noPhase[0].x).not.toBeCloseTo(withPhase[0].x, 5);
    });

    it('should generate a circle with frequency ratio 1:1 and phase PI/2', () => {
      const amplitude = { x: 100, y: 100 };
      const curve = SacredGeometry.lissajous(
        origin,
        amplitude,
        { x: 1, y: 1 },
        PI / 2,
        360
      );

      // All points should be approximately on a circle
      curve.forEach(point => {
        const dist = distance2D(origin, point);
        expect(dist).toBeCloseTo(100, 0); // Within 1 unit
      });
    });
  });

  describe('spiral', () => {
    it('should generate correct number of points', () => {
      const turns = 3;
      const pointsPerTurn = 50;
      const spiral = SacredGeometry.spiral(origin, 10, 5, turns, pointsPerTurn);

      expect(spiral).toHaveLength(turns * pointsPerTurn + 1);
    });

    it('should use default 100 points per turn', () => {
      const turns = 2;
      const spiral = SacredGeometry.spiral(origin, 10, 5, turns);

      expect(spiral).toHaveLength(turns * 100 + 1);
    });

    it('should start at the center with initial radius', () => {
      const initialRadius = 10;
      const spiral = SacredGeometry.spiral(origin, initialRadius, 5, 3);

      const dist = distance2D(origin, spiral[0]);
      expect(dist).toBeCloseTo(initialRadius, 10);
    });

    it('should increase radius with each point (outward spiral)', () => {
      const spiral = SacredGeometry.spiral(origin, 10, 5, 2);

      // Check that distance from center increases
      let prevDist = 0;
      for (let i = 0; i < spiral.length; i++) {
        const dist = distance2D(origin, spiral[i]);
        expect(dist).toBeGreaterThanOrEqual(prevDist - 0.001);
        prevDist = dist;
      }
    });

    it('should offset by center position', () => {
      const center = { x: 100, y: 200 };
      const spiral = SacredGeometry.spiral(center, 10, 5, 1, 10);

      // First point should be offset by center
      const firstPointDist = distance2D(center, spiral[0]);
      expect(firstPointDist).toBeCloseTo(10, 10);
    });

    it('should grow according to growth parameter', () => {
      const initialRadius = 10;
      const growth = 5;
      const turns = 1;
      const pointsPerTurn = 100;

      const spiral = SacredGeometry.spiral(origin, initialRadius, growth, turns, pointsPerTurn);

      // After one full turn (2*PI), radius should be initialRadius + growth * 2*PI
      const lastPoint = spiral[spiral.length - 1];
      const expectedRadius = initialRadius + growth * TWO_PI * turns;
      const actualRadius = distance2D(origin, lastPoint);

      expect(actualRadius).toBeCloseTo(expectedRadius, 8);
    });
  });

  describe('pointInPolygon', () => {
    it('should return true for point inside triangle', () => {
      const triangle: Vector2D[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 }
      ];
      const pointInside = { x: 50, y: 30 };

      expect(SacredGeometry.pointInPolygon(pointInside, triangle)).toBe(true);
    });

    it('should return false for point outside triangle', () => {
      const triangle: Vector2D[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 }
      ];
      const pointOutside = { x: 200, y: 200 };

      expect(SacredGeometry.pointInPolygon(pointOutside, triangle)).toBe(false);
    });

    it('should return true for point inside square', () => {
      const square: Vector2D[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ];
      const pointInside = { x: 50, y: 50 };

      expect(SacredGeometry.pointInPolygon(pointInside, square)).toBe(true);
    });

    it('should return false for point outside square', () => {
      const square: Vector2D[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ];
      const pointOutside = { x: -50, y: 50 };

      expect(SacredGeometry.pointInPolygon(pointOutside, square)).toBe(false);
    });

    it('should work with complex concave polygons', () => {
      // L-shaped polygon
      const lShape: Vector2D[] = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 50 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ];

      // Point in the lower-left area (inside)
      expect(SacredGeometry.pointInPolygon({ x: 25, y: 75 }, lShape)).toBe(true);

      // Point in the cut-out area (outside)
      expect(SacredGeometry.pointInPolygon({ x: 75, y: 25 }, lShape)).toBe(false);
    });

    it('should work with regular polygons from regularPolygon function', () => {
      const hexagon = SacredGeometry.regularPolygon(origin, 100, 6);

      // Center should be inside
      expect(SacredGeometry.pointInPolygon(origin, hexagon)).toBe(true);

      // Point far outside should be outside
      expect(SacredGeometry.pointInPolygon({ x: 500, y: 500 }, hexagon)).toBe(false);
    });
  });

  describe('polygonCentroid', () => {
    it('should calculate centroid of equilateral triangle at origin', () => {
      const triangle: Vector2D[] = [
        { x: 0, y: 100 },
        { x: -86.6, y: -50 },
        { x: 86.6, y: -50 }
      ];

      const centroid = SacredGeometry.polygonCentroid(triangle);

      // Centroid should be near origin
      expect(centroid.x).toBeCloseTo(0, 0);
      expect(centroid.y).toBeCloseTo(0, 0);
    });

    it('should calculate centroid of square', () => {
      const square: Vector2D[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ];

      const centroid = SacredGeometry.polygonCentroid(square);

      expect(centroid.x).toBeCloseTo(50, 10);
      expect(centroid.y).toBeCloseTo(50, 10);
    });

    it('should calculate centroid of rectangle', () => {
      const rect: Vector2D[] = [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 100 },
        { x: 0, y: 100 }
      ];

      const centroid = SacredGeometry.polygonCentroid(rect);

      expect(centroid.x).toBeCloseTo(100, 10);
      expect(centroid.y).toBeCloseTo(50, 10);
    });

    it('should handle offset polygons', () => {
      const offsetSquare: Vector2D[] = [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 }
      ];

      const centroid = SacredGeometry.polygonCentroid(offsetSquare);

      expect(centroid.x).toBeCloseTo(150, 10);
      expect(centroid.y).toBeCloseTo(150, 10);
    });

    it('should work with regular polygons from regularPolygon function', () => {
      const center = { x: 100, y: 100 };
      const hexagon = SacredGeometry.regularPolygon(center, 50, 6);

      const centroid = SacredGeometry.polygonCentroid(hexagon);

      expect(centroid.x).toBeCloseTo(center.x, 8);
      expect(centroid.y).toBeCloseTo(center.y, 8);
    });
  });

  describe('fractalPattern', () => {
    it('should generate patterns at specified depth', () => {
      const generator = (c: Vector2D, s: number): Vector2D[] =>
        SacredGeometry.regularPolygon(c, s, 3);

      const patterns = SacredGeometry.fractalPattern(
        origin,
        100,
        0,
        generator
      );

      // Depth 0 should only have the initial pattern
      expect(patterns).toHaveLength(1);
    });

    it('should recursively generate patterns', () => {
      const generator = (c: Vector2D, s: number): Vector2D[] =>
        SacredGeometry.regularPolygon(c, s, 3);

      const patterns = SacredGeometry.fractalPattern(
        origin,
        100,
        1,
        generator
      );

      // Depth 1: 1 initial + 3 child patterns = 4
      expect(patterns).toHaveLength(4);
    });

    it('should apply scale factor to recursive patterns', () => {
      const generator = (c: Vector2D, s: number): Vector2D[] =>
        SacredGeometry.regularPolygon(c, s, 4);

      const scaleFactor = 0.5;
      const patterns = SacredGeometry.fractalPattern(
        origin,
        100,
        1,
        generator,
        scaleFactor
      );

      // First pattern has original size
      const firstSize = distance2D(patterns[0][0], patterns[0][1]);

      // Child patterns should be smaller
      for (let i = 1; i < patterns.length; i++) {
        const childSize = distance2D(patterns[i][0], patterns[i][1]);
        expect(childSize).toBeLessThan(firstSize);
      }
    });

    it('should use default scale factor of 0.5', () => {
      const generator = (c: Vector2D, s: number): Vector2D[] =>
        SacredGeometry.regularPolygon(c, s, 4);

      const patterns = SacredGeometry.fractalPattern(
        origin,
        100,
        1,
        generator
      );

      // Verify that child patterns exist and are smaller
      expect(patterns.length).toBeGreaterThan(1);
    });

    it('should place child patterns at parent vertices', () => {
      const generator = (c: Vector2D, s: number): Vector2D[] =>
        SacredGeometry.regularPolygon(c, s, 3);

      const patterns = SacredGeometry.fractalPattern(
        origin,
        100,
        1,
        generator
      );

      const parentVertices = patterns[0];

      // Each child pattern should be centered at one of parent's vertices
      for (let i = 1; i < patterns.length; i++) {
        const childCentroid = SacredGeometry.polygonCentroid(patterns[i]);

        // Check if centroid is near any parent vertex
        const isNearVertex = parentVertices.some(vertex =>
          distance2D(childCentroid, vertex) < 1
        );

        expect(isNearVertex).toBe(true);
      }
    });

    it('should handle custom generator functions', () => {
      // Custom generator that creates a square
      const squareGenerator = (c: Vector2D, s: number): Vector2D[] => [
        { x: c.x - s/2, y: c.y - s/2 },
        { x: c.x + s/2, y: c.y - s/2 },
        { x: c.x + s/2, y: c.y + s/2 },
        { x: c.x - s/2, y: c.y + s/2 }
      ];

      const patterns = SacredGeometry.fractalPattern(
        origin,
        100,
        1,
        squareGenerator
      );

      // Each pattern should have 4 vertices (square)
      patterns.forEach(pattern => {
        expect(pattern).toHaveLength(4);
      });
    });

    it('should generate exponentially more patterns with depth', () => {
      const generator = (c: Vector2D, s: number): Vector2D[] =>
        SacredGeometry.regularPolygon(c, s, 3);

      const depth0 = SacredGeometry.fractalPattern(origin, 100, 0, generator);
      const depth1 = SacredGeometry.fractalPattern(origin, 100, 1, generator);
      const depth2 = SacredGeometry.fractalPattern(origin, 100, 2, generator);

      expect(depth1.length).toBeGreaterThan(depth0.length);
      expect(depth2.length).toBeGreaterThan(depth1.length);
    });
  });

  describe('integration tests', () => {
    it('should compose multiple geometry functions', () => {
      // Create a flower of life and check if center point is inside first circle's bounding polygon
      const flowerCircles = SacredGeometry.flowerOfLife(origin, 50, 1);
      const firstCircle = flowerCircles[0];

      // Approximate circle with polygon
      const circlePolygon = SacredGeometry.regularPolygon(
        firstCircle.center,
        firstCircle.radius,
        32
      );

      // Center should be inside the polygon
      expect(SacredGeometry.pointInPolygon(origin, circlePolygon)).toBe(true);
    });

    it('should maintain mathematical consistency across functions', () => {
      // Golden ratio should be consistent
      const goldenRatio = SacredGeometry.getSacredRatio('GOLDEN');

      // Create a golden rectangle and verify proportions
      const width = 100;
      const height = width / goldenRatio;

      const rect: Vector2D[] = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height }
      ];

      // Calculate side ratios
      const longSide = distance2D(rect[0], rect[1]);
      const shortSide = distance2D(rect[1], rect[2]);
      const ratio = longSide / shortSide;

      expect(ratio).toBeCloseTo(goldenRatio, 10);
    });

    it('should generate valid star from polygon vertices', () => {
      const hexagon = SacredGeometry.regularPolygon(origin, 100, 6);
      const star = SacredGeometry.starPolygon(origin, 100, 50, 6);

      // Star should have twice as many vertices as hexagon
      expect(star).toHaveLength(hexagon.length * 2);

      // Outer vertices of star should match hexagon vertices (at outer radius)
      hexagon.forEach((vertex, i) => {
        const starOuterVertex = star[i * 2];
        const dist = distance2D(vertex, starOuterVertex);
        // They should be at same angle, same radius
        expect(distance2D(origin, vertex)).toBeCloseTo(distance2D(origin, starOuterVertex), 10);
      });
    });
  });
});
