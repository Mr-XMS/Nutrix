export type AgreementStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface ServiceAgreementItem {
  id: string;
  serviceAgreementId: string;
  supportItemNumber: string;
  supportItemName: string;
  category: 'CORE' | 'CAPACITY_BUILDING' | 'CAPITAL';
  unitPrice: string; // Decimal serialised as string
  allocatedQty: string;
  allocatedBudget: string;
  deliveredQty: string;
  deliveredBudget: string;
}

export interface ServiceAgreementSummary {
  id: string;
  organisationId: string;
  participantId: string;
  ndisPlanId: string;
  startDate: string;
  endDate: string;
  status: AgreementStatus;
  signedAt: string | null;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    ndisNumber: string;
  };
  lineItems: ServiceAgreementItem[];
  _count?: { lineItems: number };
}
