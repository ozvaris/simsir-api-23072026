export class OperationResultResponse {
  success!: true;

  constructor(partial?: Partial<OperationResultResponse>) {
    Object.assign(this, partial);
  }
}
