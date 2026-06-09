// src/modules/payment-methods/responses/operation-result.response.ts

export class OperationResultResponse {
  success!: true;

  constructor(partial?: Partial<OperationResultResponse>) {
    Object.assign(this, partial);
  }
}
