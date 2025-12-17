// Utility to convert numbers to Indian Currency Words
const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function convertUnderThousand(n: number): string {
  let s = "";
  
  if (n >= 100) {
    s += units[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  
  if (n >= 20) {
    s += tens[Math.floor(n / 10)] + " ";
    n %= 10;
  }
  
  if (n >= 10) {
    s += teens[n - 10] + " ";
    n = 0;
  }
  
  if (n > 0) {
    s += units[n] + " ";
  }
  
  return s.trim();
}

export const numberToIndianWords = (num: number): string => {
  if (num === 0) return "Zero only";
  
  // Round to 2 decimal places for safety
  const n = Math.round(num);
  
  let str = "";
  
  const crore = Math.floor(n / 10000000);
  let remainder = n % 10000000;
  
  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  
  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  
  if (crore > 0) {
    str += convertUnderThousand(crore) + " Crore ";
  }
  
  if (lakh > 0) {
    str += convertUnderThousand(lakh) + " Lakh ";
  }
  
  if (thousand > 0) {
    str += convertUnderThousand(thousand) + " Thousand ";
  }
  
  if (remainder > 0) {
    str += convertUnderThousand(remainder);
  }
  
  return str.trim() + " only";
};

export const calculateTaxes = (taxableTotal: number, gstType: 'intra' | 'inter') => {
  // Assuming standard 18% GST rate
  const RATE = 0.18;
  const gstAmount = taxableTotal * RATE;
  const grandTotal = taxableTotal + gstAmount;

  if (gstType === 'intra') {
    return {
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      igst: 0,
      grandTotal,
      gstAmount
    };
  } else {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      grandTotal,
      gstAmount
    };
  }
};