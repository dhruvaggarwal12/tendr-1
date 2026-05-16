import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMemo } from 'react';
import tendrLogo from '../../assets/logos/tendr-logo-secondary.png';

const GiftHampersCakes = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedHamperType, setSelectedHamperType] = useState('all');
  const [eggType, setEggType] = useState('all'); // all | eggless | egg
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState(''); // 'delivery' or 'pickup'
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    deliveryDate: '',
    specialInstructions: ''
  });

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSignInClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/9211668427?text=Hi%20Tendr%20team%2C%20I%20have%20a%20query%20about%20cakes%20%26%20gift%20hampers', '_blank');
  };

  const handleChatClick = () => {
    window.open('https://wa.me/9211668427?text=Hi%20Tendr%20team%2C%20I%20want%20to%20chat%20about%20cakes%20%26%20gift%20hampers', '_blank');
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    setDeliveryOption(''); // Reset delivery option
  };

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOrderSubmit = () => {
    const orderData = {
      id: Date.now(),
      deliveryOption,
      customerInfo,
      items: cart,
      total: cartTotal,
      orderDate: new Date().toISOString(),
      status: 'pending'
    };

    // Save to localStorage (in real app, this would go to a database)
    const existingOrders = JSON.parse(localStorage.getItem('tendrOrders') || '[]');
    existingOrders.push(orderData);
    localStorage.setItem('tendrOrders', JSON.stringify(existingOrders));

    // Reset form and cart
    setCart([]);
    setShowCheckout(false);
    setDeliveryOption('');
    setCustomerInfo({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      pincode: '',
      deliveryDate: '',
      specialInstructions: ''
    });

    const message = deliveryOption === 'pickup' 
      ? 'Order placed successfully! Please visit our store to collect your items. We will contact you soon for confirmation.'
      : 'Order placed successfully! We will contact you soon for confirmation and delivery details.';
    
    alert(message);
  };

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'cakes', name: 'Cakes' },
    { id: 'hampers', name: 'Gift Hampers' }
  ];

  const products = [
    // Cakes
    {
      id: 1,
      name: 'Chocolate Truffle Cake',
      category: 'cakes',
      price: 899,
      originalPrice: 1199,
      image: 'https://www.indiacakes.com/media/catalog/product/cache/a4577f844569f68fd14659d95bb20f68/t/a/tasty_chocolate_truffle_cake_half_kg_749.webp',
      description: 'Rich chocolate cake with truffle ganache',
      weight: '1 kg',
      supplier: 'Bakebook Bakery',
      eggless: true,
      varieties: ['Classic', 'Rocher', 'Salted Caramel'],
      inStock: true,
      rating: 4.8,
      reviews: 124
    },
    {
      id: 2,
      name: 'Red Velvet Cake',
      category: 'cakes',
      price: 899,
      originalPrice: 1099,
      image: 'https://www.warmoven.in/cdn/shop/files/heartfelt_red_velvet_cake.jpg?v=1749833349&width=1080',
      description: 'Classic red velvet with cream cheese frosting',
      weight: '1.2 kg',
      supplier: 'Velvety Crumbs',
      eggless: true,
      varieties: ['Heart Shape', 'Sprinkles', 'Berry Topped'],
      inStock: true,
      rating: 4.6,
      reviews: 89
    },
    {
      id: 3,
      name: 'Vanilla Buttercream Cake',
      category: 'cakes',
      price: 899,
      originalPrice: 999,
      image: 'https://pastrybysaloni.com/wp-content/uploads/2025/04/how-to-make-vanilla-cake-without-eggs.jpg',
      description: 'Light vanilla cake with buttercream frosting',
      weight: '1 kg',
      supplier: 'Whisk & Whip',
      eggless: false,
      varieties: ['Almond Crunch', 'Fruit Layered'],
      inStock: true,
      rating: 4.5,
      reviews: 67
    },
    {
      id: 4,
      name: 'Black Forest Cake',
      category: 'cakes',
      price: 999,
      originalPrice: 1299,
      image: 'https://www.flurys.com/cdn/shop/products/BlackForestCake_1.jpg?v=1676363135&width=1024',
      description: 'Chocolate cake with cherries and whipped cream',
      weight: '1.5 kg',
      supplier: 'Bakebook Bakery',
      eggless: true,
      varieties: ['Classic', 'Cherry Overload'],
      inStock: true,
      rating: 4.9,
      reviews: 156
    },
    {
      id: 5,
      name: 'Cheesecake',
      category: 'cakes',
      price: 1099,
      originalPrice: 1299,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR680-586A8JBnRnwp3uD7TqE8xhsp3YN837w&s',
      description: 'New York style cheesecake with berry compote',
      weight: '800g',
      supplier: 'Creamery House',
      eggless: false,
      varieties: ['Blueberry', 'Strawberry'],
      inStock: true,
      rating: 4.7,
      reviews: 92
    },
    {
      id: 6,
      name: 'Tiramisu Cake',
      category: 'cakes',
      price: 849,
      originalPrice: 1099,
      image: 'https://cdn.prod.website-files.com/614a379840dbad1848e598c2/66f42170d5cdc5872e8e316c_IMG_9990.jpg',
      description: 'Italian tiramisu with coffee and mascarpone',
      weight: '1 kg',
      supplier: 'Dolce & Bakes',
      eggless: true,
      varieties: ['Classic', 'Mocha'],
      inStock: true,
      rating: 4.8,
      reviews: 78
    },
    {
      id: 13,
      name: 'Butterscotch Crunch Cake',
      category: 'cakes',
      price: 749,
      originalPrice: 899,
      image: 'https://cakehouseonline.com/wp-content/uploads/2021/03/Butter-Scotch-Crunch-Cake.jpg',
      description: 'Caramel butterscotch with praline crunch',
      weight: '1 kg',
      supplier: 'Bakebook Bakery',
      eggless: true,
      varieties: ['Caramel Drip', 'Nutty Crunch'],
      inStock: true,
      rating: 4.5,
      reviews: 82
    },
    {
      id: 14,
      name: 'Blueberry Fresh Cream Cake',
      category: 'cakes',
      price: 899,
      originalPrice: 1099,
      image: 'https://www.sidechef.com/recipe/34c024bf-0418-4e78-949c-061764921484.jpg',
      description: 'Fresh cream cake with blueberry compote',
      weight: '1.2 kg',
      supplier: 'Creamery House',
      eggless: true,
      varieties: ['Classic', 'Extra Berry'],
      inStock: true,
      rating: 4.6,
      reviews: 75
    },
    {
      id: 15,
      name: 'Mango Mousse Cake',
      category: 'cakes',
      price: 799,
      originalPrice: 999,
      image: 'https://bakewithshivesh.com/wp-content/uploads/2024/06/IMG_1751-1.jpg',
      description: 'Tropical mango mousse with creamy texture',
      weight: '1 kg',
      supplier: 'Whisk & Whip',
      eggless: true,
      varieties: ['Alphonso', 'Kesar'],
      inStock: true,
      rating: 4.4,
      reviews: 61
    },
    {
      id: 16,
      name: 'Pineapple Fresh Cream Cake',
      category: 'cakes',
      price: 999,
      originalPrice: 1099,
      image: 'https://static.wixstatic.com/media/8b10e8_955682c9f3e44d2988fadee99f92f463~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg',
      description: 'Classic pineapple cake with cherries',
      weight: '1 kg',
      supplier: 'Velvety Crumbs',
      eggless: true,
      varieties: ['Classic', 'Extra Fruit'],
      inStock: true,
      rating: 4.3,
      reviews: 54
    },
    {
      id: 17,
      name: 'Ferrero Rocher Cake',
      category: 'cakes',
      price: 1299,
      originalPrice: 1499,
      image: 'https://www.homecookingadventure.com/wp-content/uploads/2022/01/ferrero_rochercake_main.jpg',
      description: 'Hazelnut chocolate layers with rocher pieces',
      weight: '1 kg',
      supplier: 'Dolce & Bakes',
      eggless: true,
      varieties: ['Crunchy', 'Silky'],
      inStock: true,
      rating: 4.7,
      reviews: 132
    },
    {
      id: 18,
      name: 'Oreo Cookies Cake',
      category: 'cakes',
      price: 899,
      originalPrice: 1199,
      image: 'https://www.rainbownourishments.com/wp-content/uploads/2023/04/vegan-oreo-cake-cookies-and-cream-cake-3.jpg',
      description: 'Chocolate sponge with cookies and cream',
      weight: '1 kg',
      supplier: 'Whisk & Whip',
      eggless: true,
      varieties: ['Extra Cookie', 'Choco Drip'],
      inStock: true,
      rating: 4.5,
      reviews: 93
    },
    {
      id: 19,
      name: 'Fruit Overload Cake',
      category: 'cakes',
      price: 999,
      originalPrice: 1299,
      image: 'https://i0.wp.com/thefreshlymade.com/wp-content/uploads/2020/10/TFMFC106S.jpg?fit=1080%2C1080&ssl=1',
      description: 'Loaded seasonal fruits on fresh cream',
      weight: '1.2 kg',
      supplier: 'Creamery House',
      eggless: true,
      varieties: ['Berries', 'Tropical'],
      inStock: true,
      rating: 4.6,
      reviews: 101
    },
    {
      id: 20,
      name: 'Rasmalai Fusion Cake',
      category: 'cakes',
      price: 1199,
      originalPrice: 1399,
      image: 'https://thebakeshopindia.com/cdn/shop/files/46.jpg?v=1685278789&width=1920',
      description: 'Indian fusion with rasmalai flavor',
      weight: '1 kg',
      supplier: 'Bakebook Bakery',
      eggless: true,
      varieties: ['Pista', 'Kesar'],
      inStock: true,
      rating: 4.4,
      reviews: 77
    },
    {
      id: 21,
      name: 'Irish Coffee Cake',
      category: 'cakes',
      price: 899,
      originalPrice: 1099,
      image: 'https://www.justbake.in/userfiles/irish-coffee-cake-1.jpg',
      description: 'Coffee infused sponge with cream',
      weight: '1 kg',
      supplier: 'Dolce & Bakes',
      eggless: false,
      varieties: ['Mocha', 'Classic'],
      inStock: true,
      rating: 4.3,
      reviews: 69
    },
    {
      id: 22,
      name: 'Strawberry Fresh Cream Cake',
      category: 'cakes',
      price: 899,
      originalPrice: 999,
      image: 'https://curlygirlkitchen.com/wp-content/uploads/2022/03/Strawberry-Shortcake-Cake-High-Altitude-Mascarpone-Whipped-Cream-Frosting-009.jpg',
      description: 'Fresh strawberries with vanilla cream',
      weight: '1 kg',
      supplier: 'Creamery House',
      eggless: true,
      varieties: ['Classic', 'Extra Berry'],
      inStock: true,
      rating: 4.5,
      reviews: 110
    },
    {
      id: 23,
      name: 'KitKat Chocolate Cake',
      category: 'cakes',
      price: 899,
      originalPrice: 1099,
      image: 'https://cdn.bloomsflora.com/uploads/product/bloomsflora/13059_90_13059.webp',
      description: 'Chocolate cake with KitKat border',
      weight: '1 kg',
      supplier: 'Velvety Crumbs',
      eggless: true,
      varieties: ['Gems Topping', 'Choco Shards'],
      inStock: true,
      rating: 4.5,
      reviews: 84
    },
    {
      id: 24,
      name: 'Caramel Walnut Cake',
      category: 'cakes',
      price: 949,
      originalPrice: 1199,
      image: 'https://www.scrumdiddlyumptious.com/wp-content/uploads/sites/9/2024/07/683e6226a95b3ebba4053e49e5807f59_be3af8.jpg',
      description: 'Moist caramel cake with toasted walnuts',
      weight: '1 kg',
      supplier: 'Whisk & Whip',
      eggless: false,
      varieties: ['Extra Walnut', 'Caramel Drip'],
      inStock: true,
      rating: 4.4,
      reviews: 58
    },
    {
      id: 25,
      name: 'Biscoff Lotus Cake',
      category: 'cakes',
      price: 1299,
      originalPrice: 1499,
      image: 'https://cdn.uengage.io/uploads/7175/image-937491-1720437433.jpeg',
      description: 'Lotus Biscoff spread with caramelized crunch',
      weight: '1 kg',
      supplier: 'Bakebook Bakery',
      eggless: true,
      varieties: ['Crunchy', 'Silky'],
      inStock: true,
      rating: 4.7,
      reviews: 120
    },
    {
      id: 26,
      name: 'German Chocolate Cake',
      category: 'cakes',
      price: 1399,
      originalPrice: 1599,
      image: 'https://tatyanaseverydayfood.com/wp-content/uploads/2019/08/The-BEST-German-Chocolate-Cake-3-768x1024.jpg',
      description: 'Chocolate cake with coconut-pecan frosting',
      weight: '1 kg',
      supplier: 'Dolce & Bakes',
      eggless: false,
      varieties: ['Classic', 'Extra Coconut'],
      inStock: true,
      rating: 4.6,
      reviews: 88
    },
    {
      id: 27,
      name: 'Lemon Zest Cake',
      category: 'cakes',
      price: 649,
      originalPrice: 849,
      image: 'https://www.bakewithstork.com/-/media/Project/Upfield/Whitelabels/Bake-With-Stork-UK/Assets/Recipes/Sync-Recipes/999792cb-569d-4016-9d27-bd4ee3df424a.jpg?rev=4544331dd4c746d99894b77a27e895c0',
      description: 'Fresh lemon sponge with tangy glaze',
      weight: '800g',
      supplier: 'Velvety Crumbs',
      eggless: true,
      varieties: ['Poppy Seed', 'Classic'],
      inStock: true,
      rating: 4.2,
      reviews: 49
    },
    {
      id: 28,
      name: 'Blueberry Cheesecake',
      category: 'cakes',
      price: 1399,
      originalPrice: 1599,
      image: 'https://theobroma.in/cdn/shop/files/HIGHRESBlueberryCheesecake-Square_grande.jpg?v=1711180961',
      description: 'Creamy cheesecake topped with blueberries',
      weight: '900g',
      supplier: 'Creamery House',
      eggless: false,
      varieties: ['Blueberry', 'Mixed Berry'],
      inStock: true,
      rating: 4.6,
      reviews: 90
    },
    {
      id: 29,
      name: 'Opera Cake',
      category: 'cakes',
      price: 1399,
      originalPrice: 1699,
      image: 'https://i0.wp.com/thefreshlymade.com/wp-content/uploads/2020/10/TFMGN383S.jpg?fit=1080%2C1080&ssl=1',
      description: 'Layers of almond sponge, coffee, and chocolate',
      weight: '1 kg',
      supplier: 'Dolce & Bakes',
      eggless: false,
      varieties: ['Classic', 'Mocha'],
      inStock: true,
      rating: 4.7,
      reviews: 73
    },
    {
      id: 30,
      name: 'Hazelnut Praline Cake',
      category: 'cakes',
      price: 1299,
      originalPrice: 1599,
      image: 'https://theobroma.in/cdn/shop/files/HazelnutPralineMousseCake.jpg?v=1711125988',
      description: 'Roasted hazelnut praline and chocolate cream',
      weight: '1 kg',
      supplier: 'Bakebook Bakery',
      eggless: true,
      varieties: ['Crunchy', 'Silky'],
      inStock: true,
      rating: 4.6,
      reviews: 85
    },
    // Gift Hampers
    {
      id: 7,
      name: 'Luxury Chocolate Hamper',
      category: 'hampers',
      hamperType: 'chocolate',
      price: 1499,
      originalPrice: 1999,
      image: 'https://www.fnp.com/images/pr/l/v20241015181826/chokola-grandeur-luxury-chocolate-hamper_1.jpg',
      description: 'Premium chocolates, nuts, and gourmet treats',
      weight: '2 kg',
      supplier: 'ChocoCrate Co.',
      varieties: ['Dark Selection', 'Assorted Pralines', 'Vegan'],
      inStock: true,
      rating: 4.9,
      reviews: 203
    },
    {
      id: 8,
      name: 'Makeup Essentials Hamper',
      category: 'hampers',
      hamperType: 'makeup',
      price: 2299,
      originalPrice: 2799,
      image: 'https://thanhcongcraft.com/wp-content/uploads/2024/03/5-Makeup-Cosmetic-Gift-Basket-Ideas-And-How-To-Decorate-3.jpg',
      description: 'Curated cosmetics kit with skincare minis',
      weight: '1.2 kg',
      supplier: 'GlamBox Studio',
      varieties: ['Everyday Nude', 'Smokey Glam'],
      inStock: true,
      rating: 4.6,
      reviews: 145
    },
    {
      id: 9,
      name: "Men's Grooming Hamper",
      category: 'hampers',
      hamperType: 'men_grooming',
      price: 1699,
      originalPrice: 2199,
      image: 'https://assets.winni.in/c_limit,dpr_1,fl_progressive,q_80,w_1000/28516_grooming-hamper-for-men.jpeg',
      description: 'Skin and beard care essentials for men',
      weight: '1.4 kg',
      supplier: 'UrbanGent',
      varieties: ['Beard Care', 'Oil Control'],
      inStock: true,
      rating: 4.8,
      reviews: 167
    },
    {
      id: 10,
      name: 'Wafers & Snacks Hamper',
      category: 'hampers',
      hamperType: 'wafers',
      price: 1199,
      originalPrice: 1599,
      image: 'https://www.chocolatedeliveryonline.com/cdn/shop/products/CDO-274.jpg?v=1670674838',
      description: 'Assorted wafers, chips and savory delights',
      weight: '1.8 kg',
      supplier: 'Snackster',
      varieties: ['Assorted', 'All-Chocolate'],
      inStock: true,
      rating: 4.7,
      reviews: 134
    },
    {
      id: 11,
      name: 'Wellness Gift Basket',
      category: 'hampers',
      hamperType: 'wellness',
      price: 1299,
      originalPrice: 1699,
      image: 'https://m.media-amazon.com/images/I/710V5ATeo3L._UF1000,1000_QL80_.jpg',
      description: 'Organic teas, honey, and wellness products',
      weight: '1.5 kg',
      supplier: 'Holistica',
      varieties: ['Detox', 'Calm & Sleep'],
      inStock: true,
      rating: 4.5,
      reviews: 98
    },
    {
      id: 12,
      name: 'Birthday Celebration Hamper',
      category: 'hampers',
      hamperType: 'assorted',
      price: 1899,
      originalPrice: 2399,
      image: 'https://www.fnp.ae/images/pr/l/v20241030094905/happy-birthday-celebration-hamper_1.jpg',
      description: 'Complete birthday celebration package',
      weight: '2.2 kg',
      supplier: 'Party Crate',
      varieties: ['Birthday Special', 'Premium Celebration'],
      inStock: true,
      rating: 4.8,
      reviews: 178
    }
    ,
    {
      id: 31,
      name: 'Gourmet Dry Fruits Hamper',
      category: 'hampers',
      hamperType: 'dryfruits',
      price: 1599,
      originalPrice: 1999,
      image: 'https://m.media-amazon.com/images/I/91YZ2IYdGnL._UF1000,1000_QL80_.jpg',
      description: 'Premium almonds, cashews, pistachios and raisins',
      weight: '1.4 kg',
      supplier: 'NutriGift',
      varieties: ['Roasted', 'Salted', 'Assorted'],
      inStock: true,
      rating: 4.7,
      reviews: 142
    },
    {
      id: 32,
      name: 'Tea & Coffee Connoisseur',
      category: 'hampers',
      hamperType: 'tea_coffee',
      price: 1799,
      originalPrice: 2199,
      image: 'https://shreddersandshredding.com/wp-content/uploads/2021/05/coffee-gift-hamper.jpg',
      description: 'Finest teas and artisan coffee with accessories',
      weight: '1.6 kg',
      supplier: 'Brew N Leaf',
      varieties: ['Assam & Arabica', 'Green & Espresso'],
      inStock: true,
      rating: 4.6,
      reviews: 128
    },
    {
      id: 33,
      name: 'Spa Pamper Box',
      category: 'hampers',
      hamperType: 'spa',
      price: 1899,
      originalPrice: 2399,
      image: 'https://i.etsystatic.com/25929194/r/il/2b71d6/3386842342/il_fullxfull.3386842342_e5wc.jpg',
      description: 'Aromatherapy oils, bath salts and body care',
      weight: '1.8 kg',
      supplier: 'SereniTea Spa',
      varieties: ['Lavender Calm', 'Citrus Fresh'],
      inStock: true,
      rating: 4.7,
      reviews: 136
    },
    {
      id: 34,
      name: 'Festive Sweets Box',
      category: 'hampers',
      hamperType: 'festive',
      price: 1399,
      originalPrice: 1799,
      image: 'https://ashasweetcenter.com/cdn/shop/files/ASC_119.jpg?v=1727105016',
      description: 'Traditional mithai and celebratory goodies',
      weight: '1.5 kg',
      supplier: 'Gulab Sweets',
      varieties: ['Assorted', 'Dryfruit Special'],
      inStock: true,
      rating: 4.5,
      reviews: 112
    },
    {
      id: 35,
      name: 'Cookies & Bakes Hamper',
      category: 'hampers',
      hamperType: 'cookies',
      price: 1199,
      originalPrice: 1499,
      image: 'https://www.dreamadozen.com/cdn/shop/files/Cookie-Monster-Square.jpg?v=1755862983',
      description: 'Assorted cookies, brownies and tea cakes',
      weight: '1.6 kg',
      supplier: 'Bakebook Bakery',
      varieties: ['Choco Chip', 'Mixed Box'],
      inStock: true,
      rating: 4.6,
      reviews: 124
    },
    {
      id: 36,
      name: 'Breakfast Goodies Basket',
      category: 'hampers',
      hamperType: 'breakfast',
      price: 1499,
      originalPrice: 1799,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxgDV7xifnr2bYNllp3wyOFnac0PXSsdpslg&s',
      description: 'Jams, cereals, honey and pancake mix',
      weight: '1.9 kg',
      supplier: 'Morning Crate',
      varieties: ['Berry Jam', 'Maple Stack'],
      inStock: true,
      rating: 4.5,
      reviews: 97
    },
    {
      id: 37,
      name: 'Healthy Snacks Box',
      category: 'hampers',
      hamperType: 'health',
      price: 1299,
      originalPrice: 1599,
      image: 'https://i.etsystatic.com/26862732/r/il/a3602e/2807679923/il_fullxfull.2807679923_a9u6.jpg',
      description: 'Granola, seed mixes, protein bars and more',
      weight: '1.3 kg',
      supplier: 'FitSnack Co.',
      varieties: ['High-Protein', 'Vegan'],
      inStock: true,
      rating: 4.6,
      reviews: 118
    },
    {
      id: 38,
      name: 'Kids Treats Hamper',
      category: 'hampers',
      hamperType: 'kids',
      price: 999,
      originalPrice: 1299,
      image: 'https://www.fnp.com/images/pr/l/v20201014151445/basket-of-sweet-treats-for-kids_1.jpg',
      description: 'Candies, chocolates and fun snacks for kids',
      weight: '1.2 kg',
      supplier: 'HappyCrate',
      varieties: ['Choco Lovers', 'Rainbow'],
      inStock: true,
      rating: 4.4,
      reviews: 83
    },
    {
      id: 39,
      name: 'Office Gourmet Hamper',
      category: 'hampers',
      hamperType: 'office',
      price: 2199,
      originalPrice: 2699,
      image: 'https://m.media-amazon.com/images/I/A1tE6E2tLzL.jpg',
      description: 'Premium snacks and beverages for teams',
      weight: '2.0 kg',
      supplier: 'Corporate Crates',
      varieties: ['Assorted', 'All Savory'],
      inStock: true,
      rating: 4.7,
      reviews: 140
    }
  ];

  const hamperTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'chocolate', name: 'Chocolate Hampers' },
    { id: 'makeup', name: 'Makeup Hampers' },
    { id: 'men_grooming', name: "Men's Grooming Hampers" },
    { id: 'wafers', name: 'Wafers & Snacks' },
    { id: 'wellness', name: 'Wellness' },
    { id: 'assorted', name: 'Assorted' },
    { id: 'dryfruits', name: 'Dry Fruits' },
    { id: 'tea_coffee', name: 'Tea & Coffee' },
    { id: 'spa', name: 'Spa & Relax' },
    { id: 'festive', name: 'Festive Sweets' },
    { id: 'cookies', name: 'Cookies & Bakes' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'health', name: 'Healthy Snacks' },
    { id: 'kids', name: 'Kids Treats' },
    { id: 'office', name: 'Office Gourmet' },
  ];

  const priceRanges = [
    { id: 'all', name: 'All', min: 0, max: Infinity },
    { id: '500-1000', name: '₹500–₹1000', min: 500, max: 1000 },
    { id: '1000-2000', name: '₹1000–₹2000', min: 1000, max: 2000 },
    { id: '2000-3000', name: '₹2000–₹3000', min: 2000, max: 3000 },
  ];

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (selectedCategory === 'cakes' && eggType !== 'all') {
      list = list.filter(p => (eggType === 'eggless' ? p.eggless : !p.eggless));
    }
    if (selectedCategory === 'hampers' && selectedHamperType !== 'all') {
      list = list.filter(p => p.hamperType === selectedHamperType);
    }
    const pr = priceRanges.find(r => r.id === selectedPriceRange) || priceRanges[0];
    list = list.filter(p => p.price >= pr.min && p.price <= pr.max);
    return list;
  }, [products, selectedCategory, eggType, selectedHamperType, selectedPriceRange]);

  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-rose-100" style={{ position: "relative" }}>

      {/* ── Coming Soon overlay ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        background: "rgba(255,248,240,0.72)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Outfit', sans-serif",
        textAlign: "center", padding: "24px",
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎁</div>
        <div style={{ display: "inline-block", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "5px 16px", borderRadius: 100, marginBottom: 20 }}>
          Coming Soon
        </div>
        <h1 style={{ fontSize: "clamp(2rem,6vw,3.2rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 14px", lineHeight: 1.15 }}>
          Gift Hampers & Cakes
        </h1>
        <p style={{ fontSize: 17, color: "#7A5535", maxWidth: 460, lineHeight: 1.65, margin: "0 0 32px" }}>
          Curated gift hampers and customised cakes for every celebration — launching very soon across Delhi NCR.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/" style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none", boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>
            ← Back to Home
          </a>
          <a href="https://wa.me/919211668427?text=Hi%20Tendr%2C%20I%27m%20interested%20in%20gift%20hampers%20and%20cakes" target="_blank" rel="noopener noreferrer"
            style={{ padding: "12px 28px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
            Notify Me on WhatsApp
          </a>
        </div>
        <p style={{ fontSize: 12, color: "#9B7450", marginTop: 24 }}>contacttendr@gmail.com · +91-9211668427</p>
      </div>

      {/* Header */}
      <nav className="bg-white shadow-sm px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img
              src={tendrLogo}
              alt="tendr logo"
              className="h-12 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            <a 
              href="https://wa.me/1234567890" 
              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
            >
              💬
            </a>
            <button 
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-orange-600 border border-orange-600 rounded-full hover:bg-orange-50 transition-colors text-xs sm:text-sm"
              onClick={handleSignInClick}
            >
              Sign In
            </button>
            <button 
              className="px-3 sm:px-6 py-1.5 sm:py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors text-xs sm:text-sm"
              onClick={handleSignUpClick}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Gift Hampers & Cakes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection of delicious cakes and luxurious gift hampers. 
            Perfect for every celebration and special occasion.
          </p>
          
          {/* Delivery Information Banner */}
          <div className="mt-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <span className="text-blue-500 text-xl mr-3">🚚</span>
                <div className="text-center">
                  <h3 className="font-semibold text-blue-800 mb-1">Delivery Options</h3>
                  <p className="text-sm text-blue-700">
                    <strong>Cakes:</strong> Both pickup and home delivery available • 
                    <strong> Gift Hampers:</strong> Home delivery only (pickup not available)
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Egg/Eggless for Cakes */}
          {selectedCategory === 'cakes' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={eggType}
                onChange={(e) => setEggType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="eggless">Eggless</option>
                <option value="egg">Egg</option>
              </select>
            </div>
          )}

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Price:</label>
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              {priceRanges.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {product.originalPrice > product.price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1">
                  <span className="text-sm font-medium text-gray-800">⭐ {product.rating}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name}</h3>
                {product.supplier && (
                  <p className="text-xs text-gray-500 mb-1">Supplier: <span className="font-medium text-gray-700">{product.supplier}</span></p>
                )}
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                {product.varieties && product.varieties.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Varieties:</div>
                    <div className="flex flex-wrap gap-1">
                      {product.varieties.map((v, idx) => (
                        <span key={idx} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">{v}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-orange-600">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                    )}
                  </div>
                  {product.category === 'cakes' && (
                    <span className="text-xs text-gray-500">{product.weight}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{product.reviews} reviews{product.category === 'cakes' && (
                    eggType !== 'all' ? ` • ${eggType === 'eggless' ? 'Eggless' : 'Egg'}` : ''
                  )}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Shopping Cart */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Shopping Cart ({cart.length} items)</h3>
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-600">₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-orange-600">₹{cartTotal}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Checkout
              </button>
            </div>
          </div>
        )}

        {/* Chat Button */}
        <button
          onClick={handleChatClick}
          className="fixed bottom-4 left-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full shadow-lg transition-colors text-sm font-semibold"
          aria-label="Chat with us"
        >
          💬 Chat with us
        </button>

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
                <button
                  onClick={() => {
                    setShowCheckout(false);
                    setDeliveryOption('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-2">
                    <span className="text-sm">{item.name} × {item.quantity}</span>
                    <span className="text-sm font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-orange-600">₹{cartTotal}</span>
                  </div>
                </div>
              </div>

              {/* Delivery/Pickup Options */}
              {!deliveryOption && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-4">How would you like to receive your order?</h3>
                  
                  {/* Check if cart contains gift hampers */}
                  {cart.some(item => item.category === 'hampers') && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <span className="text-blue-500 text-xl mr-3">ℹ️</span>
                        <div>
                          <h4 className="font-semibold text-blue-800 mb-1">Delivery Information</h4>
                          <p className="text-sm text-blue-700">
                            <strong>For Cakes:</strong> Both pickup and home delivery are available.<br/>
                            <strong>For Gift Hampers:</strong> Only home delivery is available. Pickup is not available for gift hampers.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setDeliveryOption('delivery')}
                      className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-left"
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">🚚</span>
                        <h4 className="font-semibold text-gray-800">Home Delivery</h4>
                      </div>
                      <p className="text-sm text-gray-600">We'll deliver your order to your address</p>
                    </button>
                    
                    {/* Only show pickup option if cart doesn't contain gift hampers */}
                    {!cart.some(item => item.category === 'hampers') && (
                      <button
                        onClick={() => setDeliveryOption('pickup')}
                        className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-left"
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">🏪</span>
                          <h4 className="font-semibold text-gray-800">Store Pickup</h4>
                        </div>
                        <p className="text-sm text-gray-600">Visit our store to collect your order</p>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Pickup Confirmation */}
              {deliveryOption === 'pickup' && (
                <div className="mb-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Store Pickup Selected</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      You can collect your order from our store. We'll contact you when it's ready for pickup.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={customerInfo.name}
                          onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={customerInfo.phone}
                          onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeliveryOption('')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleOrderSubmit}
                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Information Form - Only for Delivery */}
              {deliveryOption === 'delivery' && (
                <form onSubmit={(e) => { e.preventDefault(); handleOrderSubmit(); }}>
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-4">Delivery Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerInfo.name}
                        onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={customerInfo.email}
                        onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={customerInfo.phone}
                        onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={customerInfo.city}
                        onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        value={customerInfo.pincode}
                        onChange={(e) => handleCustomerInfoChange('pincode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Enter pincode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                      <input
                        type="date"
                        required
                        value={customerInfo.deliveryDate}
                        onChange={(e) => handleCustomerInfoChange('deliveryDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                    <textarea
                      required
                      value={customerInfo.address}
                      onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      rows={3}
                      placeholder="Enter complete delivery address"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                    <textarea
                      value={customerInfo.specialInstructions}
                      onChange={(e) => handleCustomerInfoChange('specialInstructions', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      rows={2}
                      placeholder="Any special delivery instructions or notes"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('')}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      Place Order
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftHampersCakes;
