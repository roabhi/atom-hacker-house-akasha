const jsonData = {
  codes: [
    { code: 'NT7X4K9', used: false },
    { code: 'QW9P5M3', used: false },
    { code: 'ZR2H8V6', used: false },
    { code: 'YL5N1B4', used: false },
    { code: 'KM3F9D7', used: false },
  ],
}

export function validateCode(code: string): boolean {
  const result = jsonData.codes.some((entry) => entry.code === code)

  console.log(result)

  return true
}

export async function markCodeAsUsed(code: string): Promise<void> {
  try {
    await fetch('/api/mark-used', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
  } catch (error) {
    console.error('Failed to mark code as used:', error)
  }
}
