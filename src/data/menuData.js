export const categories = [
  { id: 'all', name: 'All Items', icon: 'Sparkles' },
  { id: 'zinger', name: 'Zinger', icon: 'Flame' },
  { id: 'wings', name: 'Wings', icon: 'Drumstick' },
  { id: 'burgers', name: 'Burgers', icon: 'Utensils' },
  { id: 'broast', name: 'Broast', icon: 'ShieldAlert' },
  { id: 'rolls', name: 'Rolls & Wraps', icon: 'Wrap' },
  { id: 'deals', name: 'Deals & Combos', icon: 'Gift' },
  { id: 'sides', name: 'Sides', icon: 'Boxes' },
  { id: 'drinks', name: 'Drinks', icon: 'Coffee' },
  { id: 'desserts', name: 'Desserts', icon: 'Cake' }
];

export const initialMenuItems = [
  {
    id: 'z1',
    name: 'Mega Crunch Zinger Supreme',
    category: 'zinger',
    price: 449,
    originalPrice: 549,
    rating: 4.9,
    reviews: 420,
    prepTime: '15-20 min',
    calories: '650 kcal',
    description: 'Double crispy fried chicken breast fillet topped with spicy chipotle mayo, double melted cheddar, and fresh lettuce on toasted brioche.',
    image: '/images/hero_zinger_combo.png',
    badge: 'Popular',
    spiceLevel: 2,
    popular: true,
    isAvailable: true,
    options: {
      spiceLevels: ['Mild', 'Spicy', 'Extra Hot'],
      additions: [
        { name: 'Extra Cheese Slice', price: 50 },
        { name: 'Garlic Mayo Dip', price: 40 },
        { name: 'Bacon Strips', price: 80 }
      ]
    }
  },
  {
    id: 'w1',
    name: 'Fiery Hot Wings Bucket (12 pcs)',
    category: 'wings',
    price: 749,
    originalPrice: 899,
    rating: 4.8,
    reviews: 310,
    prepTime: '20 min',
    calories: '920 kcal',
    description: '12 pieces of extra crunchy chicken wings coated in our signature chili paprika glaze served with garlic ranch dipping sauce.',
    image: '/images/fiery_wings_bucket.png',
    badge: 'Best Seller',
    spiceLevel: 3,
    popular: true,
    isAvailable: true,
    options: {
      spiceLevels: ['Original Crispy', 'Hot & Fiery', 'Ghost Chili Inferno'],
      additions: [
        { name: 'Extra Ranch Dip', price: 40 },
        { name: 'Honey Mustard Dip', price: 40 }
      ]
    }
  },
  {
    id: 'b1',
    name: 'Crispy Broast Combo (4 pcs)',
    category: 'broast',
    price: 599,
    originalPrice: 699,
    rating: 4.7,
    reviews: 185,
    prepTime: '15-22 min',
    calories: '850 kcal',
    description: '4 pieces of bone-in golden crispy fried broast chicken, served with home-made fresh coleslaw, garlic dip, and warm dinner roll.',
    image: '/images/crispy_broast.png',
    badge: 'Chef Choice',
    spiceLevel: 1,
    popular: true,
    isAvailable: true,
    options: {
      spiceLevels: ['Classic Broast', 'Spicy Broast'],
      additions: [
        { name: 'Extra Dinner Roll', price: 30 },
        { name: 'Extra Coleslaw', price: 60 }
      ]
    }
  },
  {
    id: 'd1',
    name: 'ChicknChunks Family Feast Box',
    category: 'deals',
    price: 1499,
    originalPrice: 1799,
    rating: 5.0,
    reviews: 540,
    prepTime: '25 min',
    calories: '2200 kcal',
    description: '8 pieces Crispy Broast Chicken + 2 Zinger Burgers + Large Seasoned Fries + 3 Dipping Sauces + 1.5L Soft Drink bottle.',
    image: '/images/family_feast_box.png',
    badge: 'Mega Deal',
    spiceLevel: 2,
    popular: true,
    isAvailable: true,
    options: {
      spiceLevels: ['Half Mild / Half Spicy', 'All Spicy'],
      additions: [
        { name: 'Upgrade to Curly Fries', price: 80 },
        { name: 'Extra Dip Trio', price: 100 }
      ]
    }
  },
  {
    id: 'r1',
    name: 'Chipotle Chicken Twister Wrap',
    category: 'rolls',
    price: 379,
    originalPrice: 449,
    rating: 4.6,
    reviews: 140,
    prepTime: '12 min',
    calories: '510 kcal',
    description: 'Golden chicken tenders wrapped in warm toasted tortilla with shredded lettuce, diced tomatoes, melted cheese & chipotle dressing.',
    image: '/images/twister_wrap.png',
    badge: 'Fast Choice',
    spiceLevel: 1,
    popular: false,
    isAvailable: true,
    options: {
      spiceLevels: ['Mild Chipotle', 'Spicy Jalapeño'],
      additions: [
        { name: 'Guacamole', price: 60 },
        { name: 'Double Cheese', price: 50 }
      ]
    }
  },
  {
    id: 'des1',
    name: 'Molten Chocolate Lava Cake',
    category: 'desserts',
    price: 279,
    originalPrice: 349,
    rating: 4.9,
    reviews: 280,
    prepTime: '8 min',
    calories: '420 kcal',
    description: 'Rich dark chocolate warm cake with a molten chocolate oozing center, served with vanilla ice cream and strawberry sauce.',
    image: '/images/lava_cake.png',
    badge: 'Sweet Treat',
    spiceLevel: 0,
    popular: true,
    isAvailable: true,
    options: {
      spiceLevels: ['Standard Dessert'],
      additions: [
        { name: 'Extra Ice Cream Scoop', price: 60 },
        { name: 'Caramel Drizzle', price: 30 }
      ]
    }
  },
  {
    id: 'z2',
    name: 'Classic Chicken Zinger Burger',
    category: 'zinger',
    price: 349,
    originalPrice: 425,
    rating: 4.5,
    reviews: 210,
    prepTime: '12 min',
    calories: '540 kcal',
    description: 'Crispy fried chicken breast, mayo, and crisp lettuce on a toasted sesame seed bun.',
    image: '/images/hero_zinger_combo.png',
    badge: '',
    spiceLevel: 1,
    popular: false,
    isAvailable: true,
    options: {
      spiceLevels: ['Original', 'Spicy'],
      additions: [{ name: 'Cheese Slice', price: 40 }]
    }
  },
  {
    id: 's1',
    name: 'Loaded Seasoned Curly Fries',
    category: 'sides',
    price: 249,
    originalPrice: 299,
    rating: 4.8,
    reviews: 320,
    prepTime: '10 min',
    calories: '480 kcal',
    description: 'Crispy spiral potato fries seasoned with cajun spices and served with warm cheddar sauce.',
    image: '/images/hero_zinger_combo.png',
    badge: 'Popular Side',
    spiceLevel: 1,
    popular: true,
    isAvailable: true,
    options: {
      spiceLevels: ['Cajun Spice', 'Extra Spicy'],
      additions: [{ name: 'Bacon Bits & Jalapeños', price: 80 }]
    }
  },
  {
    id: 'dr1',
    name: 'Chilled Wild Berry Fizz',
    category: 'drinks',
    price: 179,
    originalPrice: 199,
    rating: 4.7,
    reviews: 95,
    prepTime: '3 min',
    calories: '180 kcal',
    description: 'Refreshing sparkling soda infused with wild raspberries, mint leaves, and lime wedge.',
    image: '/images/hero_zinger_combo.png',
    badge: 'Refreshing',
    spiceLevel: 0,
    popular: false,
    isAvailable: true,
    options: {
      spiceLevels: ['Standard Chilled'],
      additions: [{ name: 'Less Ice', price: 0 }]
    }
  }
];

