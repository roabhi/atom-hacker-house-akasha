import codes from './codes.json';

export function validateCode(code: string): boolean {
  const codeData = codes.codes.find(c => c.code === code && !c.used);
  return !!codeData;
}

export function markCodeAsUsed(code: string): void {
  const codeData = codes.codes.find(c => c.code === code);
  if (codeData) {
    codeData.used = true;
  }
}