import {
  CreditCard,
  Food,
  House,
  Money,
  More,
  Present,
  ShoppingCart,
  Ticket,
  Van,
  Wallet
} from '@element-plus/icons-vue'

export const categoryIconComponents = {
  ShoppingCart,
  Food,
  House,
  Van,
  Ticket,
  Money,
  Wallet,
  CreditCard,
  Present,
  More
}

export const availableCategoryIcons = [
  { value: 'ShoppingCart', label: 'shopping-cart' },
  { value: 'Food', label: 'food' },
  { value: 'House', label: 'house' },
  { value: 'Van', label: 'van' },
  { value: 'Ticket', label: 'ticket' },
  { value: 'Money', label: 'money' },
  { value: 'Wallet', label: 'wallet' },
  { value: 'CreditCard', label: 'credit-card' },
  { value: 'Present', label: 'present' },
  { value: 'More', label: 'more' }
]

export const resolveCategoryIcon = (iconName) => {
  return categoryIconComponents[iconName] || More
}


export const categoryIconClassMap = {
  ShoppingCart: 'translate-x-[1px] translate-y-[1px]'
}

export const resolveCategoryIconClass = (iconName) => {
  return categoryIconClassMap[iconName] || ''
}