export const initialOrdersList = [
  {
    orderId: 'CHK-948201',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    status: 'preparing',
    statusStep: 2,
    customerName: 'Sarah Connor',
    customerPhone: '+92 300 2348890',
    address: '742 Evergreen Terrace, Apt 4B',
    paymentMethod: 'Card',
    total: 998,
    itemsCount: 3,
    items: [
      { name: 'Mega Crunch Zinger Supreme', quantity: 2, unitPrice: 449 },
      { name: 'Loaded Seasoned Curly Fries', quantity: 1, unitPrice: 249 }
    ]
  },
  {
    orderId: 'CHK-810394',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    status: 'on_way',
    statusStep: 3,
    customerName: 'Marcus Vance',
    customerPhone: '+92 300 8871234',
    address: '109 Ocean Drive, Suite 12',
    paymentMethod: 'Cash on Delivery',
    total: 1499,
    itemsCount: 1,
    items: [
      { name: 'ChicknChunks Family Feast Box', quantity: 1, unitPrice: 1499 }
    ]
  },
  {
    orderId: 'CHK-719205',
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    status: 'delivered',
    statusStep: 4,
    customerName: 'Emily Watson',
    customerPhone: '+92 300 4439012',
    address: '55 Sunset Blvd',
    paymentMethod: 'Apple Pay',
    total: 1028,
    itemsCount: 2,
    items: [
      { name: 'Fiery Hot Wings Bucket (12 pcs)', quantity: 1, unitPrice: 749 },
      { name: 'Molten Chocolate Lava Cake', quantity: 1, unitPrice: 279 }
    ]
  }
];

export const promoCodesList = {
  'CHICKN20': { code: 'CHICKN20', discountPercent: 20, description: '20% Off Your Entire Order', isActive: true },
  'FREEDEL': { code: 'FREEDEL', freeDelivery: true, description: 'Free Delivery on any order', isActive: true },
  'CRUNCH10': { code: 'CRUNCH10', discountFlat: 250, description: 'Rs. 250 Off Orders over Rs. 1,000', isActive: true }
};
