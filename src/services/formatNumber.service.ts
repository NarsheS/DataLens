const numberFormatter = new Intl.NumberFormat("pt-BR");

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export default formatNumber