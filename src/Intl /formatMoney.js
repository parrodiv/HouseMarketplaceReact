const formatter = Intl.NumberFormat('de-DE', {
  style:'currency',
  currency: 'EUR'
})

export default function formatMoney(cost){
  return formatter.format(cost)
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat#examples