import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

const APP_URL = process.env.APP_URL || "http://localhost:3001";

function transformUrl(value: any): any {
  if (typeof value !== "string") return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/storage/")) return `${APP_URL}${value}`;
  return value;
}

function walk(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(walk);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (
      typeof val === "string" &&
      (key === "url" ||
        key.endsWith("Url") ||
        key === "coverUrl" ||
        key === "avatarUrl")
    ) {
      result[key] = transformUrl(val);
    } else {
      result[key] = walk(val);
    }
  }
  return result;
}

@Injectable()
export class UrlTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(walk));
  }
}
