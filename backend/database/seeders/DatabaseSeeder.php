<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Promo;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
        ]);

        // ── Users ──────────────────────────────────────────────────────
        User::create([
            'name' => 'Admin',
            'email' => 'admin@chicknchunks.com',
            'password' => 'admin123',
            'role' => 'admin',
            'phone' => '+92 300 1234567',
        ]);

        User::create([
            'name' => 'Customer',
            'email' => 'customer@test.com',
            'password' => 'password',
            'role' => 'customer',
            'phone' => '+92 300 7654321',
        ]);

        User::create([
            'name' => 'Rider Ali',
            'email' => 'rider@test.com',
            'password' => 'password',
            'role' => 'rider',
            'phone' => '+92 301 1112233',
        ]);

        User::create([
            'name' => 'Rider Sara',
            'email' => 'rider2@test.com',
            'password' => 'password',
            'role' => 'rider',
            'phone' => '+92 302 4445566',
            'vehicle_info' => 'Honda CD70 — White',
            'is_active' => true,
        ]);

        // ── Menu Items ─────────────────────────────────────────────────
        $menuItems = [
            [
                'name' => 'Mega Crunch Zinger Supreme',
                'category' => 'zinger',
                'price' => 449.00,
                'original_price' => 549.00,
                'description' => 'Double crispy fried chicken breast fillet topped with spicy chipotle mayo, double melted cheddar, and fresh lettuce on toasted brioche.',
                'image' => '/images/hero_zinger_combo.png',
                'badge' => 'Popular',
                'spice_level' => 2,
                'popular' => true,
                'is_available' => true,
                'options' => [
                    'spiceLevels' => ['Mild', 'Spicy', 'Extra Hot'],
                    'additions' => [
                        ['name' => 'Extra Cheese Slice', 'price' => 50],
                        ['name' => 'Garlic Mayo Dip', 'price' => 40],
                        ['name' => 'Bacon Strips', 'price' => 80],
                    ],
                ],
                'rating' => 4.9,
                'reviews' => 420,
                'prep_time' => '15-20 min',
                'calories' => '650 kcal',
            ],
            [
                'name' => 'Fiery Hot Wings Bucket (12 pcs)',
                'category' => 'wings',
                'price' => 749.00,
                'original_price' => 899.00,
                'description' => '12 pieces of extra crunchy chicken wings coated in our signature chili paprika glaze served with garlic ranch dipping sauce.',
                'image' => '/images/fiery_wings_bucket.png',
                'badge' => 'Best Seller',
                'spice_level' => 3,
                'popular' => true,
                'is_available' => true,
                'options' => [
                    'spiceLevels' => ['Original Crispy', 'Hot & Fiery', 'Ghost Chili Inferno'],
                    'additions' => [
                        ['name' => 'Extra Ranch Dip', 'price' => 40],
                        ['name' => 'Honey Mustard Dip', 'price' => 40],
                    ],
                ],
                'rating' => 4.8,
                'reviews' => 310,
                'prep_time' => '20 min',
                'calories' => '920 kcal',
            ],
            [
                'name' => 'Crispy Broast Combo (4 pcs)',
                'category' => 'broast',
                'price' => 599.00,
                'original_price' => 699.00,
                'description' => '4 pieces of bone-in golden crispy fried broast chicken, served with home-made fresh coleslaw, garlic dip, and warm dinner roll.',
                'image' => '/images/crispy_broast.png',
                'badge' => 'Chef Choice',
                'spice_level' => 1,
                'popular' => true,
                'is_available' => true,
                'options' => [
                    'spiceLevels' => ['Classic Broast', 'Spicy Broast'],
                    'additions' => [
                        ['name' => 'Extra Dinner Roll', 'price' => 30],
                        ['name' => 'Extra Coleslaw', 'price' => 60],
                    ],
                ],
                'rating' => 4.7,
                'reviews' => 185,
                'prep_time' => '15-22 min',
                'calories' => '850 kcal',
            ],
            [
                'name' => 'ChicknChunks Family Feast Box',
                'category' => 'deals',
                'price' => 1499.00,
                'original_price' => 1799.00,
                'description' => '8 pieces Crispy Broast Chicken + 2 Zinger Burgers + Large Seasoned Fries + 3 Dipping Sauces + 1.5L Soft Drink bottle.',
                'image' => '/images/family_feast_box.png',
                'badge' => 'Mega Deal',
                'spice_level' => 2,
                'popular' => true,
                'is_available' => true,
                'options' => [
                    'spiceLevels' => ['Half Mild / Half Spicy', 'All Spicy'],
                    'additions' => [
                        ['name' => 'Upgrade to Curly Fries', 'price' => 80],
                        ['name' => 'Extra Dip Trio', 'price' => 100],
                    ],
                ],
                'rating' => 5.0,
                'reviews' => 540,
                'prep_time' => '25 min',
                'calories' => '2200 kcal',
            ],
            [
                'name' => 'Chipotle Chicken Twister Wrap',
                'category' => 'rolls',
                'price' => 379.00,
                'original_price' => 449.00,
                'description' => 'Golden chicken tenders wrapped in warm toasted tortilla with shredded lettuce, diced tomatoes, melted cheese & chipotle dressing.',
                'image' => '/images/twister_wrap.png',
                'badge' => 'Fast Choice',
                'spice_level' => 1,
                'popular' => false,
                'is_available' => true,
                'options' => [
                    'spiceLevels' => ['Mild Chipotle', 'Spicy Jalapeño'],
                    'additions' => [
                        ['name' => 'Guacamole', 'price' => 60],
                        ['name' => 'Double Cheese', 'price' => 50],
                    ],
                ],
                'rating' => 4.6,
                'reviews' => 140,
                'prep_time' => '12 min',
                'calories' => '510 kcal',
            ],
            [
                'name' => 'Molten Chocolate Lava Cake',
                'category' => 'desserts',
                'price' => 279.00,
                'original_price' => 349.00,
                'description' => 'Rich dark chocolate warm cake with a molten chocolate oozing center, served with vanilla ice cream and strawberry sauce.',
                'image' => '/images/lava_cake.png',
                'badge' => 'Sweet Treat',
                'spice_level' => 0,
                'popular' => true,
                'is_available' => true,
                'options' => [
                    'spiceLevels' => ['Standard Dessert'],
                    'additions' => [
                        ['name' => 'Extra Ice Cream Scoop', 'price' => 60],
                        ['name' => 'Caramel Drizzle', 'price' => 30],
                    ],
                ],
                'rating' => 4.9,
                'reviews' => 280,
                'prep_time' => '8 min',
                'calories' => '420 kcal',
            ],
            [
                'name' => 'Classic Chicken Zinger Burger',
                'category' => 'zinger',
                'price' => 349.00,
                'original_price' => 425.00,
                'description' => 'Crispy fried chicken breast, mayo, and crisp lettuce on a toasted sesame seed bun.',
                'image' => '/images/hero_zinger_combo.png',
                'badge' => '',
                'spice_level' => 1,
                'popular' => false,
                'is_available' => true,
                'options' => [
                    'spiceLevels' => ['Original', 'Spicy'],
                    'additions' => [
                        ['name' => 'Cheese Slice', 'price' => 40],
                    ],
                ],
                'rating' => 4.5,
                'reviews' => 210,
                'prep_time' => '12 min',
                'calories' => '540 kcal',
            ],
            [
                'name' => 'Loaded Seasoned Curly Fries',
                'category' => 'sides',
                'price' => 249.00,
                'original_price' => 299.00,
                'description' => 'Crispy spiral potato fries seasoned with cajun spices and served with warm cheddar sauce.',
                'image' => '/images/hero_zinger_combo.png',
                'badge' => 'Popular Side',
                'spice_level' => 1,
                'popular' => true,
                'is_available' => true,
                'options' => [
                    'spiceLevels' => ['Cajun Spice', 'Extra Spicy'],
                    'additions' => [
                        ['name' => 'Bacon Bits & Jalapeños', 'price' => 80],
                    ],
                ],
                'rating' => 4.8,
                'reviews' => 320,
                'prep_time' => '10 min',
                'calories' => '480 kcal',
            ],
            [
                'name' => 'Chilled Wild Berry Fizz',
                'category' => 'drinks',
                'price' => 179.00,
                'original_price' => 199.00,
                'description' => 'Refreshing sparkling soda infused with wild raspberries, mint leaves, and lime wedge.',
                'image' => '/images/hero_zinger_combo.png',
                'badge' => 'Refreshing',
                'spice_level' => 0,
                'popular' => false,
                'is_available' => true,
                'options' => [
                    'spiceLevels' => ['Standard Chilled'],
                    'additions' => [
                        ['name' => 'Less Ice', 'price' => 0],
                    ],
                ],
                'rating' => 4.7,
                'reviews' => 95,
                'prep_time' => '3 min',
                'calories' => '180 kcal',
            ],
        ];

        foreach ($menuItems as $item) {
            MenuItem::create($item);
        }

        // ── Promo Codes ──────────────────────────────────────────────
        Promo::create([
            'code' => 'CHICKN20',
            'discount_percent' => 20,
            'discount_flat' => 0,
            'free_delivery' => false,
            'description' => '20% Off Your Entire Order',
            'is_active' => true,
        ]);

        Promo::create([
            'code' => 'FREEDEL',
            'discount_percent' => 0,
            'discount_flat' => 0,
            'free_delivery' => true,
            'description' => 'Free Delivery on any order',
            'is_active' => true,
        ]);

        Promo::create([
            'code' => 'CRUNCH10',
            'discount_percent' => 0,
            'discount_flat' => 250,
            'free_delivery' => false,
            'description' => 'Rs. 250 Off Orders over Rs. 1,000',
            'is_active' => true,
        ]);

        // ── Sample Orders ────────────────────────────────────────────
        $sampleOrders = [
            [
                'order_id' => 'CHK-948201',
                'customer_id' => 2,
                'customer_name' => 'Sarah Connor',
                'customer_phone' => '+92 300 2348890',
                'address' => '742 Evergreen Terrace, Apt 4B',
                'items' => [
                    ['name' => 'Mega Crunch Zinger Supreme', 'quantity' => 2, 'unitPrice' => 449],
                    ['name' => 'Loaded Seasoned Curly Fries', 'quantity' => 1, 'unitPrice' => 249],
                ],
                'subtotal' => 1147.00,
                'delivery_fee' => 99.00,
                'discount_amount' => 0,
                'total' => 1246.00,
                'payment_method' => 'card',
                'payment_status' => 'paid',
                'status' => 'preparing',
                'status_step' => 2,
                'estimated_minutes' => 25,
                'created_at' => now()->subMinutes(15),
            ],
            [
                'order_id' => 'CHK-810394',
                'customer_id' => 2,
                'customer_name' => 'Marcus Vance',
                'customer_phone' => '+92 300 8871234',
                'address' => '109 Ocean Drive, Suite 12',
                'items' => [
                    ['name' => 'ChicknChunks Family Feast Box', 'quantity' => 1, 'unitPrice' => 1499],
                ],
                'subtotal' => 1499.00,
                'delivery_fee' => 0,
                'discount_amount' => 0,
                'total' => 1499.00,
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'status' => 'on_way',
                'status_step' => 3,
                'estimated_minutes' => 15,
                'created_at' => now()->subMinutes(30),
            ],
            [
                'order_id' => 'CHK-719205',
                'customer_id' => 2,
                'customer_name' => 'Emily Watson',
                'customer_phone' => '+92 300 4439012',
                'address' => '55 Sunset Blvd',
                'items' => [
                    ['name' => 'Fiery Hot Wings Bucket (12 pcs)', 'quantity' => 1, 'unitPrice' => 749],
                    ['name' => 'Molten Chocolate Lava Cake', 'quantity' => 1, 'unitPrice' => 279],
                ],
                'subtotal' => 1028.00,
                'delivery_fee' => 0,
                'discount_amount' => 0,
                'total' => 1028.00,
                'payment_method' => 'apple_pay',
                'payment_status' => 'paid',
                'status' => 'delivered',
                'status_step' => 4,
                'estimated_minutes' => 0,
                'created_at' => now()->subHours(1),
            ],
        ];

        foreach ($sampleOrders as $orderData) {
            Order::create($orderData);
        }
    }
}
