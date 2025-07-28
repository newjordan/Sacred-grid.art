// src/math/Transformations.ts - 2D/3D projection matrices and transformations

import { Vector2D, Vector3D } from '../types';
import { DEG_TO_RAD, RAD_TO_DEG } from '../utils/constants';

/**
 * 2D Transformation Matrix
 */
export class Matrix2D {
  constructor(
    public a: number = 1,
    public b: number = 0,
    public c: number = 0,
    public d: number = 1,
    public e: number = 0,
    public f: number = 0
  ) {}

  /**
   * Create identity matrix
   */
  static identity(): Matrix2D {
    return new Matrix2D(1, 0, 0, 1, 0, 0);
  }

  /**
   * Create translation matrix
   */
  static translation(x: number, y: number): Matrix2D {
    return new Matrix2D(1, 0, 0, 1, x, y);
  }

  /**
   * Create rotation matrix
   */
  static rotation(angle: number): Matrix2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Matrix2D(cos, sin, -sin, cos, 0, 0);
  }

  /**
   * Create scale matrix
   */
  static scale(sx: number, sy: number = sx): Matrix2D {
    return new Matrix2D(sx, 0, 0, sy, 0, 0);
  }

  /**
   * Multiply this matrix with another
   */
  multiply(other: Matrix2D): Matrix2D {
    return new Matrix2D(
      this.a * other.a + this.b * other.c,
      this.a * other.b + this.b * other.d,
      this.c * other.a + this.d * other.c,
      this.c * other.b + this.d * other.d,
      this.e * other.a + this.f * other.c + other.e,
      this.e * other.b + this.f * other.d + other.f
    );
  }

  /**
   * Transform a point
   */
  transformPoint(point: Vector2D): Vector2D {
    return {
      x: this.a * point.x + this.c * point.y + this.e,
      y: this.b * point.x + this.d * point.y + this.f
    };
  }

  /**
   * Get inverse matrix
   */
  inverse(): Matrix2D {
    const det = this.a * this.d - this.b * this.c;
    if (Math.abs(det) < 1e-10) {
      throw new Error('Matrix is not invertible');
    }

    return new Matrix2D(
      this.d / det,
      -this.b / det,
      -this.c / det,
      this.a / det,
      (this.c * this.f - this.d * this.e) / det,
      (this.b * this.e - this.a * this.f) / det
    );
  }

  /**
   * Convert to CSS transform string
   */
  toCSSTransform(): string {
    return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
  }
}

/**
 * 3D Transformation Matrix
 */
