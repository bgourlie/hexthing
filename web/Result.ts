interface OkResult<T> {
  readonly type: 'Ok';
  readonly value: T;
}

interface ErrResult {
  readonly type: 'Err';
  readonly message: string;
}

export type Result<T> = OkResult<T> | ErrResult;

export function Ok<T>(value: T): Result<T> {
  return {type: 'Ok', value};
}

export function Err(message: string): Result<never> {
  return {type: 'Err', message};
}

export function is_ok<T>(result: Result<T>): result is OkResult<T> {
  return result.type === 'Ok';
}

export function is_err(result: Result<any>): result is ErrResult {
  return result.type === 'Err';
}
