import { HttpStatus } from "@nestjs/common";

export enum HttpRequestStatus {
  SUCCESS = HttpStatus.OK,
  ERROR = HttpStatus.BAD_REQUEST,
}
