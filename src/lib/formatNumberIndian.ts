export const formatNumberIndian = (value: any) => {
  if (!value) return "";
  const [integerPart, decimalPart] = value.toString().split(".");
  const formattedInteger = integerPart
    .replace(/\B(?=(\d{2})+(?!\d))/g, ",")
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