export class Matrix3D {
  constructor(public matrix: number[] = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]) {
    if (matrix.length !== 16) {
      throw new Error('3D matrix must have 16 elements');
    }
  }

  /**
   * Create identity matrix
   */
  static identity(): Matrix3D {
    return new Matrix3D();
  }

  /**
   * Create translation matrix
   */
  static translation(x: number, y: number, z: number): Matrix3D {
    return new Matrix3D([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]);
  }

  /**
   * Create rotation matrix around X axis
   */
  static rotationX(angle: number): Matrix3D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Matrix3D([
      1, 0, 0, 0,
      0, cos, sin, 0,
      0, -sin, cos, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * Create rotation matrix around Y axis
   */
  static rotationY(angle: number): Matrix3D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Matrix3D([
      cos, 0, -sin, 0,
      0, 1, 0, 0,
      sin, 0, cos, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * Create rotation matrix around Z axis
   */
  static rotationZ(angle: number): Matrix3D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Matrix3D([
      cos, sin, 0, 0,
      -sin, cos, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * Create scale matrix
   */
  static scale(sx: number, sy: number = sx, sz: number = sx): Matrix3D {
    return new Matrix3D([
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * Multiply with another matrix
   */
  multiply(other: Matrix3D): Matrix3D {
    const result = new Array(16).fill(0);
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i * 4 + j] += this.matrix[i * 4 + k] * other.matrix[k * 4 + j];
        }
      }
    }
    
    return new Matrix3D(result);
  }

  /**
   * Transform a 3D point
   */
  transformPoint(point: Vector3D): Vector3D {
    const x = point.x * this.matrix[0] + point.y * this.matrix[4] + point.z * this.matrix[8] + this.matrix[12];
    const y = point.x * this.matrix[1] + point.y * this.matrix[5] + point.z * this.matrix[9] + this.matrix[13];
    const z = point.x * this.matrix[2] + point.y * this.matrix[6] + point.z * this.matrix[10] + this.matrix[14];
    const w = point.x * this.matrix[3] + point.y * this.matrix[7] + point.z * this.matrix[11] + this.matrix[15];
    
    return {
      x: x / w,
      y: y / w,
      z: z / w
    };
  }

  /**
   * Project 3D point to 2D
   */
  project3DTo2D(point: Vector3D, distance: number = 500): Vector2D {
    const transformed = this.transformPoint(point);
    const scale = distance / (distance + transformed.z);
    
    return {
      x: transformed.x * scale,
      y: transformed.y * scale
    };
  }
}

/**
 * Transformation utilities
 */
export class Transformations {
  /**
   * Rotate point around center
   */
  static rotatePoint(point: Vector2D, center: Vector2D, angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos
    };
  }

  /**
   * Scale point from center
   */
  static scalePoint(point: Vector2D, center: Vector2D, scale: number): Vector2D {
    return {
      x: center.x + (point.x - center.x) * scale,
      y: center.y + (point.y - center.y) * scale
    };
  }

  /**
   * Translate point
   */
  static translatePoint(point: Vector2D, offset: Vector2D): Vector2D {
    return {
      x: point.x + offset.x,
      y: point.y + offset.y
    };
  }

  /**
   * Apply multiple transformations to a point
   */
  static transformPoint(
    point: Vector2D,
    transformations: Array<{
      type: 'translate' | 'rotate' | 'scale';
      params: any;
    }>
  ): Vector2D {
    let result = { ...point };
    
    for (const transform of transformations) {
      switch (transform.type) {
        case 'translate':
          result = this.translatePoint(result, transform.params);
          break;
        case 'rotate':
          result = this.rotatePoint(result, transform.params.center, transform.params.angle);
          break;
        case 'scale':
          result = this.scalePoint(result, transform.params.center, transform.params.scale);
          break;
      }
    }
    
    return result;
  }

  /**
   * Create perspective projection matrix
   */
  static perspectiveProjection(
    fov: number,
    aspect: number,
    near: number,
    far: number
  ): Matrix3D {
    const f = 1 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);
    
    return new Matrix3D([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ]);
  }

  /**
   * Create orthographic projection matrix
   */
  static orthographicProjection(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ): Matrix3D {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    
    return new Matrix3D([
      -2 * lr, 0, 0, 0,
      0, -2 * bt, 0, 0,
      0, 0, 2 * nf, 0,
      (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1
    ]);
  }

  /**
   * Create look-at matrix
   */
  static lookAt(eye: Vector3D, target: Vector3D, up: Vector3D): Matrix3D {
    const zAxis = this.normalize3D(this.subtract3D(eye, target));
    const xAxis = this.normalize3D(this.cross3D(up, zAxis));
    const yAxis = this.cross3D(zAxis, xAxis);
    
    return new Matrix3D([
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      -this.dot3D(xAxis, eye), -this.dot3D(yAxis, eye), -this.dot3D(zAxis, eye), 1
    ]);
  }

  /**
   * Vector utilities
   */
  static subtract3D(a: Vector3D, b: Vector3D): Vector3D {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }

  static cross3D(a: Vector3D, b: Vector3D): Vector3D {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  static dot3D(a: Vector3D, b: Vector3D): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static length3D(v: Vector3D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }

  static normalize3D(v: Vector3D): Vector3D {
    const length = this.length3D(v);
    if (length === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / length, y: v.y / length, z: v.z / length };
  }

  /**
   * Convert degrees to radians
   */
  static degToRad(degrees: number): number {
    return degrees * DEG_TO_RAD;
  }

  /**
   * Convert radians to degrees
   */
  static radToDeg(radians: number): number {
    return radians * RAD_TO_DEG;
  }

  /**
   * Interpolate between two points
   */
  static lerp2D(a: Vector2D, b: Vector2D, t: number): Vector2D {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t
    };
  }

  /**
   * Interpolate between two 3D points
   */
  static lerp3D(a: Vector3D, b: Vector3D, t: number): Vector3D {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t
    };
  }

  /**
   * Calculate distance between two points
   */
  static distance2D(a: Vector2D, b: Vector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate distance between two 3D points
   */
  static distance3D(a: Vector3D, b: Vector3D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

export default Transformations;